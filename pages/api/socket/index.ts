import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import type { NextApiRequest } from "next";
import type { NextApiResponse } from "next";

import jwt from "jsonwebtoken";
import Message from "../../../../models/Message";

import dbConnect from "../../../../lib/dbConnect";

// 在线用户
const onlineUsers = new Map(); // userId => socket.id

export default async function handler(req, res) {
  if (res.socket.server.io) {
    res.end();
    return;
  }

  console.log('开始连接数据库')
  await dbConnect();
  console.log('连接数据库成功')

  console.log("正在初始化 Socket.IO...");
  const io = new SocketIOServer(res.socket.server, {
    path: "/api/socket",  // 前端连接路径要一致
    addTrailingSlash: false,
  });

  

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      console.log('socket.userId: ', socket.userId)
      next();
    } catch (err) {
      next(new Error("token 认证失败"));
    }
  });

  console.log("token 认证成功");

  console.log("Socket.io starting...");
  io.on("connection", (socket) => {
    console.log("Client connected socket.id: ", socket.id);
    console.log('上线 socket.userId: ', socket.userId)

    // TODO: 现在的问题是。emit private_message后，客户端接不到消息。原因是，未上线的用户没有对应的socket.id.
    // 先http读取记录吧

    // 广播上线
    onlineUsers.set(socket.userId, socket.id);
    io.emit("user_online", { userIds: [...onlineUsers.keys()] });

    socket.on("message", (msg) => {
      console.log("Received message:", msg);
      io.emit("message", msg + ':test'); // 广播给所有客户端
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });

    

    // 私聊
    socket.on("private_message", async ({ toUserId, content }) => {
      const message = await Message.create({
        sender: socket.userId,
        to: toUserId,
        content,
        type: "private",
        readBy: [socket.userId],
      });

      const toSocketId = onlineUsers.get(toUserId)
      if (toSocketId) {
        console.log('private_message created: ', message)
        io.to(toSocketId)?.emit("private_message", message);
      }
    });

    // 离线
    socket.on("disconnect", () => {
      console.log('用户已断开连接:', socket.userId);
      onlineUsers.delete(socket.userId);
      io.emit("user_offline", { userIds: [...onlineUsers.keys()] });
    });
      
    

    // 群聊
    // socket.on('group_message', async ({ groupId, content }) => {
    //   const message = await Message.create({
    //     sender: userId,
    //     groupId,
    //     content,
    //     type: 'group',
    //     readBy: [userId],
    //   });
    //   io.to(groupId).emit('group_message', message);
    // });

    // 加入群聊
    // socket.on('join_group', (groupId) => {
    //   socket.join(groupId);
    // });

    // 标记已读
    // socket.on('mark_read', async ({ chatId, isGroup }) => {
    //   const filter = isGroup
    //     ? { groupId: chatId }
    //     : {
    //         type: 'private',
    //         $or: [
    //           { sender: chatId, to: userId },
    //           { sender: userId, to: chatId }
    //         ]
    //       };

    //   await Message.updateMany(
    //     { ...filter, readBy: { $ne: userId } },
    //     { $addToSet: { readBy: userId } }
    //   );

    //   io.to(chatId).emit('messages_read', { from: userId, chatId });
    // });
  });

  res.socket.server.io = io;

  res.end();
}
