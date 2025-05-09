// 储存已经在线的用户id

const onlineUsers = new Set(); // userId => socket.id
export default onlineUsers;