import axios from 'axios';

// LLM API配置
const API_URL = process.env.NEXT_PUBLIC_LLM_API_URL || 'https://api.siliconflow.cn/v1';
const API_KEY = process.env.NEXT_PUBLIC_LLM_API_KEY || '';
const LLM_PROVIDER = process.env.NEXT_PUBLIC_LLM_PROVIDER || 'generic-openai';

// 创建axios实例
const llmClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  },
  timeout: 60000, // 60秒超时
});

interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatCompletionMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class LLMApi {
  // 默认模型
  defaultModel = 'RWKV-4-World-7B';

  // 创建聊天完成请求
  async createChatCompletion(
    messages: ChatCompletionMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<ChatCompletionResponse> {
    const request: ChatCompletionRequest = {
      model: options.model || this.defaultModel,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      stream: options.stream,
    };

    try {
      console.log('发送LLM请求:', { 
        provider: LLM_PROVIDER, 
        url: API_URL,
        model: request.model,
        messageCount: messages.length,
        // 不记录API密钥
      });

      const response = await llmClient.post<ChatCompletionResponse>('/chat/completions', request);
      return response.data;
    } catch (error) {
      console.error('LLM API请求失败:', error);
      throw error;
    }
  }

  // 创建流式聊天完成请求
  async createStreamingChatCompletion(
    messages: ChatCompletionMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<ReadableStream<Uint8Array>> {
    const request: ChatCompletionRequest = {
      model: options.model || this.defaultModel,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      stream: true,
    };

    try {
      console.log('发送流式LLM请求:', { 
        provider: LLM_PROVIDER, 
        url: API_URL,
        model: request.model,
        messageCount: messages.length,
      });

      const response = await fetch(`${API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`流式LLM请求失败: ${response.status} ${response.statusText}`);
      }

      return response.body as ReadableStream<Uint8Array>;
    } catch (error) {
      console.error('流式LLM请求失败:', error);
      throw error;
    }
  }
}

export const llmApi = new LLMApi();

export const generateChatResponse = async (prompt: string): Promise<string> => {
  try {
    const response = await llmApi.createChatCompletion([
      { role: 'system', content: '你是一个有用的助手。' },
      { role: 'user', content: prompt }
    ]);
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('生成聊天回复失败:', error);
    throw error;
  }
};

export default llmApi; 