# Instant-AI 与 Anything LLM 集成方案

## 概述
本文档提供了将 Instant-AI 前端与 Anything LLM 后端集成的详细计划。集成将重点放在聊天、知识库创建和文件上传功能上。

## 1. 环境设置

### 1.1 启动 Anything LLM 服务
- 确保 Anything LLM 服务器运行正常(端口 3001)
- 验证 API 是否可访问

### 1.2 创建前端 API 服务层
- 在 Instant-AI 前端项目中创建 API 请求服务层
- 设置 API 基础路径和拦截器
- 处理错误和认证需求

## 2. API 集成计划

### 2.1 知识库管理 API
- **获取知识库列表**: `/v1/workspaces`
- **创建新知识库**: `/v1/workspace/new`
- **获取单个知识库详情**: `/v1/workspace/:slug`
- **更新知识库设置**: `/v1/workspace/:slug/update`
- **删除知识库**: `/v1/workspace/:slug`

### 2.2 文件上传 API
- **查看文件列表**: `/v1/documents`
- **获取文件夹文件列表**: `/v1/documents/folder/:folderName`
- **上传文件**: `/v1/document/upload`
- **上传到指定文件夹**: `/v1/document/upload/:folderName`
- **创建文件夹**: `/v1/document/create-folder`
- **获取支持的文件类型**: `/v1/document/accepted-file-types`

### 2.3 聊天 API
- **发送聊天消息**: `/v1/workspace/:slug/chat`
- **流式聊天响应**: `/v1/workspace/:slug/stream-chat`
- **获取聊天历史**: `/v1/workspace/:slug/chats`
- **执行向量搜索**: `/v1/workspace/:slug/vector-search`

## 3. 实现步骤

### 3.1 API 客户端实现
1. 创建 `apiClient.ts` 实现核心 API 功能
2. 添加请求拦截器与错误处理
3. 创建 API 密钥管理工具

### 3.2 知识库组件实现
1. 实现知识库列表展示
2. 实现知识库创建表单
3. 实现知识库设置更新
4. 连接知识库删除功能

### 3.3 文件管理组件实现
1. 实现文件上传组件
2. 实现文件列表与预览
3. 实现文件夹创建和管理
4. 文件与知识库关联功能

### 3.4 聊天组件集成
1. 将聊天输入与 API 连接
2. 实现流式响应渲染
3. 集成聊天历史记录
4. 实现消息引用和来源展示

## 4. 测试计划
1. API 连接测试
2. 知识库创建与管理测试 
3. 文件上传与处理测试
4. 聊天功能端到端测试

## 5. 注意事项
- 需要确保 Anything LLM 服务器正常运行且可访问
- 处理前后端 CORS 问题
- 处理认证和 API 密钥管理
- 实现错误处理和用户反馈