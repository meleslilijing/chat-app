// 未读消息数量统计
import dbConnect from "../../../lib/dbConnect";
import Message from "../../../models/Message";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await dbConnect();

  // const token = req.headers.authorization?.split(" ")[1];
  // if (!token) return res.status(401).json({ error: "未认证" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const privateCount = await Message.aggregate([
    {
      $match: {
        type: "private",
        to: decoded.userId,
        readBy: { $ne: decoded.userId },
      },
    },
  ]);

  res.json({
    code: 1,
    message: "success",
    data: {
      private: privateCount,
    },
  });
}
