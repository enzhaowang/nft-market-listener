"use client";

import { useState } from "react";
import { useWriteContract } from "wagmi";
import NFTMarket from "../contracts/abi/NFTMarket.json";
import { MYNFT_MARKET_ADDRESS } from "../constant/contract";


export function ListNFT() {
  const [nftContract, setNftContract] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [price, setPrice] = useState("");
  const { writeContract } = useWriteContract();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    writeContract({
      abi: NFTMarket,
      address: MYNFT_MARKET_ADDRESS as `0x${string}`, 
      functionName: "list",
      args: [nftContract, BigInt(Number(price) * 10**18), BigInt(tokenId)],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        value={nftContract}
        onChange={(e) => setNftContract(e.target.value)}
        placeholder="NFT Contract Address"
        className="p-2 border rounded"
      />
      <input
        type="text"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
        placeholder="Token ID"
        className="p-2 border rounded"
      />
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Price (in ETH)"
        className="p-2 border rounded"
      />
      <button
        type="submit"
        className="p-2 bg-blue-500 text-white rounded"
      >
        List NFT
      </button>
    </form>
  );
}
