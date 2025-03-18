"use client";

import { FC, useEffect, useRef } from "react";
import { ChatMessage, ChatMessageProps } from "./ChatMessage";

interface ChatMessageListProps {
  messages: ChatMessageProps[];
  isStreaming?: boolean;
}

export const ChatMessageList: FC<ChatMessageListProps> = ({ 
  messages,
  isStreaming
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col overflow-y-auto px-4 py-4">
      {messages.map((message, index) => (
        <ChatMessage
          key={index}
          role={message.role}
          content={message.content}
          timestamp={message.timestamp}
          isStreaming={isStreaming && index === messages.length - 1 && message.role === "assistant"}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;