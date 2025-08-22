import mongoose from 'mongoose';

const mongoUri = 'mongodb+srv://millercaptain546:4yRKzuvLM7ewHbWE@b1.qfkjqap.mongodb.net/?retryWrites=true&w=majority&appName=b1';

async function testConnection() {
  try {
    console.log('🔌 Testing MongoDB connection...');
    console.log('URI:', mongoUri);
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB connected successfully!');
    
    // Test creating a simple document
    const TestModel = mongoose.model('Test', new mongoose.Schema({ name: String }));
    const testDoc = new TestModel({ name: 'test' });
    await testDoc.save();
    console.log('✅ Document saved successfully!');
    
    await mongoose.disconnect();
    console.log('✅ Disconnected successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();
