"use client"

import { useState } from "react"
import { Send, RefreshCw, Smile, Link, FileText, Clock, Mic, Maximize2, ImageIcon, Eye, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { availableModels, type LLMModel } from "@/types/models"
import { Message } from "@/types/chat"
import { HistoryDialog } from "./HistoryDialog"
import { ChatMessageList } from "./ChatMessageList"
import { WelcomeMessage } from "./WelcomeMessage"

interface AssistantCard {
  id: string
  title: string
  description: string
  icon: string
}

export function ChatInterface() {
  const initialMessages: Message[] = []
  
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [selectedModel, setSelectedModel] = useState<LLMModel>(availableModels[0])
  const [isStreaming, setIsStreaming] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [activeFileContent, setActiveFileContent] = useState<string | null>(null)
  const [isFilesVisible, setIsFilesVisible] = useState(true)

  const handleSend = () => {
    if (!input.trim()) return
    
    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: Date.now()
    }
    setMessages([...messages, userMessage])
    setInput("")
    
    // 设置流式输出状态
    setIsStreaming(true)
    
    // 模拟助手回复（延迟以模拟API调用）
    const assistantId = Date.now() + 1
    const assistantMessage: Message = {
      id: assistantId.toString(),
      role: "assistant",
      content: "", // 初始为空
      timestamp: Date.now() + 1
    }
    
    // 添加空消息以开始流式效果
    setMessages(prev => [...prev, assistantMessage])
    
    // 模拟流式回复
    const response = activeFileContent || "这是一个模拟的助手回复，支持流式输出效果。\n\n可以包含多行内容，并逐步显示。"
    let displayText = ""
    let index = 0
    
    const interval = setInterval(() => {
      if (index < response.length) {
        displayText += response[index]
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantId.toString() 
              ? { ...msg, content: displayText } 
              : msg
          )
        )
        index++
      } else {
        clearInterval(interval)
        setIsStreaming(false)
      }
    }, 50)
  }

  const handleFileSelect = (file: any) => {
    setActiveFileContent(file.content)
  }

  const assistantCards: AssistantCard[] = [
    {
      id: "1",
      title: "Cron 表达式助手",
      description: "Crontab表达式生成",
      icon: "⏰",
    },
    {
      id: "2",
      title: "小智法语翻译助手",
      description: "友好、专业、富有同理心的法语翻译AI助手",
      icon: "🇫🇷",
    },
    {
      id: "3",
      title: "语言魅力学习导师",
      description: "提高教学语言的魅力与花样回复",
      icon: "🎯",
    },
    {
      id: "4",
      title: "命理研究员",
      description: "精通八字命",
      icon: "📜",
    },
  ]

  const commonQuestions = [
    { id: "1", text: "是否有云端服务版？" },
    { id: "2", text: "LobeChat 的定价是如何的？" },
    { id: "3", text: "是否支持本地语言模型?" },
    { id: "4", text: "是否支持图像识别和生成?" },
    { id: "5", text: "是否支持插件系统？" },
  ]

  const handleSelectQuestion = (question: string) => {
    setInput(question);
    // 自动发送问题
    setTimeout(() => {
      const textArea = document.querySelector('textarea');
      if (textArea) {
        textArea.focus();
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
        });
        textArea.dispatchEvent(enterEvent);
      } else {
        handleSend();
      }
    }, 100);
  }

  const handleRefreshCards = () => {
    // 在实际应用中，这里可以实现刷新推荐卡片的逻辑
    console.log("刷新助手卡片")
  }

  const toggleHistoryDialog = () => {
    setIsHistoryOpen(!isHistoryOpen);
  }

  const toggleFilesVisibility = () => {
    setIsFilesVisible(!isFilesVisible);
  }

  return (
    <div className="flex flex-col h-screen flex-1">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-md">
            <span className="text-sm">📝</span>
            <span className="text-sm">随便聊聊</span>
          </div>
          <div className="flex items-center ml-2 space-x-2 px-3 py-1 bg-gray-100 rounded-md">
            <span className="text-sm">{selectedModel.id}</span>
          </div>
          <div 
            className="flex items-center ml-2 space-x-2 px-3 py-1 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200"
            onClick={toggleHistoryDialog}
          >
            <Clock className="h-4 w-4" />
            <span className="text-sm">8</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleHistoryDialog}
            className={isHistoryOpen ? "bg-blue-50" : ""}
          >
            <Clock className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <RefreshCw className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Maximize2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <span className="sr-only">Menu</span>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </Button>
        </div>
      </div>

      {/* 主内容区域 - 添加flex布局支持右侧文件列表 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 聊天区域 */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="p-6">
              <WelcomeMessage 
                assistantCards={assistantCards}
                commonQuestions={commonQuestions}
                onSelectQuestion={handleSelectQuestion}
                onRefreshCards={handleRefreshCards}
              />
            </div>
          ) : (
            <ChatMessageList
              messages={messages.map(msg => ({
                role: msg.role as "user" | "assistant",
                content: msg.content,
                timestamp: msg.timestamp,
              }))}
              isStreaming={isStreaming}
            />
          )}
        </div>

        {/* 右侧文件列表 */}
        {isFilesVisible && (
          <div className="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-medium">全部文件</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7" 
                onClick={toggleFilesVisibility}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </Button>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div 
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                  onClick={() => window.open('/sample.pdf', '_blank')}
                >
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-sm truncate">sample.pdf</span>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                  <FileText className="h-4 w-4 text-green-500" />
                  <span className="text-sm truncate">project_notes.docx</span>
                </div>
                <div 
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                  onClick={() => window.open('/report.pdf', '_blank')}
                >
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-sm truncate">report.pdf</span>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                  <FileText className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm truncate">presentation.pptx</span>
                </div>
                <div 
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                  onClick={() => window.open('/contract.pdf', '_blank')}
                >
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-sm truncate">contract.pdf</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t p-4">
        <div className="flex items-center space-x-2 mb-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg className="w-3 h-3" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.0264 1.1706a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4929 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0264 1.1706a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.6 8.3829l2.0264-1.1706a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.3927-.6813zm2.0739-3.0231l-.142-.0852-4.7782-2.7913a.7712.7712 0 0 0-.7806 0L9.409 9.2297V6.8974a.0804.0804 0 0 1 .0332-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.0264-1.1706a.0757.0757 0 0 1-.038-.052V6.0574a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
                    />
                  </svg>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[300px] bg-white border shadow-lg">
              {availableModels.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                      {model.provider === "openai" && (
                        <svg className="w-3 h-3" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.0264 1.1706a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4929 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0264 1.1706a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.6 8.3829l2.0264-1.1706a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.3927-.6813zm2.0739-3.0231l-.142-.0852-4.7782-2.7913a.7712.7712 0 0 0-.7806 0L9.409 9.2297V6.8974a.0804.0804 0 0 1 .0332-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.0264-1.1706a.0757.0757 0 0 1-.038-.052V6.0574a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{model.name}</span>
                      <div className="flex gap-1">
                        {model.features.vision && <Eye className="w-3 h-3 text-green-500" />}
                        {model.features.streaming && <Zap className="w-3 h-3 text-green-500" />}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{model.contextWindow}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon">
            <Smile className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Link className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <FileText className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Mic className="h-5 w-5" />
          </Button>
          <div className="ml-auto flex items-center">
            <div className="flex items-center gap-2 mr-2">
              <Switch id="kb-switch" />
              <label htmlFor="kb-switch" className="text-xs text-gray-500">
                知识库
              </label>
            </div>
            <Button variant="ghost" size="sm" className="text-green-500">
              使用 0
            </Button>
          </div>
        </div>

        <div className="flex items-end">
          <textarea
            className="flex-1 resize-none border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
            placeholder="输入聊天内容..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            disabled={isStreaming}
          />
          <div className="ml-2 flex flex-col space-y-2">
            <Button 
              variant="default" 
              size="icon" 
              className="rounded-full bg-black text-white" 
              onClick={handleSend}
              disabled={isStreaming || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="text-xs">
              发送 / 换行
            </Button>
          </div>
          <div>
            <Button variant="ghost" size="sm" className="text-xs">
              执行
            </Button>
          </div>
        </div>
      </div>
      
      <HistoryDialog 
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
      />
    </div>
  )
}