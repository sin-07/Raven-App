const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

dotenv.config({ path: './.env' });

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set in .env. Aborting.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }

  const email = 'vs.aniket07@gmail.com';
  const password = 'Aniket1812@';

  try {
    const adminsColl = mongoose.connection.collection('admins');
    const existing = await adminsColl.findOne({ email });
    if (existing) {
      console.log('Admin already exists in database:', email);
      await mongoose.disconnect();
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const now = new Date();
    const doc = {
      email,
      password: hashed,
      name: 'Admin User',
      role: 'admin',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const res = await adminsColl.insertOne(doc);
    if (res.insertedId) {
      console.log('Inserted admin:', email);
    } else {
      console.error('Failed to insert admin for unknown reason');
    }
  } catch (err) {
    console.error('Error while inserting admin:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
