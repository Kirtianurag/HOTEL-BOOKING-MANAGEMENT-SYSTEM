import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stayease';

async function listUsers() {
  try {
    console.log(`\nConnecting to database at: ${MONGODB_URI} ...`);
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    const users = await db.collection('users')
      .find({}, { projection: { firstName: 1, lastName: 1, email: 1, role: 1, createdAt: 1 } })
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`\n========================================`);
    console.log(`  STAYEASE USER DATABASE (${users.length} registered users)`);
    console.log(`========================================\n`);

    if (users.length === 0) {
      console.log('No users found in database.\n');
    } else {
      console.table(users.map((u, i) => ({
        '#': i + 1,
        'Name': `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        'Email': u.email,
        'Role': (u.role || 'guest').toUpperCase(),
        'Created At': u.createdAt ? new Date(u.createdAt).toLocaleString() : 'N/A'
      })));
    }

    await mongoose.disconnect();
    console.log('');
  } catch (err) {
    console.error('Error reading users database:', err.message);
    process.exit(1);
  }
}

listUsers();

