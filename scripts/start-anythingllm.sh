#!/bin/bash

# 定位到Anything LLM目录
cd /Users/wildmaker/Documents/Projects/anything-llm

# 查找服务启动命令
echo "正在查找Anything LLM服务启动命令..."
COMMANDS=$(npm run | grep -E "server|start" | grep -v "test" | grep -v "build")

echo "找到以下可能的启动命令:"
echo "$COMMANDS"

# 默认启动命令
if echo "$COMMANDS" | grep -q "dev"; then
  START_CMD="npm run dev"
elif echo "$COMMANDS" | grep -q "server"; then
  START_CMD="npm run server"
elif echo "$COMMANDS" | grep -q "start"; then
  START_CMD="npm run start"
else
  START_CMD="node server/index.js"
fi

echo "将使用命令: $START_CMD 启动服务"
echo "按任意键继续，或按Ctrl+C取消..."
read -n 1 -s

# 启动服务
echo "正在启动Anything LLM服务..."
eval "$START_CMD"