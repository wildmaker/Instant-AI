"use client";

import { FC, useState } from "react";
import { ChatInput } from "./ChatInput";
import { ChatMessageList } from "./ChatMessageList";
import { Message } from "@/types/chat";
import { createStreamParser } from "@/lib/utils/createStreamParser";

interface ChatContainerProps {
  initialMessages?: Message[];
  onSendMessage?: (message: string) => Promise<void>;
  isStreaming?: boolean;
}

export const ChatContainer: FC<ChatContainerProps> = ({
  initialMessages = [],
  onSendMessage,
  isStreaming: _isStreaming = false,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSend = async (message: string) => {
    try {
      setIsSending(true);
      // 添加用户消息
      const userMessage: Message = {
        role: "user",
        content: message,
      };
      setMessages((prev) => [...prev, userMessage]);

      // 创建助手消息
      const assistantMessage: Message = {
        role: "assistant",
        content: "",
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsStreaming(true);

      // 调用流式 API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const reader = response.body?.getReader();
      const parser = createStreamParser();

      if (!reader) {
        throw new Error("Failed to get response reader");
      }

      let accumulatedContent = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = new TextDecoder().decode(value);
          const chunks = parser.processChunk(text);

          for (const chunk of chunks) {
            if (chunk.type === "content") {
              accumulatedContent += chunk.content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  ...newMessages[newMessages.length - 1],
                  content: accumulatedContent,
                };
                return newMessages;
              });
            }
          }
        }

        // 处理剩余的内容
        const remainingChunks = parser.flush();
        for (const chunk of remainingChunks) {
          if (chunk.type === "content") {
            accumulatedContent += chunk.content;
            setMessages((prev) => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = {
                ...newMessages[newMessages.length - 1],
                content: accumulatedContent,
              };
              return newMessages;
            });
          }
        }
      } finally {
        reader.releaseLock();
      }

      // 如果有外部的 onSendMessage 处理函数，也调用它
      if (onSendMessage) {
        await onSendMessage(message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          ...newMessages[newMessages.length - 1],
          content: "抱歉，发生了错误。请稍后重试。",
        };
        return newMessages;
      });
    } finally {
      setIsSending(false);
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <ChatMessageList messages={messages} isStreaming={isStreaming} />
      </div>
      <ChatInput onSend={handleSend} disabled={isSending} />
    </div>
  );
};