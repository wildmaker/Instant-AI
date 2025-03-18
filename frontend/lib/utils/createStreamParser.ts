import { StreamChunk } from "@/types/chat";

export const createStreamParser = () => {
  let buffer = "";

  const processChunk = (chunk: string): StreamChunk[] => {
    const chunks: StreamChunk[] = [];
    buffer += chunk;

    // Split buffer by newlines and process each line
    const lines = buffer.split("\n");
    // Keep the last line in buffer as it might be incomplete
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        // Remove "data: " prefix if exists
        const data = line.replace(/^data: /, "");
        if (data === "[DONE]") continue;

        const parsed = JSON.parse(data);
        
        if (parsed.error) {
          chunks.push({
            type: "error",
            content: parsed.error.message || "Unknown error occurred",
          });
          continue;
        }

        // Extract content from the response based on your API's format
        // Modify this part according to your API response structure
        const content = parsed.choices?.[0]?.delta?.content || "";
        if (content) {
          chunks.push({
            type: "content",
            content,
          });
        }
      } catch (error) {
        console.error("Error parsing stream chunk:", error);
        chunks.push({
          type: "error",
          content: "Error parsing stream response",
        });
      }
    }

    return chunks;
  };

  const flush = (): StreamChunk[] => {
    if (!buffer.trim()) return [];
    const chunks = processChunk("");
    buffer = "";
    return chunks;
  };

  return {
    processChunk,
    flush,
  };
};