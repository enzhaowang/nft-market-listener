import 'dotenv/config';

export const RPC_URL = process.env.RPC_URL ?? "http://127.0.0.1:8545";
export const CHAIN_ID = 31337; // 默认anvil本地链
export const NFT_MARKET_ADDRESS =
  (process.env.NFT_MARKET_ADDRESS as `0x${string}`) ??
  "0x0000000000000000000000000000000000000000";
