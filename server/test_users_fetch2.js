import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const userSchema = new mongoose.Schema({}, { strict: false });
  const User = mongoose.model('User', userSchema);
  
  const adminUser = await User.findOne({ email: 'souradeepmandal459@gmail.com' });
  if (!adminUser) {
    console.log("Admin not found");
    process.exit();
  }
  
  const token = jwt.sign({ userId: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  const cookie = `jwt=${token}`;
  
  const usersRes = await fetch('http://localhost:5000/api/auth/users', {
    method: 'GET',
    headers: {
      'Cookie': cookie
    }
  });
  
  console.log("Status:", usersRes.status);
  console.log("Data:", await usersRes.text());
  process.exit();
}
run();
