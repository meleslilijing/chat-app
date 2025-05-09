import mongoose from 'mongoose'
import dbConnect from '../../../lib/dbConnect'
import User from "../../../models/User";
import bcrypt from "bcryptjs";



const names = [
  'alice', 'bob', 'carol', 'david', 'eva',
  'frank', 'grace', 'henry', 'irene', 'jack',
  'karen', 'leo', 'mary', 'nick', 'olivia',
  'peter', 'queen', 'roger', 'susan', 'tom',
];

export default async function handler(req, res) {
  await dbConnect();

  console.log('清空已有用户')
  // 可选：清空已有用户
  await User.deleteMany({});

  console.log('连接成功，开始插入用户...');

  const hashedPassword = await bcrypt.hash('123', 10);

  const users = names.map((name) => ({
    username: name,
    email: `${name}@gmail.com`,
    password: hashedPassword,
  }));

  await User.insertMany(users);

  console.log(`✅ 成功插入 ${users.length} 个用户`);

  res.status(201).json({ 
    code: 1,
    message: `✅ 成功插入 ${users.length} 个用户`, 
  });
}



// scripts/seedUsers.ts


