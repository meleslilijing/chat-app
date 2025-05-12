import React, { useEffect, useMemo, useRef, useState } from "react";

import {User} from '@/types'

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
}: {
  users: User[];
  dispatch: any;
  onlineSet: Set<string>;
  sendUserId: string;
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

  const changeToUserId = (id: string) => {
    // console.log(id)
    dispatch({ type: "update_touser_id", payload: id });
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

              return (
                <div
                  key={id}
                  className="user-item flex cursor-pointer flex-col"
                  onClick={() => changeToUserId(id)}
                >
                  <div className="flex flex-row gap-2">
                    <UserAvatar name={username} />
                    <span>
                      {username[0].toUpperCase() + username.slice(1)} {onlineSet.has(id) ? "" : "(offline)"}
                    </span>
                  </div>
                  <Separator className="my-2" />
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
