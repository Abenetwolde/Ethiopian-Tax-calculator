import mongoose from 'mongoose';

const url = 'mongodb://localhost:27017/tax_bot';

export async function connectDB() {
  try {
    await mongoose.connect(url, {
      serverSelectionTimeoutMS: 20000,
    });
    console.log("Connected successfully to MongoDB");
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error; // rethrow to handle it where you call connectDB
  }
}

export default mongoose;
