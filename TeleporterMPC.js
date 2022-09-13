#!/usr/bin/env node

/*
 * Teleport Bridge 
 * Copyright (c) Artrepreneur1
 * Use of this source code is governed by an MIT
 * license that can be found in the LICENSE file.
 * This is an implementation of a privacy bridging node. 
 * Currently, utilizes ECDSA Signatures to validate burning or vaulting of assets.
 * Signatures allow minting to occur cross chain. 
 */

const cors = require('cors');
var express = require('express');
var app = express();
var path = require('path');
global.fetch = require('node-fetch');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const os = require('os');
const { ethers } = require("ethers");
const fs = require("fs");
app.set('trust proxy', true);
app.use(cors());
const Web3 = require('web3');
const axios = require('axios');
var ip = require("ip");
const dns = require('dns');
var thisNode = ip.address().toString(); // IP of this node
const find = require('find-process');

/* Load Settings */
const settings = getSettings();

/* Settings Mapping */
const settingsMap = new Map();

for (i in settings){
     //Stucture: settingsMap.set('someLuxCoin', {chain1:'', ..., chainN: ''})
     settingsMap.set(i.toString(), settings[i]);
}

/* RPC list */
const rpcList = settingsMap.get('RPC');

/* Networks (ie. chains) */
const networkName = settingsMap.get('NetNames');

/* DB */
const DB = settingsMap.get('DB');

/* Signature Re-signing flag */
const newSigAllowed = settingsMap.get('NewSigAllowed');

/* Signing MSG */
var msg = settingsMap.get('Msg'); //signing msg used in front running prevention

/* List of Signing Managers for MPC */
var signingMngrs = settingsMap.get('SigningManagers');
var sm_managers = [];
for (sm_index in signingMngrs){ 
     sm_managers.push(signingMngrs[sm_index]);
}

//var mpcHeader = "/MPC/multi-party-ecdsa/target/release/examples/";

/* KeyStore file(s) for MPC */
var keyStoreFiles = settingsMap.get('KeyStore');
var keyStoreArr = [];

// A single node can have multiple key store files if set up that way.
for (ks_index in keyStoreFiles){  
     keyStoreArr.push(keyStoreFiles[ks_index]);
}
var keyStore = keyStoreArr[0];

/* MPC Peers */
var mpcPeerList = settingsMap.get('MPCPeers');
var mpcPeerArr = [];
var peerDataArr = [];
for (j in mpcPeerList){  
     peerDataArr = mpcPeerList[j].split(",");
     ip = peerDataArr[1].toString().split(":")[0];
     if ( ip.trim() !== thisNode.toString()){ //Exclude thisNode from MPC peers
          mpcPeerArr.push((peerDataArr[0]));
     }
}

/* Dupelist - a graylist for slowing flood attack */
var dupeStart = 0, dupeStop = 0;
var dupeListLimit = Number(settingsMap.get('DupeListLimit'));
var dupeList = new Map();

/* SM Manager Timeout Params */
const smTimeOutBound = (Number(settingsMap.get('SMTimeout')) * 100 * Math.random()) % 60; //0.5;

/* TXID processing state */
const txProcMap = new Map();

/* Bridge contracts for Teleport Bridge */
const list = settingsMap.get('Teleporter');

function getWeb3ForId(toNetId){
     return new Web3(new Web3.providers.HttpProvider(rpcList[toNetId]));
}

/* Given network id returns the appropriate contract to talk to as array of values */
function getNetworkAddresses(toNetId, tokenName){
     let arr = [];
     
     web3 = getWeb3ForId(toNetId);
     let chainName = networkName[toNetId];

     arr.push(settingsMap.get(tokenName.toString())[chainName], web3, list[chainName]); //, tele);
     return arr;
}

