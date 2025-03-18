"use client";

import { FC, memo } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";

interface AssistantCard {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface CommonQuestion {
  id: string;
  text: string;
}

export interface WelcomeMessageProps {
  assistantCards?: AssistantCard[];
  commonQuestions?: CommonQuestion[];
  onSelectQuestion?: (question: string) => void;
  onRefreshCards?: () => void;
}

export const WelcomeMessage: FC<WelcomeMessageProps> = memo(function WelcomeMessage({
  assistantCards = [],
  commonQuestions = [],
  onSelectQuestion,
  onRefreshCards,
}) {
  // 根据当前时间返回对应的问候语
  const getGreeting = (): string => {
    const now = new Date();
    const hours = now.getHours();

    if (hours >= 4 && hours < 11) {
      return "早上好";
    } else if (hours >= 11 && hours < 14) {
      return "中午好";
    } else if (hours >= 14 && hours < 18) {
      return "下午好";
    } else {
      return "晚上好";
    }
  };

  return (
    <div className="flex flex-col gap-8 mb-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="text-4xl">👋</div>
        <h1 className="text-2xl font-bold">{getGreeting()}</h1>
      </div>
      
      <div className="text-base text-gray-700">
        我是您的私人智能助理 LobeChat，请问现在能帮您做什么？
        <br />
        如果需要获得更加专业或定制的助手，可以点击 <span className="bg-gray-100 px-1 py-0.5 rounded">+</span> 创建自定义助手
      </div>
      
      {assistantCards.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>新增助手推荐:</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRefreshCards}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {assistantCards.map((card) => (
              <div key={card.id} className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3 text-2xl">{card.icon}</div>
                  <div>
                    <h3 className="font-medium">{card.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{card.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {commonQuestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>大家都在问：</span>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <span className="text-sm">→</span>
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {commonQuestions.map((question) => (
              <div 
                key={question.id}
                className="px-4 py-2 bg-white border rounded-full cursor-pointer hover:bg-gray-50"
                onClick={() => onSelectQuestion?.(question.text)}
              >
                {question.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default WelcomeMessage;