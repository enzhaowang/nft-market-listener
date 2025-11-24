import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { closeDb, connectDb } from '../db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// GET /api/transfers?address=0x...
app.get('/api/transfers', async (req, res) => {
  try {
    const address = (req.query.address as string | undefined)?.toLowerCase();

    if (!address) {
      return res.status(400).json({ error: 'address query param is required' });
    }
    console.log("address:",address);

    const { transferCollection } = await connectDb();

    // 如果你只想查 from（发出的记录）：
    const query = { from: address };

    // 如果你想查该地址“相关的所有转账”（from 或 to 任一）：
    // const query = {
    //   $or: [{ from: address }, { to: address }],
    // };

    // 简单加个分页
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      transferCollection
        .find(query)
        .sort({ blockNumber: -1 }) // 最新的在前
        .skip(skip)
        .limit(limit)
        .toArray(),
      transferCollection.countDocuments(query),
    ]);

    return res.json({
      address,
      page,
      limit,
      total,
      items,
    });
  } catch (err) {
    console.error('Error in GET /api/transfers:', err);
    closeDb();
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});
