import useActiveWeb3React from "hooks/useActiveWeb3React";
import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  useBridge,
  useFetchUserBalances,
  useGetAvailableTokens,
  useGetQuote,
  useSwap,
  useUpdateActiveChains,
} from "state/swap/hooks";
import { AppState } from "state/store";
import { useAppSelector } from "state/hooks";
import { useDispatch, useSelector } from "react-redux";
import {
  Field,
  updateActiveChains,
  updateCurrentAmount,
  updateCurrentSelectSide,
  updateCurrentTrade,
  updateError,
} from "state/swap/action";
import SwapHeader from "components/Swap/Header";
import Exchange from "components/Swap/Exchange";
import Lottie from "lottie-react";
import { useWalletModalToggle } from "state/application/hooks";
import { ChainId } from "constants/chainIds";
import Head from "next/head";
import TransactionDetail from "components/Swap/TransactionDetail";
import CustomizedSteppers from "components/Stepper";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import {
  NETWORK_ICON,
  NETWORK_LABEL,
  SUPPORTED_NETWORKS,
} from "config/networks";
import ListCard from "components/Swap/ListCard";
import {
  altContract,
  useLbtcContract,
  useTeleportContract,
} from "hooks/useContract";
import { Contract } from "ethers";
import addresses from "constants/addresses";
import Web3 from "web3";
import { isAddress } from "functions/validate";
import { switchChain } from "functions/contract";
import { RedoRounded } from "@mui/icons-material";

interface SwapProps {}

