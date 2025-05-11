'use client'

import { useState } from "react";
import { useRouter } from 'next/router';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";

import axios from 'axios'


const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onChangeEmail = (e: any) => {
    setEmail(e.target.value);
  };

  const onChangePwd = (e: any) => {
    setPassword(e.target.value);
  };

  const onSubmit = async (e: any) => {
    const response = await axios.get('/api/auth/login', {
      params: {
        email: encodeURIComponent(email.trim()),
        password
      }
    })
    const {code, message, data} = response.data

    if (code !== 1) {
      toast.error(message)
      return
    }
    localStorage.setItem('token', data.token); // 保存 JWT
    localStorage.setItem('user', JSON.stringify(data.user));
    router.push('/chat'); // 跳转到 SPA 聊天界面
  };

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <form className="w-2/3 space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="text"
              placeholder="Please input email"
              onChange={onChangeEmail}
            />
          </div>
          <div>
            <Label htmlFor="pwd">Password</Label>
            <Input
              id="pwd"
              type="password"
              placeholder="Please input password"
              onChange={onChangePwd}
            />
          </div>
          <Button type="button" onClick={onSubmit}>
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default Login;