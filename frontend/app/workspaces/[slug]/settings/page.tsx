"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Save, ArrowLeft, Trash2, Upload, FolderPlus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { workspaceApi, documentApi, Workspace } from '@/lib/api/anything-llm'
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

// 上传文件表单验证
const uploadSchema = z.object({
  file: z.instanceof(FileList)
    .refine(files => files.length > 0, "请选择文件")
    .refine(files => files.length < 11, "一次最多上传10个文件")
})

// 创建文件夹表单验证
const folderSchema = z.object({
  name: z.string().min(2, "文件夹名称至少需要2个字符")
})

export default function WorkspaceSettingsPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])
  const [folders, setFolders] = useState<any[]>([])
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [folderOpen, setFolderOpen] = useState(false)
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
  
  // 上传表单
  const uploadForm = useForm<z.infer<typeof uploadSchema>>({
    resolver: zodResolver(uploadSchema)
  })
  
  // 文件夹表单
  const folderForm = useForm<z.infer<typeof folderSchema>>({
    resolver: zodResolver(folderSchema),
    defaultValues: {
      name: ""
    }
  })

  // 加载知识库详情
  const loadWorkspace = async () => {
    try {
      setIsLoading(true)
      const response = await workspaceApi.getWorkspace(slug)
      setWorkspace(response.workspace)
      
      // 设置表单默认值
      form.reset({
        name: response.workspace.name,
        similarityThreshold: response.workspace.similarityThreshold || 0.7,
        openAiTemp: response.workspace.openAiTemp || 0.7,
        openAiHistory: response.workspace.openAiHistory || 20,
        openAiPrompt: response.workspace.openAiPrompt || "",
        queryRefusalResponse: response.workspace.queryRefusalResponse || "",
        chatMode: response.workspace.chatMode || "chat",
        topN: response.workspace.topN || 4
      })
      
      // 加载文档
      await loadDocuments()
    } catch (error) {
      console.error('加载知识库详情失败:', error)
      toast({
        title: "加载失败",
        description: "无法获取知识库详情，请检查API连接",
        variant: "destructive",
      })
      router.push('/workspaces')
    } finally {
      setIsLoading(false)
    }
  }
  
  // 加载文档列表
  const loadDocuments = async () => {
    try {
      const folderResult = await documentApi.getFolders()
      setFolders(folderResult.folders || [])
      
      const docsResult = await documentApi.getDocuments(currentFolder)
      setDocuments(docsResult.documents || [])
    } catch (error) {
      console.error('加载文档失败:', error)
      toast({
        title: "加载失败",
        description: "无法获取文档列表",
        variant: "destructive",
      })
    }
  }

  // 初始加载
  useEffect(() => {
    if (slug) {
      loadWorkspace()
    }
  }, [slug])
  
  // 文件夹变更时重新加载文档
  useEffect(() => {
    if (!isLoading && workspace) {
      loadDocuments()
    }
  }, [currentFolder, isLoading, workspace])

  // 更新知识库设置
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!workspace) return
    
    try {
      setIsSaving(true)
      await workspaceApi.updateWorkspace(slug, values)
      toast({
        title: "保存成功",
        description: "知识库设置已更新",
      })
      
      // 重新加载知识库详情
      await loadWorkspace()
    } catch (error) {
      console.error('保存知识库设置失败:', error)
      toast({
        title: "保存失败",
        description: "无法更新知识库设置，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  // 上传文件
  const onUpload = async (values: z.infer<typeof uploadSchema>) => {
    try {
      setIsUploading(true)
      
      const files = Array.from(values.file)
      const formData = new FormData()
      
      files.forEach(file => {
        formData.append('files', file)
      })
      
      if (currentFolder) {
        formData.append('folderId', currentFolder)
      }
      
      await documentApi.uploadFiles(formData)
      
      toast({
        title: "上传成功",
        description: `${files.length}个文件上传成功`,
      })
      
      // 关闭对话框并重置表单
      setUploadOpen(false)
      uploadForm.reset()
      
      // 重新加载文档列表
      await loadDocuments()
    } catch (error) {
      console.error('上传文件失败:', error)
      toast({
        title: "上传失败",
        description: "无法上传文件，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }
  
  // 创建文件夹
  const onCreateFolder = async (values: z.infer<typeof folderSchema>) => {
    try {
      await documentApi.createFolder(values.name)
      
      toast({
        title: "创建成功",
        description: `文件夹 "${values.name}" 创建成功`,
      })
      
      // 关闭对话框并重置表单
      setFolderOpen(false)
      folderForm.reset()
      
      // 重新加载文件夹列表
      await loadDocuments()
    } catch (error) {
      console.error('创建文件夹失败:', error)
      toast({
        title: "创建失败",
        description: "无法创建文件夹，请稍后重试",
        variant: "destructive",
      })
    }
  }
  
  // 删除文档
  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('确定要删除此文档吗？此操作不可撤销。')) {
      return
    }
    
    try {
      await documentApi.deleteDocument(docId)
      
      toast({
        title: "删除成功",
        description: "文档已成功删除",
      })
      
      // 重新加载文档列表
      await loadDocuments()
    } catch (error) {
      console.error('删除文档失败:', error)
      toast({
        title: "删除失败",
        description: "无法删除文档，请稍后重试",
        variant: "destructive",
      })
    }
  }
  
  // 删除文件夹
  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('确定要删除此文件夹吗？文件夹中的所有文档将被删除，此操作不可撤销。')) {
      return
    }
    
    try {
      await documentApi.deleteFolder(folderId)
      
      toast({
        title: "删除成功",
        description: "文件夹已成功删除",
      })
      
      // 如果当前在删除的文件夹中，返回根目录
      if (currentFolder === folderId) {
        setCurrentFolder(null)
      }
      
      // 重新加载文档列表
      await loadDocuments()
    } catch (error) {
      console.error('删除文件夹失败:', error)
      toast({
        title: "删除失败",
        description: "无法删除文件夹，请稍后重试",
        variant: "destructive",
      })
    }
  }
  
  // 添加文档到知识库
  const handleAddToWorkspace = async (docId: string) => {
    if (!workspace) return
    
    try {
      await workspaceApi.updateWorkspaceEmbeddings(slug, {
        adds: [docId],
        removes: []
      })
      
      toast({
        title: "添加成功",
        description: "文档已添加到知识库",
      })
      
      // 重新加载知识库详情
      await loadWorkspace()
    } catch (error) {
      console.error('添加文档到知识库失败:', error)
      toast({
        title: "添加失败",
        description: "无法添加文档到知识库，请稍后重试",
        variant: "destructive",
      })
    }
  }
  
  // 从知识库移除文档
  const handleRemoveFromWorkspace = async (docId: string) => {
    if (!workspace) return
    
    try {
      await workspaceApi.updateWorkspaceEmbeddings(slug, {
        adds: [],
        removes: [docId]
      })
      
      toast({
        title: "移除成功",
        description: "文档已从知识库中移除",
      })
      
      // 重新加载知识库详情
      await loadWorkspace()
    } catch (error) {
      console.error('从知识库移除文档失败:', error)
      toast({
        title: "移除失败",
        description: "无法从知识库移除文档，请稍后重试",
        variant: "destructive",
      })
    }
  }
  
  // 返回知识库列表
  const handleBack = () => {
    router.push('/workspaces')
  }
  
  // 导航到文件夹
  const navigateToFolder = (folderId: string | null) => {
    setCurrentFolder(folderId)
  }
  
  // 检查文档是否已添加到知识库
  const isDocumentInWorkspace = (docId: string) => {
    if (!workspace || !workspace.documents) return false
    return workspace.documents.some(doc => doc.docId === docId)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-4 text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={handleBack} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          返回
        </Button>
        <h1 className="text-3xl font-bold">{workspace?.name} - 设置</h1>
      </div>
      
      <Tabs defaultValue="settings">
        <TabsList className="mb-6">
          <TabsTrigger value="settings">基本设置</TabsTrigger>
          <TabsTrigger value="documents">文档管理</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>知识库设置</CardTitle>
              <CardDescription>
                配置知识库的基本参数和功能
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="similarityThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>相似度阈值</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" min="0" max="1" {...field} />
                          </FormControl>
                          <FormDescription>
                            检索文档时的最低相似度阈值
                          </FormDescription>
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
                          <FormDescription>
                            控制回答的创造性，值越高创造性越强
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="openAiHistory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>历史消息数量</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormDescription>
                            聊天中保留的历史消息数量
                          </FormDescription>
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
                          <FormDescription>
                            每次检索的文档片段数量
                          </FormDescription>
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
                        <FormDescription>
                          选择聊天模式或纯查询模式
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="openAiPrompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>系统提示词</FormLabel>
                        <FormControl>
                          <textarea 
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="输入系统提示词，可为空"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          设置系统提示词，指导AI回答的方式和风格
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="queryRefusalResponse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>拒绝回答提示</FormLabel>
                        <FormControl>
                          <textarea 
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="输入拒绝回答的提示词，可为空"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          当无法回答问题时显示的提示信息
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving} className="mt-4">
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? "保存中..." : "保存设置"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap justify-between items-center">
                <div>
                  <CardTitle>文档管理</CardTitle>
                  <CardDescription>
                    上传和管理知识库文档
                  </CardDescription>
                </div>
                <div className="flex space-x-2 mt-2 sm:mt-0">
                  <Dialog open={folderOpen} onOpenChange={setFolderOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <FolderPlus className="h-4 w-4 mr-2" />
                        新建文件夹
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>创建新文件夹</DialogTitle>
                        <DialogDescription>
                          输入文件夹名称
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...folderForm}>
                        <form onSubmit={folderForm.handleSubmit(onCreateFolder)}>
                          <FormField
                            control={folderForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>文件夹名称</FormLabel>
                                <FormControl>
                                  <Input placeholder="输入文件夹名称" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <DialogFooter className="mt-4">
                            <Button type="submit">创建文件夹</Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        上传文件
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>上传文件</DialogTitle>
                        <DialogDescription>
                          选择要上传的文件
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...uploadForm}>
                        <form onSubmit={uploadForm.handleSubmit(onUpload)}>
                          <FormField
                            control={uploadForm.control}
                            name="file"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>选择文件</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="file" 
                                    multiple
                                    onChange={(e) => field.onChange(e.target.files)}
                                  />
                                </FormControl>
                                <FormDescription>
                                  支持PDF、Word、TXT等文件格式，单次最多上传10个文件
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <DialogFooter className="mt-4">
                            <Button type="submit" disabled={isUploading}>
                              {isUploading ? "上传中..." : "上传文件"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* 文件位置导航 */}
              <div className="mb-4 flex items-center">
                <Button 
                  variant="ghost" 
                  onClick={() => navigateToFolder(null)}
                  className={!currentFolder ? "font-bold bg-muted" : ""}
                >
                  根目录
                </Button>
                {currentFolder && folders.find(f => f.id === currentFolder) && (
                  <>
                    <span className="mx-2">/</span>
                    <Button 
                      variant="ghost"
                      className="font-bold bg-muted"
                    >
                      {folders.find(f => f.id === currentFolder)?.name || ''}
                    </Button>
                  </>
                )}
              </div>
              
              <Separator className="my-4" />
              
              {/* 文件夹列表 */}
              {!currentFolder && folders.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">文件夹</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {folders.map((folder) => (
                      <Card key={folder.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardHeader className="pb-2 pt-4">
                          <CardTitle className="text-base flex justify-between">
                            <span className="truncate">{folder.name}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => { 
                                e.stopPropagation();
                                handleDeleteFolder(folder.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent 
                          className="pt-0 pb-4" 
                          onClick={() => navigateToFolder(folder.id)}
                        >
                          <p className="text-sm text-muted-foreground">
                            {folder.documentCount || 0}个文档
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <Separator className="my-6" />
                </div>
              )}
              
              {/* 文档列表 */}
              <div>
                <h3 className="text-lg font-medium mb-2">文档</h3>
                {documents.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {documents.map((doc) => (
                      <Card key={doc.docId} className="flex flex-col">
                        <div className="flex items-start justify-between p-4">
                          <div className="flex items-start space-x-4">
                            <FileText className="h-8 w-8 text-blue-500 mt-1" />
                            <div>
                              <h4 className="font-medium">{doc.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                上传时间: {new Date(doc.createdAt).toLocaleString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                类型: {doc.type || '未知'} | 大小: {(doc.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {isDocumentInWorkspace(doc.docId) ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRemoveFromWorkspace(doc.docId)}
                              >
                                从知识库移除
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleAddToWorkspace(doc.docId)}
                              >
                                添加到知识库
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteDocument(doc.docId)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg">
                    <h3 className="text-lg font-medium mb-2">暂无文档</h3>
                    <p className="text-gray-500 mb-4">点击"上传文件"按钮添加文档</p>
                    <Button onClick={() => setUploadOpen(true)}>
                      <Upload className="mr-2 h-4 w-4" />
                      上传文件
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}