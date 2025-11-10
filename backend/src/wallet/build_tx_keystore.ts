import {createWalletClient, http, parseEther, parseGwei, type Hash, type TransactionReceipt} from "viem";
import { prepareTransactionRequest } from "viem/actions";
import {sepolia} from "viem/chains";
import dotenv from "dotenv";
import { createPublicClient, type PublicClient, type WalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {readFileSync} from 'fs';
import {join} from 'path';
import {Wallet} from "@ethersproject/wallet";
import { send } from "process";
import { create } from "domain";

dotenv.config();

async function sendTransactionWithKeystore(): Promise<Hash>{
    try {
        //1. getkeystore and password
        const keyStorePassword = process.env.KEYSTORE_PASSWORD;
        console.log("KEYSTORE_PASSWORD:", keyStorePassword);

        const keyStoreFilePath = join(process.cwd(), '.key', 'keystore.json');
        console.log("Keystore file path:", keyStoreFilePath);

        if(!keyStorePassword){
            throw new Error("KEYSTORE_PASSWORD is not set in environment variables");
        }

        //2. read keystore file
        const keystoreContent = readFileSync(keyStoreFilePath, 'utf-8');
        const keystore = JSON.parse(keystoreContent);
        console.log("Keystore content read successfully.");

        //3. decrypt keystore to get private key
        const wallet = await Wallet.fromEncryptedJson(JSON.stringify(keystore), keyStorePassword);
        const privateKey = wallet.privateKey as `0x${string}`;
        console.log("Decrypted private key:", privateKey);

        //4. create wallet client
        const walletClient: WalletClient = createWalletClient({
            account: privateKeyToAccount(privateKey),
            chain: sepolia,
            transport: http(process.env.SEPOLIA_RPC_URL!),
        });

        //5. create public client
        const publicClient: PublicClient = createPublicClient({
            chain: sepolia,
            transport: http(process.env.SEPOLIA_RPC_URL!),
        });

        //6. create account
        const account = privateKeyToAccount(privateKey);
        const userAddress = account.address;
        console.log("Account address:", userAddress); 

        //7. check the block number
        const blockNumbber = await publicClient.getBlockNumber();
        console.log("Block number:", blockNumbber);

        //8. get current gas price
        const gasPrice = await publicClient.getGasPrice();
        console.log("Current gas price:", gasPrice);

        //9. fetch balance
        const balance = await publicClient.getBalance({address: userAddress});
        console.log("Balance:", balance);

        //10. fetch nonce
        const nonce = await publicClient.getTransactionCount({
            address: userAddress,
        });
        console.log("Nonce:", nonce);

        //11. prepare transaction params
        const txParams = {
            account: account,
            to: "0xC3637C58e72D5f4A8570D3b86D6875F1eC5fAa3B" as `0x${string}`,
            value: parseEther("0.001"),
            type: 'eip1559' as const,
            chain: sepolia,
            chainId: sepolia.id,

            //EIP-1559 specific fields
            maxFeePerGas: gasPrice * 2n + parseGwei("1.5"),
            maxPriorityFeePerGas: parseGwei("1.5"),
            nonce: nonce,
            gas: 21000n,
        };
        console.log("Transaction params:", txParams);

        //12. prepare transaction request
        const preparedTx = await prepareTransactionRequest(publicClient, txParams);
        console.log("Prepared transaction request:", {
            ...preparedTx,
            maxFeeperGas: parseGwei(preparedTx.maxFeePerGas.toString()),
            maxPriorityFeePerGas: parseGwei(preparedTx.maxPriorityFeePerGas.toString()),
        });

        //13. sign the transaction
        const signedTx = await walletClient.signTransaction(preparedTx);
        console.log("Signed transaction:", signedTx);

        //14. send the transaction
        const txHash = await publicClient.sendRawTransaction({
            serializedTransaction: signedTx,
        });
        console.log("Transaction hash:", txHash);

        //15. wait for transaction receipt
        const receipt: TransactionReceipt = await publicClient.waitForTransactionReceipt({hash: txHash});
        console.log("Transaction receipt:", receipt);
        console.log(`Transaction status: ${receipt.status === 'success' ? 'Success' : 'Failure'}`);
        console.log("Transaction was included in block number:", receipt.blockNumber);
        console.log("Transaction was included in block hash:", receipt.blockHash);

        return txHash;


    }catch (error) {
        console.error("Error in sendTransactionWithKeystore:", error);
        if(error instanceof Error){
            console.log("Error message:", error.message);
        } 
        if(error && typeof error === 'object' && 'stack' in error){
            console.log("Error stack:", (error as Error).stack);
        }
        throw error;
    }
}

sendTransactionWithKeystore();