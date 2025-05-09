import { useState, useEffect } from "react";
import { Textarea } from "src/components/ui/textarea"
import {Button} from "src/components/ui/button";

export default function MessageInput({ value = '' }) {
  return (
    <div className="message">
      <Textarea placeholder="Type your message here." value={value} />
      <Button>send</Button>
    </div>
  );
}
