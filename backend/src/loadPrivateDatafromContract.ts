import {
    createPublicClient,
    http,
    keccak256,
    toHex
} from 'viem'

import {foundry} from 'viem/chains'
import dotenv from 'dotenv'

dotenv.config()



const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const publicClient = createPublicClient({
    chain: foundry,
    transport: http(process.env.RPC_URL!)
})


const main = async () => {
    //-------------------------
    //1. get _locks.length(slot 0)
    //--------------------------
    const lengthHex = await publicClient.getStorageAt({
        address: CONTRACT_ADDRESS,
        slot: toHex(0n),
    });

    if(!lengthHex) {
        throw new Error("lengthHex is undefined");
    }

    const length = BigInt(lengthHex);
    console.log('locks length = ', length.toString());

    if(length == 0n) return;

    //--------------------------
    // 2. calculate base slot
    //--------------------------
    const baseSlotHex = keccak256(toHex(0n,{size: 32})) //32 bytes
    const baseSlot = BigInt(baseSlotHex);
    console.log('base slot = ', baseSlot);

    //for LockInfo
    //slot 0 : address user(20 bytes) + uint64 startTime (8 bytes). 20 + 8 < 32
    //slot 1 : uint256 amount(32 bytes). use a whole slot
    const LOCKINFO_SLOTS_NUM = 2n;

    for(let i = 0n; i < length; i++) {
        
        const firstSlot = baseSlot + i * LOCKINFO_SLOTS_NUM; //user + startTime
        const secondSlot = firstSlot + 1n; // amount

        //field user uses 160 bits,  fiels startTime uses 64 bits
        const firstSlotHex = await publicClient.getStorageAt({
            address: CONTRACT_ADDRESS,
            slot: toHex(firstSlot),
        });
        const secondSlotHex = await publicClient.getStorageAt({
            address: CONTRACT_ADDRESS,
            slot: toHex(secondSlot),
        });

        const user = '0x' + firstSlotHex?.slice(-40);
        const startTimeHex = '0x' + firstSlotHex?.slice(-16-40, -40);
        const startTime = Number(BigInt(startTimeHex))
        if(secondSlotHex === undefined) throw new Error("secondSlotHex is undefined")
        const amount = BigInt(secondSlotHex);

        console.log(
            `lock[${i}]: user: ${user}, startTime: ${startTime}, amount: ${amount}`
        )



    

    }




    
}

main().catch((error) => {
    console.error('error:', error);
    process.exit(1);
})