import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let currentToken: string | null = null;

export function initSocket(token: string) {
  // 如果 token 变化或者 socket 不存在，则重新初始化
  if (!socket || currentToken !== token) {
    // 如果已存在 socket，先断开连接
    if (socket) {
      socket.disconnect();
      socket = null;
    }

    if (token) {
      currentToken = token;
      socket = io({
        path: '/api/socket',
        auth: { token },
        // 添加重连配置
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
}
