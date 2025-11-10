// src/wallet/cli_wallet.ts
import dotenv from "dotenv";
import bip39 from "bip39";
import { privateToPublic, publicToAddress } from "ethereumjs-util";
import { createRequire } from "module";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { Wallet } from "@ethersproject/wallet";
import {Account, createPublicClient, createWalletClient, http, parseEther, parseGwei, type Hash, type TransactionReceipt} from "viem";
import { prepareTransactionRequest } from "viem/actions";
import {type PublicClient, type WalletClient, encodeFunctionData, formatEther } from "viem";

import MY_ERC20_ABI from '../abis/MyERC20.json' with { type: 'json' };

dotenv.config();

// 用 createRequire 把 CJS 的 hdkey 載進來
const require = createRequire(import.meta.url);
const HDKey = require("hdkey");
const MyERC20_ADDRESS = "0xD6E941AdC2622698FC9ca1767aa357D82c8B3381";

function getMnemonicSync(): string {
  const fromEnv = process.env.MNEMONIC;
  if (fromEnv && bip39.validateMnemonic(fromEnv)) {
    console.log("Using MNEMONIC from .env");
    return fromEnv;
  }
  const mnemonic = bip39.generateMnemonic();
  console.log("Generated mnemonic:", mnemonic);
  console.log(`👉 請把這段貼到 .env:\nMNEMONIC="${mnemonic}"`);
  return mnemonic;
}

async function generateWallet() {
  // 1. 拿助記詞
  const mnemonic = getMnemonicSync();

  // 2. 助記詞 → seed
  const seed = await bip39.mnemonicToSeed(mnemonic);

  // 3. seed → HD root
  const root = HDKey.fromMasterSeed(seed);

  // 4. 以太坊常用 path
  const path = "m/44'/60'/0'/0/0";
  const child = root.derive(path);

  const privBuf: Buffer = child.privateKey;
  const privateKey = ("0x" + privBuf.toString("hex")) as `0x${string}`;

  // 5. 私鑰 → 地址
  const pub = privateToPublic(privBuf);
  const address = ("0x" + publicToAddress(pub).toString("hex")) as `0x${string}`;

  return {
    mnemonic,
    path,
    privateKey,
    address,
  };
}

async function getBalance(address: `0x${string}`) {
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(process.env.SEPOLIA_RPC_URL!),
  });

  // 2. get balance
  const balance = await publicClient.getBalance({ address });
  return balance;
}

//send token from account to address
async function getERC20TransactionSignature(account: Account, walletClient: WalletClient, publicClient : PublicClient, to: `0x${string}`, amountInEther: string): Promise<Hash> {

    //get gas price
    const gasPrice = await publicClient.getGasPrice();
    console.log("Current gas price:", gasPrice);

    //get nonce
    const address = account.address;
    console.log("Account address:", address);
    const nonce = await publicClient.getTransactionCount({ address: account.address });

    //abi encoded data for transfer tokens
    const encodeData = encodeFunctionData({
        abi: MY_ERC20_ABI,
        functionName: 'transfer',
        args: [to, parseEther(amountInEther)],
    });
    console.log("Encoded data:", encodeData);

    const estinamtegas = await publicClient.estimateGas({
      account,
      to: MyERC20_ADDRESS,
      data:encodeData,
      value: 0n,
    });


    //prepare params
    const txParam = {
        account,
        to: MyERC20_ADDRESS as `0x${string}`,
        value: 0n, //0 ether
        type: 'eip1559' as const,
        chainId: sepolia.id,
        chain: sepolia,

        //EIP-1559 params
        maxFeePerGas: gasPrice * 2n + parseGwei('2'),
        maxPriorityFeePerGas: parseGwei('2'),
        gas: estinamtegas,
        nonce: nonce,
        data:encodeData

    }
    const txRequest = await prepareTransactionRequest(walletClient, txParam);
    console.log("Transaction request:", txRequest);

    //sign the txRequest
    const signedTx = await walletClient.signTransaction(txRequest);

    return signedTx;
}

async function getERC20Balance(address: `0x${string}`): Promise<string>{
    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(process.env.SEPOLIA_RPC_URL!),
    });

    //create erc20 contract
   const balance = await publicClient.readContract({
        address: MyERC20_ADDRESS as `0x${string}`,
        abi: MY_ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
    });

    return formatEther(balance as bigint);

}


async function main(){
    const privateKey = process.env.PRIVATE_KEY_FROM_CLI_WALLET as `0x${string}`;
    const account = privateKeyToAccount(privateKey);
    const address = account.address;
    console.log("Account address:", address);
    const balance = await getBalance(address);
    console.log("Balance:", Number(balance)/1e18, "ETH");

    //create wallet client
    const walletClient: WalletClient = createWalletClient({
        account,
        chain: sepolia,
        transport: http(process.env.SEPOLIA_RPC_URL!),
    });

    //create public client
    const publicClient: PublicClient = createPublicClient({
        chain: sepolia,
        transport: http(process.env.SEPOLIA_RPC_URL!),
    });



    //get signature
    const signature = await getERC20TransactionSignature(account, walletClient, publicClient, "0xC3637C58e72D5f4A8570D3b86D6875F1eC5fAa3B" as `0x${string}`, "1");
    console.log("Transaction signature:", signature);
    //send signed transaction
    const txHash: Hash = await publicClient.sendRawTransaction({ serializedTransaction: signature });
    console.log("Transaction hash:", txHash);

    //wait for transaction to be confirmed
    const receipt: TransactionReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log("Transaction status:", receipt.status === 'success' ? 'Success' : 'Failure');
    console.log("Transaction receipt:", receipt);

    //get erc20 balance
    const erc20BalanceFrom =  await getERC20Balance(address);
    const erc20BalanceTo =  await getERC20Balance("0xC3637C58e72D5f4A8570D3b86D6875F1eC5fAa3B" as `0x${string}`);
    console.log("erc20BalanceFrom Balance:", erc20BalanceFrom, "MY_ERC20");
    console.log("erc20BalanceTo Balance:", erc20BalanceTo, "MY_ERC20");



}

main();
