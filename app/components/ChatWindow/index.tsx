import { useEffect, useMemo, useState } from "react";

import type {User, Message} from '@/types'
import UserAvatar from "../UserAvatar";


const dateISOStringToLocaleString = (dateISOString: string) => {
  if (!dateISOString) {
    return ''
  }
  const date = new Date(dateISOString);
  const year = date.getFullYear();
  const month = date.getMonth()+1;
  const dt = date.getDate();

  let dStr = dt.toString();
  let monthStr = month.toString();

  if (dt < 10) {
    dStr = '0' + dStr;
  }
  if (month < 10) {
    monthStr = '0' + month;
  }
  return `${year}-${monthStr}-${dStr} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}

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
  online: boolean
}) {
  const userMap = useMemo(() => {
    const map: { [key: string]: User } = {};
    users.forEach((user: User) => {
      map[user.id] = user;
    });
    return map;
  }, [users])

  return (
    <div className="flex flex-col">
      <div className="items-center border-b p-2 flex justify-between">
        <p>{ toUser ? toUser.username[0].toUpperCase() + toUser.username.slice(1) : 'UNKNOWN'} { online ? '' : '(Offline)'}</p>
        <p>Sender: {sendUser ? sendUser.username[0].toUpperCase() + sendUser.username.slice(1) : 'UNKNOWN'}</p>
      </div>
      <div className="chat-records p-2">
        {messages.map((message: Message) => {
          const senderName = userMap[message.sender].username
          const createDateStr = dateISOStringToLocaleString(message.createdAt)

          const isSender = message.sender === sendUser?.id

          return (
            <div className={`record flex ${ isSender ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="record-avatar flex flex-start">
                <UserAvatar name={senderName} />
              </div>
              <div className="record-content p-2 max-w-1/2">
                <div className="flex justify-start text-xs gap-2">
                  <p>{senderName}</p>
                  <p className="">{createDateStr}</p>
                </div>
                <div className={`content p-2 rounded-sm ${isSender ? 'bg-green-200 text-black' : 'bg-gray-700'}`}>
                  {message.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
