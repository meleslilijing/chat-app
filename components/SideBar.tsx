import React, { useEffect, useMemo, useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

const mockUsers = [
  { id: 1, name: "John Doe", message: "Hello" },
  { id: 2, name: "Li", message: "Hello" },
  { id: 3, name: "Han", message: "Hello" },
  { id: 4, name: "nick", message: "Hello" },
  { id: 5, name: "joy", message: "Hello" },
  { id: 6, name: "Rose", message: "Hello" },
];

interface IUser {
  id: string;
  email: string;
  username: string;
}

export default function SideBar({
  users,
  dispatch,
  onlineSet,
  currentUser
}: {
  state: any;
  dispatch: any;
}) {
  const [searhText, setSearchText] = useState("");

  const showUsers = useMemo(() => {
    const filteredUsers = users
      .filter((user: IUser) => user.id !== currentUser.id && user.username.includes(searhText))
      .sort((a: IUser, b: IUser) => {
        return a.username.localeCompare(b.username)
      });

    const onlineUsers: IUser[] = []
    const offlineUsers: IUser[] = []

    filteredUsers.forEach((user: IUser) => {
      if (onlineSet.has(user.id)) {
        onlineUsers.push(user)
      } else {
        offlineUsers.push(user)
      }
    })

    return [...onlineUsers, ...offlineUsers];
  }, [searhText, users, onlineSet]);

  const onSearchTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText((e.target as HTMLInputElement).value);
  };

  const changeActivedUser = (id: string) => {
    // console.log(id)
    dispatch({ type: "update_actived_user", payload: id });
  };

  return (
    <div className="side-bar">
      <h4 className="flex justify-center border-b-2 p-1">
        <Input type="text" placeholder="Search" onChange={onSearchTextChange} />
      </h4>
      <ScrollArea className="h-72 rounded-md">
        <div className="sidebar">
          <div className="user-list p-4">
            {showUsers.map((user) => {
              const { id, username } = user;
              
              return (
                <>
                  <div key={id} className="user-item" onClick={
                    () => changeActivedUser(id)
                  }>
                    <Avatar>
                      {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
                      <AvatarFallback>{username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>{ username} { onlineSet.has(id) ? "" : "(offline)" }</div>
                  </div>
                  <Separator className="my-2" />
                </>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
