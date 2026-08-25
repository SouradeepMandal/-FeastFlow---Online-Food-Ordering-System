import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({});
  console.log('Users:', JSON.stringify(users, null, 2));
  process.exit();
}
check();
