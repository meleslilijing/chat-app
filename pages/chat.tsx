import { useEffect, useState, useReducer, useMemo } from "react";
import { getSocket, initSocket } from "../../lib/socket";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { useRouter } from "next/router";

import SideBar from "@/components/SideBar";
import ChatWindow from "@/components/ChatWindow";
import MessageInput from "@/components/MessageInput";

import useAllUsers from "@/hooks/useAllUsers";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import reducer, { initState } from "@/reducer";

import "@/app/globals.css";
import "./style.css";

let socket: any;

interface IUser {
  id: string
  email: string
  username: string
}

interface IMessage {
  type: 'private'
  sender: string
  to: string
  content: string
  createdAt: string;
}

interface IState {
  activedUserId: string
  messages: IMessage[]
}

export default function ChatBox() {
  const router = useRouter();

  const users: IUser[] = useAllUsers();

  const [connected, setConnected] = useState(false);
  const [onlineSet, setOnlineSet] = useState(new Set()); // 在线用户

  const [state, dispatch] = useReducer<IState, any>(reducer, initState);

  const [currentUser, setCurrentUser] = useState<any>(null);

  // 当前聊天目标用户
  const activedUser = useMemo(() => {
    const arr = users.filter((user: any) => user.id === state.activedUserId);
    if (arr.length === 0) {
      return null;
    }
    return arr[0];
  }, [state.activedUserId]);


  const loadMessages = async () => {
    try {
      const response = await axios.get('/api/message/load', {
        params: {
          type: 'private',
          conversationId: state.activedUserId,
          token: localStorage.getItem('token')
        }
      })
      const {code, message, data} = response.data
      if (code !== 1) {
        toast.error(message)
        return
      }
      dispatch({
        type: 'update_messages',
        payload: data.messages
      })
    } catch (error: Error) {
      console.error(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (state.activedUserId !== "") {
      loadMessages()
    }
  }, [state.activedUserId])

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

  const onlineArr = useMemo(() => {
    const temp = [];
    for (let id of onlineSet) {
      temp.push(users.find((user) => user.id === id));
    }
    return temp.filter((user) => !!user).map((user) => user.username);
  }, [users, onlineSet]);

  useEffect(() => {
    console.log('initSocket chat')
    socket = initSocket(localStorage.getItem("token") || "");

    socket.on("connect", () => {
      setConnected(true);
      console.log("Connected socket.id:", socket.id);
    });

    socket.emit("message", ` 进入聊天室`);
    socket.on("message", (msg: string) => {
      console.log(msg);
    });

    socket.on('private_message', (message: string) => {
      console.log('private_message message: ', message)
      dispatch({
        type: 'send_message',
        payload: message
      })
    })

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
      socket?.disconnect();
    };
  }, []);

  const sendMessage = (content: string) => {
    const message = {
      type: "private",
      sender: currentUser.id,
      to: activedUser.id,
      content,
    }

    const toUserId = activedUser.id
    if (message.content.trim()) {
      socket.emit("private_message", {
        toUserId,
        content: message.content
      });

      // offline 用户接收的信息，前端先直接显示
      if (!onlineSet.has(toUserId)) {
        dispatch({
          type: 'send_message',
          payload: message
        })
      }
    }
  }

  return (
    <div className="chat w-full h-full p-20">
      <Toaster position="top-center" />
      <div>Connected: {connected.toString()}</div>
      <div>登录用户: {JSON.stringify(currentUser)}</div>
      <div>聊天对象: {JSON.stringify(activedUser)}</div>
      <div>在线用户: {onlineArr.join(",")}</div>
      <div>在线用户数: {onlineSet.size}</div>
      <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
        <ResizablePanel defaultSize={30}>
          <SideBar
            dispatch={dispatch}
            users={users}
            onlineSet={onlineSet}
            currentUser={currentUser}
          />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={70}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={60}>
              <ChatWindow 
                key={activedUser?.id} 
                users={users}
                messages={state.messages}
                activedUser={activedUser} 
              />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={40}>
              <MessageInput
                disabled={!activedUser || !connected}
                sendMessage={sendMessage}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
// TODO: 添加读取目标用户的聊天记录的功能
