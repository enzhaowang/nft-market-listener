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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      {!isConnected ? (
        <div className="w-full max-w-md">
          <button
            onClick={() => open()}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
          >
            连接钱包
          </button>
        </div>
      ) : (
        <div className="space-y-6 w-full max-w-md bg-white/80 dark:bg-zinc-900/60 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col space-y-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              已连接地址
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {shortAddr}
            </span>
            <span className="break-all text-gray-900 dark:text-gray-100 text-xs">
              {address}
            </span>

            <span className="font-medium text-gray-700 dark:text-gray-300 mt-3">
              当前网络
            </span>
            <span className="text-gray-900 dark:text-gray-100">
              {currentChain ? currentChain.name : "未知网络"}
            </span>
          </div>

          <button
            onClick={() => disconnect()}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
          >
            断开连接
          </button>

          {/* 把当前地址和链传进去，组件里就能直接用 */}
          <ListNFT  />
          <BuyNFT  />
          <ListedNFTs/>
        </div>
      )}
    </div>
  );
}
