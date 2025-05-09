# 使用 Node 官方镜像
FROM node:20

# 设置工作目录
WORKDIR /app

# 拷贝项目文件
COPY package.json ./
RUN npm install

COPY . .

# 构建 Next.js（可选，开发可跳过）
# RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "dev"]
