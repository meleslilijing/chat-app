// scripts/seedUsers.ts

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require( '../models/User');
const dbConnect = require( '../lib/dbConnect');

dotenv.config();

const names = [
  'alice', 'bob', 'carol', 'david', 'eva',
  'frank', 'grace', 'henry', 'irene', 'jack',
  'karen', 'leo', 'mary', 'nick', 'olivia',
  'peter', 'queen', 'roger', 'susan', 'tom',
];

async function seed() {
  await dbConnect();

  console.log('连接成功，开始插入用户...');

  // 可选：清空已有用户
  await User.deleteMany({});

  const hashedPassword = await bcrypt.hash('123', 10);

  const users = names.map((name) => ({
    username: name,
    email: `${name}@gmail.com`,
    password: hashedPassword,
  }));

  await User.insertMany(users);

  console.log(`✅ 成功插入 ${users.length} 个用户`);
  mongoose.connection.close();
}

seed().catch((err) => {
  console.error('❌ 插入失败:', err);
  mongoose.connection.close();
});
