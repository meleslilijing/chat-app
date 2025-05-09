// pages/api/auth/login.ts

import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/dbConnect";
import User from "../../../models/User";
//@ts-ignore
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "仅支持 GET 请求" });
  }

  let { email, password } = req.query;
  email = decodeURIComponent(email as string || '')

console.log(`email: ${email}, password: ${password}`)
  if (typeof email !== "string" || typeof password !== "string") {
    return res
      .status(400)
      .json({ code: -1, message: "缺少或格式错误的用户名/密码" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ code: -1, message: "用户不存在" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ code: -1, message: "密码错误" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      code: 1,
      message: "success",
      data: {
        token,
        user: { 
          _id: user._id, 
          username: user.username, 
          email: user.email 
        },
      }
      
    });
  } catch (err) {
    console.error("登录失败:", err);
    return res.status(500).json({ codd: -1, message: "服务器内部错误" });
  }
}
