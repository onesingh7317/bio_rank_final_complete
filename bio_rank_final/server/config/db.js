const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let mongoMemoryServer = null;

async function seedDefaultAdmin(User) {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin User',
        username: 'admin',
        email: 'admin@biorank.app',
        passwordHash,
        role: 'admin',
      });
      console.log('--------------------------------------------------');
      console.log('🔑 Default Admin Account Ready:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   Email:    admin@biorank.app');
      console.log('--------------------------------------------------');
    } else {
      console.log(`👤 Admin user ready: ${existingAdmin.username} (${existingAdmin.email})`);
    }
  } catch (err) {
    console.error('Error seeding default admin:', err.message);
  }
}

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/biorank';

  try {
    // Try connecting to configured MongoDB (e.g. Atlas or local service)
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    const safeLogUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    console.log(`✅ MongoDB Atlas connected successfully to: ${safeLogUri}`);
  } catch (err) {
    console.warn(`⚠️  Could not connect to external MongoDB (${err.message}). Starting In-Memory MongoDB Server...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`✅ In-Memory MongoDB Server connected at: ${inMemoryUri}`);
    } catch (memErr) {
      console.error('❌ Failed to start In-Memory MongoDB Server:', memErr.message);
      process.exit(1);
    }
  }

  // Seed default admin account if none exists
  const User = require('../models/User');
  await seedDefaultAdmin(User);
}

module.exports = connectDB;
