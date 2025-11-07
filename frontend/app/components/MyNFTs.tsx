"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract, usePublicClient } from "wagmi";
import NFTMarket from "../contracts/abi/NFTMarket.json";
import MyNFT from "../contracts/abi/MyNFT.json"; // Corrected import path
import { formatEther } from "viem";
import { MYNFT_ADDRESS, MYNFT_MARKET_ADDRESS } from "../constant/contract";

interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: any[];
}

export function MyNFTs() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContract } = useWriteContract();
  const [userNFTs, setUserNFTs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);


  const handleApprove = (tokenId: number) => {
    writeContract({
      abi: MyNFT,
      address: MYNFT_ADDRESS as `0x${string}`,
      functionName: "approve",
      args: [MYNFT_MARKET_ADDRESS, BigInt(tokenId)],
    });
  };

  const handleList = (tokenId: number, price: number) => {
    writeContract({
      abi: NFTMarket,
      address: MYNFT_MARKET_ADDRESS as `0x${string}`,
      functionName: "list",
      args: [MYNFT_ADDRESS as `0x${string}`, BigInt(price * 10**18), BigInt(tokenId)],
    });
  };

  useEffect(() => {
    const fetchUserNFTs = async () => {
      if (!address || !publicClient) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const allNFTsBalance = await publicClient.readContract({
          abi: MyNFT,
          address: MYNFT_ADDRESS as `0x${string}`,
          functionName: "balanceOf",
          args: [address],
        });

        const nfts: any[] = [];
        for (let i = 0; i < Number(allNFTsBalance); i++) {

          
          const tokenURI = await publicClient.readContract({
            abi: MyNFT,
            address: MYNFT_ADDRESS as `0x${string}`,
            functionName: "tokenURI",
            args: [BigInt(i)],
          });

          const owner = await publicClient.readContract({
            abi: MyNFT,
            address: MYNFT_ADDRESS as `0x${string}`,
            functionName: "ownerOf",
            args: [BigInt(i)],
          });

          // Fetch metadata from tokenURI
          let ipfsTokenURI = tokenURI;
          if (tokenURI.startsWith("ipfs://")) {
            ipfsTokenURI = `https://ipfs.io/ipfs/${tokenURI.replace("ipfs://", "")}`;
          }
          let response;
          let metadata: NFTMetadata;
          try {
            response = await fetch(ipfsTokenURI);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            metadata = await response.json();
          } catch (error) {
            console.error("Error fetching or parsing metadata:", error);
            // Assign a default metadata or skip this NFT if metadata is crucial
            metadata = { name: `NFT #${Number(i)}`, description: "Could not load metadata." };
          }

          nfts.push({ id: Number(i), tokenId: Number(i), owner: String(owner), metadata });
        }
        setUserNFTs(nfts);
      } catch (error) {
        console.error("Error fetching user NFTs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserNFTs();
  }, [address, publicClient]);

  function converIpfsToHttp(url: string) {
    if (url.startsWith("ipfs://")) {
      return `https://ipfs.io/ipfs/${url.replace("ipfs://", "")}`;
    }
    return url;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center text-purple-600">My NFTs</h2>
      {loading ? (
        <p className="text-center">Loading your NFTs...</p>
      ) : userNFTs.length === 0 ? (
        <p className="text-center text-gray-500">You don't own any NFTs yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {userNFTs.map((nft) => (
            <div key={nft.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
              {nft.metadata?.image ? (
                <img
                  src={converIpfsToHttp(nft.metadata.image)}
                  alt={nft.metadata.name || `NFT ${nft.tokenId}`}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    // Fallback for broken image links
                    e.currentTarget.src = "/path/to/default/image.png"; // Replace with a default image path
                  }}
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">No Image Available</p>
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 truncate">{nft.metadata?.name || `NFT #${nft.tokenId}`}</h3>
                {nft.metadata?.description && (
                  <p className="text-sm text-gray-600 mb-3 truncate-2-lines">{nft.metadata.description}</p>
                )}
                <p className="text-xs text-gray-500 mb-2">Token ID: {nft.tokenId}</p>
                <p className="text-xs text-gray-500 mb-2">Owner: {nft.owner}</p>
                
                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={() => handleApprove(nft.tokenId)}
                    className="w-full py-2 px-4 bg-purple-500 hover:bg-purple-600 text-white rounded-md text-sm font-medium transition duration-300"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      const price = prompt("Enter price in ETH:");
                      if (price) {
                        handleList(nft.tokenId, parseFloat(price));
                      }
                    }}
                    className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium transition duration-300"
                  >
                    List for Sale
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
