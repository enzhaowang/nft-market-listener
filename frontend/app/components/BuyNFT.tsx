"use client";

import { useState } from "react";
import { useWriteContract, useAccount, useReadContract } from "wagmi";
import NFTMarket from "../contracts/abi/NFTMarket.json";
import { MYNFT_MARKET_ADDRESS } from "../constant/contract";
import { usePublicClient } from 'wagmi';


export function BuyNFT() {
  const [listingId, setListingId] = useState("");
  const { writeContract } = useWriteContract();
  const { address: account } = useAccount();
  const publicClient = usePublicClient();

  const { data: nonce } = useReadContract({
    abi: NFTMarket,
    address: MYNFT_MARKET_ADDRESS as `0x${string}`,
    functionName: 'nonces',
    args: [account],
    query: {
      enabled: !!account,
    }
  });

  const handleBuySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listingId) return;

    
        await publicClient.simulateContract({
       abi: NFTMarket,
      address: MYNFT_MARKET_ADDRESS as `0x${string}`,
      functionName: "buyNFT",
      args: [BigInt(listingId)],
      });

    // writeContract({
    //   abi: NFTMarket,
    //   address: MYNFT_MARKET_ADDRESS as `0x${string}`,
    //   functionName: "buyNFT",
    //   args: [BigInt(listingId)],
    // });
  };

  const handlePermitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listingId || !account || nonce == null) return;

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20); // 20 minutes from now

    try {
      const response = await fetch('http://localhost:3001/sign-permit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyer: account,
          nonce: nonce.toString(),
          deadline: deadline.toString(),
        }),
      });
      console.log(`buyer: ${account}, nonce: ${nonce}, deadline: ${deadline}`)
      console.log(response);

      if (!response.ok) {
        throw new Error('Failed to get signature from backend');
      }

      const { signature } = await response.json();
        await publicClient.simulateContract({
        account,
        abi: NFTMarket,
        address: MYNFT_MARKET_ADDRESS,
        functionName: 'permitBuy',
        args: [BigInt(listingId), nonce, deadline, signature],
      });

      // writeContract({
      //   abi: NFTMarket,
      //   address: MYNFT_MARKET_ADDRESS as `0x${string}`,
      //   functionName: "permitBuy",
      //   args: [BigInt(listingId), nonce as bigint, deadline as bigint, signature],
      // });
    } catch (error) {
      console.error("Error during permit buy:", error);
    }
  };

  return (
    <div>
      <form className="flex flex-col gap-4">
        <input
          type="text"
          value={listingId}
          onChange={(e) => setListingId(e.target.value)}
          placeholder="Listing ID"
          className="p-2 border rounded"
        />
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleBuySubmit}
            className="p-2 bg-blue-500 text-white rounded w-full"
          >
            Buy NFT
          </button>
          <button
            type="button"
            onClick={handlePermitSubmit}
            className="p-2 bg-green-500 text-white rounded w-full"
          >
            Buy NFT with Permit
          </button>
        </div>
      </form>
    </div>
  );
}
