// pages/index.tsx
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket;

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    // 触发服务端初始化 Socket.IO
    
      socket = io({
        path: "/api/socket",
      });

      socket.on("connect", () => {
        setConnected(true);
        console.log("Connected:", socket.id);
      });

      socket.on("message", (msg: string) => {
        setMessages((prev) => [...prev, msg]);
      });

      socket.on("disconnect", () => {
        setConnected(false);
      });

    return () => {
      socket?.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("message", message);
      setMessage("");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Socket.IO Chat Example</h1>
      <div>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message"
        />
        <button onClick={sendMessage} disabled={!connected}>
          Send
        </button>
      </div>
      <ul>
        {messages.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}
