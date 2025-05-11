import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { initSocket } from "../lib/socket";


export default function MessageInput({
  disabled,
  sendMessage
}) {
  const [message, setMessage] = useState('')
  useEffect(() => {}, []);

  // const send = () => {
  //   socket.emit('private_message', { 
  //     toUserId, 
  //     content: message
  //   })
  // };

  const keyUpHandler = (e) => {
    if (e.key === 'Enter') {
      sendMessage(message);
      setMessage('')
    }
  };

  const onChange = (e) => {
    setMessage(e.target.value)
  }

  return (
    <div className="message">
      <Textarea
        disabled={disabled}
        placeholder="Press Enter to send!"
        value={message}
        onKeyUp={keyUpHandler}
        onChange={onChange}
      />
      <Button onClick={() => sendMessage(message)} disabled={disabled}>send</Button>
    </div>
  );
}
