import { useEffect, useMemo, useState, useRef } from "react";

import type { User, Message } from "@/types";
import UserAvatar from "../UserAvatar";
import { ScrollArea } from "components/ui/scroll-area";

const dateISOStringToLocaleString = (dateISOString: string) => {
  if (!dateISOString) {
    return "";
  }
  const date = new Date(dateISOString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const dt = date.getDate();

  let dStr = dt.toString();
  let monthStr = month.toString();

  if (dt < 10) {
    dStr = "0" + dStr;
  }
  if (month < 10) {
    monthStr = "0" + month;
  }
  return `${year}-${monthStr}-${dStr} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
};

export default function ChatWindow({
  users,
  messages,
  sendUser,
  toUser,
  online,
}: {
  users: User[];
  messages: Message[];
  sendUser: User | null;
  toUser: User | null;
  online: boolean;
}) {
  const userMap = useMemo(() => {
    const map: { [key: string]: User } = {};
    users.forEach((user: User) => {
      map[user.id] = user;
    });
    return map;
  }, [users]);


  const itemsRef = useRef<any>(null);
  const getMap = () => {
    if (!itemsRef.current) {
      // 首次运行时初始化 Map。
      itemsRef.current = new Map<Message, any>();
    }
    return itemsRef.current;
  }
  const scrollToMessage = (message: Message) => {
    const map = getMap();
    const node = map.get(message);
    
    node?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }

  useEffect(() => {
    const len = messages.length
    scrollToMessage(messages[len - 1])
  }, [messages])


  return (
    <div className="chat-window flex flex-col" style={{height: '100%'}}>
      <div className="items-center border-b p-2 flex justify-between" style={{
        height: '50px'
      }}>
        <p>
          {toUser
            ? toUser.username[0].toUpperCase() + toUser.username.slice(1)
            : "UNKNOWN"}{" "}
          {online ? "" : "(Offline)"}
        </p>
        <p>
          Sender:{" "}
          {sendUser
            ? sendUser.username[0].toUpperCase() + sendUser.username.slice(1)
            : "UNKNOWN"}
        </p>
      </div>
      <ScrollArea className="chat-records p-2" style={{height: 'calc(100% - 50px)'}}>
        {messages.map((message: Message, index: number) => {
          const senderName = userMap[message.sender]?.username || 'Unknown';
          const createDateStr = dateISOStringToLocaleString(message.createdAt);
          const isSender = message.sender === sendUser?.id;

          return (
            <div
              key={`${message.createdAt}-${index}`}
              ref={(node) => {
                const map = getMap();
                if (node) {
                  map.set(message, node);
                } else {
                  map.delete(message);
                }
              }}
              className={`record flex ${isSender ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className="record-avatar flex flex-start">
                <UserAvatar name={senderName} />
              </div>
              <div className="record-content p-2 max-w-1/2">
                <div className="flex justify-start text-sm gap-2">
                  <p>{senderName}</p>
                  <p className="">{createDateStr}</p>
                  {isSender && (
                    <span className="text-sm">
                      {message.readBy.includes(message.to)
                        ? "✓✓ 已读"
                        : message.readBy.includes(message.sender)
                          ? "✓ 已发送"
                          : "发送中"}
                    </span>
                  )}
                </div>
                <div
                  className={`content p-2 rounded-sm ${
                    isSender ? "bg-green-200 text-black" : "bg-gray-700"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          );
        })}
      </ScrollArea>
    </div>
  );
}
