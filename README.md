# NFT Market Listener

A sample NFT marketplace project that combines **Solidity contracts + a Next.js frontend + a TypeScript backend listener service**.

Project goals:
- Deploy and use NFT / ERC20 / NFT Marketplace contracts
- Complete NFT minting, listing, and buying flows in the frontend
- Listen to on-chain events in the backend and extend service capabilities (for example: transfer scanning, signature service, and Merkle distribution)

## Project Structure

```text
.
├── contracts/   # Foundry contract project (NFT, ERC20, marketplace, tests, scripts)
├── frontend/    # Next.js + wagmi + viem frontend
├── backend/     # Node.js + TypeScript + viem listener/service scripts
└── images/      # Screenshot assets
```

## Tech Stack

- **Contracts**: Solidity, Foundry
- **Frontend**: Next.js (App Router), React, wagmi, viem, Reown AppKit
- **Backend**: Node.js, TypeScript, viem, Express, MongoDB (dependency already included)

## Requirements

Recommended tool versions (or compatible versions):

- Node.js 18+
- pnpm 10+
- Foundry (`forge` / `cast` / `anvil`)

## Quick Start

> The suggested order is: local chain (`anvil`) -> contracts -> frontend -> backend.

### 1) Start a local chain

```bash
anvil
```

Default local RPC: `http://127.0.0.1:8545`.

### 2) Build and test contracts

```bash
cd contracts
forge build
forge test
```

### 3) Install frontend dependencies and run

```bash
cd frontend
pnpm install
pnpm dev
```

Then open: `http://localhost:3000`

### 4) Install backend dependencies and run

```bash
cd backend
pnpm install
pnpm watch
```

`pnpm watch` starts the NFT Marketplace event listener script.

## Frontend Features

Main pages/capabilities include:

- Wallet connection and account info display
- NFT listing (List)
- NFT purchase (Buy)
- Listed NFT display (Listed NFTs)
- Other extended pages (for example: minting, My NFTs, transfer history)

If you use locally deployed contracts, update frontend contract configuration:

- `frontend/app/constant/contract.ts`
- `frontend/app/contracts/abi/*.json`

## Backend Scripts

`backend/package.json` provides multiple runnable scripts (examples):

- `pnpm watch`: listen to NFT marketplace events
- `pnpm start:permit-signer`: run the permit signer script
- `pnpm scanerc20`: scan ERC20 Transfer events
- `pnpm erc20server`: run an ERC20 sample server
- `pnpm merkledistributor`: run Merkle distributor logic

You can inspect and extend related files under `backend/src/` as needed.

## Environment Variables

The backend uses `dotenv`. Common variables include:

- `RPC_URL` (default can be `http://127.0.0.1:8545`)
- `SEPOLIA_RPC_URL`
- `PRIVATE_KEY` / `PRIVATE_KEY1`
- `NFT_MARKET_ADDRESS`
- `SEPOLIA_RPC_URL` / `ETHERSCAN_API_KEY` (for contract deployment/verification scenarios)

It is recommended to maintain local `.env` files under both `backend/` and `contracts/` (never commit private keys).

## Reference Screenshots

- Home page example: `images/login.png`
- Marketplace page example: `images/nftmarket.png`

## Development Tips

- Validate the full flow on a local chain first, then move to Sepolia.
- After contract address changes, always sync both frontend and backend configuration.
- Before submitting, it is recommended to at least run:

```bash
# contracts
forge test

# frontend
pnpm lint

# backend
pnpm watch
```
