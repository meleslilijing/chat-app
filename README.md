如何启动项目？
docker-compose up --build

测试账号
http://localhost:3000/api/auth/login?email=hello%2540gmail.com&password=123
预期返回
{
  "code": 1,
  "message": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODFjODZmMjA0MGEyZDQzNzhlOGJkY2QiLCJlbWFpbCI6ImhlbGxvQGdtYWlsLmNvbSIsImlhdCI6MTc0NjcxNDA5OSwiZXhwIjoxNzQ3MzE4ODk5fQ.YkKbhmtJqNXdx5-J-rymDE1kj4qCOte-xx_jy21YpSU",
  "user": {
    "_id": "681c86f2040a2d4378e8bdcd",
    "username": "hellohello",
    "email": "hello@gmail.com"
  }
}

TODO: 
改为https
登录的pwd在发送get请求前 需要进行加密


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
