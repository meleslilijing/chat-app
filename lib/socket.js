import { io } from 'socket.io-client';

let socket;

export function initSocket(token) {
  if (!socket) {
    socket = io({
      path: '/api/socket',
      auth: { token },
    });
  }

  return socket;
}

export function getSocket() {
  return socket;
}
