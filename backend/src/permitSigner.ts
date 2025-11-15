import express from 'express';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet, sepolia } from 'viem/chains';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = 3001;

const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
if (!privateKey) {
  throw new Error('PRIVATE_KEY not found in .env file');
}

const account = privateKeyToAccount(privateKey);

const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(process.env.SEPOLIA_RPC_URL!),
});

const domain = {
  name: 'NFTMarket',
  version: '1',
  chainId: sepolia.id,
  verifyingContract: '0xdAb82a36Ef516569056BC32b281eDb634c97E139',
} as const;

console.log(`sepolia.id: ${sepolia.id}`)

const types = {
  BuyNFTPermit: [
    { name: 'buyer', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
} as const;

app.post('/sign-permit', async (req, res) => {
  const { buyer, nonce, deadline } = req.body;

  if (!buyer || nonce === undefined || !deadline) {
    return res.status(400).json({ error: 'Missing required parameters: buyer, nonce, deadline' });
  }

  try {
    const signature = await walletClient.signTypedData({
      domain,
      types,
      primaryType: 'BuyNFTPermit',
      message: {
        buyer,
        nonce: BigInt(nonce),
        deadline: BigInt(deadline),
      },
    });

    res.json({ signature });
  } catch (error) {
    console.error('Error signing permit:', error);
    res.status(500).json({ error: 'Failed to sign permit' });
  }
});

app.listen(port, () => {
  console.log(`Permit signer server listening at http://localhost:${port}`);
});
