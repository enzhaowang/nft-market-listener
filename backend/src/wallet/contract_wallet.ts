// src/wallet/cli_wallet.ts
import dotenv from "dotenv";
import bip39 from "bip39";
import { privateToPublic, publicToAddress } from "ethereumjs-util";
import { createRequire } from "module";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { Wallet } from "@ethersproject/wallet";
import {Account, createPublicClient, createWalletClient, getContract, http, parseEther, parseGwei, type Hash, type TransactionReceipt} from "viem";
import { prepareTransactionRequest } from "viem/actions";
import {type PublicClient, type WalletClient, encodeFunctionData, formatEther } from "viem";

import MY_ERC20_ABI from '../abis/MyERC20.json' with { type: 'json' };
import ContractWallet_ABI from '../abis/ContractWallet.json' with { type: 'json' };

dotenv.config();



const MyERC20_ADDRESS = process.env.MyERC20_ADDRESS as `0x${string}`;
const CONTRACT_WALLET_ADDRESS = process.env.CONTRACT_WALLET_ADDRESS as `0x${string}`;

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


async function contractWallet(){
    const privateKey1 = process.env.PRIVATE_KEY as `0x${string}`;
    const account1 = privateKeyToAccount(privateKey1);
    const address1 = account1.address;
    console.log("Account1 address:", address1);

    const privateKey2 = process.env.PRIVATE_KEY1 as `0x${string}`;
    const account2 = privateKeyToAccount(privateKey2);
    const address2 = account2.address;
    console.log("Account2 address:", address2);

    //contract wallet address from .env
    const contractWalletAddress = process.env.CONTRACT_WALLET_ADDRESS as `0x${string}`;
    console.log("Contract Wallet address:", contractWalletAddress);

    //create wallet client
    const walletClient1: WalletClient = createWalletClient({
        account: account1,
        chain: sepolia,
        transport: http(process.env.SEPOLIA_RPC_URL!),
    })

    const walletClient2: WalletClient = createWalletClient({
        account: account2,
        chain: sepolia,
        transport: http(process.env.SEPOLIA_RPC_URL!),
    });

    //create public client
    const publicClient: PublicClient = createPublicClient({
        chain: sepolia,
        transport: http(process.env.SEPOLIA_RPC_URL!),
    });

    const contractWalletAccount1 = getContract({
    address: contractWalletAddress,
    abi: ContractWallet_ABI,
    client: {
        public: publicClient,
        wallet: walletClient1,
    },

    });
    const contractWalletAccount2 = getContract({
        address: contractWalletAddress,
        abi: ContractWallet_ABI,
        client: {
            public: publicClient,
            wallet: walletClient2,
        },
    });



    //create a submitTransaction
    const ercbalanceBefore = await getERC20Balance("0xC3637C58e72D5f4A8570D3b86D6875F1eC5fAa3B"as `0x${string}`);
    console.log("erc20BalanceBefore Balance:", ercbalanceBefore);
    const encodeData = encodeFunctionData({
        abi: MY_ERC20_ABI,
        functionName: 'transfer',
        args: ['0xC3637C58e72D5f4A8570D3b86D6875F1eC5fAa3B' as `0x${string}`, parseEther("0.05")],
    });
    console.log("Encoded data for ERC20 transfer:", encodeData);
    
    //call submitTransaction from account1
    const txHashSubmitTransaction = await contractWalletAccount1.write.submitTransaction([
        MyERC20_ADDRESS as `0x${string}`,
        0n,
        encodeData,
    ]);
    console.log("submitTransaction tx hash from account1:", txHashSubmitTransaction);
    
    //wait for the tx to be mined
    const receiptOfSubmitTransaction = await publicClient.waitForTransactionReceipt({ hash: txHashSubmitTransaction });
    console.log("submitTransaction tx mined in block:", receiptOfSubmitTransaction.blockNumber);
    console.log("submitTransaction tx status:", receiptOfSubmitTransaction.status === 'success' ? '成功' : '失败');

    //call confirmTransaction from account1
    const txHashConfirmTransaction1 = await contractWalletAccount1.write.confirmTransaction([4n]);
    console.log("confirmTransaction1 tx hash from account1:", txHashConfirmTransaction1);
    //wait for the tx to be mined
    const receiptOfConfirmTransaction1 = await publicClient.waitForTransactionReceipt({ hash: txHashConfirmTransaction1 });
    console.log("confirmTransaction1 tx mined in block:", receiptOfConfirmTransaction1.blockNumber);
    console.log("confirmTransaction1 tx status:", receiptOfConfirmTransaction1.status === 'success' ? '成功' : '失败');
    
    //call confirmTransaction from account2
    const txHashConfirmTransaction2 = await contractWalletAccount2.write.confirmTransaction([4n]);
    console.log("confirmTransaction2 tx hash from account2:", txHashConfirmTransaction2);
    //wait for the tx to be mined
    const receiptOfConfirmTransaction2 = await publicClient.waitForTransactionReceipt({ hash: txHashConfirmTransaction2 });
    console.log("confirmTransaction2 tx mined in block:", receiptOfConfirmTransaction2.blockNumber);
    console.log("confirmTransaction2 tx status:", receiptOfConfirmTransaction2.status === 'success' ? '成功' : '失败');
    
    //check the transaction info
    const hashOftransactionInfo = await contractWalletAccount1.read.getTransaction([4n]);
    console.log("Transaction info hash:", hashOftransactionInfo);

    //execute the transaction
    const txHashExecuteTransaction = await contractWalletAccount1.write.executeTransaction([4n]);
    console.log("executeTransaction tx hash from account1:", txHashExecuteTransaction);
    //wait for the tx to be mined
    const receiptOfExecuteTransaction = await publicClient.waitForTransactionReceipt({ hash: txHashExecuteTransaction });
    console.log("executeTransaction tx mined in block:", receiptOfExecuteTransaction.blockNumber);
    console.log("executeTransaction tx status:", receiptOfExecuteTransaction.status === 'success' ? '成功' : '失败');

    const ercbalanceAfter = await getERC20Balance("0xC3637C58e72D5f4A8570D3b86D6875F1eC5fAa3B"as `0x${string}`);
    console.log("erc20BalanceAfter Balance:", ercbalanceAfter);










}

contractWallet();
