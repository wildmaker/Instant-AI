import React from "react";
import UserIcon from "@/components/UserIcon";
import { Message } from "@/types/chat";
import { renderMarkdown } from "@/utils/markdown";
import { sanitize } from "@/utils/purify";

interface ChatBubbleProps {
  message: Message;
  className?: string;
}

export function ChatBubble({ message, className = '' }: ChatBubbleProps) {
  const { role, content } = message;
  const isUser = role === "user";
  
  // 空消息检查
  if (!content && role === "assistant") {
    return (
      <div
        className={`flex justify-center items-end w-full bg-gray-50 dark:bg-gray-900 ${className}`}
      >
        <div className={`py-6 px-4 w-full flex gap-x-5 md:max-w-[80%] flex-col`}>
          <div className="flex gap-x-5">
            <UserIcon role={role} className="mr-2 mt-1 flex-shrink-0" />
            <div className="animate-pulse flex space-x-4 mt-2">
              <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // 处理内容，为AI回复应用markdown
  const processedContent = isUser ? content : sanitize(renderMarkdown(content));

  return (
    <div
      className={`flex justify-center items-end w-full bg-gray-50 dark:bg-gray-900 ${className}`}
    >
      <div className={`py-6 px-4 w-full flex gap-x-5 md:max-w-[80%] flex-col`}>
        <div className="flex gap-x-5">
          <UserIcon role={role} className="mr-2 mt-1 flex-shrink-0" />

          <div
            className={`markdown whitespace-pre-line text-gray-800 dark:text-white font-normal text-sm md:text-sm flex flex-col gap-y-1 mt-2`}
            dangerouslySetInnerHTML={{
              __html: processedContent,
            }}
          />
        </div>
      </div>
    </div>
  );
}