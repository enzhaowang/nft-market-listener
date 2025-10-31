import {
    createPublicClient,
    formatEther,
    http,
    publicActions,
    webSocket,
} from "viem";
import { foundry } from "viem/chains";
import dotenv from "dotenv";

dotenv.config();

const NFTMARKET_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

// 定义合约 ABI，只包含需要监听的事件
const NFTMarketABI = [
    {
        type: 'event',
        name: 'NFTListed',
        inputs: [
            { type: 'uint256', name: 'listingId', indexed: true },
            { type: 'address', name: 'seller'},
            { type: 'address', name: 'nftContract'},
            { type: 'uint256', name: 'tokenId' },
            { type: 'uint256', name: 'price' }
        ]
    },
    {
        type: 'event',
        name: 'BuyNFT',
        inputs: [
            { type: 'uint256', name: 'listingId', indexed: true },
            { type: 'address', name: 'seller' },
            { type: 'address', name: 'buyer'},
            { type: 'address', name: 'nftContract' },
            { type: 'uint256', name: 'tokenId' },
            { type: 'uint256', name: 'price' }
        ]
    },
    {
        type: 'event',
        name: 'TokenReceived',
        inputs: [
            { type: 'uint256', name: 'listingId', indexed: true },
            { type: 'address', name: 'seller' },
            { type: 'address', name: 'buyer'},
            { type: 'address', name: 'nftContract' },
            { type: 'uint256', name: 'tokenId' },
            { type: 'uint256', name: 'price' }
        ]
    },
    {
        type: 'event',
        name: 'NFTListingCancelled', 
        inputs: [
            { type: 'uint256', name: 'listingId', indexed: true }
        ]
    }
] as const; // 使用 as const 帮助 TS 推断正确的类型

const main = async () => {
    // 创建公共客户端
    const publicClient = createPublicClient({
        chain: foundry,
        transport: webSocket(process.env.RPC_URL!),
    }).extend(publicActions);

    console.log('开始监听 NFT Market 事件...');

    // 使用 abi 参数并传入事件定义
    const unwatch = publicClient.watchEvent({
        address: NFTMARKET_ADDRESS,
        events: NFTMarketABI,
        onLogs: (logs) => {
            logs.forEach((log) => {
                // 现在 TypeScript 可以正确推断 eventName 和 args
                switch (log.eventName) {
                    case 'NFTListed':
                        // 在访问 price 之前进行检查，以解决 TypeScript 类型问题
                        if (log.args.price !== undefined) {
                            console.log('\n检测到新的 NFTListed 事件:');
                            console.log(`  Listing ID: ${log.args.listingId}`);
                            console.log(`  Seller: ${log.args.seller}`);
                            console.log(`  NFT Contract: ${log.args.nftContract}`);
                            console.log(`  Token ID: ${log.args.tokenId}`);
                            console.log(`  Price: ${formatEther(log.args.price)} ETH`);
                            console.log(`  Tx Hash: ${log.transactionHash}`);
                        }
                        break;
                    case 'BuyNFT':
                        // 在访问 price 之前进行检查，以解决 TypeScript 类型问题
                        if (log.args.price !== undefined) {
                            console.log('\n检测到新的 BuyNFT 事件:');
                            console.log(`  Listing ID: ${log.args.listingId}`);
                            console.log(`  Seller: ${log.args.seller}`);
                            console.log(`  Buyer: ${log.args.buyer}`);
                            console.log(`  NFT Contract: ${log.args.nftContract}`);
                            console.log(`  Token ID: ${log.args.tokenId}`);
                            console.log(`  Price: ${formatEther(log.args.price)} ETH`);
                            console.log(`  Tx Hash: ${log.transactionHash}`);
                        }
                        break;
                    case 'TokenReceived':
                        // 在访问 price 之前进行检查，以解决 TypeScript 类型问题
                        if (log.args.price !== undefined) {
                            console.log('\n检测到新的 TokenReceived 事件:');
                            console.log(`  Listing ID: ${log.args.listingId}`);
                            console.log(`  Seller: ${log.args.seller}`);
                            console.log(`  Buyer: ${log.args.buyer}`);
                            console.log(`  NFT Contract: ${log.args.nftContract}`);
                            console.log(`  Token ID: ${log.args.tokenId}`);
                            console.log(`  Price: ${formatEther(log.args.price)} ETH`);
                            console.log(`  Tx Hash: ${log.transactionHash}`);
                        }
                        break;
                    case 'NFTListingCancelled':
                        console.log('\n检测到新的 NFTListingCalcelled 事件:');
                        console.log(`  Listing ID: ${log.args.listingId}`);
                        console.log(`  Tx Hash: ${log.transactionHash}`);
                        break;
                }
            });
        }
    });

    // 保持程序运行
    process.on('SIGINT', () => {
        console.log('\n停止监听...');
        unwatch();
        process.exit();
    });
};

main().catch((error) => {
    console.error('发生错误:', error);
    process.exit(1);
});
