"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";

type TransferEvent = {
  _id: string;
  transactionHash: string;
  logIndex: number;
  blockNumber: number;
  contractAddress: string;
  from: string;
  to: string;
  value: string;      
  createdAt?: string; 
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export function TransferHistory() {
  const { address } = useAccount();
  const [transfers, setTransfers] = useState<TransferEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransfers = async () => {
    if (!address) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_BASE}/api/transfers?address=${encodeURIComponent(address)}`
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed: ${res.status}`);
      }

      const data = await res.json();
      setTransfers(data.items || []);
    } catch (e: any) {
      console.error("Failed to fetch transfers:", e);
      setError(e.message || "Failed to fetch transfers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    
    if (address) {
      fetchTransfers();
    } else {
      setTransfers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const shorten = (addr: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  if (!address) {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold">Transfer History</h2>
        <p className="text-gray-600">Please connect your wallet first.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Transfer History</h2>
        <button
          type="button"
          onClick={fetchTransfers}
          disabled={loading}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <p className="text-sm text-gray-600">
        Address: <span className="font-mono break-all">{address}</span>
      </p>

      {error && (
        <div className="p-2 text-sm text-red-700 bg-red-100 border border-red-300 rounded">
          {error}
        </div>
      )}

      {loading && transfers.length === 0 && (
        <p className="text-gray-600">Loading transfer events...</p>
      )}

      {!loading && transfers.length === 0 && !error && (
        <p className="text-gray-600">No transfer events found for this address.</p>
      )}

      {transfers.length > 0 && (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">Block</th>
                <th className="px-3 py-2 text-left">From</th>
                <th className="px-3 py-2 text-left">To</th>
                <th className="px-3 py-2 text-left">Value</th>
                <th className="px-3 py-2 text-left">Tx Hash</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((tx) => (
                <tr key={tx.transactionHash + "-" + tx.logIndex} className="border-t">
                  <td className="px-3 py-2">{tx.blockNumber}</td>
                  <td className="px-3 py-2 font-mono">{shorten(tx.from)}</td>
                  <td className="px-3 py-2 font-mono">{shorten(tx.to)}</td>
                  <td className="px-3 py-2">
                    {(() => {
                      try {
                        return `${formatEther(BigInt(tx.value))} ETH`;
                      } catch {
                        return tx.value;
                      }
                    })()}
                  </td>
                  <td className="px-3 py-2 font-mono">
                    {shorten(tx.transactionHash)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
