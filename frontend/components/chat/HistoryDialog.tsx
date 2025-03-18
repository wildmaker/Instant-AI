"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: React.ReactNode
}

interface HistoryItem {
  id: string
  title: string
  timestamp: string
  messages: Message[]
  isActive?: boolean
}

interface HistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HistoryDialog({ open, onOpenChange }: HistoryDialogProps) {
  const [historyItems] = React.useState<HistoryItem[]>([
    {
      id: "1",
      title: "UI 需求：文件列表与内容展示",
      timestamp: "21分钟前",
      isActive: true,
      messages: [
        {
          id: "m1",
          role: "user",
          content: "我需要一个文件列表和内容展示的UI设计，有什么建议吗？",
        },
        {
          id: "m2",
          role: "assistant",
          content: (
            <div className="space-y-4">
              <p>对于文件列表和内容展示的UI设计，我有以下建议：</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>使用左侧导航栏展示文件列表，右侧展示文件内容，这是最常见的布局方式</li>
                <li>文件列表支持排序、筛选和搜索功能</li>
                <li>文件内容区域根据文件类型提供不同的预览方式</li>
              </ol>
              <p>您希望我为您设计一个具体的UI原型吗？</p>
            </div>
          ),
        },
        {
          id: "m3",
          role: "user",
          content: "是的，请帮我设计一个简单的原型，主要是文件管理系统的主界面。",
        },
      ],
    },
    {
      id: "2",
      title: "理解AI代码对编程新手的重要性",
      timestamp: "4小时前",
      messages: [
        {
          id: "m1",
          role: "user",
          content: "作为编程新手，我应该如何理解AI生成的代码？",
        },
        {
          id: "m2",
          role: "assistant",
          content: (
            <div className="space-y-4">
              <p>对于编程新手，我建议以下做法：</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  使用AI工具如Cursor生成代码，但花时间逐步理解每一部分。例如，查看代码结构、注释和逻辑，确保您能解释其功能。
                </li>
                <li>结合AI生成代码与手动练习，这步掌握编程概念。例如，通过修改AI生成的代码来学习调试技巧。</li>
                <li>避免过度依赖AI，特别是在学习早期阶段，确保您能独立解决问题。</li>
              </ol>
              <h3 className="font-medium mt-4">争议与挑战</h3>
              <p>
                关于是否要理解AI代码，存在一些争议。部分观点认为，AI
                工具能降低编程门槛，适合全栈开发快速构建系统。但研究（如University of Toronto
                Study）显示，过度依赖可能导致学习效果下降，特别是在明来看。因此，平衡使用AI与理解代码是关键。
              </p>
            </div>
          ),
        },
      ],
    },
    {
      id: "3",
      title: "已安装的MCP服务器列表整理",
      timestamp: "5小时前",
      messages: [
        {
          id: "m1",
          role: "user",
          content: "请帮我整理一下已安装的MCP服务器列表",
        },
        {
          id: "m2",
          role: "assistant",
          content: (
            <div className="space-y-4">
              <p>以下是从您提供的 MCP Servers 配置中提取的名称列表：</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>filesystem</li>
                <li>GitLab MCP Server</li>
                <li>Git MCP Server</li>
                <li>Playwright</li>
                <li>Mcp Compass</li>
                <li>Sequential Thinking</li>
                <li>Brave Search</li>
                <li>Figma MCP</li>
                <li>magic-mcp</li>
                <li>veyrax-mcp</li>
              </ol>
              <p className="mt-4">这是所有已安装 server 的名称，按原始配置顺序排列。</p>
            </div>
          ),
        },
        {
          id: "m3",
          role: "user",
          content: "谢谢，这些服务器都是做什么用的？",
        },
        {
          id: "m4",
          role: "assistant",
          content:
            "这些MCP服务器各自有不同的功能：filesystem用于文件系统操作，GitLab和Git MCP Server用于版本控制集成，Playwright用于浏览器自动化测试，其他服务器则提供特定领域的功能支持。您需要了解某个特定服务器的详细功能吗？",
        },
      ],
    },
    {
      id: "4",
      title: "Cursor AI 与工作区文件管理",
      timestamp: "5小时前",
      messages: [
        {
          id: "m1",
          role: "user",
          content:
            "Cursor 在 AI 编写代码的时候，会阅读已经打开的工作区的所有文件吗？如果我用另一个 AI 同时修改工作区的文件是否会造成 cursor 的 AI 无法正常运行？",
        },
        {
          id: "m2",
          role: "assistant",
          content: (
            <div className="space-y-4">
              <p>
                在使用 Cursor AI
                编写代码时，它并不会自动阅读工作区中所有已打开的文件，而是依赖于其代码索引机制和上下文管理来决定获取哪些内容，具体来说：
              </p>
              <ol className="list-decimal pl-5 space-y-2 mt-2">
                <li>
                  <span className="font-medium">代码索引与上下文：</span>
                  <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li>
                      Cursor
                      默认会对工作区中的代码库进行索引（除非启用了隐私模式），它会计算每个文件的嵌入向量，并利用这些向量来搜索代码库的相关结构和内容。
                    </li>
                    <li>
                      当你在 Cursor 中发起 AI 请求（例如通过 Chat 或 Composer 功能）时，AI
                      通常会根据你的输入提示和当前上下文（比如光标所在的文件或你明确引用的文件）来决定使用哪些文件的内容。它不会盲目读取所有已打开的文件，而是优先考虑与任务相关的文件。
                    </li>
                    <li>
                      你可以通过 <code className="bg-gray-100 px-1 rounded">@codebase</code> 或{" "}
                      <code className="bg-gray-100 px-1 rounded">@files</code> 手动指定让 AI
                      读取整个代码库或特定文件，以确保它获取足够的上下文。
                    </li>
                  </ul>
                </li>
                <li className="mt-2">
                  <span className="font-medium">另一个 AI 同时修改文件的影响：</span>
                  <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li>
                      如果另一个 AI（或任何外部工具）在同一时间修改工作区的文件，Cursor 的 AI
                      本身不会直接"无法正常运行"，但可能会出现以下情况：
                    </li>
                    <li>
                      上下文不一致：Cursor 的 AI 依赖于它在索引时的文件快照。如果文件在索引后被外部修改，而 Cursor
                      没有及时重新索引，AI 可能会基于过时的内容生成代码，导致结果不符合预期。
                    </li>
                    <li>
                      实时性问题：Cursor 的索引并不是实时更新的。如果外部修改频繁发生，Cursor
                      可能需要手动触发重新索引（通常在设置中可以配置自动索引或手动刷新）。
                    </li>
                    <li>
                      冲突风险：如果两个 AI
                      同时尝试修改同一文件（例如通过自动保存或应用建议），可能会导致文件内容冲突，甚至可能导致文件损坏或丢失内容。
                    </li>
                  </ul>
                </li>
              </ol>
            </div>
          ),
        },
      ],
    },
    {
      id: "5",
      title: "Installing Magic MCP Server for Cursor",
      timestamp: "6小时前",
      messages: [
        {
          id: "m1",
          role: "user",
          content: "如何安装 Magic MCP Server for Cursor？",
        },
        {
          id: "m2",
          role: "assistant",
          content: (
            <div className="space-y-4">
              <p>安装 Magic MCP Server for Cursor 的步骤：</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  <span className="font-medium">下载安装包</span>
                  <p className="mt-1">从官方网站下载最新版本的 Magic MCP Server 安装包。</p>
                </li>
                <li>
                  <span className="font-medium">配置环境变量</span>
                  <p className="mt-1">将 Magic MCP Server 的路径添加到系统环境变量中。</p>
                  <pre className="bg-gray-100 p-2 rounded mt-1">
                    <code>export MAGIC_MCP_PATH=/path/to/magic-mcp</code>
                  </pre>
                </li>
                <li>
                  <span className="font-medium">运行初始化脚本</span>
                  <p className="mt-1">执行以下命令初始化 Magic MCP Server：</p>
                  <pre className="bg-gray-100 p-2 rounded mt-1">
                    <code>magic-mcp init --config=/path/to/config.json</code>
                  </pre>
                </li>
                <li>
                  <span className="font-medium">验证安装是否成功</span>
                  <p className="mt-1">运行以下命令检查 Magic MCP Server 是否正常运行：</p>
                  <pre className="bg-gray-100 p-2 rounded mt-1">
                    <code>magic-mcp status</code>
                  </pre>
                </li>
              </ol>
            </div>
          ),
        },
        {
          id: "m3",
          role: "user",
          content: "有没有更简单的安装方法？比如通过包管理器？",
        },
        {
          id: "m4",
          role: "assistant",
          content:
            "是的，您也可以通过包管理器安装。如果您使用 npm，可以运行 `npm install -g magic-mcp-server`；如果使用 Homebrew (macOS)，可以运行 `brew install magic-mcp-server`。安装完成后，只需运行 `magic-mcp init` 进行初始化配置即可。",
        },
      ],
    },
  ])

