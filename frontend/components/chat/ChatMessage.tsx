"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FC, memo } from "react";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";

export interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
  isStreaming?: boolean;
}

export const ChatMessage: FC<ChatMessageProps> = memo(function ChatMessage({
  role,
  content,
  timestamp,
  isStreaming,
}) {
  const isUser = role === "user";
  
  return (
    <div className={cn(
      "flex mb-6",
      isUser ? "justify-end" : ""
    )}>
      {!isUser && (
        <div className="flex-shrink-0 mr-4">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span>👋</span>
          </div>
        </div>
      )}
      
      <div className={cn(
        "flex flex-col",
        isUser ? "items-end" : "items-start",
        "max-w-[85%]"
      )}>
        <div className={cn(
          "rounded-lg p-4 w-fit",
          isUser 
            ? "bg-blue-500 text-white" 
            : "bg-white border border-gray-200",
          isStreaming && "animate-pulse"
        )}>
          <div className={cn(
            "prose prose-sm max-w-none",
            isUser ? "prose-invert" : ""
          )}>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
        
        {timestamp && (
          <div className="text-xs text-gray-500 mt-1">
            {format(timestamp, 'HH:mm')}
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 ml-4">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span>👤</span>
          </div>
        </div>
      )}
    </div>
  );
});

export default ChatMessage;