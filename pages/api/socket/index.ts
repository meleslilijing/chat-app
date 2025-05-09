// pages/api/socket.ts
import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import type { NextApiRequest } from "next";
import type { NextApiResponse } from "next";

// 扩展 res 类型，加入 socket.io server
type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (res.socket.server.io) {
    console.log("Socket.io already running");
    res.end();
    return;
  }

  console.log("Socket.io starting...");
  const io = new SocketIOServer(res.socket.server, {
    path: "/api/socket",  // 前端连接路径要一致
    addTrailingSlash: false,
  });

  io.on("connection", (socket) => {
    console.log("Client connected", socket.id);

    socket.on("message", (msg) => {
      console.log("Received message:", msg);
      io.emit("message", msg); // 广播给所有客户端
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });

  res.socket.server.io = io;
  res.end();
}
