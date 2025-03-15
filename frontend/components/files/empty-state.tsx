import { Plus, Upload } from "lucide-react"
import { CreateKnowledgeModal } from "./CreateKnowledgeModal"
import { FileUploadButton } from "./FileUploadButton"

export function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <h2 className="text-lg font-medium mb-2">将文件或文件夹拖到这里</h2>
      <p className="text-sm text-gray-500 mb-8">或者</p>

      <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
        <CreateKnowledgeModal>
          <div className="aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 flex flex-col items-center justify-center p-4 transition-colors cursor-pointer">
            <div className="w-16 h-16 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-purple-600" />
            </div>
            <span className="text-sm font-medium">新建知识库</span>
          </div>
        </CreateKnowledgeModal>

        <FileUploadButton>
          <div className="aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 flex flex-col items-center justify-center p-4 transition-colors cursor-pointer">
            <div className="w-16 h-16 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-amber-600" />
            </div>
            <span className="text-sm font-medium">上传文件</span>
          </div>
        </FileUploadButton>

        <FileUploadButton directory>
          <div className="aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 flex flex-col items-center justify-center p-4 transition-colors cursor-pointer">
            <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <span className="text-sm font-medium">上传文件夹</span>
          </div>
        </FileUploadButton>
      </div>
    </div>
  )
}