const Swap: React.FC<SwapProps> = ({}) => {
  const { library, connector, chainId, account } = useActiveWeb3React();
  const { loading } = useSelector((state: any) => state.swap);
  const { Moralis, initialize } = useMoralis();
  const teleportContract = useTeleportContract();
  const dispatch = useDispatch();
  const toggleWalletModal = useWalletModalToggle();
  const getAvailableTokens = useGetAvailableTokens();
  const fetchUserBalances = useFetchUserBalances();
  const swapTokens = useSwap();
  const bridgeTokens = useBridge();
  const getQuote = useGetQuote();
  const updateChains = useUpdateActiveChains();
  const [animateSwapArrows, setAnimateSwapArrows] = useState<boolean>(false);
  const [TeleportContractBurn, setTeleportContractBurn] = useState<any>();
  const [TeleportContractMint, setTeleportContractMint] = useState<any>();
  const [fromTeleportAddr, setFromTeleportAddr] = useState("");
  const [evmToAddress, setEvmToAddress] = useState("");
  const [bridgeState, setBridgeState] = useState<{
    toTargetAddrHash?: string;
    toTokenAddrHash?: string;
    toNetIdHash?: string;
    signature?: string;
    hashedTxId?: string;
    transferTxHash?: string;
    tokenAddrHash?: string;
    vault?: string;
    networkType?: string;
    status:
      | "IDLE"
      | "PROCESSING"
      | "BURNED"
      | "MINTED"
      | "TRANSFERING"
      | "SUCCESS"
      | "FAILED";
    text?: string;
  }>({
    status: "IDLE",
  });
  const router = useRouter();

  const {
    currentAmount,
    currentTrade,
    currentBalances,
    error,
    currentSelectSide,
    balances,
    activeChains,
  } = useAppSelector((state: AppState) => state.swap);

  const isCrossChain = activeChains?.from !== activeChains?.toChain;

  const initMoralis = useCallback(() => {
    async () => {
      if (chainId) {
        try {
          await Moralis.initPlugins();
          await Moralis.enableWeb3();
          getAvailableTokens();
          fetchUserBalances();
          if (!Moralis.User.current()) await Moralis.authenticate();
        } catch (error) {
          console.log("error in init", error);
        }
      }
    };
  }, [Moralis, chainId, fetchUserBalances, getAvailableTokens]);

  useEffect(() => {
    setEvmToAddress(account);
    initMoralis();
  }, [chainId]);

  useEffect(() => {
    if (currentTrade) {
      fetchUserBalances();
    }
  }, [currentTrade]);

  const handleChange = (value, side?) => {
    const newAmount = { ...currentAmount, [side || currentSelectSide]: value };

    if (!isCrossChain) {
      getQuote(newAmount, side);
    } else {
      if (side === Field.INPUT) {
        console.log("okurrrrurhuinsjcd");
        newAmount.to = (value - value * 0.001).toString();
      } else {
        console.log("init value", newAmount);
        const newVal = value * 0.001;
        console.log(" value * 0.001 value", value, newVal);

        newAmount.from = (newVal + value).toString();
      }
    }
    if (currentBalances[Field.INPUT] < newAmount.from) {
      dispatch(
        updateError({
          description: "Insufficient Balance",
        })
      );
    } else {
      dispatch(updateError(null));
    }
    console.log("newAmountssssss", newAmount);
    if (side) {
      console.log("side exisststsss currentSelectSide", side);
      updateCurrentSelectSide(side);
    }
    dispatch(updateCurrentAmount(newAmount));
  };
  const onSwitchTokens = () => {
    router.query["fromChain"] = String(activeChains.to);
    router.query["toChain"] = String(activeChains.from);
    router.query["from"] = String(currentTrade.to.symbol.toUpperCase());
    router.query["to"] = String(currentTrade.from.symbol.toUpperCase());
    router.push(router);
    dispatch(
      updateCurrentTrade({
        to: currentTrade.from,
        from: currentTrade.to,
      })
    );
    dispatch(
      updateActiveChains({
        to: activeChains.from,
        from: activeChains.to,
      })
    );

    const newAmount = {
      to: currentAmount.from,
      from: currentAmount.to,
    };
    dispatch(updateCurrentAmount(newAmount));
  };

  //BRIDGE FUNCTIONS
  async function handleInput() {
    if (chainId !== activeChains?.from) {
      await switchChain(activeChains?.from, library, account);
      return;
    }
    setBridgeState({ ...bridgeState, status: "PROCESSING" });
    const teleportContractBurn2 = await setNets();
    const msgSig = await library
      ?.getSigner()
      .signMessage("Sign to prove you are initiator of transaction.");

    try {
      const amt = Web3.utils.toWei(currentAmount[Field.INPUT].toString()); // Convert intialAmt toWei
      console.log(
        "teleportContractBurn2:",
        teleportContractBurn2,
        amt,
        currentTrade[Field.INPUT].address
      );

      const tx = await teleportContractBurn2.bridgeBurn(
        amt,
        currentTrade[Field.INPUT].address
      ); // Burn coins
      console.log("txxxxx:", tx);

      let cnt = 0;

      // Listen for burning completion
      //CANT BE TRUSTED
      // teleportContractBurn2.once("BridgeBurned", async (caller, amount) => {
      //   console.log("Recipient:", caller);

      //   console.log("Amount:", amount.toString());

      //   if (cnt == 0) {
      //     setBridgeState({ ...bridgeState, status: "BURNED" });
      //     handleMint(
      //       amount,
      //       cnt,
      //       activeChains?.from,
      //       activeChains?.to,
      //       tx,
      //       msgSig
      //     );
      //     cnt++;
      //   }
      // });

      const receipt = await tx.wait();
      console.log("Receipt:", receipt, receipt.status === 1);

      if (receipt.status !== 1) {
        console.log("Transaction Failure.");

        return;
      } else {
        console.log("Receipt received");
        teleportContractBurn2.off("BridgeBurned");
        teleportContractBurn2.removeAllListeners(["BridgeBurned"]);

        if (cnt == 0) {
          setBridgeState({ ...bridgeState, status: "BURNED" });
          console.log(
            "cookie array:",
            amt,
            cnt,
            tx,
            currentAmount[Field.INPUT].name
          );
          await handleMint(
            amt,
            cnt,
            activeChains?.from,
            activeChains?.to,
            tx,
            msgSig
          );
          cnt++;
        }
      }
    } catch (err) {
      console.log("Error: inhandle input", err);
      return;
    }
  }

  async function setNets() {
    console.log("currentTrade", currentTrade);
    console.log("teleportContract", teleportContract);
    const fromNetRadio = activeChains?.from;
    const toNetRadio = activeChains?.to;
    console.log("chains", fromNetRadio, toNetRadio);
    let teleportContractBurn2;
    try {
      if (fromNetRadio == "43113" && toNetRadio == "4") {
        // && tokenName == "LuxBTC" => check if token is LBTC or LETH
        console.log("from lux to eth chain");
        setTeleportContractBurn(
          altContract("TELEPORT", 43113, account, library)
        ); //set contract burn to teleport lux contract
        setTeleportContractMint(altContract("TELEPORT", 4, account, library)); //set contract mint to teleport eth contract
        setFromTeleportAddr(addresses.Teleport_Lux);
      } else if (fromNetRadio == "4" && toNetRadio == "43113") {
        setTeleportContractBurn(altContract("TELEPORT", 4, account, library)); //set contract burn to teleport eth contract
        teleportContractBurn2 = altContract("TELEPORT", 4, account, library);
        setTeleportContractMint(
          altContract("TELEPORT", 43113, account, library)
        ); //set contract mint to teleport lux contract
        setFromTeleportAddr(addresses.Teleport_Eth);
      }
    } catch (error) {
      setBridgeState({ ...bridgeState, status: "FAILED" });
      setTimeout(() => {
        setBridgeState({ ...bridgeState, status: "IDLE" });
      }, 2000);
    }

    console.log("TeleportContract TeleportContractBurn", TeleportContractBurn);
    console.log("TeleportContract TeleportContractMint", TeleportContractMint);
    console.log("teleportContractBurn2", teleportContractBurn2);
    return teleportContractBurn2;
  }

  //async function handleMint(amount, cnt, fromNetId, toNetId, receipt, tx){
  async function handleMint(amount, cnt, fromNetId, toNetId, tx, msgSig) {
    const amtNoWei = Web3.utils.fromWei(amount.toString());
    console.log("amtNoWei", Number(amtNoWei), "cnt", cnt);
    const txid = tx.hash;
    console.log("txid:", txid);

    if (Number(amtNoWei) > 0 && cnt == 0) {
      const toNetIdHash = Web3.utils.keccak256(toNetId.toString());
      const toTargetAddrHash = Web3.utils.keccak256(evmToAddress); //Web3.utils.keccak256(evmToAddress.slice(2));
      const toTokenAddrHash = Web3.utils.keccak256(
        currentTrade[Field.OUTPUT].address
      ); //Web3.utils.keccak256(toTokenAddress.slice(2));
      const cmd =
        "https://teleporter.wpkt.cash/api/v1/getsig/txid/" +
        txid +
        "/fromNetId/" +
        fromNetId +
        "/toNetIdHash/" +
        toNetIdHash +
        "/tokenName/" +
        currentTrade[Field.OUTPUT].name +
        "/tokenAddrHash/" +
        toTokenAddrHash +
        "/msgSig/" +
        msgSig +
        "/toTargetAddrHash/" +
        toTargetAddrHash;

      console.log("cmd", cmd);

      fetch(cmd)
        .then((response) => response.json())
        .then(async (result) => {
          console.log("Data:", result);

          if (result.signature && result.hashedTxId) {
            // Set globals
            console.log("result here", result);
            setBridgeState({ ...bridgeState, ...result, status: "MINTED" });
          } else if (Number(result.output) === -1) {
            console.log("Duplicate transaction.");
            return;
          } else if (Number(result.output) === -3) {
            console.log("Gas price error.");
            return;
          } else if (Number(result.output) === -4) {
            console.log("Unknown Error.");
            return;
          } else if (Number(result.output) === -5) {
            console.log("Front Run Attempt.");
            return;
          } else {
            console.log("Bad transaction.");
            return;
          }
        })
        .catch(async function (err) {
          console.log("error", err);
          return;
        });

      return;
    } else {
      return;
    }
  }

  //Complete transaction after minting
  async function completeTransaction() {
    console.log("CompleteTransaction - switching to:", activeChains);
    const { signature, hashedTxId, status } = bridgeState;
    await setNets();
    if (chainId !== activeChains?.to) {
      await switchChain(activeChains?.to, library, account);
    }
    console.log("completeTransaction 1", TeleportContractMint);
    try {
      if (!TeleportContractMint) {
        console.log(
          " completeTransaction TeleportContractMintError:",
          TeleportContractMint
        );
        throw new Error(" completeTransaction Bad contract mint object.");
      }
      console.log("completeTransaction 2");

      // Check if key exists to know if transaction was already completed.
      const keyExists = await TeleportContractMint.keyExistsTx(
        bridgeState?.signature
      );

      console.log("keyExists", keyExists);

      if (keyExists) {
        console.log("key exists");
      }
    } catch (err) {
      console.log("completeTransaction Transaction Failure. 1", err);
      // setBridgeState({ ...bridgeState, status: "FAILED" });
      return;
    }
    console.log("completeTransaction 3", signature, hashedTxId, status);

    if (signature && hashedTxId && status !== "SUCCESS") {
      setBridgeState({ ...bridgeState, status: "TRANSFERING" });
      console.log("completeTransaction 4", bridgeState);

      try {
        const toNetIdHash = Web3.utils.keccak256(activeChains?.to.toString());
        const toTargetAddrHash = Web3.utils.keccak256(evmToAddress); //Web3.utils.keccak256(evmToAddress.slice(2));
        console.log(
          "completeTransaction 5",
          "toTargetAddrHash",
          toTargetAddrHash,
          "toNetIdHash",
          toNetIdHash,
          "currentAmount",
          currentAmount[Field.INPUT],
          "currentAmount[Field.INPUT]",
          "hashedTxId",
          hashedTxId,
          "signature",
          signature,
          " currentTrade[Field.OUTPUT].address",
          currentTrade[Field.OUTPUT].address,
          "activeChains?.to",
          activeChains?.to
        );

        const tx = await TeleportContractMint.bridgeMintStealth(
          Web3.utils.toWei(currentAmount[Field.INPUT].toString()),
          hashedTxId.toString(),
          evmToAddress.toString(),
          signature,
          currentTrade[Field.OUTPUT].address.toString(),
          activeChains?.to.toString(),
          "false",
          {
            gasLimit: 4000000,
          }
        );
        console.log("completeTransaction 6 TX: in TeleportContractMint", tx);

        const receipt = await tx.wait();

        setBridgeState({
          ...bridgeState,
          text: `Pending Transaction ID:${tx.hash} Please wait for on-chain confirmation...`,
        });

        TeleportContractMint.once(
          "BridgeMinted",
          async (recip, tokenAddr, amount) => {
            let feesNoWei = 0;
            console.log("Recipient:", recip);
            console.log("Amount:", amount.toString());
            const amtNoWei = Web3.utils.fromWei(amount.toString());
            const initialAmt = Web3.utils.fromWei(
              currentAmount[Field.OUTPUT].toString()
            );
            console.log("amtNoWei", amtNoWei, initialAmt);
            if (Number(amtNoWei) > 0) {
              const fees = Number(initialAmt) - Number(amtNoWei);
              feesNoWei = parseFloat(fees.toFixed(10));
            }

            console.log(
              "Amount:",
              amtNoWei,
              "Fees:",
              feesNoWei,
              "Token Address:",
              tokenAddr
            );

            if (Number(amtNoWei) > 0) {
              if (receipt !== undefined) {
                setBridgeState({
                  ...bridgeState,
                  transferTxHash: receipt.transactionHash,
                  text: `Your transaction hash is ${receipt.transactionHash}`,
                });
              }

              setBridgeState({
                ...bridgeState,
                status: "SUCCESS",
                text: `If the Teleport token hasn't already been added to your wallet yet, use the button below to add it. Make sure to add it to the right MetaMask account.`,
              });
              return;
            } else {
              setBridgeState({
                ...bridgeState,
                status: "FAILED",
                text: `Transaction Failure: >Bad transaction. Check your sender / recipient address pair or transaction hash. `,
              });
              return;
            }
          }
        );

        console.log("Receipt:", receipt, receipt.status === 1);

        if (receipt.status !== 1) {
          console.log("Transaction Failure.");
          setBridgeState({
            ...bridgeState,
            status: "FAILED",
            text: `Transaction Failure: possible you have already claimed this transaction.`,
          });
          return;
        } else {
          console.log("Receipt received");
          if (bridgeState.status !== "SUCCESS") {
            setBridgeState({
              ...bridgeState,
              status: "SUCCESS",
              text: `If the Teleport token hasn't already been added to your wallet yet, use the button below to add it. Make sure to add it to the right MetaMask account.`,
            });
          }

          TeleportContractMint.removeAllListeners(["BridgeMinted"]);
        }
      } catch (err) {
        console.log("Error in complete transaction:", err);
        // setBridgeState({
        //   ...bridgeState,
        //   status: "FAILED",
        //   text: `Transaction Failure: ${err.message}`,
        // });
        return;
      }
    } else {
      setBridgeState({
        ...bridgeState,
        status: "FAILED",
        text: "Transaction Failure: Can not retrieve data from bridge servers.",
      });
      return;
    }
  }
  return (
    <main className="flex flex-col items-center justify-center flex-grow w-full h-full px-2 mt-24 sm:px-0">
      <div id="swap-page" className="w-full max-w-xl py-4 md:py-8 lg:py-12">
        <Head>
          <title>LUX | BRIDGE</title>
          <meta
            key="description"
            name="description"
            content="Lux Zero Knowledge Privacy Bridge"
          />
        </Head>

        <div className="py-6 space-y-4 rounded-3xl bg-primary z-1 mb-7">
          {/* Add slippage */}
          <div className="px-5">
            <SwapHeader
              input={currentTrade[Field.INPUT]}
              output={currentTrade[Field.OUTPUT]}
              crossChain={isCrossChain}
              bothSelected={
                currentTrade.from &&
                currentTrade.to &&
                activeChains.from &&
                activeChains.to
              }
              fromChain={NETWORK_LABEL[Number(activeChains?.from)]}
              toChain={NETWORK_LABEL[Number(activeChains?.to)]}
            />
          </div>
          {/* <ConfirmSwapModal
                isOpen={showConfirm}
                trade={trade}
                originalTrade={tradeToConfirm}
                onAcceptChanges={handleAcceptChanges}
                attemptingTxn={attemptingTxn}
                txHash={txHash}
                recipient={recipient}
                allowedSlippage={allowedSlippage}
                onConfirm={handleSwap}
                swapErrorMessage={swapErrorMessage}
                onDismiss={handleConfirmDismiss}
                minerBribe={doArcher ? archerETHTip : undefined}
              /> */}
          <div className="mb-12">
            <div className="px-5">
              <Exchange
                chainBalances={balances[activeChains?.from] || []}
                // priceImpact={priceImpact}
                label={`Swap From:`}
                selectedCurrencyBalance={"0"}
                value={currentAmount[Field.INPUT]}
                showMaxButton={true}
                token={currentTrade[Field.INPUT]}
                onUserInput={(val) => handleChange(val, Field.INPUT)}
                onMax={() =>
                  handleChange(currentBalances[Field.INPUT], Field.INPUT)
                }
                // fiatValue={fiatValueInput ?? undefined}
                onCurrencySelect={(token) => {
                  dispatch(
                    updateCurrentTrade({
                      ...currentTrade,
                      from: { ...token, isNative: token.symbol === "ETH" },
                    })
                  );
                  router.query.from = token.symbol.toUpperCase();
                  router.push(router);
                }}
                otherToken={currentTrade[Field.OUTPUT]}
                showCommonBases={true}
                onKeyDownFunc={() =>
                  dispatch(updateCurrentSelectSide(Field.INPUT))
                }
                id="swap-currency-input"
                onChainChange={(val) => updateChains(val, "from")}
              />
            </div>
            <div className="relative grid py-3">
              <hr className="h-px bg-[#323546] opacity-30 block absolute w-full top-[50%] z-[1]" />
              <div className="z-10 flex flex-wrap justify-center w-full px-4">
                <button
                  className="-mt-6 -mb-6 rounded-full"
                  onClick={() => {
                    onSwitchTokens();
                  }}
                >
                  <div className="p-1 rounded-full bg-secondary">
                    <div
                      className="flex flex-col justify-center py-1 rounded-full"
                      onMouseEnter={() => setAnimateSwapArrows(true)}
                      onMouseLeave={() => setAnimateSwapArrows(false)}
                    >
                      <Image
                        src="/icons/swithcer.svg"
                        alt=""
                        width={30}
                        height={30}
                        className="stroke-white"
                      />
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="px-5">
              <Exchange
                chainBalances={balances[activeChains?.to] || []}
                // priceImpact={priceImpact}
                label={`Swap To:`}
                selectedCurrencyBalance={currentBalances[Field.OUTPUT]}
                value={currentAmount[Field.OUTPUT]}
                showMaxButton={true}
                token={currentTrade[Field.OUTPUT]}
                onUserInput={(val) => handleChange(val, Field.OUTPUT)}
                onMax={() =>
                  handleChange(currentBalances[Field.OUTPUT], Field.OUTPUT)
                }
                // fiatValue={fiatValueInput ?? undefined}
                onCurrencySelect={(token) => {
                  dispatch(
                    updateCurrentTrade({
                      ...currentTrade,
                      to: { ...token, isNative: token.symbol === "ETH" },
                    })
                  );
                  router.query.to = token.symbol.toUpperCase();
                  router.push(router);
                }}
                otherToken={currentTrade[Field.INPUT]}
                showCommonBases={true}
                onKeyDownFunc={() =>
                  dispatch(updateCurrentSelectSide(Field.OUTPUT))
                }
                id="swap-currency-output"
                onChainChange={(val) => updateChains(val, "to")}
              />
            </div>
          </div>
          {currentTrade.from &&
            currentTrade.to &&
            activeChains.from &&
            activeChains.to &&
            activeChains.to !== activeChains.from && (
              <CustomizedSteppers
                activeStep={
                  bridgeState?.status === "MINTED"
                    ? 1
                    : bridgeState?.status === "TRANSFERING" ||
                      bridgeState?.status === "SUCCESS"
                    ? 2
                    : 0
                }
                steps={
                  bridgeState?.status === "SUCCESS"
                    ? [
                        {
                          label: NETWORK_LABEL[Number(activeChains?.to)],
                          icon: 3,
                          logo:
                            NETWORK_ICON[Number(activeChains?.to)] ||
                            "/icons/livepeer.png",
                        },
                      ]
                    : [
                        {
                          label: NETWORK_LABEL[Number(activeChains?.from)],
                          icon: 1,
                          logo:
                            NETWORK_ICON[Number(activeChains?.from)] ||
                            "/icons/livepeer.png",
                        },
                        {
                          label: "Teleport",
                          sublabel: "Private Routing",
                          icon: 2,
                          logo: "/icons/livepeer.png",
                        },
                        {
                          label: NETWORK_LABEL[Number(activeChains?.to)],
                          icon: 3,
                          logo:
                            NETWORK_ICON[Number(activeChains?.to)] ||
                            "/icons/livepeer.png",
                        },
                      ]
                }
              />
            )}
          {currentTrade.from &&
            currentTrade.to &&
            activeChains?.from &&
            activeChains?.to &&
            activeChains?.to === activeChains?.from && (
              <div className="px-5">
                <ListCard
                  fee="1%"
                  label="Via 1inch"
                  amount={currentAmount[Field.OUTPUT]}
                  className="flex items-center justify-between"
                />
                <div className="flex flex-wrap gap-x-6"></div>
              </div>
            )}
          <div className="flex flex-wrap px-5 mt-1">
            {activeChains.from !== activeChains.to && (
              <div className="w-full mb-2">
                <input
                  type="text"
                  id="token-search-input"
                  placeholder="Enter Destination Address"
                  autoComplete="off"
                  value={evmToAddress}
                  onChange={(e) => setEvmToAddress(e.target.value)}
                  className="w-full bg-transparent border bg-[#1B1D2B] border-[#323546] focus:outline-none rounded-full placeholder-white-50  font-light text-sm pl-3 px-6 py-4 "
                />
                <p className="ml-3 text-xs text-grey-100">
                  Destination Address
                </p>
              </div>
            )}

            {!account ? (
              <div
                className="w-full px-6 py-4 text-base text-center text-white border rounded-full shadow-sm cursor-pointer focus:ring-2 focus:ring-offset-2 bg-primary-300 border-dark-800 focus:ring-offset-dark-700 focus:ring-dark-800 disabled:bg-opacity-80 disabled:cursor-not-allowed focus:outline-none"
                onClick={toggleWalletModal}
              >
                Connect Wallet
              </div>
            ) : (
              <button
                className="w-full h-10 text-base text-center text-white rounded-full shadow-sm bg-primary-300 disabled:bg-opacity-80 disabled:cursor-not-allowed focus:outline-none"
                onClick={async () => {
                  if (
                    bridgeState?.status === "MINTED" ||
                    bridgeState?.status === "TRANSFERING" ||
                    bridgeState?.status === "BURNED" ||
                    bridgeState?.status === "FAILED" //Take this out
                  ) {
                    completeTransaction();
                    console.log("activechainssss", activeChains);
                  } else if (bridgeState?.status === "SUCCESS") {
                    setBridgeState({ status: "IDLE" });
                  } else {
                    if (!evmToAddress || !isAddress(evmToAddress)) {
                      alert("Update EVM address");
                      return;
                    }
                    handleInput();
                  }
                }}
                id="swap-button"
                disabled={
                  !currentAmount[Field.INPUT] ||
                  !currentAmount[Field.OUTPUT] ||
                  bridgeState?.status === "TRANSFERING" ||
                  bridgeState?.status === "PROCESSING"
                }
              >
                {bridgeState?.status === "PROCESSING" ? (
                  <i className="text-white fas fa-circle-notch animate-spin" />
                ) : bridgeState?.status === "BURNED" ? (
                  "Minting"
                ) : bridgeState?.status === "MINTED" ? (
                  <div className="flex h-full">
                    <div className="flex items-center justify-center w-2/3 ">
                      Continue
                    </div>
                    <div
                      onClick={() => setBridgeState({ status: "IDLE" })}
                      className="flex items-center justify-center w-1/3 h-full rounded-l-full bg-primary "
                    >
                      <RedoRounded />
                    </div>
                  </div>
                ) : bridgeState?.status === "TRANSFERING" ? (
                  "Transfering"
                ) : bridgeState?.status === "SUCCESS" ? (
                  "Restart"
                ) : (
                  "Bridge"
                )}
              </button>
            )}
          </div>
          {/* <UnsupportedCurrencyFooter show={swapIsUnsupported} currentTrade={[currentTrade.INPUT, currentTrade.OUTPUT]} /> */}
        </div>
        {activeChains.from && activeChains.to && currentTrade.from !== 0 && (
          <TransactionDetail
            evmToAddress={evmToAddress}
            amount={currentAmount[Field.INPUT]}
            token={currentTrade[Field.INPUT]}
            bridgeState={bridgeState}
          />
        )}
      </div>
    </main>
  );
};

export default Swap;
