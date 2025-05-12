import mongoose from "mongoose";
import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import type { NextApiRequest } from "next";
import type { NextApiResponse } from "next";

import jwt from "jsonwebtoken";
import Message from "../../../models/Message";

import dbConnect from "../../../lib/dbConnect";

// 在线用户
const onlineUsers = new Map(); // userId => socket.id

export default async function handler(req, res) {
  if (res.socket.server.io) {
    res.end();
    return;
  }

  console.log("开始连接数据库");
  await dbConnect();
  console.log("连接数据库成功");

  console.log("正在初始化 Socket.IO...");
  const io = new SocketIOServer(res.socket.server, {
    path: "/api/socket", // 前端连接路径要一致
    addTrailingSlash: false,
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      console.log("socket.userId: ", socket.userId);
      next();
    } catch (err) {
      next(new Error("token 认证失败"));
    }
  });

  console.log("token 认证成功");

  console.log("Socket.io starting...");
  io.on("connection", async (socket) => {
    const userId = socket.userId;

    const unreadMessages = await Message.find({
      to: new mongoose.Types.ObjectId(userId),
      readBy: {
        $not: { $elemMatch: { $eq: new mongoose.Types.ObjectId(userId) } },
      },
    })
      .sort({ createdAt: -1 }) // 按创建时间倒序排列
      .lean(); // 返回普通JavaScript对象而非Mongoose文档

    // 广播上线
    onlineUsers.set(userId, socket.id);
    io.emit("user_online", {
      userIds: [...onlineUsers.keys()],
      unreadMessages: unreadMessages,
    });

    // 私聊
    socket.on("private_message", async ({ toUserId, content }) => {
      console.log("private_message: ", { toUserId, content });
      const message = await Message.create({
        sender: userId,
        to: toUserId,
        content,
        type: "private",
        readBy: [userId],
      });

      const toSocketId = onlineUsers.get(toUserId);
      if (toSocketId) {
        console.log("private_message created: ", message);
        io.to(toSocketId)?.emit("private_message", message);
      }
    });

    // 标记已读
    socket.on("mark_read", async ({ chatId }) => {
      console.log("mark_read: ", { chatId });
      const filter = {
        type: "private",
        $or: [
          { sender: chatId, to: userId },
          { sender: userId, to: chatId },
        ],
      };

      await Message.updateMany(
        { ...filter, readBy: { $ne: userId } },
        { $addToSet: { readBy: userId } }
      );

      // 通过socket，给在线的用户更新消息
      const toSocketId = onlineUsers.get(chatId);
      if (toSocketId) {
        io.to(toSocketId).emit("messages_read", { sender: userId });
      }
    });

    // 离线
    socket.on("disconnect", () => {
      console.log("用户已断开连接:", userId);
      onlineUsers.delete(userId);
      io.emit("user_offline", { userIds: [...onlineUsers.keys()] });
    });
  });

  res.socket.server.io = io;

  res.end();
}
