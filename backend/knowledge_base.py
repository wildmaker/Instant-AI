import os
import json
import uuid
import shutil
from typing import Dict, List, Optional, Any
from document_processor import DocumentProcessor

class KnowledgeBaseManager:
    """Manage knowledge bases and their documents"""
    
    def __init__(self, data_dir: str = 'data'):
        self.data_dir = data_dir
        self.kb_file = os.path.join(data_dir, 'knowledge_bases.json')
        
        # Create data directory if it doesn't exist
        os.makedirs(data_dir, exist_ok=True)
        
        # Create knowledge bases file if it doesn't exist
        if not os.path.exists(self.kb_file):
            with open(self.kb_file, 'w', encoding='utf-8') as f:
                json.dump([], f)
    
    def get_all_knowledge_bases(self) -> List[Dict[str, Any]]:
        """Get all knowledge bases"""
        try:
            with open(self.kb_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading knowledge bases: {e}")
            return []
    
    def get_knowledge_base(self, kb_id: str) -> Optional[Dict[str, Any]]:
        """Get a knowledge base by ID"""
        knowledge_bases = self.get_all_knowledge_bases()
        for kb in knowledge_bases:
            if kb['id'] == kb_id:
                return kb
        return None
    
    def create_knowledge_base(self, name: str) -> Dict[str, Any]:
        """Create a new knowledge base"""
        knowledge_bases = self.get_all_knowledge_bases()
        
        # Check if name already exists
        for kb in knowledge_bases:
            if kb['name'] == name:
                raise ValueError(f"知识库名称 '{name}' 已存在")
        
        # Create new knowledge base
        kb_id = str(uuid.uuid4())
        created_at = self._get_current_timestamp()
        
        new_kb = {
            'id': kb_id,
            'name': name,
            'created_at': created_at,
            'files': []
        }
        
        # Add to list and save
        knowledge_bases.append(new_kb)
        self._save_knowledge_bases(knowledge_bases)
        
        # Create directory for this knowledge base's files
        kb_dir = os.path.join(self.data_dir, 'uploads', kb_id)
        os.makedirs(kb_dir, exist_ok=True)
        
        return new_kb
    
    def update_knowledge_base(self, kb_id: str, name: str) -> Optional[Dict[str, Any]]:
        """Update a knowledge base"""
        knowledge_bases = self.get_all_knowledge_bases()
        
        # Check if name already exists in other knowledge bases
        for kb in knowledge_bases:
            if kb['name'] == name and kb['id'] != kb_id:
                raise ValueError(f"知识库名称 '{name}' 已存在")
        
        for i, kb in enumerate(knowledge_bases):
            if kb['id'] == kb_id:
                knowledge_bases[i]['name'] = name
                self._save_knowledge_bases(knowledge_bases)
                return knowledge_bases[i]
        
        return None
    
    def delete_knowledge_base(self, kb_id: str) -> bool:
        """Delete a knowledge base and its files"""
        knowledge_bases = self.get_all_knowledge_bases()
        
        for i, kb in enumerate(knowledge_bases):
            if kb['id'] == kb_id:
                # Remove from list
                del knowledge_bases[i]
                self._save_knowledge_bases(knowledge_bases)
                
                # Delete files directory
                kb_dir = os.path.join(self.data_dir, 'uploads', kb_id)
                if os.path.exists(kb_dir):
                    shutil.rmtree(kb_dir)
                
                # Delete SQLite database file if exists
                db_dir = os.path.join(self.data_dir, 'databases')
                db_file = os.path.join(db_dir, f"{kb_id}.db")
                if os.path.exists(db_file):
                    os.remove(db_file)
                
                return True
        
        return False
    
    def get_files(self, kb_id: str) -> List[Dict[str, Any]]:
        """Get all files in a knowledge base"""
        kb = self.get_knowledge_base(kb_id)
        if not kb:
            return []
        
        return kb.get('files', [])
    
    def get_file(self, kb_id: str, file_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific file from a knowledge base"""
        files = self.get_files(kb_id)
        
        for file in files:
            if file['id'] == file_id:
                return file
        
        return None
    
    def add_file(self, kb_id: str, filename: str, file_path: str, 
                 file_type: str, file_size: float) -> Dict[str, Any]:
        """
        Add a file to a knowledge base
        Process the file and store its contents
        """
        knowledge_bases = self.get_all_knowledge_bases()
        
        # Find the knowledge base
        kb_index = -1
        for i, kb in enumerate(knowledge_bases):
            if kb['id'] == kb_id:
                kb_index = i
                break
        
        if kb_index == -1:
            raise ValueError(f"知识库 ID {kb_id} 不存在")
        
        # Create file entry
        file_id = str(uuid.uuid4())
        uploaded_at = self._get_current_timestamp()
        
        file_info = {
            'id': file_id,
            'name': filename,
            'path': file_path,
            'type': file_type,
            'size': file_size,
            'uploaded_at': uploaded_at
        }
        
        # Process the file for the knowledge base
        try:
            processor = DocumentProcessor(file_path, kb_id, file_id)
            result = processor.process_for_knowledge_base()
            
            # Store any additional metadata from processing
            if result.get("metadata"):
                file_info["metadata"] = result["metadata"]
            
            # Add to knowledge base
            knowledge_bases[kb_index]['files'].append(file_info)
            self._save_knowledge_bases(knowledge_bases)
            
            return file_info
        
        except Exception as e:
            # Delete the file if processing fails
            if os.path.exists(file_path):
                os.remove(file_path)
            
            raise Exception(f"文件处理失败：{str(e)}")
    
    def delete_file(self, kb_id: str, file_id: str) -> bool:
        """Delete a file from a knowledge base"""
        knowledge_bases = self.get_all_knowledge_bases()
        
        # Find the knowledge base
        kb_index = -1
        for i, kb in enumerate(knowledge_bases):
            if kb['id'] == kb_id:
                kb_index = i
                break
        
        if kb_index == -1:
            return False
        
        # Find the file
        file_index = -1
        file_path = None
        
        for i, file in enumerate(knowledge_bases[kb_index]['files']):
            if file['id'] == file_id:
                file_index = i
                file_path = file.get('path')
                break
        
        if file_index == -1:
            return False
        
        # Remove file entry
        del knowledge_bases[kb_index]['files'][file_index]
        self._save_knowledge_bases(knowledge_bases)
        
        # Delete the file
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
        
        return True
    
    def _save_knowledge_bases(self, knowledge_bases: List[Dict[str, Any]]) -> None:
        """Save knowledge bases to file"""
        with open(self.kb_file, 'w', encoding='utf-8') as f:
            json.dump(knowledge_bases, f, ensure_ascii=False, indent=2)
    
    def _get_current_timestamp(self) -> str:
        """Get current timestamp in ISO format"""
        from datetime import datetime
        return datetime.now().isoformat() 