// pages/api/auth/login.ts

import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../../lib/dbConnect";
import User from "../../../../models/User";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "仅支持 GET 请求" });
  }

  try {
    const users = await User.find();
    
    return res.status(200).json({
      code: 1,
      message: "看console.log",
      data: {
        users: users.map((user) => ({
          id: user.id,
          email: user.email,
          username: user.username
        }))
      }
    });
  } catch (err) {
    return res.status(500).json({ codd: -1, message: "服务器内部错误" });
  }
}
