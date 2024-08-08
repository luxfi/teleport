/**
 *Submitted for verification at basescan.org on 2024-03-20
 */
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ERC20B.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/* __                      ____    ______  __  __
/\ \                    /\  _`\ /\__  _\/\ \/\ \
\ \ \      __  __  __  _\ \ \L\_\/_/\ \/\ \ \_\ \
 \ \ \  __/\ \/\ \/\ \/'\\ \  _\L  \ \ \ \ \  _  \
  \ \ \L\ \ \ \_\ \/>  </ \ \ \L\ \ \ \ \ \ \ \ \ \
   \ \____/\ \____//\_/\_\ \ \____/  \ \_\ \ \_\ \_\
    \/___/  \/___/ \//\/_/  \/___/    \/_/  \/_/\/_/
*/

contract Bridge is Ownable, AccessControl {

    uint256 internal fee = 0; //zero default
    uint256 public feeRate = 10 * (uint256(10) ** 15); // Fee rate 1%
    address internal payoutAddr;

    /* Events */
    event BridgeBurned(address caller, uint256 amt);
    event SigMappingAdded(bytes _key);
    event NewMPCOracleSet(address MPCOracle);
    event BridgeMinted(address recipient, address token, uint256 amt);
    event AdminGranted(address to);
    event AdminRevoked(address to);


    constructor() Ownable(msg.sender) {
        grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /*
     * dev Sets admins
     */
    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Ownable");
        _;
    }

    function grantAdmin(address to) public onlyAdmin {
        grantRole(DEFAULT_ADMIN_ROLE, to);
        emit AdminGranted(to);
    }

    function revokeAdmin(address to) public onlyAdmin {
        require(hasRole(DEFAULT_ADMIN_ROLE, to), "Ownable");
        revokeRole(DEFAULT_ADMIN_ROLE, to);
        emit AdminRevoked(to);
    }

    /*
     * dev Set fee payout addresses and fee - set at contract launch - in wei
     */
    function setPayoutAddress(address addr, uint256 feeR) public onlyAdmin{
        payoutAddr = addr;
        feeRate = feeR;
    }

    /*
     * dev: Mappings
     */
    struct MPCOracleAddrInfo{
        bool exists;
    }

    /*
     * dev: Map MPCOracle address at blockHeight
     */
    mapping(address => MPCOracleAddrInfo) internal MPCOracleAddrMap;

    function addMPCMapping(address _key) internal {
        MPCOracleAddrMap[_key].exists = true;
    }

    /*
     * dev: Used to set a new MPC address at block height - only MPC signers can update
     */
    function setMPCOracle (address MPCO) public onlyAdmin {
        addMPCMapping(MPCO); // store in mapping.
        emit NewMPCOracleSet(MPCO);
    }

    function getMPCMapDataTx(address _key) public view returns (bool){
        return MPCOracleAddrMap[_key].exists;
    }

    /*
     * dev: Struct for mapping transaction history
     */
    struct TransactionInfo{
        string txid;
        bool exists;
        //bool isStealth;
    }

    mapping(bytes => TransactionInfo) internal transactionMap;

    function addMappingStealth(bytes memory _key) internal {
        require(!transactionMap[_key].exists);
        transactionMap[_key].exists = true;
        emit SigMappingAdded(_key);
    }

    function keyExistsTx(bytes memory _key) public view returns (bool){
        return transactionMap[_key].exists;
    }


    /*
     * dev: Burns the msg.senders coins
     */
    function bridgeBurn(uint256 amount, address tokenAddr) public {
        VarStruct memory varStruct;
        varStruct.token = ERC20B(tokenAddr);
        require((varStruct.token.balanceOf(msg.sender) > 0), "ZeroBal");
        varStruct.token.bridgeBurn(msg.sender, amount);
        emit BridgeBurned(msg.sender, amount);
    }

    /*
     * dev Concat data to sign
     */
    function append(string memory amt, string memory toTargetAddrStr, string memory txid, string memory tokenAddrStrHash, string memory chainIdStr, string memory vault) internal pure returns (string memory) {
        return string(abi.encodePacked(amt, toTargetAddrStr, txid, tokenAddrStrHash, chainIdStr, vault));
    }



    struct VarStruct {
        bytes32 tokenAddrHash;
        string amtStr;
        bytes32 toTargetAddrStrHash;
        bytes32 toChainIdHash;
        address toTargetAddr;
        ERC20B token;
    }


    /*
     * dev Sig is specific to recipient target address, hashed txid, amount, block height, target token and target chain
     * Sig can only be claimed once.
     */
    function bridgeMintStealth(uint256 amt, string memory hashedId, address toTargetAddrStr, bytes memory signedTXInfo, address tokenAddrStr, string memory chainId, string memory vault) public returns (address) {

        VarStruct memory varStruct;

        varStruct.tokenAddrHash = keccak256(abi.encodePacked(tokenAddrStr));
        varStruct.token = ERC20B(tokenAddrStr);
        varStruct.toTargetAddr = toTargetAddrStr;
        varStruct.toTargetAddrStrHash = keccak256(abi.encodePacked(toTargetAddrStr));
        varStruct.amtStr = Strings.toString(amt);
        varStruct.toChainIdHash = keccak256(abi.encodePacked(chainId));

        // Concat msg
        string memory msg1 = append(varStruct.amtStr, Strings.toHexString(uint256(varStruct.toTargetAddrStrHash), 32), hashedId, Strings.toHexString(uint256(varStruct.tokenAddrHash), 32), Strings.toHexString(uint256(varStruct.toChainIdHash), 32), vault);

        // Check signedTXInfo doesn't already exist
        require(!transactionMap[signedTXInfo].exists, "DupeTX");

        address signer = recoverSigner(prefixed(keccak256(abi.encodePacked(msg1))), signedTXInfo);

        // Check signer is MPCOracle and corresponds to the correct ERC20 B
       require((MPCOracleAddrMap[signer].exists), 'BadSig');

        //If correct signer, then payout
        fee = amt * feeRate / 10 ** 18;
        amt -= fee; //remove fees

        varStruct.token.bridgeMint(payoutAddr, fee);
        varStruct.token.bridgeMint(varStruct.toTargetAddr, amt);

        //add new txid Mapping
        addMappingStealth(signedTXInfo);

        emit BridgeMinted(varStruct.toTargetAddr, tokenAddrStr, amt);

        return signer;
    }


    function splitSignature(bytes memory sig) internal pure returns (uint8, bytes32, bytes32)
    {
        require(sig.length == 65);
        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }

    function recoverSigner(bytes32 message, bytes memory sig) internal pure returns (address)
    {
        uint8 v;
        bytes32 r;
        bytes32 s;
        (v, r, s) = splitSignature(sig);
        return ecrecover(message, v, r, s);
    }

    /*
     * dev: Builds a prefixed hash to mimic the behavior of eth_sign.
     */
    function prefixed(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

}
