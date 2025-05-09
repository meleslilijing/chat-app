// 加载历史消息

import dbConnect from '../../../lib/dbConnect';
import Message from '../../../models/Message';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'GET') return res.status(405).end();

  const { conversationId, type, limit = 20, before } = req.query;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ error: '缺少 token' });

  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
  } catch (e) {
    return res.status(401).json({ error: '无效 token' });
  }

  const query = {};
  if (type === 'private') {
    query.$or = [
      { sender: userId, receiver: conversationId },
      { sender: conversationId, receiver: userId }
    ];
  } else if (type === 'group') {
    query.group = conversationId;
  } else {
    return res.status(400).json({ error: 'type 必须是 private 或 group' });
  }

  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  res.json(messages.reverse()); // 时间顺序：早 → 晚
}
