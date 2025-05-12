"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "components/ui/card";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Button } from "components/ui/button";
import { Toaster, toast } from "sonner";

import axios from 'axios'

const Register = () => {
  const router = useRouter();

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [cpassword, setCPassword] = useState('')

  const onChangeEmail = (e: any) => {
    setEmail(e.target.value);
  };

  const onChangeUsername = (e: any) => {
    setUsername(e.target.value);
  };

  const onChangePwd = (e: any) => {
    setPassword(e.target.value);
  };

  const onChangeCPwd = (e: any) => {
    setCPassword(e.target.value);
  };

  const onSubmit = async (e: any) => {
    if (password !== cpassword) {
      toast.error('两次密码需要一致')
      return
    }

    try {
      const response = await axios.post('/api/auth/register', {
        email,
        username, 
        password
      })
      
      const {code, message, data} = response.data
      
      if (code !== 1) {
        toast.error(message)
        return
      }
      toast.success(message)
      console.log(data)

      const {token, user} = data
      localStorage.setItem('token', token); // 保存 JWT
      localStorage.setItem('user', JSON.stringify(user));

      router.push('/chat');

    } catch (error) {
      console.error('error: ', error);
    }
  };

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <form className="w-2/3 space-y-6">
        <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="text"
              placeholder="Please input user name"
              onChange={onChangeEmail}
            />
          </div>
          <div>
            <Label htmlFor="username">User Name</Label>
            <Input
              id="username"
              type="text"
              placeholder="Please input user name"
              onChange={onChangeUsername}
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
          <div>
            <Label htmlFor="pwd">Confirm Password</Label>
            <Input
              id="cpwd"
              type="password"
              placeholder="Please input confirm password"
              onChange={onChangeCPwd}
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

export default Register