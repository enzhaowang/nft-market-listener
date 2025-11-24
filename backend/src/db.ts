import 'dotenv/config';
import { MongoClient, ServerApiVersion, Db, Collection } from 'mongodb';

const uri = process.env.MONGODB_URL!;
if (!uri) {
  throw new Error('MONGO_URL not set in .env');
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db: Db;
let transferCollection: Collection;

export async function connectDb() {
  if (!db) {
    await client.connect();
    console.log('✅ Mongo connected');

    db = client.db('erc20db'); 
    transferCollection = db.collection('transfer_events');

    // set indx
    await transferCollection.createIndex({ from: 1 });
    await transferCollection.createIndex({ to: 1 });
  }
  return { db, transferCollection };
}

export async function closeDb() {
  await client.close();
}
