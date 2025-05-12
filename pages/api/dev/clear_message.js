import dbConnect from '../../../lib/dbConnect'
import Message from "../../../models/Message";
import bcrypt from "bcryptjs";


export default async function handler(req, res) {
  await dbConnect();

  console.log('清空消息')
  // 可选：清空已有用户
  await Message.deleteMany({});

  res.status(201).json({ 
    code: 1,
    message: `清空Table Messages`, 
  });
}



// scripts/seedUsers.ts


