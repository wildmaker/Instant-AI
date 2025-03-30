"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Settings, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { workspaceApi, Workspace } from '@/lib/api/anything-llm'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

// 表单验证模式
const formSchema = z.object({
  name: z.string().min(2, {
    message: "知识库名称至少需要2个字符",
  }),
  similarityThreshold: z.coerce.number().min(0).max(1).default(0.7),
  openAiTemp: z.coerce.number().min(0).max(1).default(0.7),
  openAiHistory: z.coerce.number().min(1).default(20),
  openAiPrompt: z.string().optional(),
  queryRefusalResponse: z.string().optional(),
  chatMode: z.enum(["chat", "query"]).default("chat"),
  topN: z.coerce.number().min(1).default(4)
})

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()
  const { toast } = useToast()

  // 表单设置
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      similarityThreshold: 0.7,
      openAiTemp: 0.7,
      openAiHistory: 20,
      chatMode: "chat",
      topN: 4
    },
  })

  // 加载知识库列表
  const loadWorkspaces = async () => {
    try {
      setIsLoading(true)
      const response = await workspaceApi.getWorkspaces()
      setWorkspaces(response.workspaces)
    } catch (error) {
      console.error('加载知识库失败:', error)
      toast({
        title: "加载失败",
        description: "无法获取知识库列表，请检查API连接",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadWorkspaces()
  }, [])

  // 创建知识库
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsCreating(true)
      const response = await workspaceApi.createWorkspace(values)
      toast({
        title: "创建成功",
        description: `知识库 "${response.workspace.name}" 已成功创建`,
      })
      loadWorkspaces()
      form.reset()
      setIsOpen(false)
    } catch (error) {
      console.error('创建知识库失败:', error)
      toast({
        title: "创建失败",
        description: "无法创建知识库，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  // 删除知识库
  const handleDelete = async (workspace: Workspace) => {
    if (!confirm(`确定要删除知识库 "${workspace.name}" 吗？此操作不可撤销。`)) {
      return
    }

    try {
      await workspaceApi.deleteWorkspace(workspace.slug)
      toast({
        title: "删除成功",
        description: `知识库 "${workspace.name}" 已成功删除`,
      })
      loadWorkspaces()
    } catch (error) {
      console.error('删除知识库失败:', error)
      toast({
        title: "删除失败",
        description: "无法删除知识库，请稍后重试",
        variant: "destructive",
      })
    }
  }

  // 打开聊天
  const handleChat = (workspace: Workspace) => {
    router.push(`/chat?workspace=${workspace.slug}`)
  }

  // 打开设置
  const handleSettings = (workspace: Workspace) => {
    router.push(`/workspaces/${workspace.slug}/settings`)
  }

  // 过滤知识库
  const filteredWorkspaces = searchTerm 
    ? workspaces.filter(ws => ws.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : workspaces

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">我的知识库</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              创建知识库
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>创建新知识库</DialogTitle>
              <DialogDescription>
                创建一个知识库来管理和检索您的文档信息
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>知识库名称</FormLabel>
                      <FormControl>
                        <Input placeholder="输入知识库名称" {...field} />
                      </FormControl>
                      <FormDescription>
                        这是您的知识库的名称，将在列表中显示
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="similarityThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>相似度阈值</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" max="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="openAiTemp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>模型温度</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" max="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="openAiHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>历史消息数量</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="topN"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>检索条数</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="chatMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>聊天模式</FormLabel>
                      <FormControl>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="chat">聊天模式 (使用历史记录和通用知识)</option>
                          <option value="query">查询模式 (仅使用文档知识)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "创建中..." : "创建知识库"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="mb-6">
        <Input
          placeholder="搜索知识库..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      <Separator className="my-6" />
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
            <p className="mt-4 text-gray-500">加载知识库中...</p>
          </div>
        </div>
      ) : filteredWorkspaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkspaces.map((workspace) => (
            <Card key={workspace.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle>{workspace.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-500 flex-grow">
                <p>创建时间: {new Date(workspace.createdAt).toLocaleString()}</p>
                <p>更新时间: {new Date(workspace.lastUpdatedAt).toLocaleString()}</p>
                <p>聊天模式: {workspace.chatMode === 'chat' ? '聊天模式' : '查询模式'}</p>
                <p>检索条数: {workspace.topN || 4}</p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2 border-t">
                <Button variant="outline" size="sm" onClick={() => handleSettings(workspace)}>
                  <Settings className="h-4 w-4 mr-1" />
                  设置
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleChat(workspace)}>
                  <MessageSquare className="h-4 w-4 mr-1" />
                  聊天
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(workspace)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  删除
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-lg font-medium mb-2">暂无知识库</h3>
          <p className="text-gray-500 mb-4">点击"创建知识库"按钮开始使用</p>
          <Button onClick={() => setIsOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            创建知识库
          </Button>
        </div>
      )}
    </div>
  )
}