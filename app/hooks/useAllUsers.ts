import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

export default function useAllUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("/api/users/all").then((response) => {
      const { code, message, data } = response.data;
      if (code !== 1) {
        toast.error(message);
        return;
      }
      setUsers(data.users);
    });
  }, []);

  return users;
}
