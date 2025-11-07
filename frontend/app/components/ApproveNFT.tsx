"use client";

import { useState } from "react";
import { useWriteContract, useAccount } from "wagmi";
import MyNFT from "./abi/MyNFT.json"; // Assuming MyNFT ABI is available
import NFTMarket from "../contracts/abi/NFTMarket.json"; // For approving to the marketplace

export function ApproveNFT() {
  const [nftContractAddress, setNftContractAddress] = useState<string>("");
  const [tokenId, setTokenId] = useState<string>("");
  const [operatorAddress, setOperatorAddress] = useState<string>(""); // Address to approve for (e.g., marketplace)
  const { writeContract } = useWriteContract();
  const { address } = useAccount();

  // Use the MyNFT contract address for approval
  const myNftContractAddress = "0xYOUR_MYNFT_CONTRACT_ADDRESS"; // <<< REPLACE THIS
  // Use the NFTMarket contract address as the operator if approving for the marketplace
  const nftMarketContractAddress = "0xc6d5648f91A0c2F0ce6F7F4BA3d206B650FDD0D3"; // From ListNFT.tsx

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      alert("Please connect your wallet first.");
      return;
    }
    if (!nftContractAddress || !tokenId || !operatorAddress) {
      alert("Please fill in all fields.");
      return;
    }

    // For ERC721, the approve function typically takes `to` (operator) and `tokenId`.
    // If approving for a marketplace, the `operatorAddress` would be the marketplace address.
    // If approving for a specific NFT contract, it would be that contract's address.
    // Here, we assume we are approving a specific NFT (tokenId) from MyNFT contract to an operator.

    writeContract({
      abi: MyNFT,
      address: myNftContractAddress as `0x${string}`,
      functionName: "approve", // Standard ERC721 approve function
      args: [operatorAddress, BigInt(tokenId)],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold">Approve NFT</h2>
      <input
        type="text"
        value={nftContractAddress} // This might not be needed if we are always approving from MyNFT contract
        onChange={(e) => setNftContractAddress(e.target.value)}
        placeholder="NFT Contract Address (e.g., MyNFT contract)"
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
        type="text"
        value={operatorAddress}
        onChange={(e) => setOperatorAddress(e.target.value)}
        placeholder="Operator Address (e.g., Marketplace Address)"
        className="p-2 border rounded"
      />
      <button
        type="submit"
        className="p-2 bg-purple-500 text-white rounded"
      >
        Approve NFT
      </button>
    </form>
  );
}
