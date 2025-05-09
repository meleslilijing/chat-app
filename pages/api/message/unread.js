// 未读消息数量统计
import dbConnect from '../../../lib/dbConnect';
import Message from '../../../models/Message';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  await dbConnect();

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '未认证' });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.userId;

  const privateCount = await Message.aggregate([
    {
      $match: {
        type: 'private',
        to: decoded.userId,
        readBy: { $ne: decoded.userId },
      },
    },
    {
      $group: {
        _id: '$sender',
        count: { $sum: 1 },
      },
    },
  ]);

  const groupCount = await Message.aggregate([
    {
      $match: {
        type: 'group',
        readBy: { $ne: decoded.userId },
      },
    },
    {
      $group: {
        _id: '$groupId',
        count: { $sum: 1 },
      },
    },
  ]);

  res.json({ private: privateCount, group: groupCount });
}
