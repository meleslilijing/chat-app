import { useEffect, useMemo, useState } from "react";

import { initSocket } from "../lib/socket";

interface IUser {
  id: string;
  email: string;
  username: string;
}

interface IMessage {
  type: "private";
  sender: string;
  to: string;
  content: string;
  createdAt: string;
}

export default function ChatWindow({
  activedUser,
  users,
  messages,
}: {
  activedUser: IUser;
  users: IUser[];
  messages: IMessage[];
}) {
  const userMap = useMemo(() => {
    const map: { [key: string]: IUser } = {};
    users.forEach((user: IUser) => {
      map[user.id] = user;
    });
    return map;
  }, [users])

  return (
    <div>
      <div className="chat-records">
        {messages.map((message: IMessage) => {
          return (
            <div className="record">
              {`${message.createdAt}-${userMap[message.sender].username}: ${message.content}`}
            </div>
          );
        })}
      </div>
    </div>
  );
}
