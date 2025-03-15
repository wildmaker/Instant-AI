import os
import json
import uuid
from typing import Dict, List, Any, Optional
from knowledge_base import KnowledgeBaseManager
from document_processor import DocumentProcessor
from llm_interface.llm_selector import llm
from sql_query_engine import SQLQueryEngine

class ChatEngine:
    """Handle chat interactions with the knowledge base"""
    
    def __init__(self, kb_manager: KnowledgeBaseManager):
        self.kb_manager = kb_manager
        self.conversations = {}  # Store conversation history
        self.sql_engine = SQLQueryEngine()
    
    def query(self, kb_id: str, question: str, conversation_id: Optional[str] = None, 
              history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        """
        Process a query against the knowledge base
        
        Args:
            kb_id: Knowledge base ID
            question: User's question
            conversation_id: Optional conversation ID for context
            history: Optional conversation history
            
        Returns:
            Dict with answer and related metadata
        """
        # Validate knowledge base
        kb = self.kb_manager.get_knowledge_base(kb_id)
        if not kb:
            return {
                "answer": "知识库不存在，请选择有效的知识库",
                "error": True
            }
        
        # Create or retrieve conversation context
        if not conversation_id:
            conversation_id = str(uuid.uuid4())
            self.conversations[conversation_id] = []
        elif conversation_id not in self.conversations:
            self.conversations[conversation_id] = []
        
        # Update history if provided
        if history:
            self.conversations[conversation_id] = history
        
        # Add current question to history
        self.conversations[conversation_id].append({
            "role": "user",
            "content": question
        })
        
        # Determine query type - simple or complex (SQL)
        is_complex_query = self._is_complex_query(question)
        
        try:
            if is_complex_query:
                answer, sources = self._handle_complex_query(kb_id, question)
            else:
                answer, sources = self._handle_simple_query(kb_id, question)
            
            # Add answer to conversation history
            self.conversations[conversation_id].append({
                "role": "assistant", 
                "content": answer
            })
            
            return {
                "answer": answer,
                "conversationId": conversation_id,
                "sources": sources,
                "isComplexQuery": is_complex_query
            }
            
        except Exception as e:
            error_message = f"处理查询时出错: {str(e)}"
            
            # Add error to conversation history
            self.conversations[conversation_id].append({
                "role": "assistant", 
                "content": error_message
            })
            
            return {
                "answer": error_message,
                "conversationId": conversation_id,
                "error": True
            }
    
    def _handle_simple_query(self, kb_id: str, question: str) -> tuple:
        """
        Handle a simple knowledge base query using Dify/LLM
        Returns answer text and sources
        """
        # Get knowledge base files
        files = self.kb_manager.get_files(kb_id)
        
        # Prepare context from files
        context = self._prepare_context_from_files(kb_id, files, max_files=3)
        
        # Use LLM to answer the question
        prompt = f"""基于提供的上下文信息，回答用户的问题。如果上下文中没有相关信息，请说明无法回答。

上下文:
{context}

问题: {question}

回答:"""
        
        response = llm.generate_completion(prompt)
        
        # For simple queries, use file names as sources
        sources = [file["name"] for file in files[:3]]
        
        return response, sources
    
    def _handle_complex_query(self, kb_id: str, question: str) -> tuple:
        """
        Handle a complex query that requires SQL execution
        Returns answer text and sources
        """
        # Get table metadata
        tables = self.sql_engine.get_table_metadata(kb_id)
        
        if not tables:
            return "无法执行查询，知识库中没有表格数据。请先上传CSV或Excel文件。", []
        
        # Generate SQL query using LLM
        sql_prompt = f"""作为一个SQL专家，你需要将自然语言问题转换为SQL查询。
以下是数据库表的结构信息:

{self._format_tables_info(tables)}

请将这个问题转换为一个有效的SQL查询: "{question}"
只返回SQL语句，不要有任何其他解释。"""
        
        # Get SQL query from LLM
        sql_query = llm.generate_completion(sql_prompt).strip()
        
        try:
            # Execute the SQL query
            results, columns = self.sql_engine.execute_query(kb_id, sql_query)
            
            # Format the results for display
            if len(results) > 0:
                # For single count/value results, simplify the output
                if len(columns) == 1 and len(results) == 1:
                    value = list(results[0].values())[0]
                    if columns[0].lower().startswith('count'):
                        result_text = f"查询结果: {value}"
                    else:
                        result_text = f"{columns[0]}: {value}"
                else:
                    # Format as table for multiple rows/columns
                    result_text = self._format_results_as_table(results, columns)
            else:
                result_text = "查询结果为空。"
            
            # Generate natural language explanation of results
            explain_prompt = f"""以下是用户的问题:
{question}

这是执行的SQL查询:
{sql_query}

以下是查询结果:
{result_text}

请提供这些结果的自然语言解释，用简洁易懂的中文回答用户的问题。"""
            
            explanation = llm.generate_completion(explain_prompt)
            
            # Sources are table names used in the query
            sources = self._extract_tables_from_query(sql_query, tables)
            
            return explanation, sources
            
        except Exception as e:
            return f"执行SQL查询时出错: {str(e)}。生成的SQL: {sql_query}", []
    
    def _is_complex_query(self, question: str) -> bool:
        """
        Determine if a question requires complex SQL processing
        """
        # Use LLM to detect if this is a complex query
        prompt = f"""确定以下问题是简单查询还是复杂查询。

简单查询: 直接从文档中检索单一事实或信息的查询。例如"产品X的尺寸是多少？"、"Y过程的步骤是什么？"
复杂查询: 需要跨表分析、统计、聚合、计数或比较的查询。例如"统计材质为玻璃的产品数量"、"价格在X范围内的型号有哪些？"

问题: {question}

只回答"简单"或"复杂"。"""

        response = llm.generate_completion(prompt).strip().lower()
        
        return "复杂" in response or "complex" in response
    
    def _prepare_context_from_files(self, kb_id: str, files: List[Dict], max_files: int = 3) -> str:
        """
        Extract and prepare context from knowledge base files
        """
        context_chunks = []
        
        for file in files[:max_files]:
            file_path = file.get("path")
            if file_path and os.path.exists(file_path):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        # Truncate if too long
                        if len(content) > 5000:
                            content = content[:5000] + "..."
                        
                        context_chunks.append(f"文件 '{file['name']}':\n{content}\n")
                except Exception:
                    # Try alternate encoding if UTF-8 fails
                    try:
                        with open(file_path, 'r', encoding='gbk') as f:
                            content = f.read()
                            if len(content) > 5000:
                                content = content[:5000] + "..."
                            context_chunks.append(f"文件 '{file['name']}':\n{content}\n")
                    except Exception as e:
                        context_chunks.append(f"文件 '{file['name']}' 读取失败: {str(e)}")
        
        return "\n\n".join(context_chunks)
    
    def _format_tables_info(self, tables: List[Dict]) -> str:
        """Format table metadata as a string for prompt"""
        formatted = []
        
        for table in tables:
            table_name = table["table_name"]
            columns = ", ".join([f"{col['name']} ({col['type']})" for col in table["columns"]])
            formatted.append(f"表名: {table_name}\n列: {columns}\n行数: {table['row_count']}")
        
        return "\n\n".join(formatted)
    
    def _format_results_as_table(self, results: List[Dict], columns: List[str]) -> str:
        """Format SQL results as a text table"""
        if not results:
            return "空结果"
        
        # Calculate column widths
        col_widths = {col: len(col) for col in columns}
        for row in results:
            for col in columns:
                val_len = len(str(row.get(col, "")))
                if val_len > col_widths[col]:
                    col_widths[col] = val_len
        
        # Create header
        header = " | ".join(col.ljust(col_widths[col]) for col in columns)
        separator = "-" * len(header)
        
        # Create rows
        rows = []
        for row in results:
            formatted_row = " | ".join(str(row.get(col, "")).ljust(col_widths[col]) for col in columns)
            rows.append(formatted_row)
        
        # Combine all parts
        table = f"{header}\n{separator}\n" + "\n".join(rows)
        
        # Truncate if too many rows
        if len(rows) > 20:
            truncated_rows = rows[:20]
            table = f"{header}\n{separator}\n" + "\n".join(truncated_rows) + f"\n... (总共 {len(results)} 行，只显示前 20 行)"
        
        return table
    
    def _extract_tables_from_query(self, query: str, tables: List[Dict]) -> List[str]:
        """Extract table names referenced in an SQL query"""
        sources = []
        table_names = [table["table_name"] for table in tables]
        
        for table_name in table_names:
            # Simple case-insensitive search for table name
            if table_name.lower() in query.lower():
                sources.append(table_name)
        
        return sources 