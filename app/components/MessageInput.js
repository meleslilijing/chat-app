import { useState, useEffect } from "react";
import { Textarea } from "components/ui/textarea";

export default function MessageInput({
  disabled,
  sendMessage
}) {
  const [message, setMessage] = useState('')
  useEffect(() => {}, []);

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
    <div className="message w-full h-full">
      <Textarea
        className="w-full h-full"
        disabled={disabled}
        placeholder="Press Enter to send!"
        value={message}
        onKeyUp={keyUpHandler}
        onChange={onChange}
      />
      {/* <Button onClick={() => sendMessage(message)} disabled={disabled}>send</Button> */}
    </div>
  );
}
