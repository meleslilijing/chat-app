import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/dbConnect";
import User from "../../../models/User";
import bcrypt from "bcryptjs";

//@ts-ignore
import jwt from "jsonwebtoken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();
  const { email, username, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(200).json({
      code: -1,
      message: "用户已存在",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, password: hashedPassword });

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  res.status(201).json({
    code: 1,
    message: "注册成功",
    data: {
      token,
      user: {
        username: user.username,
        email: user.email
      }
    }
  });
}
