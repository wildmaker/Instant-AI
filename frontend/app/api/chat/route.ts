import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];

    // 创建一个 TransformStream 用于流式输出
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // 模拟流式响应
    const response = `你说的是："${lastMessage.content}"。这是一个模拟的流式响应，让我们来测试一下效果：\n\n`;
    const chunks = response.split("");
    
    // 启动异步写入过程
    (async () => {
      try {
        for (const chunk of chunks) {
          const data = {
            choices: [{
              delta: { content: chunk },
              finish_reason: null
            }]
          };
          await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          // 添加随机延迟使效果更明显
          await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 50));
        }
        
        // 发送完成标记
        await writer.write(encoder.encode("data: [DONE]\n\n"));
      } catch (error) {
        console.error("Error writing to stream:", error);
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}