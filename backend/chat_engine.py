import os
from typing import Dict, List, Optional
from knowledge_base import KnowledgeBaseManager
from document_processor import DocumentProcessor
from llm_interface.llm_selector import llm

class ChatEngine:
    """Process queries against knowledge base documents"""
    
    def __init__(self, kb_manager: KnowledgeBaseManager):
        self.kb_manager = kb_manager
        self.conversations = {}  # Store conversation history
    
    def query(self, kb_id: str, question: str, conversation_id: Optional[str] = None, 
              history: Optional[List[Dict]] = None) -> Dict:
        """
        Process a query against the knowledge base
        
        Args:
            kb_id: Knowledge base ID
            question: User question
            conversation_id: Optional ID for continuing a conversation
            history: Optional conversation history
            
        Returns:
            Dict with answer and sources
        """
        # Get knowledge base
        kb = self.kb_manager.get_knowledge_base(kb_id)
        if not kb:
            return {"answer": "找不到指定的知识库", "error": True}
        
        # Get files in knowledge base
        files = kb.get("files", [])
        if not files:
            return {"answer": "知识库中还没有文档，请先上传文档", "error": True}
        
        # Build context from files (in a real implementation, we'd use vector embeddings)
        context = self._build_context(kb_id, files)
        
        # Build prompt with context and question
        prompt = self._build_prompt(context, question, history)
        
        # Query LLM
        try:
            answer = llm.query(prompt)
            
            # Update conversation history
            if conversation_id and conversation_id in self.conversations:
                self.conversations[conversation_id].append({
                    "role": "user",
                    "content": question
                })
                self.conversations[conversation_id].append({
                    "role": "assistant",
                    "content": answer
                })
            else:
                # Create new conversation
                new_id = str(len(self.conversations) + 1)
                self.conversations[new_id] = [
                    {"role": "user", "content": question},
                    {"role": "assistant", "content": answer}
                ]
                conversation_id = new_id
            
            # Return answer with conversation ID
            return {
                "answer": answer,
                "conversation_id": conversation_id,
                "sources": [file["name"] for file in files[:3]]  # Simplified sources for demo
            }
        except Exception as e:
            return {"answer": f"查询处理出错: {str(e)}", "error": True}
    
    def _build_context(self, kb_id: str, files: List[Dict]) -> str:
        """
        Build context from knowledge base files
        
        In a real implementation, this would use embeddings and semantic search
        to find relevant documents. For simplicity, we'll just use the most recent files.
        """
        context_parts = []
        
        # Use up to 3 most recent files for context
        for file in files[:3]:
            try:
                file_path = file["path"]
                processor = DocumentProcessor(file_path)
                content = processor.extract_text()
                
                # Truncate if too long (simple approach)
                if len(content) > 5000:
                    content = content[:5000] + "...[内容已截断]"
                
                context_parts.append(f"=== {file['name']} ===\n{content}\n")
            except Exception as e:
                print(f"Error processing file {file['name']}: {e}")
        
        return "\n".join(context_parts)
    
    def _build_prompt(self, context: str, question: str, 
                     history: Optional[List[Dict]] = None) -> str:
        """Build the prompt for the LLM with context and question"""
        
        # System instructions
        system_prompt = """你是一个知识库问答助手，能够基于提供的文档内容回答用户问题。
请根据以下文档内容回答用户的问题。如果问题无法从提供的文档中得到答案，请直接说明"抱歉，文档中没有包含相关信息"。
回答应该简洁明了，使用用户的语言风格，并尽可能直接引用文档内容。如果引用了特定文档，请在回答末尾注明文档来源。

以下是文档内容:
"""
        
        # Add conversation history if available
        conversation_context = ""
        if history and len(history) > 0:
            conversation_context = "之前的对话历史:\n"
            for message in history:
                role = "用户" if message["role"] == "user" else "助手"
                conversation_context += f"{role}: {message['content']}\n"
            conversation_context += "\n"
        
        # Combine all parts
        full_prompt = f"{system_prompt}\n{context}\n\n{conversation_context}用户当前问题: {question}"
        
        return full_prompt 