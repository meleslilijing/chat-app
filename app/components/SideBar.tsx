import React, { useEffect, useMemo, useRef, useState } from "react";

import {User, Message} from '@/types'

// import { Avatar, AvatarFallback, AvatarImage } from "components/ui/avatar";
import { Separator } from "components/ui/separator";
import { ScrollArea } from "components/ui/scroll-area";
import { Input } from "components/ui/input";

import UserAvatar from "./UserAvatar";

export default function SideBar({
  dispatch,
  users,
  onlineSet,
  sendUserId,
  toUserId,
  socket,
  unreadMessages,
}: {
  users: User[];
  dispatch: any;
  onlineSet: Set<string>;
  sendUserId: string;
  toUserId: string;
  unreadMessages: Message[];
  socket: any;
}) {
  const [searhText, setSearchText] = useState("");

  const showUsers = useMemo(() => {
    const filteredUsers = users
      .filter(
        (user: User) =>
          user.id !== sendUserId && user.username.includes(searhText)
      )
      .sort((a: User, b: User) => {
        return a.username.localeCompare(b.username);
      });

    const onlineUsers: User[] = [];
    const offlineUsers: User[] = [];

    filteredUsers.forEach((user: User) => {
      if (onlineSet.has(user.id)) {
        onlineUsers.push(user);
      } else {
        offlineUsers.push(user);
      }
    });

    return [...onlineUsers, ...offlineUsers];
  }, [searhText, users, onlineSet]);

  const onSearchTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText((e.target as HTMLInputElement).value);
  };

  return (
    <div className="side-bar h-full">
      <h4 className="flex justify-center border-b-2 p-1">
        <Input className="p-2 border-0" type="text" placeholder="Search" onChange={onSearchTextChange} />
      </h4>
      <ScrollArea className="rounded-md h-full">
        <div className="sidebar">
          <div className="user-list p-4">
            {showUsers.map((user) => {
              const { id, username } = user;
              const unreadCount = unreadMessages.filter(
                (message: Message) => 
                  message.sender === id && 
                  !message.readBy.includes(sendUserId)
              ).length;

              return (
                <div
                  key={id}
                  className={`user-item flex cursor-pointer flex-col hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-md relative ${id === toUserId ? "bg-gray-100 dark:bg-gray-800" : ""}`}
                  onClick={() => {
                    console.log("click user: ", id);
                    dispatch({
                      type: 'update_touser_id',
                      payload: id
                    });
                    dispatch({
                      type: 'clear_unread_messages',
                      payload: id
                    });

                    // 清除服务器上的未读消息
                    socket?.emit("mark_read", { chatId: id });
                  }}
                >
                  <div className="flex flex-row gap-2 items-center justify-between">
                    <div className="flex flex-row gap-2 items-center">
                      <UserAvatar name={username} />
                      <span>
                        {username[0].toUpperCase() + username.slice(1)} {onlineSet.has(id) ? "" : "(offline)"}
                      </span>
                    </div>
                    {unreadCount > 0 && id !== toUserId && (
                      <div className="bg-red-500 text-white rounded-full px-2 py-1 text-xs font-bold min-w-[20px] text-center">
                        {unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
