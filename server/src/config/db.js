import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://souradeepmandal459_db_user:5ebzYdDpiovMVDGy@ac-ghenyji-shard-00-00.cwdou3z.mongodb.net:27017,ac-ghenyji-shard-00-01.cwdou3z.mongodb.net:27017,ac-ghenyji-shard-00-02.cwdou3z.mongodb.net:27017/feastflow?ssl=true&replicaSet=atlas-48nzcu-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
