import {
    createPublicClient,
    createWalletClient,
    formatEther,
    getContract,
    http,
    parseEther,
    parseGwei,
    publicActions,
    parseEventLogs,
    encodeAbiParameters
} from "viem";
import { foundry, sepolia } from "viem/chains";
import dotenv from "dotenv";


import MyNFT_ABI from './abis/MyNFT.json' with { type: 'json' };
import ERC20_ABI from './abis/MyERC20.json' with { type: 'json' };
import NFTMarket_ABI from './abis/NFTMarket.json' with {type: 'json'};
import { privateKeyToAccount } from "viem/accounts";
dotenv.config();

const MyNFT_ADDRESS = "0x426e923eb578637bf4D2e1e31Fdd838DDe0EFC47";
const ERC20_ADDRESS = "0xD6E941AdC2622698FC9ca1767aa357D82c8B3381";
const NFTMARKET_ADDRESS = "0xc6d5648f91A0c2F0ce6F7F4BA3d206B650FDD0D3";

const main = async () => {
    // 创建一个公共客户端

    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(process.env.SEPOLIA_RPC_URL!),
    }).extend(publicActions);

    const blockNumber = await publicClient.getBlockNumber();
    console.log(`The block number is ${blockNumber}`);


    // 创建一个钱包客户端
    const account = privateKeyToAccount(
        process.env.PRIVATE_KEY! as `0x${string}`
    );
    const account1 = privateKeyToAccount(
        process.env.PRIVATE_KEY1! as `0x${string}`
    );

    const walletClient = createWalletClient({
        account,
        chain: sepolia,
        transport: http(process.env.SEPOLIA_RPC_URL!),
    }).extend(publicActions);


    const walletClient1 = createWalletClient({
        account: account1,
        chain: sepolia,
        transport: http(process.env.SEPOLIA_RPC_URL!),
    }).extend(publicActions);

    const address = await walletClient.getAddresses();
    const address1 = await walletClient1.getAddresses();
    console.log(`The wallet address is ${address}`);
    console.log(`The wallet address1 is ${address1}`)

    //============transfer ERC20 from address to address1
    const erc20Contract = getContract({
        address: ERC20_ADDRESS,
        abi: ERC20_ABI,
        client: {
            public: publicClient,
            wallet: walletClient,
        },
    });



    // const tx = await erc20Contract.write.transfer([
    //     `${address1}`,
    //     parseEther("100"),
    // ]);
    // console.log(` 调用 transfer 方法的 transaction hash is ${tx}`);

    // // 等待交易被确认
    // const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
    // console.log(`交易状态: ${receipt.status === 'success' ? '成功' : '失败'}`);
    // // console.log(receipt.logs);
    // // 从 receipt 中解析事件
    // const transferLogs1 = await parseEventLogs({
    //     abi: ERC20_ABI,
    //     eventName: 'Transfer',
    //     logs: receipt.logs,
    // });

    // // 打印转账事件详情
    // for (const log of transferLogs1) {
    //     const eventLog = log as unknown as { eventName: string; args: { from: string; to: string; value: bigint } };
    //     if (eventLog.eventName === 'Transfer') {
    //         console.log('转账事件详情:');
    //         console.log(`从: ${eventLog.args.from}`);
    //         console.log(`到: ${eventLog.args.to}`);
    //         console.log(`金额: ${formatEther(eventLog.args.value)}`);
    //     }
    // }

    //=============approve tokens to nft market
    // const erc20Contract1 = getContract({
    //     address: ERC20_ADDRESS,
    //     abi: ERC20_ABI,
    //     client: {
    //         public: publicClient,
    //         wallet: walletClient1,
    //     },
    // });
    // const approveTokenTx1 = await erc20Contract.write.approve([
    //     `${NFTMARKET_ADDRESS}`,
    //     parseEther("100")
    // ]);
    // const receiptTokenTx1 = await publicClient.waitForTransactionReceipt({hash: approveTokenTx1});
    // console.log(`交易状态: ${receiptTokenTx1.status === 'success' ? '成功' : '失败'}`);
    // console.log(receiptTokenTx1.logs);

    // const approveTokenTx2 = await erc20Contract1.write.approve([
    //      `${NFTMARKET_ADDRESS}`,
    //     parseEther("100")
    // ]);
    //     const receiptTokenTx2 = await publicClient.waitForTransactionReceipt({hash: approveTokenTx2});
    // console.log(`交易状态: ${receiptTokenTx2.status === 'success' ? '成功' : '失败'}`);
    // console.log(receiptTokenTx2.logs);





    //========address account mintNFT
    const nftContract = getContract({
        address: MyNFT_ADDRESS,
        abi: MyNFT_ABI,
        client: {
            public: publicClient,
            wallet: walletClient,
        },
    });
    // const mintNFTtx = await nftContract.write.mintNFT([
    //     `${address}`,
    //     "ipfs://bafkreihgyyx4a5qsi4fxotxmqitngegzobmplmwzz4durcdkp3fokd6j24"
    // ]);
    // console.log(` 调用 mintNFTtx 方法的 transaction hash is ${mintNFTtx}`);

    // //wait transaction to be confirmed
    // const receiptOfMintNFT = await publicClient.waitForTransactionReceipt({ hash: mintNFTtx });
    // console.log(`交易状态: ${receiptOfMintNFT.status === 'success' ? '成功' : '失败'}`);
    // console.log(receiptOfMintNFT.logs);

    // //====approve the NFT to the NFTMarket
    const approveNFTtx = await nftContract.write.approve([
        `${NFTMARKET_ADDRESS}`,
        2
    ]);
    const receiptofApprove = await publicClient.waitForTransactionReceipt({ hash: approveNFTtx });
    console.log(`交易状态: ${receiptofApprove.status === 'success' ? '成功' : '失败'}`);
    console.log(receiptofApprove.logs);



    //=====list NFT in NFTMarket
    // const nftMarketContract = getContract({
    //     address: NFTMARKET_ADDRESS,
    //     abi: NFTMarket_ABI,
    //     client: {
    //         public: publicClient,
    //         wallet: walletClient1
    //     },
    // });
    // const listNFTTx = await nftMarketContract.write.list([
    //     `${MyNFT_ADDRESS}`,
    //     parseEther("1"),
    //     1
    // ]);
    // const receiptListNFT = await publicClient.waitForTransactionReceipt({hash: listNFTTx});
    // console.log(`交易状态: ${receiptListNFT.status === 'success' ? '成功' : '失败'}`);

    //====== buyNFT
    // const nftMarketContract = getContract({
    //     address: NFTMARKET_ADDRESS,
    //     abi: NFTMarket_ABI,
    //     client: {
    //         public: publicClient,
    //         wallet: walletClient
    //     },
    // });
    // const buyNFTTx = await nftMarketContract.write.buyNFT([
    //     0
    // ]);
    // const buyNFTReceipt = await publicClient.waitForTransactionReceipt({hash: buyNFTTx});
    // console.log(`交易状态: ${buyNFTReceipt.status === 'success' ? '成功' : '失败'}`);

    //====Token Received
//     const tokenIdnumer1 = encodeAbiParameters(
//         [{type: 'uint256'}],
//         [1n]
//     );
//     const tokenReceivedTx = await erc20Contract.write.transferWithCallbackAndData([
//         `${NFTMARKET_ADDRESS}`,
//         parseEther("1"),
//         tokenIdnumer1
//     ]);

//    const tokenReceivedReceipt = await publicClient.waitForTransactionReceipt({hash: tokenReceivedTx});
//    console.log(`交易状态: ${tokenReceivedReceipt.status === 'success' ? '成功' : '失败'}`);
   















};

main();
