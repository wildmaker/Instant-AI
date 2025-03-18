'use client';

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Smile, Link, FileText, ImageIcon, Mic, Eye, Zap } from "lucide-react";
import { FC } from "react";
import { LLMModel } from "@/types/models";

interface ChatToolbarProps {
  selectedModel: LLMModel;
  onModelSelect: (model: LLMModel) => void;
  availableModels: LLMModel[];
}

export const ChatToolbar: FC<ChatToolbarProps> = ({
  selectedModel,
  onModelSelect,
  availableModels,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b">
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-sm font-normal justify-start">
              {selectedModel.name}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {availableModels.map((model) => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => onModelSelect(model)}
                className="text-sm"
              >
                {model.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Smile className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Link className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <FileText className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Mic className="h-4 w-4" />
        </Button>

        <div className="flex items-center mx-2 space-x-1 text-xs">
          <Eye className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
          <span className="text-muted-foreground">知识库</span>
          <Switch className="scale-75 ml-1" />
        </div>
      </div>
    </div>
  );
};