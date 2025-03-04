import os
import pandas as pd
import PyPDF2
import docx
from typing import Dict, List, Optional

class DocumentProcessor:
    """Process uploaded documents and extract contents for querying"""
    
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.file_extension = os.path.splitext(file_path)[1].lower()
        
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
    
    def extract_from_tabular(self) -> str:
        """Extract data from CSV/Excel files"""
        try:
            if self.file_extension == '.csv':
                df = pd.read_csv(self.file_path)
            else:
                df = pd.read_excel(self.file_path)
            
            # Convert dataframe to string representation
            return df.to_string()
        except Exception as e:
            raise Exception(f"Error extracting data from tabular file: {e}")
    
    def extract_from_pdf(self) -> str:
        """Extract text from PDF files"""
        try:
            text = ""
            with open(self.file_path, 'rb') as file:
                reader = PyPDF2.PdfFileReader(file)
                for page_num in range(reader.numPages):
                    text += reader.getPage(page_num).extractText() + "\n"
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