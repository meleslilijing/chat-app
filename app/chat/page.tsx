"use client";
import axios from "axios";
import { useEffect, useState, useReducer, useMemo, useRef } from "react";
import { toast } from "sonner";
import { Socket } from "socket.io-client";

import { State } from "@/types";

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
import { initSocket, disconnectSocket } from "@/lib/socket";

import { User, Message } from "@/types";

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
    return { messages: [] };
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
      return { messages: [] };
    }
    return data;
  } catch (error: any) {
    console.error('Error loading messages:', error);
    toast.error(error.message);
    return { messages: [] };
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
      readBy: [senderUserId],
    };

    resolve(message);
  });
};

export default function ChatBox() {
  const users: User[] = useAllUsers();
  const [connected, setConnected] = useState<boolean>(false);
  const [onlineSet, setOnlineSet] = useState<Set<string>>(new Set<string>([]));
  const [state, dispatch] = useReducer<State, any>(reducer, initState);
  const socketRef = useRef<Socket | null>(null);

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

  const onlineUsersName = useMemo(() => {
    const temp = [];
    for (let id of onlineSet) {
      temp.push(users.find((user) => user.id === id));
    }
    return temp.filter((user) => !!user).map((user) => user.username);
  }, [users, onlineSet]);

  // 初始化 socket 连接
  useEffect(() => {
    // 确保用户已登录且有 token
    const token = localStorage.getItem("token");
    if (!token || !sendUser) {
      setConnected(false);
      return;
    }

    // 初始化 socket
    const socket = initSocket(token);
    socketRef.current = socket;

    if (!socket) {
      setConnected(false);
      return;
    }

    // 连接事件处理
    socket.on("connect", () => {
      setConnected(true);
      console.log("Connected socket.id:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setConnected(false);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("user_online", ({ userIds, unreadMessages }) => {
      setOnlineSet(() => new Set(userIds));
      dispatch({
        type: 'set_unreadMessages',
        payload: unreadMessages
      });
    });

    socket.on("user_offline", ({ userIds }: { userIds: string[] }) => {
      setOnlineSet(() => new Set(userIds));
    });

    // 添加处理未读消息更新的事件
    socket.on("update_unread_messages", ({ unreadMessages }) => {
      dispatch({
        type: 'set_unreadMessages',
        payload: unreadMessages
      });
    });

    // 处理消息已读的事件
    socket.on("messages_read", ({ sender, chatId }) => {
      console.log("messages_read event:", { sender, chatId });
      
      // 如果当前聊天窗口是消息的发送者
      if (state.toUserId === sender) {
        const updatedMessages = state.messages.map((message: Message) => {
          // 如果消息是由当前用户发送给该接收者的
          if (message.sender === sendUser?.id && message.to === sender) {
            return {
              ...message,
              readBy: Array.from(new Set([...message.readBy, sender]))
            };
          }
          return message;
        });

        dispatch({
          type: "update_messages",
          payload: updatedMessages
        });
      }
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("user_online");
      socket.off("user_offline");
      socket.off("update_unread_messages");
      socket.off("messages_read");
      disconnectSocket();
    };
  }, [sendUser]); // 依赖于 sendUser，确保用户信息变化时重新初始化 socket

  useEffect(() => {
    if (!state.toUserId) {
      return;
    }

    const socket = socketRef.current;
    if (!socket) {
      return;
    }

    loadMessages(state.toUserId, localStorage.getItem("token")).then((data) => {
      if (data && Array.isArray(data.messages)) {
        dispatch({
          type: "update_messages",
          payload: data.messages,
        });
      }
    });

    socket.on("private_message", (message: Message) => {
      console.log("private_message message: ", message);

      // 当前聊天窗口消息
      if (message.sender === state.toUserId || message.to === state.toUserId) {
        // 标记为已读, 本地
        message.readBy = [...message.readBy, message.to];
        dispatch({
          type: "send_message",
          payload: message,
        });

        // 标记为已读，同步到服务器和db
        socket.emit("mark_read", { chatId: message.to });
      } else {
        // 如果消息不是来自当前聊天窗口，则更新未读消息列表
        dispatch({
          type: 'add_unread_message',
          payload: message
        });
      }
    });

    return () => {
      socket?.off("private_message");
    };
  }, [state.toUserId]); // 只在切换用户时触发

  if (localStorage.getItem("token") === null || sendUser === null) {
    return <ErrorPage />;
  }

  return (
    <div
      className="chat-page w-full flex flex-col gap-2"
      style={{ height: "calc(100% - 50px)" }}
    >
      <div className="dev-pan border-1">
        <div>Connected: {connected.toString()}</div>
        <div>登录用户: {JSON.stringify(sendUser)}</div>
        <div>聊天对象: {JSON.stringify(toUser)}</div>
        <div>在线用户: {onlineUsersName.join(",")}</div>
        <div>在线用户数: {onlineSet.size}</div>
      </div>
      <ResizablePanelGroup
        direction="horizontal"
        className="rounded-lg border h-fit"
      >
        <ResizablePanel defaultSize={30}>
          <SideBar
            dispatch={dispatch}
            users={users}
            onlineSet={onlineSet}
            sendUserId={sendUser.id}
            toUserId={state.toUserId}
            unreadMessages={state.unreadMessages}
            socket={socketRef.current}
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
                online={onlineSet.has(toUser?.id || "")}
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
                        // 发送消息到服务器
                        socketRef.current?.emit("private_message", {
                          toUserId: toUser?.id,
                          content: message.content,
                        });

                        // 本地更新消息列表，使用服务器返回的消息对象
                        dispatch({
                          type: "send_message",
                          payload: message,
                        });
                      }
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