var Exp = /((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]+$/i;

/* Database stuff */
var connStr = 'mongodb://teleportUser:'+DB+'@localhost:27017/Teleport';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');
mongoose.connect(connStr, {
}, function (err) {
     if (err) throw err;
     console.log('Successfully connected to MongoDB');
});

app.get('/', function (req, res) {
     app.use(express.static(__dirname+'/views'));
     res.sendFile(path.join(__dirname,'./views/index.html'));
});

var port = process.env.PORT || 3200;
var server = app.listen(port, function () {
     var host = server.address().address;
     var port = server.address().port;
     console.log('>> Teleporter Running At:', host, port);
});


/* For multichain bridge */
var TeleportDataSchema = new Schema({
     txId: { type: String, required: false, index: { unique: true }, trim: true },
     chainType: { type: String, required: false, trim: true }, //from chain
     amount: { type: Number, required: false, default: 0},
     evmSenderAddress: { type: String, required: false, trim: true },
     sig: { type: String, required: true, index: { unique: true }, trim: true },
     hashedTxId: { type: String, required: false, index: { unique: true }, trim: true }
 });

var TeleportData = mongoose.model('TeleportData', TeleportDataSchema);

/*
 * Given a sig, checks TeleportData to see if sig already exists. 
 * Since there is only one valid sig for any txid + data combo, this sig is unique regardless of chain.
 * This is true because it is verified data, data we concat is oraclized against txid.
 * We don't have stealth sig for pkt to wpkt since it is a pegged asset, only evm to evm
 */
function checkStealthSig(evmTxHash){
     console.log("Searching for txid:", evmTxHash);
     return new Promise(async (resolve, reject) => { 
          try {
               TeleportData.findOne({
                    hashedTxId: evmTxHash
               }, function (err, result) {
                    console.log("Find:", result, err);
                    if (err) throw err;
          
                    if (result && result != null) {
                         console.log('Err ... entry already exists:', result);
                         resolve([true, result]);
                    }
                    else { // Not a replay
                         console.log('Entry does not exist...yet');
                         resolve([false, result]);
                    }
               });
          }
          catch(e){
               console.log('Error:', e);
               reject([false]);
          }
     });
}


/*
async function temp(w3From, vault, txInfo, txProcMap){
     return (await hashAndSignTx(w3From.utils.toWei(amt.toString()), w3From, vault.toString(), txInfo, txProcMap)); 
}*/

/*
 * Given parameters associated with the token burn, we validate and produce a signature entitling user to payout.
 * Parameters specific to where funds are being moved / minted to, are hashed, such that only the user has knowledge of
 * mint destination. Effectively, the transaction is teleported stealthily. 
 */
app.get('/api/v1/getsig/txid/:txid/fromNetId/:fromNetId/toNetIdHash/:toNetIdHash/tokenName/:tokenName/tokenAddrHash/:tokenAddrHash/msgSig/:msgSig/toTargetAddrHash/:toTargetAddrHash/nonce/:nonce', function (req, res) { 
     
     // Checking inputs
     var stealthMode = true; // Stealth overrride by default, for now.
     var sig = 0;
     var evmTxHash = null;
     
     console.log('====================================================================');
     var txid = req.params.txid.trim();
     if (!(txid.length > 0) && !(txid.match(Exp))){
          output = "NullTransactionError: bad transaction hash";
          res.send(output);
          return;
     }

     // Dupelist reset if time has elapsed.
     dupeStop = new Date(); //time now
     if ((dupeStop - dupeStart )/1000 >= 2400){
          dupeList = new Map();//Clear dupeList
          dupeStart = new Date();
     }

     // Limit on checks here, else you go into graylist. 
     if (dupeList.get(txid.toString()) == undefined){ //First time
          dupeList.set(txid.toString(), 0); // init
     }

     else {
          if (dupeList.get(txid.toString()) >= dupeListLimit) { // temp blacklist - pm2 cron will reset graylist after 12hrs
               console.log('Dupe transaction request limit hit');
               output = "DupeTransactionError: Too many transaction requests. Try back later.";
               res.send(output);
               return;
          }
          dupeList.set(txid.toString(), (dupeList.get(txid.toString()) + 1)); 
     }

     var fromNetId = req.params.fromNetId.trim();
     if (!fromNetId){
          output = "NullFromNetIDError: No from netId sent.";
          res.send(output);
          return;
     }
     
     var toNetIdHash = req.params.toNetIdHash.trim();
     if (!toNetIdHash){
          output = "NullToNetIDHashError: No to netId sent.";
          res.send(output);
          return;
     }

     var tokenName = req.params.tokenName.trim();
     if (!tokenName){
          output = "NullTokenNameError: No token name sent.";
          res.send(output);
          return;
     }

     var tokenAddrHash = req.params.tokenAddrHash.trim();

     if (!tokenAddrHash){
          output = "NullTokenAddressHashError: No token address hash sent.";
          res.send(output);
          return;
     }

     var toTargetAddrHash = req.params.toTargetAddrHash.trim();          
     if (!toTargetAddrHash){
          output = "NullToTargetAddrHashError: No target address hash sent.";
          res.send(output);
          return;
     }
    
     var msgSig = req.params.msgSig.trim();
     if (!msgSig){
          output = "NullMessageSignatureError: Challenge message signature not sent.";
          res.send(output);
          return;
     }

     var nonce = req.params.nonce.trim();
     if (!nonce){
          output = "NullNonceError: No nonce sent.";
          res.send(output);
          return;
     }
     

     let fromNetArr = getNetworkAddresses(fromNetId, tokenName); 
     evmTxHash = web3.utils.soliditySha3(txid);
     let txidNonce = (stealthMode)? (evmTxHash + nonce):(txid + nonce); 
     let txStub = (stealthMode) ? evmTxHash : txid;
     let txInfo = [txStub, fromNetId, toNetIdHash, tokenName, tokenAddrHash, toTargetAddrHash, msgSig, nonce]; 
     console.log('txidNonce:', txidNonce);
     console.log('txProcMapX:', txProcMap.get(txidNonce.toString()), 'TX MAP:', txProcMap);

     /*let w3From = fromNetArr[1];
     amt = 3;
     vault = 'true';
     console.log(w3From.utils.toWei('3'), w3From, 'true', txInfo, txProcMap);
     sig = temp(w3From, vault, txInfo, txProcMap);
     console.log(sig);
     output = JSON.stringify({fromTokenContractAddress: fromNetArr[0], from: toTargetAddrHash, tokenAmt: amt, signature: sig, hashedTxId: txid, tokenAddrHash: tokenAddrHash, vault: vault});
     console.log(output);
     res.send(output);
     return;*/

     if (!txProcMap.get(txidNonce.toString())){

          if (fromNetArr.length !== 3) {
               console.log("FromNetArrLengthError:", fromNetArr.length)
               output = "Unknown error occurred.";
               res.send(output);
               return;
          }
     
          let frombridgeConAddr = fromNetArr[2];
          let fromTokenConAddr = fromNetArr[0]; 
          let w3From = fromNetArr[1];
          let cnt = 0;
          
          /* Check that it's not a replay transaction */
          TeleportData.findOne({
               txId: txInfo[0]
          }, async function (err, result) {
               console.log("Find Result:", result, err);
     
               if (err) throw err;
               if (result && (result.length > 0)) { // && (!newSigAllowed)
                    console.log('EntryAlreadyExistsError in teleport:', result);
                    output = JSON.stringify({error: 'EntryAlreadyExistsError', tokenAmt: result.amount, signature: result.sig, hashedTxId: result.hashedTxId});
                    res.send(output);
                    return;
               }
     
               else { // Not a replay
                    getEVMTx(txid, w3From).then(async (transaction)=>{ //Get transaction details
                         if (transaction != null && transaction != undefined){
                              console.log('Transaction:', transaction);
                              let from = transaction.from; //Transaction Sender
                              let fromTokenContract = transaction.addressTo; //from token contract
                              let contract = transaction.contractTo; //from MultiTeleportBridge contract
                              let amt = transaction.value; 
                              let log = transaction.log;
                              let eventName = null;
                              let vault = null;
     
                              // Check that the logs we are looking for occurred
                              if (!log){
                                   output = 'NotVaultedOrBurnedError: No tokens were vaulted or burned.'; 
                                   res.send(output);
                                   return;
                              }
                              else{
                                   
                                   eventName = log;
                                   console.log('Event:', eventName);
                                   if (eventName.toString() === "BridgeBurned"){
                                        vault = false;
                                   }
                                   else if (eventName.toString() === "VaultDeposit"){
                                        vault = true;
                                   }
                              }
                              
                              // To prove user signed we recover signer for (msg, sig) using testSig which rtrns address which must == toTargetAddr or return error
                              var signerAddress = web3.eth.accounts.recover(msg, msgSig);//best  on server
                              console.log('signerAddress:', signerAddress.toString().toLowerCase(), 'From Address:', from.toString().toLowerCase());
                              
                              // Bad signer (test transaction signer must be same as burn transaction signer) => exit, front run attempt
                              let signerOk = false;
                              if (signerAddress.toString().toLowerCase() != from.toString().toLowerCase()){
                                   console.log('*** Possible front run attempt, message signer not transaction sender ***');
                                   output = 'NullToNetIDHashError: No to netId sent.';
                                   res.send(output);
                                   return;
                              }
                              else {
                                   signerOk = true;
                              }
                              
                              // If signerOk we use the toTargetAddrHash provided, else we hash the from address.
                              toTargetAddrHash = (signerOk) ? toTargetAddrHash : (Web3.utils.keccak256(from)); 
                              console.log('token contract:', fromTokenContract.toLowerCase(), 'fromTokenConAddr', fromTokenConAddr.toLowerCase(),'contract',  contract.toLowerCase(),'frombridgeConAddr', frombridgeConAddr.toLowerCase());
               
                              // Validate token and bridge contract addresses.
                              if (fromTokenContract.toLowerCase() === fromTokenConAddr.toLowerCase() && contract.toLowerCase() === frombridgeConAddr.toLowerCase()) { // Token was burned.
                                   let output ="";
                                   console.log('fromTokenConAddr', fromTokenConAddr,'tokenAddrHash', tokenAddrHash);
     
                                   //Produce signature for minting approval.
                                   try {

                                        //Signature confirms that coins were burned and user is entitled to redemption.
                                        if (stealthMode){ 
                                             
                                             console.log("Stealth hashing",  evmTxHash);
                                             txInfo[0] = evmTxHash;
     
                                             sig = await hashAndSignTx(w3From.utils.toWei(amt.toString()), w3From, vault.toString(), txInfo, txProcMap); 
                                             console.log('Signature:', sig);
                                        }
                                        else {
                                             sig = await hashAndSignTx(w3From.utils.toWei(amt.toString()), w3From, vault.toString(), txInfo, txProcMap); 
                                             console.log('Signature:', sig);
                                        }
     
                                        // Check for replays on stealth mode - using only the sig.
                                        if (stealthMode){
                                             var stealthFound = checkStealthSig(evmTxHash);//==>txidNonce); //see if saved already 
                                             console.log('stealthFound[1]',stealthFound[1]);
                                             r = null; 

                                             if (stealthFound[1]){
                                                  r = (stealthFound[1]._doc) ? stealthFound[1]._doc : stealthFound[1];
                                             }

                                             if (stealthFound[0]& r) {
                                             //if (stealthFound[0] && stealthFound[1]._doc) {
                                                  sig = r.sig;
                                                  evmTxHash = r.hashedTxId;
                                                  cnt++;
                                                  console.log('Stealth transaction found...', cnt);
                                                  output = JSON.stringify({fromTokenContractAddress: fromTokenContract, contract: contract, from: toTargetAddrHash, toNetIdHash: toNetIdHash, tokenAmt: amt, signature: sig, hashedTxId: evmTxHash, tokenAddrHash: tokenAddrHash, vault: vault});
                                                  console.log('Output1:', output);
                                                  res.send(output); 
                                                  return;
                                             }        
                                        }
                                        
                                        console.log("Saving info to DB- txid:", txid, "evmTxHash:", evmTxHash, "sig:", sig);
                                        
                                        //NOTE: For private transactions, store only the sig.
                                        var teleportData= new TeleportData;
                                        if (!stealthMode){
                                             teleportData.chainType = ct;
                                             teleportData.txId = txid;
                                             teleportData.amount = amt;
                                             teleportData.evmSenderAddress = from; //EVM sender address
                                        }
                                        else {
                                             teleportData.txId = evmTxHash;  //In stealth, txId is the hash 
                                        }
     
                                        teleportData.hashedTxId = evmTxHash; 
                                        teleportData.sig = sig;//using signature
     
                                        // Input data into database and retrieve the new postId and date
                                        teleportData.save(function (err, result) {
                                             if (err) {
                                                  output = JSON.stringify({ Error: err});
                                                  console.log('Error2:',output);

                                                       if (err.code == 11000){
                                                            if (!stealthMode){
                                                                 output = JSON.stringify({fromTokenContractAddress: fromTokenContract, contract: contract, from: toTargetAddrHash, tokenAmt: amt, signature: sig, hashedTxId: txid, tokenAddrHash: tokenAddrHash, vault: vault});
                                                            }
                                                            else {
                                                                 output = JSON.stringify({fromTokenContractAddress: fromTokenContract, contract: contract, from: toTargetAddrHash, tokenAmt: amt, signature: sig, hashedTxId: evmTxHash, tokenAddrHash: tokenAddrHash, vault: vault});
                                                            }     
                                                       }
                                                       console.log('Output2:',output);
                                                       res.send(output);
                                                       return;

                                             
                                             }
                                             if (result) {
                                                  if (!stealthMode){
                                                       output = JSON.stringify({fromTokenContractAddress: fromTokenContract, contract: contract, from: toTargetAddrHash, tokenAmt: amt, signature: sig, hashedTxId: txid, tokenAddrHash: tokenAddrHash, vault: vault});
                                                  }
                                                  else {
                                                       output = JSON.stringify({fromTokenContractAddress: fromTokenContract, contract: contract, from: toTargetAddrHash, tokenAmt: amt, signature: sig, hashedTxId: evmTxHash, tokenAddrHash: tokenAddrHash, vault: vault});
                                                  }
                                                  console.log('Output3:', output);
                                                  res.send(output);
                                                  return;
                                             }
                                        });
                                   }
     
                                   catch (e) {

                                        if (e==="AlreadyMintedError"){
                                             console.log(e);
                                             output = JSON.stringify({ error: e + " It appears these coins were already bridged."});

                                        }
                                        else if (e==="GasTooLowError"){
                                             console.log(e);
                                             output = JSON.stringify({ error: e + " Try setting higher gas prices. Do you have enough tokens to pay for fees?"});

                                        }

                                        else {
                                             console.log(e);
                                             output = JSON.stringify({ error: e});
                                        }
                                        res.send(output);
                                        return;
                                   }
                              }
                              else{
                                   output = JSON.stringify({ error: "ContractMisMatchError: bad token or bridge contract address."})
                                   res.send(output);
                                   return;
                              }
                         }
                         else{
                              output = JSON.stringify({ error: "NullTransactionError: bad transaction hash, no transaction on chain"})
                              res.send(output);
                              return;
                         }
                    });
               }
          });
     } 
     else {
          console.log("Skipping processing this transaction, as it is in progress.");
          output = "TransactionProcessingError: Either transaction was processed or in progress.";
          res.send(output);
          return;  
     }   
});


/*
 * Concatenate the message to be hashed.
 */
function concatMsg(amt, targetAddressHash, txid, toContractAddress, toChainIdHash, vault){ 
     return amt+targetAddressHash+txid+toContractAddress+toChainIdHash+vault;
}

/* 
 * Settings retrieval
 */
function getSettings(){
     const data = fs.readFileSync('./SettingsMPC.json',
              {encoding:'utf8', flag:'r'});
     obj = JSON.parse(data);
     return obj;  
}

/*function findSetting(name, obj){
     let objVal = obj[name];
     return objVal;
}*/

/* return signed hashed transaction info */
function hashAndSignTx(amt, web3, vault, txInfo, txProcMap){
     return new Promise(async (resolve, reject) => {
          
          toTargetAddrHash = txInfo[5];
          txid = txInfo[0];
          toChainIdHash = txInfo[2];
          toContractAddress = txInfo[4];
          nonce = txInfo[7];

          try{
               console.log('Hashing:', 'To Wei Amount:',amt, 'txid:', txid, 'To Chain ID:', toChainIdHash , 'Contract Address:', toContractAddress, 'Vault:', vault);
               var message = concatMsg(amt, toTargetAddrHash, txid, toContractAddress, toChainIdHash, vault); 
               console.log('Message:', message);
               var hash = web3.utils.soliditySha3(message);
               console.log('Hash:', hash);
               var sig = await signMsg(hash, web3, txInfo, txProcMap);
               console.log('sig2:', sig);
               console.log('MPC Address:', web3.eth.accounts.recover(hash, sig));
               resolve(sig);
          }
          catch(err){
               console.log(err);
               reject(err);
          }
     });
}



async function signMsg(message, web3, txInfo, txProcMap){ //will become MPC

     return new Promise(async (resolve, reject) => {
          //let flatSig = await web3.eth.accounts.sign(message, PK);
          let myMsgHashAndPrefix = web3.eth.accounts.hashMessage(message);
          let netSigningMsg = myMsgHashAndPrefix.substr(2);
          let i = 0;
          console.log("txInfo:", txInfo);
          try {
               await signClient(i, netSigningMsg, txInfo, txProcMap)
               .then((mpcSig)=>{
                    console.log('mpc sig:', mpcSig);
                    
                    //addr = ethers.utils.recoverAddress(myMsgHashAndPrefix, mpcSig);
                    //console.log('address:', addr);
                    
                    resolve(mpcSig);
               });
               
          }
          catch (err){
               console.log('Error:',err);
               reject(err);
          }
     });

   
}


async function signClient(i, msgHash, txInfo, txProcMap){
     console.log('---------------------In Sign Client---------------------');
     return new Promise(async (resolve, reject) => { 
          let txid = txInfo[0];
          let fromNetId = txInfo[1];
          let toNetIdHash = txInfo[2];
          let tokenName = txInfo[3];
          let tokenAddrHash = txInfo[4];
          let toTargetAddrHash = txInfo[5];
          let msgSig = txInfo[6];
          let nonce = txInfo[7];
          let txidNonce = txid + nonce;

          console.log('TX Hash:', txid, 'From NetId:', fromNetId, 'To NetId Hash:', toNetIdHash, 'Token Name:', tokenName, 'tokenAddrHash:', tokenAddrHash, 'toTargetAddrHash', toTargetAddrHash, 'msgSig:', msgSig);

          find('name', 'gg18_sign_client '+ sm_managers[i]) //busy manager 
          .then(async function (list) {
               if (list.length > 0){
                    console.log('clientAlreadyRunning',list); 
               
                    /*if (i < sm_managers.length-1) { // Managers limited to 1 sig at a time, not multi-threaded or they will die
                         i++; //Go to next sm manager
                         console.log('New sm manager chosen:', sm_managers[i]);
                    }
                    else{*/

                         try {
                              x = (list.length === 1) ? 0 : 1;
                              uptimeCmd = 'ps -p '+list[x].pid+' -o etime';
                              uptimeOut = await exec(uptimeCmd);
                              upStdout = uptimeOut.stdout;
                              upStderr = uptimeOut.stderr;
          
                              if (upStdout) {
                                   up = upStdout.split('\n')[1].trim().split(':');
                                   console.log('upStdout:', up, 'Time Bound:', smTimeOutBound);
                                   upStdoutArr = up;
                                                            
                                   // SM Manager timed out
                                   if (Number(upStdoutArr[upStdoutArr.length-1]) >= smTimeOutBound){ 
                                        console.log('SM Manager signing timeout reached');
          
                                        try {
                                             /*for (i in list) {
                                                  killSigner(list[i].pid);
                                             }*/
                                             cmd = '/gg18_sign_client '+ sm_managers[i] + ' ' + keyStore + ' ' + msgHash;
                                             outKill = await exec(__dirname + cmd); // Make sure it's dead
                                        }
                                        catch(e){
                                             console.log('Partial signature process may not have exited:', e);
                                              // Remove from txProcMap
                                              txProcMap.set(txidNonce.toString(), false);
                                              console.log('txProcMap3',txProcMap);
                                              resolve(signClient(i, msgHash, txInfo, txProcMap));
                                              //reject('SignerKill: Try transaction again with new nonce.');
                                        }
          
                                   }
                                   else { //Loop SM Managers
                                        i = 0;  
                                        signClient(i, msgHash, txInfo, txProcMap);
                                   }
          
                              }
                              else {
                                   console.log('upStderr:',upStderr);
                                   reject('SignerDeadError2:',upStderr);
                              }

                         }
                         catch (e) {
                              console.log('SignerDeadError3:', e);
                              reject('SignerDeadError3:',e);
                         }
               }
               else {
                    console.log('About to message signers...');
                    try {
                         if (!txProcMap.get(txidNonce.toString())){
                              
                              txProcMap.set(txidNonce.toString(), true);
                              console.log('txProcMap2',txProcMap);

                              try {
                                   
                                   // Peer Notification for Transactions moved to front end, as axios doesn't "resolve()" easily under edge cases.
                                   /*let finalSig = null;
                                   let mappedPeers = mpcPeerArr.map((mpcNode) => axios.get("https://"+mpcNode+"/api/v1/getsig/txid/"+txid+"/fromNetId/"+fromNetId+"/toNetIdHash/"+toNetIdHash+"/tokenName/"+tokenName+"/tokenAddrHash/"+tokenAddrHash+"/msgSig/"+msgSig+"/toTargetAddrHash/"+toTargetAddrHash+"/nonce/"+nonce));
                                   console.log('mpcPeerArr', mpcPeerArr);
                                   axios.all(mappedPeers) // Calls endpoints of other MPC nodes
                                   .then((data) => { 
                                        console.log('Peer Notification Complete');
                                        console.log('AXIOS DATA: ', data);  
                                        resolve(finalSig);//??
                                   }).catch(e => {
                                        console.log('Error:', e);
                                        output = JSON.stringify({ Error: e});
                                        reject('SigFail:', output);
                                   });*/
                                   
                    
                                   //Invoke client signer.
                                   console.log('sm_managers[i]', sm_managers[i], i);
                                   cmd = '/gg18_sign_client '+ sm_managers[i] + ' ' + keyStore + ' ' + msgHash;
                                   console.log('Running:',cmd);
                                   out = await exec(__dirname + cmd);
                                   stdout = out.stdout;
                                   stderr = out.stderr;
                                   console.log('stdout:', stdout, stderr);
                                   if (stdout) {
                                        sig = stdout;
                                        sig = (sig.split('sig_json')[1]).split(',');
                                        if (sig.length >= 3) {
                                             r = sig[0].replace(': ','').replace(/["]/g,'').trim();
                                             s = sig[1].replace(/["]/g,'').trim();
                                             v = (Number(sig[2].replace(/["]/g,''))===0)?'1b':'1c';                              
                                             finalSig = '0x'+r+s+v;
                                             console.log('Signature:',finalSig);
                                             resolve(finalSig);
                                        }
                                   }
                                   else {
                                        console.log('stderr:', stderr);
                                        reject('SignerFailError1:', stderr);
                                   }

                              }
                              catch(e){
                                   console.log('SignerFailError2:', e);

                                   if (e.toString().includes("elements in xs are not pairwise distinct")){
                                        await sleep(2000);
                                        signClient(i, msgHash, txInfo, txProcMap);
                                   }  
                                   else {
                                        reject('SignerFailError2: '+e);
                                   }
                              }

                         }
                         else {
                              reject('AlreadyProcessingTransactionError: Nonce too low. Try again.');
                         }
                      
                    }
                    catch (e){
                         console.log('SignerFailError3:',e);
                         reject('SignerFailError3:', e);
                    }

               }
          }, function (err) {
               console.log(err.stack || err);
               reject(err.stack);
          })
          
     });
}

/*
 * kill running wallet
 */
async function killSigner(signerProc){
     try {

          /*let cmd = spawn('kill -9', [signerProc.toString()]);
          console.log(signerProc.toString());
          ls.stdout.on("data", data => {
               console.log(`stdout: ${data}`);
           });
           
           ls.stderr.on("data", data => {
               console.log(`stderr: ${data}`);
           });*/

          console.log("Killing Signer..");
          let cmd = 'kill -9 '+signerProc.toString();
          out = await exec(cmd);
          console.log("Signer dead...", out);
     }
     catch (e){
          console.log('Signer process already dead:', e);
     }
}

/*
 * Given txid returns transaction details if transaction is valid and was sent to the correct smart contract address
 * For multichain transactions
 */
async function getEVMTx(txh, w3From){ //, fromBridgeContract){
     console.log('In getEVMTx', 'txh:', txh);
     try {
          txh = txh.toString();
          let transaction = await w3From.eth.getTransaction(txh);
          let transactionReceipt = await w3From.eth.getTransactionReceipt(txh);
          console.log('GetEVMTransaction:', transaction);
          

          if (transaction != null && transactionReceipt != null && transaction != undefined && transactionReceipt != undefined ){
               console.log('Transaction:',transaction, 'Transaction Receipt:', transactionReceipt);
               transaction = Object.assign(transaction, transactionReceipt);
               var addrTo = transactionReceipt.logs[0].address; 
               var tokenAmt = (parseInt(transaction.input.slice(74,138), 16) / (10**18));
               tokenAmt -= (tokenAmt * .008);
               var contractTo = transaction.to;
               var from = transaction.from;
               var amount;

               let abi = [ "event BridgeBurned(address caller, uint256 amt)", "event VaultDeposit(address depositor, uint256 amt)" ];
               let iface = new ethers.utils.Interface(abi);
               let eventLog = transaction.logs;
               var log = null;
               console.log("Log Length:", eventLog.length);
               for (i = 0;  i < eventLog.length; i++){
                    try {
                         log = iface.parseLog(transaction.logs[i]); 
                         console.log('log', log.name);   
                         log = log.name;
    
                    } catch (error) {
                         console.log("EventNotFoundError in log number:", i);
                    }
                   
               }
               
               if (transactionReceipt.logs[0].data == '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'){
                    amount = 0;
               }

               else {
                    amount = Number(transactionReceipt.logs[0].data);
               }
               amount =  w3From.utils.fromWei((amount.toLocaleString('fullwide', {useGrouping:false})).toString());
               console.log("Transaction to (Smart Contract):",contractTo);
               console.log("Transaction from:", from);
               console.log("Transaction to (Address):", addrTo);
               var transactionObj = JSON.parse('{"contractTo":"'+ contractTo +'", "addressTo":"'+ addrTo +'","from":"'+ from +'","tokenAmount":"'+ tokenAmt +'", "log":"'+ log +'", "value":"'+ amount +'"}');
               console.log('TransactionObj:',transactionObj);
               return transactionObj;
          }
          else {
               error2 = "TransactionRetrievalError: Failed to retrieve transaction. Check transaction hash is correct.";
               console.log('Error:', error2);
               return null;
          }

     } catch (error) {
          console.log('getEVMTxError:', error);
          return null;
     }
}


function sleep(millis) {
     return new Promise(resolve => setTimeout(resolve, millis));
}


