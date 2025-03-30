import { useState, useEffect, useCallback } from 'react'
import { workspaceApi } from '@/lib/api/anything-llm'
import { Message, ChatRequest, ChatResponse } from '@/types/chat'
import { utf8Decoder } from '@/lib/utils'
import { llmApi } from '@/lib/api/llm' // 导入 LLM API

// 钩子属性接口
export interface UseChatApiProps {
  workspaceSlug?: string // 工作区标识符
  initialMessages?: Message[] // 初始消息列表
}

// 钩子返回值接口
export interface UseChatApiResult {
  messages: Message[] // 当前消息列表
  isLoading: boolean // 是否正在加载
  error: string | null // 错误信息
  sendMessage: (content: string) => Promise<void> // 发送消息方法
  resetMessages: () => void // 重置消息方法
}

/**
 * 聊天API钩子，用于与后端聊天API交互
 */
export function useChatApi({
  workspaceSlug,
  initialMessages = [],
}: UseChatApiProps): UseChatApiResult {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 加载聊天历史
  useEffect(() => {
    if (!workspaceSlug) return
    
    const loadChatHistory = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const result = await workspaceApi.getWorkspaceChatHistory(workspaceSlug)
        
        if (result.history && Array.isArray(result.history)) {
          const formattedMessages: Message[] = result.history.map((msg) => ({
            id: crypto.randomUUID(),
            role: (msg.role as 'user' | 'assistant'),
            content: msg.content,
            timestamp: msg.sentAt || Date.now(),
            sources: msg.sources
          }))
          
          setMessages(formattedMessages)
        }
      } catch (err) {
        console.error('加载聊天历史失败:', err)
        setError('无法加载聊天历史')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadChatHistory()
  }, [workspaceSlug])

  // 处理流式响应
  const processStreamResponse = async (stream: ReadableStream<Uint8Array>, messageId: string) => {
    const reader = stream.getReader()
    let assistantMessage = ''
    
    console.log('Stream processing started', { messageId })
    
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          console.log('Stream processing done', { messageId, finalMessage: assistantMessage })
          break
        }
        
        // 解码并处理数据
        const chunk = utf8Decoder.decode(value, { stream: true })
        console.log('Received chunk:', { chunk, length: chunk.length })
        
        if (chunk && chunk.length > 0) {
          // 尝试从 Anything LLM 格式的事件流解析数据
          try {
            const lines = chunk.split('\n\n')
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const jsonData = line.substring(6) // Remove 'data: ' prefix
                console.log('JSON data:', jsonData)
                
                try {
                  const data = JSON.parse(jsonData)
                  if (data.type === 'textResponseChunk' && data.textResponse) {
                    assistantMessage += data.textResponse
                    
                    // 更新消息内容
                    setMessages((prev) => 
                      prev.map((msg) => 
                        msg.id === messageId ? { ...msg, content: assistantMessage } : msg
                      )
                    )
                  }
                } catch (jsonError) {
                  console.error('Error parsing JSON from stream:', jsonError)
                }
              }
            }
          } catch (parseError) {
            console.error('Error parsing stream format:', parseError)
            // 如果无法解析特定格式，则退回到直接累加文本
            assistantMessage += chunk
            
            // 更新消息内容
            setMessages((prev) => 
              prev.map((msg) => 
                msg.id === messageId ? { ...msg, content: assistantMessage } : msg
              )
            )
          }
        }
      }
    } catch (err) {
      console.error('流处理错误:', err)
      setError('读取回复流时出错')
    } finally {
      reader.releaseLock()
    }
  }

  // 发送消息
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      // 创建用户消息
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: Date.now(),
      }
      
      // 创建助手消息占位符
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        timestamp: Date.now() + 1,
      }
      
      // 添加消息到列表
      setMessages((prev) => [...prev, userMessage, assistantMessage])
      
      // 准备聊天请求数据
      const chatData: ChatRequest = {
        message: content,
      }
      
      console.log('Sending chat request:', {
        workspaceSlug,
        chatData
      })
      
      // 使用 LLM API 进行聊天
      try {
        // 获取之前的对话，最多4条消息，作为上下文
        const previousMessages = messages
          .slice(-4)
          .map(msg => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content
          }));
        
        // 添加系统提示和用户新消息
        const chatMessages = [
          { role: 'system' as const, content: '你是一个有用的助手，请简洁明了地回答问题。' },
          ...previousMessages,
          { role: 'user' as const, content }
        ];
        
        // 尝试使用流式 API
        try {
          console.log('Trying streaming LLM API...');
          const stream = await llmApi.createStreamingChatCompletion(chatMessages);
          
          // 处理流式响应
          if (stream) {
            const reader = stream.getReader();
            let assistantResponse = '';
            
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              // 解码并处理数据
              const chunk = utf8Decoder.decode(value, { stream: true });
              console.log('Stream chunk:', chunk);
              
              // 尝试解析 SSE 格式的数据
              const lines = chunk.split('\n');
              for (const line of lines) {
                if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                  try {
                    const data = JSON.parse(line.substring(6));
                    if (data.choices && data.choices[0].delta?.content) {
                      const content = data.choices[0].delta.content;
                      assistantResponse += content;
                      
                      // 更新消息内容
                      setMessages((prev) => 
                        prev.map((msg) => 
                          msg.id === assistantMessage.id ? { ...msg, content: assistantResponse } : msg
                        )
                      );
                    }
                  } catch (e) {
                    console.error('解析 SSE 数据失败:', e);
                  }
                }
              }
            }
            
            reader.releaseLock();
            setIsLoading(false);
            return;
          }
        } catch (streamError) {
          console.error('流式 API 失败，尝试普通请求:', streamError);
        }
        
        // 如果流式 API 失败，尝试普通请求
        console.log('Falling back to regular LLM API');
        const response = await llmApi.createChatCompletion(chatMessages);
        
        if (response && response.choices && response.choices.length > 0) {
          const assistantResponse = response.choices[0].message.content;
          
          // 更新消息内容
          setMessages((prevMessages) => 
            prevMessages.map((msg) => 
              msg.id === assistantMessage.id ? { ...msg, content: assistantResponse } : msg
            )
          );
        } else {
          throw new Error('LLM API 返回无效响应');
        }
      } catch (llmError: any) {
        console.error('LLM API 调用失败:', llmError);
        
        // 更新最后一条消息为错误信息
        setMessages((prevMessages) => {
          const errorMessage = llmError.message || '未知错误';
          return prevMessages.map((msg) => 
            msg.id === assistantMessage.id 
              ? { 
                  ...msg, 
                  content: `无法获取回复，请稍后再试。\n\n错误信息: ${errorMessage}` 
                } 
              : msg
          );
        });
        
        // 显示错误提示
        setError(`LLM API 错误: ${llmError.message || '未知错误'}`);
      }
    } catch (err) {
      console.error('发送消息失败:', err);
      setError('发送消息或接收回复时出错');
    } finally {
      setIsLoading(false);
    }
  }, [messages, workspaceSlug]);

  // 重置消息
  const resetMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, isLoading, error, sendMessage, resetMessages }
}