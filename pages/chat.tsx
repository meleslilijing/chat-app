import { useEffect, useState, useReducer, useMemo } from "react";
import { getSocket, initSocket } from "../lib/socket";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { useRouter } from "next/router";

import SideBar from "src/components/SideBar";
import ChatWindow from "src/components/ChatWindow";
import MessageInput from "src/components/MessageInput";

import useAllUsers from "src/hooks/useAllUsers";

import io from "socket.io-client";

import { Button } from "src/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "src/components/ui/resizable";

import reducer, { initState } from "src/reducer";

import "src/app/globals.css";
import "./style.css";

let socket: any;

export default function ChatBox() {
  const router = useRouter();

  const [connected, setConnected] = useState(false);

  const [onlineSet, setOnlineSet] = useState(new Set()); // 在线用户
  const [state, dispatch] = useReducer(reducer, initState);

  const users: any[] = useAllUsers();
  const [currentUser, setCurrentUser] = useState<any>(null);

  const activedUser = useMemo(() => {
    const arr = users.filter((user: any) => user.id === state.activedUserId);
    if (arr.length === 0) {
      return null;
    }
    return arr[0];
  }, [state.activedUserId]);

  useEffect(() => {
    setCurrentUser(() => {
      const userString = localStorage.getItem("user") || "";
      return JSON.parse(userString);
    });

    if (!localStorage.getItem("token") || !localStorage.getItem("user")) {
      router.push("/");
      return;
    }
  }, []);

  useEffect(() => {
    socket = io({
      path: "/api/socket",
      // auth: {
      //   token: localStorage.getItem("token"),
      // },
    });

    socket.on("connect", () => {
      setConnected(true);
      console.log("Connected:", socket.id);
    });

    socket.emit("message", ` 进入聊天室`);
    socket.on("message", (msg: string) => {
      console.log(msg);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    // console.log('socket')
    // const socket = initSocket(localStorage.getItem('token'));
    // // const socket = getSocket();
    // socket.connect()

    // socket.on('user_online', ({ userId }: {userId: string}) => {
    //   setOnlineSet(prev => {
    //     const ns = new Set(prev)
    //     ns.add(userId)
    //     return ns
    //   });
    // });

    // socket.on('user_offline', ({ userId }: {userId: string}) => {
    //   setOnlineSet(prev => {
    //     const ns = new Set(prev)
    //     ns.delete(userId)
    //     return ns
    //   });
    // });

    // @ts-ignore
    // window.onlineSet = onlineSet
    return () => {
      socket?.disconnect();
    };
  }, []);

  // const [messages, setMessages] = useState([]);
  // const inputRef = useRef('');

  // useEffect(() => {
  //   const socket = getSocket();

  //   socket.emit('join_group', currentChat); // if group

  //   socket.on('user_online', ({ userId }) => {
  //     setOnlineUsers(prev => new Set([...prev, userId]));
  //   });

  //   socket.on('user_offline', ({ userId }) => {
  //     setOnlineUsers(prev => {
  //       const copy = new Set(prev);
  //       copy.delete(userId);
  //       return copy;
  //     });
  //   });

  //   socket.on(isGroup ? 'group_message' : 'private_message', (message) => {
  //     setMessages(prev => [...prev, message]);
  //   });

  //   socket.on('messages_read', ({ from }) => {
  //     if (!isGroup && from === currentChat) {
  //       setMessages(prev =>
  //         prev.map(m =>
  //           m.readBy.includes(from) ? m : { ...m, readBy: [...m.readBy, from] }
  //         )
  //       );
  //     }
  //   });

  //   // 标记已读
  //   socket.emit('mark_read', { chatId: currentChat, isGroup });

  //   return () => {
  //     socket.off('user_online');
  //     socket.off('user_offline');
  //     socket.off('private_message');
  //     socket.off('group_message');
  //     socket.off('messages_read');
  //   };
  // }, [currentChat]);

  return (
    <div className="chat w-full h-full p-20">
      <Toaster position="top-center" />
      <div>Connect: {connected}</div>
      <div>登录用户: {JSON.stringify(currentUser)}</div>
      <div>聊天对象: {JSON.stringify(activedUser)}</div>
      <div>online用户: {JSON.stringify(onlineSet)}</div>
      <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
        <ResizablePanel defaultSize={30}>
          <SideBar dispatch={dispatch} users={users} />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={70}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={60}>
              <ChatWindow />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={40}>
              <MessageInput value="test default message" />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
