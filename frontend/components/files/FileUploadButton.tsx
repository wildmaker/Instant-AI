"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { useRouter } from "next/navigation"

interface FileUploadButtonProps {
  children?: React.ReactNode
  directory?: boolean
  onUpload?: (files: File[]) => Promise<void>
}

export function FileUploadButton({ children, directory = false, onUpload }: FileUploadButtonProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    
    setIsUploading(true)
    try {
      // 如果提供了 onUpload 回调，则使用它
      if (onUpload) {
        await onUpload(acceptedFiles)
      } else {
        // 否则使用默认的上传逻辑
        // 这里暂时只是模拟上传，实际项目中应该调用 API
        console.log("上传文件:", acceptedFiles)
        
        // 上传完成后刷新文件列表
        router.refresh()
      }
    } catch (error) {
      console.error("上传失败:", error)
    } finally {
      setIsUploading(false)
    }
  }, [onUpload, router])

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop: handleUpload,
    noClick: !!children, // 如果有子元素，则禁用点击
    noKeyboard: !!children,
    noDrag: !!children,
    multiple: true,
    // @ts-ignore
    directory: directory,
    webkitdirectory: directory,
  })

  // 如果有子元素，则使用子元素作为触发器
  if (children) {
    return (
      <div onClick={open}>
        {children}
      </div>
    )
  }

  // 否则使用默认按钮
  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <Button disabled={isUploading}>
        <Upload className="w-4 h-4 mr-2" />
        {directory ? "上传文件夹" : "上传文件"}
      </Button>
    </div>
  )
}