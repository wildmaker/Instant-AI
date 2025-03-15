import os
import pandas as pd
import PyPDF2
import docx
from typing import Dict, List, Optional, Any
from sql_query_engine import SQLQueryEngine

class DocumentProcessor:
    """Process uploaded documents and extract contents for querying"""
    
    def __init__(self, file_path: str, kb_id: str = None, file_id: str = None):
        self.file_path = file_path
        self.file_extension = os.path.splitext(file_path)[1].lower()
        self.kb_id = kb_id
        self.file_id = file_id
        self.sql_engine = SQLQueryEngine()
        
    def extract_text(self) -> str:
        """Extract text from the document based on file type"""
        if self.file_extension in ['.csv', '.xlsx', '.xls']:
            return self.extract_from_tabular()
        elif self.file_extension == '.pdf':
            return self.extract_from_pdf()
        elif self.file_extension in ['.docx', '.doc']:
            return self.extract_from_word()
        elif self.file_extension == '.txt':
            return self.extract_from_text()
        else:
            raise ValueError(f"Unsupported file type: {self.file_extension}")
    
    def process_for_knowledge_base(self) -> Dict[str, Any]:
        """Process document and prepare it for the knowledge base"""
        result = {
            "text": self.extract_text(),
            "metadata": {}
        }
        
        # Additional processing for tabular files
        if self.file_extension in ['.csv', '.xlsx', '.xls'] and self.kb_id and self.file_id:
            try:
                # Process for SQL queries
                table_metadata = self.sql_engine.process_tabular_file(
                    kb_id=self.kb_id,
                    file_path=self.file_path,
                    file_id=self.file_id
                )
                result["metadata"]["tables"] = table_metadata
                result["metadata"]["is_tabular"] = True
            except Exception as e:
                print(f"Warning: Failed to process tabular file for SQL: {e}")
        
        return result
    
    def extract_from_tabular(self) -> str:
        """Extract data from CSV/Excel files"""
        try:
            if self.file_extension == '.csv':
                df = pd.read_csv(self.file_path)
            else:
                # For Excel, combine all sheets
                xls = pd.ExcelFile(self.file_path)
                sheets_text = []
                
                for sheet_name in xls.sheet_names:
                    sheet_df = pd.read_excel(self.file_path, sheet_name=sheet_name)
                    sheets_text.append(f"Sheet: {sheet_name}\n{sheet_df.to_string()}")
                
                return "\n\n".join(sheets_text)
            
            # Convert dataframe to string representation
            return df.to_string()
        except Exception as e:
            raise Exception(f"Error extracting data from tabular file: {e}")
    
    def extract_from_pdf(self) -> str:
        """Extract text from PDF files"""
        try:
            text = ""
            with open(self.file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                for page_num in range(len(reader.pages)):
                    text += reader.pages[page_num].extract_text() + "\n"
            return text
        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {e}")
    
    def extract_from_word(self) -> str:
        """Extract text from Word documents"""
        try:
            doc = docx.Document(self.file_path)
            return "\n".join([para.text for para in doc.paragraphs])
        except Exception as e:
            raise Exception(f"Error extracting text from Word document: {e}")
    
    def extract_from_text(self) -> str:
        """Extract text from plain text files"""
        try:
            with open(self.file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except UnicodeDecodeError:
            # Try different encoding if UTF-8 fails
            try:
                with open(self.file_path, 'r', encoding='gbk') as file:
                    return file.read()
            except Exception as e:
                raise Exception(f"Error reading text file: {e}") 