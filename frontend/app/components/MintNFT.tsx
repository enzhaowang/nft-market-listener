"use client";

import { useState } from "react";
import { useWriteContract, useAccount } from "wagmi";
import MyNFT from "../contracts/abi/MyNFT.json"; // Assuming MyNFT ABI is available
import { MYNFT_ADDRESS } from "../constant/contract";

export function MintNFT() {
  const [tokenURIs, setTokenURIs] = useState<string>("");
  const { writeContract } = useWriteContract();
  const { address } = useAccount();


  const handleSubmit = (e: React.FormEvent) => {
    console.log("MintNFT handleSubmit called");
    e.preventDefault();
    if (!address) {
      alert("Please connect your wallet first.");
      return;
    }
    console.log("Minting NFT with URI:", tokenURIs);
    writeContract({
      abi: MyNFT,
      address: MYNFT_ADDRESS as `0x${string}`,
      functionName: "mintNFT",
      args: [address, tokenURIs],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold">Mint New NFT</h2>
      <input
        type="text"
        value={tokenURIs}
        onChange={(e) => setTokenURIs(e.target.value)}
        placeholder="Token URI (e.g., ipfs://... or http://...)"
        className="p-2 border rounded"
      />
      <button
        type="submit"
        className="p-2 bg-green-500 text-white rounded"
      >
        Mint NFT
      </button>
    </form>
  );
}
