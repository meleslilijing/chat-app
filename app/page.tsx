"use client";
import { useEffect, useState } from "react";

import { Toaster, toast } from "sonner";
import { Button } from "components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "components/ui/tabs";

import axios from "axios";

import Register from "components/Register";
import Login from "components/Login";


import "@/app/globals.css";

export default function Index() {
  useEffect(() => {
    localStorage.clear();
  }, []);

  const seedUser = async () => {
    const response = await axios.get("/api/dev/seed_user");
    const { code, message, data } = response.data;
    if (code !== 1) {
      toast.error(message);
      return;
    }
    toast.success(message);
    console.log(data);
  };

  const queryAllUsers = async () => {
    const response = await axios.get("/api/users/all");
    const { code, message, data } = response.data;
    if (code !== 1) {
      toast.error(message);
      return;
    }
    toast.success(message);
    console.log(data);
  };

  return (
    <div className="page page-index">
      <Toaster position="top-center" />
      <Button className="m-2" onClick={() => seedUser()}>
        Seed User
      </Button>
      <Button onClick={() => queryAllUsers()}>query all users</Button>
      <Tabs
        defaultValue="login"
        className="w-[400px] absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%]"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Login />
        </TabsContent>
        <TabsContent value="register">
          <Register />
        </TabsContent>
      </Tabs>
    </div>
  );
}
