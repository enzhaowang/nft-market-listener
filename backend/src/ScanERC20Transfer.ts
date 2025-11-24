import {
    createPublicClient,
    formatEther,
    http,
    publicActions,
    parseAbiItem,
    parseAbi,
} from 'viem';
import { foundry } from "viem/chains";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";
import { connectDb, closeDb} from './db.js';

dotenv.config();

const uri = process.env.MONGODB_URL as string;

//ERC20 transfer event
const TRANSFER_EVENT = {
    type: 'event',
    name: 'Transfer',
    inputs: [
        { type: 'address', name: 'from', indexed: true },
        { type: 'address', name: 'to', indexed: true },
        { type: 'uint256', name: 'value' }
    ]
} as const;


const main = async () => {
    //connect mongo db
    const { transferCollection } = await connectDb();

    await transferCollection.createIndex(
        { transactionHash: 1, logIndex: 1 },
        { unique: true }
    );


    //create public client
    const publicClient = createPublicClient({
        chain: foundry,
        transport: http(process.env.RPC_URL!)
    })

    console.log("start scan ERC20 events");

    //get current block num
    const currentBlock = await publicClient.getBlockNumber();
    console.log(`current block num: ${currentBlock}`);

    //set scan range
    //get fromBlock from db
    const fromBlock = 0n;
    const toBlock = currentBlock;

    try {
        //get all erc20 events
        const logs = await publicClient.getLogs({
            fromBlock,
            toBlock,
            address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
            // event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
            // event: TRANSFER_EVENT,
            events: parseAbi([
                'event Approval(address indexed owner, address indexed spender, uint256 value)',
                'event Transfer(address indexed from, address indexed to, uint256 value)'
            ])
        });

        console.log(`\n From block ${fromBlock} to ${toBlock}, found ${logs.length} events`);

        //handle events
        for (const log of logs) {
            console.log(`\n event detail:`);
            console.log(`event type: ${log.eventName}`);
            console.log(`contract address: ${log.address}`);
            console.log(`transaction hash: ${log.transactionHash}`);
            console.log(`block num: ${log.blockNumber}`);

            if (log.eventName === 'Transfer' && log.args.value !== undefined) {
                console.log(`from: ${log.args.from?.toLowerCase()}`);
                console.log(`to: ${log.args.to?.toLocaleLowerCase()}`);
                console.log(`amount: ${log.args.value}`);

                try {
                    await transferCollection.updateOne(
                        {
                            // criteria
                            transactionHash: log.transactionHash,
                            logIndex: Number(log.logIndex),
                        },
                        {
                            // fields going to save
                            $setOnInsert: {
                                blockNumber: Number(log.blockNumber), 
                                contractAddress: log.address,
                                from: log.args.from?.toLowerCase(),
                                to: log.args.to?.toLowerCase(),
                                value: log.args.value.toString(), // to string
                                createdAt: new Date(),
                            },
                        },
                        { upsert: true } // if exist then dont insert
                    );
                    console.log("✅ Transfer 事件已写入 MongoDB");
                } catch (error) {
                   console.log('error in save to mongodb:', error)
                } finally{
                    closeDb();
                }


            } else if (log.eventName === 'Approval' && log.args.value !== undefined) {
                console.log(`owner: ${log.args.owner}`);
                console.log(`approve: ${log.args.spender}`);
                console.log(`approve amount: ${formatEther(log.args.value)}`);
            }



        }


    } catch (error) {
        console.error('errors in scanning process:', error)
    }
};

main().catch((error) => {
    console.error('error:', error);
    closeDb();
    process.exit(1);
})