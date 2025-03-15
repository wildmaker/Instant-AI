"use client"
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FilePlus2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
}

export function FileUpload({ onUpload }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    setUploadProgress(prev => [...prev, ...Array(acceptedFiles.length).fill(0)]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    disabled: isUploading
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setUploadProgress(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    try {
      await onUpload(files);
      setFiles([]);
      setUploadProgress([]);
    } catch (error) {
      console.error("上传失败:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading && 'opacity-50 pointer-events-none'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <FilePlus2 className="h-8 w-8 text-gray-400" />
          <p className="text-gray-600">
            {isDragActive ? "松开上传文件" : "拖放文件至此或点击选择"}
          </p>
          <span className="text-sm text-gray-500">支持PDF、Word、TXT等格式</span>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded-md">
              <div className="flex-1 pr-4">
                <span className="text-sm truncate block">{file.name}</span>
                {uploadProgress[index] > 0 && (
                  <div className="h-1 bg-gray-200 rounded-full mt-1">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress[index]}%` }}
                    />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-600"
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          
          <Button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isUploading ? "上传中..." : "开始上传"}
          </Button>
        </div>
      )}
    </div>
  );
}