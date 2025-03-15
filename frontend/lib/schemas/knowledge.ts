import { z } from 'zod';

export const knowledgeSchema = z.object({
  name: z.string().min(2, "名称至少2个字符").max(50),
  description: z.string().optional()
});