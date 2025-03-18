"use client"
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { knowledgeSchema } from "@/lib/schemas/knowledge";
import { knowledgeApi } from "@/lib/api/knowledge";
import { FileUpload } from "./FileUpload";
import { Plus } from "lucide-react";

interface CreateKnowledgeModalProps {
  children?: ReactNode;
}

export function CreateKnowledgeModal({ children }: CreateKnowledgeModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof knowledgeSchema>>({
    resolver: zodResolver(knowledgeSchema),
    defaultValues: { name: "", description: "" }
  });

  const [createdKbId, setCreatedKbId] = useState<string | null>(null);

  const onSubmit = async (values: z.infer<typeof knowledgeSchema>) => {
    try {
      const { id } = await knowledgeApi.create(values);
      setCreatedKbId(id);
      setOpen(false);
    } catch (error) {
      form.setError("root", { message: "创建失败，请检查名称是否重复" });
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (!createdKbId) return;
    
    try {
      await Promise.all(
        files.map(file => knowledgeApi.uploadFile(createdKbId, file))
      );
      router.push(`/files?category=知识库`);
    } catch (error) {
      // 处理文件上传错误
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} aria-describedby="dialog-description">
      <DialogTrigger asChild>
        {children ? (
          <div onClick={() => setOpen(true)}>{children}</div>
        ) : (
          <Button 
            variant="default" 
            className="gap-2"
            onClick={() => setOpen(true)}
          >
            <Plus className="h-4 w-4" />
            新建知识库
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>创建新知识库</DialogTitle>
          <DialogDescription>
            在此创建新的知识库，填写名称和简介，然后可以上传相关文件。
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名称</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入知识库名称" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>简介</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="请输入知识库简介（可选）"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.root && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}
            {!createdKbId ? (
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  取消
                </Button>
                <Button type="submit">
                  创建
                </Button>
              </div>
            ) : (
              <>
                <FileUpload onUpload={handleFileUpload} />
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => {
                      setOpen(false);
                      router.push(`/files?category=知识库`);
                    }}
                  >
                    完成
                  </Button>
                </div>
              </>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}