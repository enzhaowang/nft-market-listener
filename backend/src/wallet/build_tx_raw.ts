import dotenv from 'dotenv';
import { createWalletClient,  createPublicClient, type WalletClient, type PublicClient, type Hash, http, parseEther, parseGwei, type TransactionReceipt } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { prepareTransactionRequest } from 'viem/actions';

dotenv.config();

async function sendTransactionExample(): Promise<Hash> {
    try{
        //get privateKey
        const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
        if(!privateKey){
            throw new Error("PRIVATE_KEY is not set in environment variables");
        }

        //get account
        const account = privateKeyToAccount(privateKey);
        const userAddress = account.address;
        console.log("User address:", userAddress);



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

        //check internet status
        const blockNumber = await publicClient.getBlockNumber();
        console.log("Current block number:", blockNumber);

        //check current gas price
        const gasPrice = await publicClient.getGasPrice();
        console.log("Current gas price:", gasPrice);

        //check current balance
        const balance = await publicClient.getBalance({ address: userAddress });
        console.log("Current balance:", balance);

        //check nonce
        const nonce = await publicClient.getTransactionCount({ address: userAddress });
        console.log("Current nonce:", nonce);

        //build tx params
        const txParams = {
            account: account,
            to: '0x0000000000000000000000000000000000000001' as `0x${string}`,
            value: parseEther('0.01'), //0.01 ether
            chainId: sepolia.id,
            type: 'eip1559' as const,
            chain: sepolia,

            //EIP-1559 params
            maxFeePerGas: gasPrice*2n + parseGwei('2'),
            maxPriorityFeePerGas: parseGwei('2'),
            gas: 21000n,
            nonce: nonce,
        }

        //prepare transaction request
        const preparedTx = await prepareTransactionRequest(walletClient, txParams);
        console.log("Prepared transaction:", {
            ...preparedTx,
            maxFeePerGas: parseGwei(preparedTx.maxFeePerGas.toString()),
            maxPriorityFeePerGas: parseGwei(preparedTx.maxPriorityFeePerGas.toString())
        });

        //way1: directly send transaction
        const txHash1 = await walletClient.sendTransaction(preparedTx);
        console.log("Transaction hash:", txHash1);

        //way2: sign transaction first, then send raw transaction
        const signedTx = await walletClient.signTransaction(preparedTx);
        console.log("Signed transaction:", signedTx);

        const txHash2 = await publicClient.sendRawTransaction({ serializedTransaction: signedTx });
        console.log("Transaction hash from raw tx:", txHash2);

        //wait transaction to be confirmed
        const receipt: TransactionReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash1 });
        console.log("transaction status", receipt.status === 'success' ? '成功' : '失败');
        console.log("transaction number", receipt.blockNumber);
        console.log("Transaction receipt:", receipt);


        return txHash2;



    }catch(error){
        console.error(error);
        if (error instanceof Error) {
            console.error(`Failed to send transaction: ${error.message}`);
        }
        if(error && typeof error === 'object' && 'stack' in error){
            console.log("Error stack:", (error as Error).stack);
        }
        throw error
    }

}

sendTransactionExample();