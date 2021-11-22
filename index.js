import WalletConnect from "@walletconnect/client";
import QRCodeModal from "algorand-walletconnect-qrcode-modal";
import algosdk from "algosdk";
import { formatJsonRpcRequest } from "@json-rpc-tools/utils";

window.global = window;
window.Buffer = window.Buffer || require("buffer").Buffer;
let senderAddress;
let chainValue;
let suggestedParams;
// Create a connector
const connector = new WalletConnect({
  bridge: "https://bridge.walletconnect.org", // Required
  qrcodeModal: QRCodeModal,
});

// Check if connection is already established
if (!connector.connected) {
  // create new session
  connector.createSession();
}

// Subscribe to connection events
connector.on("connect", (error, payload) => {
  if (error) {
    throw error;
  }

  // Get provided accounts
  const { accounts } = payload.params[0];
  senderAddress = accounts[0];
});

connector.on("session_update", (error, payload) => {
  if (error) {
    throw error;
  }

  // Get updated accounts
  const { accounts } = payload.params[0];
  senderAddress = accounts[0];
});

connector.on("disconnect", (error, payload) => {
  if (error) {
    throw error;
  }
});

export async function apiGetTxnParams(chain) {
  const params = await clientForChain(chain).getTransactionParams().do();
  return params;
}

function stringToChainType(s) {
  switch (s) {
    case ChainType.MainNet.toString():
      return ChainType.MainNet;
    case ChainType.TestNet.toString():
      return ChainType.TestNet;
    default:
      throw new Error(`Unknown chain selected: ${s}`);
  }
}

select.addEventListener("change", async (e) => {
  chainValue = stringToChainType(e.target.value);
  suggestedParams = await apiGetTxnParams(chainValue);
});

form.addEventListener("submit", async () => {
  // Draft transaction
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: senderAddress,
    to: "HZ57J3K46JIJXILONBBZOHX6BKPXEM2VVXNRFSUED6DKFD5ZD24PMJ3MVA",
    amount: 100000,
    suggestedParams,
  });

  console.log(txn);

  // Sign transaction
  // txns is an array of algosdk.Transaction
  const txnsToSign = txns.map((txn) => {
    const encodedTxn = window.Buffer.from(
      algosdk.encodeUnsignedTransaction(txn.txn)
    ).toString("base64");

    return {
      txn: encodedTxn,
      message: "Description of transaction being signed",
      // Note: if the transaction does not need to be signed (because it's part of an atomic group
      // that will be signed by another party), specify an empty singers array like so:
      // signers: [],
    };
  });

  const requestParams = [txnsToSign];

  const request = formatJsonRpcRequest("algo_signTxn", requestParams);
  const result = await this.connector.sendCustomRequest(request);
  const decodedResult = result.map((element) => {
    return element
      ? new Uint8Array(window.Buffer.from(element, "base64"))
      : null;
  });
});