  const [selectedItem, setSelectedItem] = React.useState<string | null>("1")

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          {/* 背景遮罩层 */}
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            onClick={() => onOpenChange(false)}
          />

          {/* 模态框 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-10 w-full max-w-[90vw] md:w-4/5 lg:w-5/6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-dialog-title"
            style={{
              boxSizing: 'border-box',
              lineHeight: '24px',
              color: 'rgb(10, 10, 10)',
              tabSize: 4,
            }}
          >
            <div 
              className="flex flex-col bg-white border-0 rounded-t-[24px] rounded-b-[24px] overflow-hidden h-[85vh] max-h-[calc(100vh-100px)]"
              style={{
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {/* 头部 */}
              <div className="flex items-center justify-between border-b p-4">
                <h2 id="history-dialog-title" className="text-lg font-semibold">
                  历史记录
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="hover:bg-gray-100 rounded-full"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">关闭</span>
                </Button>
              </div>

              {/* 搜索栏 */}
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索..."
                    className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid h-full relative grid-cols-2 xl:grid-cols-5 overflow-hidden">
                {/* 左侧历史记录列表 */}
                <div className="col-span-1 xl:col-span-2 border-r border-gray-200 h-full">
                  <ScrollArea className="h-full" 
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'rgba(0, 0, 0, 0.3) rgba(0, 0, 0, 0)',
                    }}
                  >
                    <div className="p-4 space-y-3">
                      {historyItems.map((item) => (
                        <div
                          key={item.id}
                          className={cn(
                            "mb-3 cursor-pointer rounded-md p-3 transition-colors",
                            selectedItem === item.id
                              ? "bg-blue-50 border border-blue-100"
                              : "hover:bg-gray-50 border border-transparent",
                          )}
                          onClick={() => setSelectedItem(item.id)}
                        >
                          <div className="flex flex-col">
                            <span className="text-[14px] font-medium leading-tight">{item.title}</span>
                            <span className="text-xs text-gray-500 mt-1">{item.timestamp}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* 右侧预览内容 - 聊天记录 */}
                <div className="col-span-1 xl:col-span-3 h-full bg-gray-50">
                  <ScrollArea className="h-full"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'rgba(0, 0, 0, 0.3) rgba(0, 0, 0, 0)',
                    }}
                  >
                    <div className="p-4">
                      {selectedItem ? (
                        <div className="space-y-6">
                          {historyItems
                            .find((item) => item.id === selectedItem)
                            ?.messages.map((message) => (
                              <div
                                key={message.id}
                                className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                              >
                                {message.role === "assistant" && (
                                  <div className="flex-shrink-0 mr-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                      <span>👋</span>
                                    </div>
                                  </div>
                                )}
                                <div
                                  className={cn(
                                    "max-w-[85%] rounded-lg p-4",
                                    message.role === "user"
                                      ? "bg-blue-500 text-white"
                                      : "bg-white border border-gray-200",
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "prose prose-sm max-w-none",
                                      message.role === "user" ? "prose-invert" : "",
                                    )}
                                  >
                                    {message.content}
                                  </div>
                                </div>
                                {message.role === "user" && (
                                  <div className="flex-shrink-0 ml-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                      <span>👤</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                          <p>请选择一个历史记录查看详情</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}