// pages/api/message/load.ts

import dbConnect from '../../../lib/dbConnect';
import Message from '../../../models/Message';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: '只支持 GET 请求' });
  }

  const { 
    type, 
    conversationId, 
    token
    // limit = '50'
  } = req.query;
  // const token = req.headers.Authorization?.split(' ')[1];
  
  console.log('Token: ', token)

  if (!token) {
    return res.status(401).json({ error: '未提供 token' });
  }

  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
  } catch (err) {
    return res.status(401).json({ error: '无效的 token' });
  }

  if (!type || !conversationId || (type !== 'private' && type !== 'group')) {
    return res.status(400).json({ error: '请求参数错误' });
  }

  try {
    const messages = await Message.find({
      type,
      ...(type === 'private'
        ? {
            $or: [
              { sender: userId, to: conversationId },
              { sender: conversationId, to: userId },
            ],
          }
        : { group: conversationId }),
    })
      .sort({ createdAt: -1 })
      // .limit(Number(limit));

    return res.status(200).json({
      code: 1,
      message: 'success',
      data: {
        messages:messages.reverse()
      }
    }); // 按时间升序返回
  } catch (err) {
    console.error('加载消息失败:', err);
    return res.status(500).json({ error: '服务器错误' });
  }
}
