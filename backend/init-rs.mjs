import mongoose from 'mongoose';

const client = new mongoose.mongo.MongoClient('mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=5000');

async function init() {
  try {
    await client.connect();
    const admin = client.db('admin');
    console.log('Connected to MongoDB directly. Checking replSet status...');
    try {
      const status = await admin.command({ replSetGetStatus: 1 });
      console.log('ReplSet already initialized:', status.set);
    } catch (err) {
      console.log('Initiating replSet rs0...');
      const res = await admin.command({
        replSetInitiate: {
          _id: 'rs0',
          members: [{ _id: 0, host: '127.0.0.1:27017' }]
        }
      });
      console.log('ReplSet initiated successfully:', res);
    }
  } catch (error) {
    console.error('ReplSet init error:', error);
  } finally {
    await client.close();
  }
}

init();

