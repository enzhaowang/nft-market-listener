"use client";

import { ListNFT } from "./components/ListNFT";
import { BuyNFT } from "./components/BuyNFT";
import { ListedNFTs } from "./components/ListedNFTs";
import { useAppKit } from "@reown/appkit/react";
import {
  useAccount,
  useDisconnect,
  useChainId,
  useChains,
} from "wagmi";

export default function Home() {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const chains = useChains();
  const currentChain = chains.find((chain) => chain.id === chainId);

  const shortAddr =
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-blue-300 p-4 dark:from-gray-900 dark:to-black md:flex-row">
      {!isConnected ? (
        <div className="w-full max-w-sm text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-800 dark:text-white">Welcome to NFT Marketplace</h1>
          <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">Connect your wallet to start exploring and trading NFTs.</p>
          <button
            onClick={() => open()}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center justify-center gap-8 p-4 md:flex-row md:items-start">
          <div className="w-full max-w-sm rounded-xl bg-white/70 p-6 shadow-lg dark:bg-zinc-800/70 md:w-1/3">
            <div className="mb-6 flex flex-col items-center space-y-2 text-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Account Details</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Connected Address</p>
              <p className="break-all text-gray-900 dark:text-gray-100 text-xs font-medium">{address}</p>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Network</p>
              <p className="text-gray-900 dark:text-gray-100">{currentChain ? currentChain.name : "Unknown Network"}</p>
            </div>
            <button
              onClick={() => disconnect()}
              className="w-full rounded-lg bg-red-500 px-5 py-2.5 text-lg font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Disconnect Wallet
            </button>
          </div>
          <div className="flex w-full flex-col gap-6 md:w-2/3">
            <ListNFT />
            <BuyNFT />
            <ListedNFTs />
          </div>
        </div>
      )}
    </div>
  );
}
