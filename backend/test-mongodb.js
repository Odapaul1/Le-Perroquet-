import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('🔄 Testing MongoDB connection...');
    console.log('📡 Connection URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/french-lms');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/french-lms');
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📊 Database Info:');
    console.log('   - Host:', mongoose.connection.host);
    console.log('   - Port:', mongoose.connection.port);
    console.log('   - Database:', mongoose.connection.name);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📦 Existing Collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('\n💡 Troubleshooting Tips:');
    console.log('   1. For local MongoDB: Ensure MongoDB service is running');
    console.log('   2. For MongoDB Atlas: Check your connection string and IP whitelist');
    console.log('   3. Check your .env file for correct MONGODB_URI');
    console.log('   4. See MONGODB_SETUP.md for detailed setup instructions');
    process.exit(1);
  }
};

testConnection();