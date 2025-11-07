"use client";

import { useState } from "react";
import { useWriteContract } from "wagmi";
import NFTMarket from "../contracts/abi/NFTMarket.json";
import { MYNFT_MARKET_ADDRESS } from "../constant/contract";

export function BuyNFT() {
  const [listingId, setListingId] = useState("");
  const { writeContract } = useWriteContract();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    writeContract({
      abi: NFTMarket,
      address: MYNFT_MARKET_ADDRESS as `0x${string}`, // Replace with your NFTMarket contract address
      functionName: "buyNFT",
      args: [BigInt(listingId)],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        value={listingId}
        onChange={(e) => setListingId(e.target.value)}
        placeholder="Listing ID"
        className="p-2 border rounded"
      />
      <button
        type="submit"
        className="p-2 bg-blue-500 text-white rounded"
      >
        Buy NFT
      </button>
    </form>
  );
}
