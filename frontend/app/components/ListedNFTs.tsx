"use client";

import { useEffect, useState } from "react";
import { useReadContract, usePublicClient } from "wagmi";
import NFTMarket from "../contracts/abi/NFTMarket.json";
import { it } from "node:test";

export function ListedNFTs() {
  const [listings, setListings] = useState<any[]>([]);
  const publicClient = usePublicClient();
  const { data: nextListingIdData } = useReadContract({
    abi: NFTMarket,
    address: "0xc6d5648f91A0c2F0ce6F7F4BA3d206B650FDD0D3", 
    functionName: "nextListingId",
  });

  const nextListingId = nextListingIdData ? Number(nextListingIdData) : 0;

  function parseListing(arr: [string, string, bigint, bigint, boolean]) {
    return {
      seller: arr[0],
      nftContract: arr[1],
      tokenId: Number(arr[2]),
      price: arr[3],
      isActive: arr[4],
    };
  }

  useEffect(() => {
    console.log("Next Listing ID:", nextListingId);
    const fetchListings = async () => {
      const fetchedListings: any[] = [];
      if (!publicClient) return;
      const listingPromises = [];
      for (let i = 0; i < nextListingId; i++) {
        listingPromises.push(
          publicClient.readContract({
            abi: NFTMarket,
            address: "0xc6d5648f91A0c2F0ce6F7F4BA3d206B650FDD0D3",
            functionName: "listings",
            args: [BigInt(i)],
          })
        );
      }

      const resultsRes = await Promise.all(listingPromises);
      console.log("Fetched Listings:", resultsRes);

      const results = resultsRes.map((res) => parseListing(res as any));
      

      // Log the parsed results for inspection
      console.log("Parsed Listings:", results);

      results.forEach((listingData, i) => {
        const listing = listingData as any;
        if (listing && listing.isActive) {
          fetchedListings.push({ id: i, ...listing });
        }
      });

      console.log("Active Listings:", fetchedListings);
      setListings(fetchedListings);
    };

    if (nextListingId > 0) {
      fetchListings();
    }
  }, [nextListingId, publicClient]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold">Listed NFTs</h2>
      {listings.length === 0 ? (
        <p>No NFTs listed yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <div key={listing.id} className="border p-4 rounded">
              <p>Listing ID: {listing.id}</p>
              <p>NFT Contract: {listing.nftContract}</p>
              <p>Token ID: {Number(listing.tokenId)}</p>
              <p>Price: {Number(listing.price)}</p>
              <p>Seller: {listing.seller}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
