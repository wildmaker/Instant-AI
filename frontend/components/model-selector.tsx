"use client"

import { Check, Eye, Zap } from "lucide-react"
import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { availableModels, type LLMModel } from "@/types/models"

export function ModelSelector() {
  const [selectedModel, setSelectedModel] = useState<LLMModel>(availableModels[0])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 w-full justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
              {selectedModel.provider === "openai" && (
                <svg className="w-3 h-3" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.0264 1.1706a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4929 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0264 1.1706a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.6 8.3829l2.0264-1.1706a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.3927-.6813zm2.0739-3.0231l-.142-.0852-4.7782-2.7913a.7712.7712 0 0 0-.7806 0L9.409 9.2297V6.8974a.0804.0804 0 0 1 .0332-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.0264-1.1706a.0757.0757 0 0 1-.038-.052V6.0574a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
                  />
                </svg>
              )}
            </div>
            <span className="text-sm font-medium">{selectedModel.name}</span>
          </div>
          <span className="text-xs text-muted-foreground">{selectedModel.contextWindow}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[300px]">
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
              {model.id === selectedModel.id && <Check className="w-4 h-4" />}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

