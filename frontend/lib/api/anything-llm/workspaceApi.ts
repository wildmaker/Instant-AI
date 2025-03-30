import { apiClient } from './apiClient'

// 知识库数据接口
export interface Workspace {
  id: number
  name: string
  slug: string
  createdAt: string
  lastUpdatedAt: string
  openAiTemp?: number | null
  openAiHistory?: number
  openAiPrompt?: string | null
  similarityThreshold?: number
  queryRefusalResponse?: string
  chatMode?: 'chat' | 'query'
  topN?: number
  documents?: Array<{
    docId: string
    name: string
    type: string
  }>
}

// 创建知识库请求接口
export interface CreateWorkspaceRequest {
  name: string
  similarityThreshold?: number
  openAiTemp?: number
  openAiHistory?: number
  openAiPrompt?: string
  queryRefusalResponse?: string
  chatMode?: 'chat' | 'query'
  topN?: number
}

// 更新知识库请求接口
export interface UpdateWorkspaceRequest {
  name?: string
  similarityThreshold?: number
  openAiTemp?: number
  openAiHistory?: number
  openAiPrompt?: string
  queryRefusalResponse?: string
  chatMode?: 'chat' | 'query'
  topN?: number
}

// 知识库列表响应接口
export interface WorkspacesResponse {
  workspaces: Workspace[]
}

// 单个知识库响应接口
export interface WorkspaceResponse {
  workspace: Workspace
}

// 知识库创建/更新响应接口
export interface WorkspaceActionResponse {
  workspace: Workspace
  message: string | null
}

// 聊天消息数据接口
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sentAt: number
  sources?: Array<any>
}

// 聊天历史响应接口
export interface WorkspaceChatHistoryResponse {
  history: ChatMessage[]
}

// 文档关联接口
export interface UpdateEmbeddingsRequest {
  adds: string[]
  removes: string[]
}

// 聊天请求接口
export interface ChatRequest {
  message: string
  mode?: 'chat' | 'query'
  sessionId?: string | null
  attachments?: Array<any>
}

// 聊天响应接口
export interface ChatResponse {
  messageId: string
  assistant: string
  sources?: any[]
  error?: string
}

// 知识库API服务
class WorkspaceApiService {
  // 获取所有知识库
  async getWorkspaces(): Promise<WorkspacesResponse> {
    try {
      return apiClient.get<WorkspacesResponse>('/workspaces')
    } catch (error) {
      console.error('获取知识库列表失败:', error)
      // 返回空的知识库列表作为后备
      return { workspaces: [] }
    }
  }

  // 获取单个知识库
  async getWorkspace(slug: string): Promise<WorkspaceResponse> {
    try {
      return apiClient.get<WorkspaceResponse>(`/workspace/${slug}`)
    } catch (error) {
      console.error(`获取知识库(${slug})失败:`, error)
      throw error
    }
  }

  // 创建新知识库
  async createWorkspace(data: CreateWorkspaceRequest): Promise<WorkspaceActionResponse> {
    try {
      return apiClient.post<WorkspaceActionResponse>('/workspace/new', data)
    } catch (error) {
      console.error('创建知识库失败:', error)
      throw error
    }
  }

  // 更新知识库
  async updateWorkspace(slug: string, data: UpdateWorkspaceRequest): Promise<WorkspaceActionResponse> {
    try {
      return apiClient.post<WorkspaceActionResponse>(`/workspace/${slug}/update`, data)
    } catch (error) {
      console.error(`更新知识库(${slug})失败:`, error)
      throw error
    }
  }

  // 删除知识库
  async deleteWorkspace(slug: string): Promise<void> {
    try {
      return apiClient.delete<void>(`/workspace/${slug}`)
    } catch (error) {
      console.error(`删除知识库(${slug})失败:`, error)
      throw error
    }
  }

  // 获取知识库聊天历史
  async getWorkspaceChatHistory(slug: string, limit?: number, apiSessionId?: string): Promise<WorkspaceChatHistoryResponse> {
    try {
      const params = new URLSearchParams()
      if (limit) params.append('limit', limit.toString())
      if (apiSessionId) params.append('apiSessionId', apiSessionId)
      
      return apiClient.get<WorkspaceChatHistoryResponse>(
        `/workspace/${slug}/chats?${params.toString()}`
      )
    } catch (error) {
      console.error(`获取知识库(${slug})聊天历史失败:`, error)
      // 返回空的聊天历史作为后备
      return { history: [] }
    }
  }

  // 更新知识库文档关联
  async updateWorkspaceEmbeddings(slug: string, data: UpdateEmbeddingsRequest): Promise<WorkspaceResponse> {
    try {
      return apiClient.post<WorkspaceResponse>(`/workspace/${slug}/update-embeddings`, data)
    } catch (error) {
      console.error(`更新知识库(${slug})文档关联失败:`, error)
      throw error
    }
  }

  // 发送聊天请求
  async chat(slug: string, data: ChatRequest): Promise<ChatResponse> {
    try {
      return apiClient.post<ChatResponse>(`/workspace/${slug}/chat`, data)
    } catch (error) {
      console.error(`发送聊天请求到知识库(${slug})失败:`, error)
      throw error
    }
  }

  // 发送流式聊天请求 (返回ReadableStream)
  async streamChat(slug: string, data: ChatRequest): Promise<ReadableStream<Uint8Array> | null> {
    try {
      // 使用getStreamUrl生成完整URL
      const url = apiClient.getStreamUrl(`/workspace/${slug}/stream-chat`);
      
      // 准备请求配置 - 使用和apiClient相同的请求头获取方式
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // 添加认证头 - 与 Anything LLM API 保持一致
      const apiKey = process.env.NEXT_PUBLIC_ANYTHING_LLM_API_KEY || '';
      if (apiKey && apiKey.length > 0) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      
      // 添加默认用户信息，Anything LLM 期望的头信息 
      headers['X-API-Version'] = '2.0.3';
      
      console.log('Stream API request:', { 
        url, 
        headers: { ...headers, Authorization: headers.Authorization ? 'Bearer [REDACTED]' : undefined },
        data 
      });
      
      // 发送流式请求
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        credentials: 'include', // 包含凭证，允许 cookie
      });
      
      if (!response.ok) {
        console.error(`流式聊天请求失败: ${response.status} ${response.statusText}`);
        console.error('错误响应内容:', await response.text().catch(() => 'Unable to read response text'));
        return null;
      }
      
      return response.body;
    } catch (error) {
      console.error(`流式聊天错误:`, error);
      return null;
    }
  }

  // 执行向量搜索
  async vectorSearch(slug: string, query: string, topN?: number, scoreThreshold?: number) {
    try {
      return apiClient.post(`/workspace/${slug}/vector-search`, {
        query,
        topN,
        scoreThreshold
      })
    } catch (error) {
      console.error(`在知识库(${slug})中执行向量搜索失败:`, error)
      throw error
    }
  }
}

export const workspaceApi = new WorkspaceApiService()