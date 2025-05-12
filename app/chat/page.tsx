"use client";
import axios from "axios";
import { useEffect, useState, useReducer, useMemo, useRef } from "react";
import { toast } from "sonner";
import { Socket } from 'socket.io-client';

import {State} from '@/types'

import SideBar from "components/SideBar";
import ChatWindow from "@/app/components/ChatWindow/index";
import MessageInput from "components/MessageInput";

import useAllUsers from "app/hooks/useAllUsers";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "components/ui/resizable";

import reducer, { initState } from "app/reducer";
import { initSocket } from "@/lib/socket";

import {User, Message} from '@/types'


import "./chat.module.css";

const ErrorPage = () => {
  return (
    <div>
      <h1>未登录页面不可用，请先登录</h1>
    </div>
  );
};

const loadMessages = async (toUserId: string, token: string | null) => {
  if (!toUserId || !token) {
    return;
  }
  try {
    const response = await axios.get("/api/message/load", {
      params: {
        type: "private",
        conversationId: toUserId,
        token,
      },
    });
    const { code, message, data } = response.data;
    if (code !== 1) {
      toast.error(message);
      return null;
    }
    return data;
  } catch (error: Error) {
    console.error(error);
    toast.error(error.message);
    return null;
  }
};

const sendMessage = (
  senderUserId: string | undefined,
  toUserId: string | undefined,
  content: string = ""
) => {
  return new Promise<Message>((resolve, reject) => {
    if (!senderUserId || !toUserId) {
      return;
    }

    const message: Message = {
      type: "private",
      sender: senderUserId,
      to: toUserId,
      content,
      createdAt: new Date().toISOString(),
    };

    resolve(message);
  });
};

export default function ChatBox() {
  const users: User[] = useAllUsers();

  const [connected, setConnected] = useState<boolean>(false);
  const [onlineSet, setOnlineSet] = useState<Set<string>>(new Set<string>([])); // 在线用户

  const [state, dispatch] = useReducer<State, any>(reducer, initState);
  const socketRef = useRef<Socket | null>(null)

  // 当前登录用户，消息发送方
  const sendUser = useMemo(() => {
    try {
      const userString = localStorage.getItem("user") || "";
      return JSON.parse(userString) || null;
    } catch (_) {
      return null;
    }
  }, []);
  
  // 当前聊天目标用户
  const toUser: User | null = useMemo(() => {
    if (!state.toUserId) {
      return null;
    }

    return users.find((user: User) => user.id === state.toUserId) || null;
  }, [state.toUserId]);


  useEffect(() => {
    if (!state.toUserId) {
      return;
    }

    loadMessages(state.toUserId, localStorage.getItem("token")).then(
      (data) => {
        console.log('loadMessages data: ', data)
        dispatch({
          type: "update_messages",
          payload: data.messages,
        });
      }
    );
  }, [state.toUserId]);

  const onlineUsersName = useMemo(() => {
    const temp = [];
    for (let id of onlineSet) {
      temp.push(users.find((user) => user.id === id));
    }
    return temp.filter((user) => !!user).map((user) => user.username);
  }, [users, onlineSet]);

  useEffect(() => {
    socketRef.current = initSocket(localStorage.getItem("token") || "");
    const socket = socketRef.current;

    if (!socket) {
      return
    }

    socket.on("connect", () => {
      setConnected(true);
      console.log("Connected socket.id:", socket.id);
    });

    socket.emit("message", ` 进入聊天室`);
    socket.on("message", (msg: string) => {
      console.log(msg);
    });

    socket.on("private_message", (message: string) => {
      console.log("private_message message: ", message);
      dispatch({
        type: "send_message",
        payload: message,
      });
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("user_online", ({ userIds }: { userIds: string[] }) => {
      setOnlineSet(() => new Set(userIds));
    });

    socket.on("user_offline", ({ userIds }: { userIds: string[] }) => {
      setOnlineSet(() => new Set(userIds));
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  if (localStorage.getItem("token") === null || sendUser === null) {
    return <ErrorPage />;
  }

  return (
    <div className="chat-page w-full flex flex-col gap-2" style={{height: 'calc(100% - 50px)'}}>
      <div className="dev-pan border-1">
        <div>Connected: {connected.toString()}</div>
        <div>登录用户: {JSON.stringify(sendUser)}</div>
        <div>聊天对象: {JSON.stringify(toUser)}</div>
        <div>在线用户: {onlineUsersName.join(",")}</div>
        <div>在线用户数: {onlineSet.size}</div>
      </div>
      <ResizablePanelGroup direction="horizontal" className="rounded-lg border h-fit">
        <ResizablePanel defaultSize={30}>
          <SideBar
            dispatch={dispatch}
            users={users}
            onlineSet={onlineSet}
            sendUserId={sendUser.id}
          />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={70}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={60}>
              <ChatWindow
                key={toUser?.id}
                users={users}
                messages={state.messages}
                sendUser={sendUser}
                toUser={toUser}
                online={ onlineSet.has(toUser?.id || "") }
              />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={40}>
              <MessageInput
                disabled={!toUser || !connected}
                sendMessage={(message: string) =>
                  sendMessage(sendUser?.id, toUser?.id, message).then(
                    (message: Message) => {
                      if (message.content.trim()) {
                        socketRef.current?.emit("private_message", {
                          toUserId: toUser?.id,
                          content: message.content,
                        });
                        
                        // offline 用户接收的信息，前端先直接显示
                        if (!onlineSet.has(toUser?.id || "")) {
                          dispatch({
                            type: "send_message",
                            payload: message,
                          });
                        }
                      } // endof if
                    }
                  )
                }
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
