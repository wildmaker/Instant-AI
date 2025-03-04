import os
import json
import uuid
import shutil
from datetime import datetime
from typing import List, Dict, Optional

class KnowledgeBaseManager:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.knowledge_bases_file = os.path.join(data_dir, "knowledge_bases.json")
        self.files_dir = os.path.join(data_dir, "files")
        
        # Ensure directories exist
        os.makedirs(self.data_dir, exist_ok=True)
        os.makedirs(self.files_dir, exist_ok=True)
        
        # Load existing knowledge bases
        self.knowledge_bases = self._load_knowledge_bases()
    
    def _load_knowledge_bases(self) -> List[Dict]:
        if os.path.exists(self.knowledge_bases_file):
            with open(self.knowledge_bases_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    
    def _save_knowledge_bases(self) -> None:
        with open(self.knowledge_bases_file, 'w', encoding='utf-8') as f:
            json.dump(self.knowledge_bases, f, ensure_ascii=False, indent=2)
    
    def get_all_knowledge_bases(self) -> List[Dict]:
        return self.knowledge_bases
    
    def get_knowledge_base(self, kb_id: str) -> Optional[Dict]:
        for kb in self.knowledge_bases:
            if kb["id"] == kb_id:
                return kb
        return None
    
    def create_knowledge_base(self, name: str) -> Dict:
        kb_id = str(uuid.uuid4())
        kb_dir = os.path.join(self.files_dir, kb_id)
        os.makedirs(kb_dir, exist_ok=True)
        
        new_kb = {
            "id": kb_id,
            "name": name,
            "created_at": datetime.now().isoformat(),
            "document_count": 0,
            "files": []
        }
        
        self.knowledge_bases.append(new_kb)
        self._save_knowledge_bases()
        
        return new_kb
    
    def update_knowledge_base(self, kb_id: str, name: str) -> Optional[Dict]:
        kb = self.get_knowledge_base(kb_id)
        if not kb:
            return None
        
        kb["name"] = name
        self._save_knowledge_bases()
        
        return kb
    
    def delete_knowledge_base(self, kb_id: str) -> bool:
        kb = self.get_knowledge_base(kb_id)
        if not kb:
            return False
        
        # Remove from list
        self.knowledge_bases = [kb for kb in self.knowledge_bases if kb["id"] != kb_id]
        self._save_knowledge_bases()
        
        # Delete directory with files
        kb_dir = os.path.join(self.files_dir, kb_id)
        if os.path.exists(kb_dir):
            shutil.rmtree(kb_dir)
        
        return True
    
    def get_files(self, kb_id: str) -> List[Dict]:
        kb = self.get_knowledge_base(kb_id)
        return kb.get("files", []) if kb else []
    
    def add_file(self, kb_id: str, file_name: str, file_path: str, file_type: str, file_size: float) -> Optional[Dict]:
        kb = self.get_knowledge_base(kb_id)
        if not kb:
            return None
        
        file_id = str(uuid.uuid4())
        file_info = {
            "id": file_id,
            "name": file_name,
            "type": file_type,
            "size": file_size,
            "path": file_path,
            "uploaded_at": datetime.now().isoformat()
        }
        
        if "files" not in kb:
            kb["files"] = []
        
        kb["files"].append(file_info)
        kb["document_count"] = len(kb["files"])
        
        self._save_knowledge_bases()
        
        return file_info
    
    def delete_file(self, kb_id: str, file_id: str) -> bool:
        kb = self.get_knowledge_base(kb_id)
        if not kb or "files" not in kb:
            return False
        
        # Find file
        file_info = None
        for file in kb["files"]:
            if file["id"] == file_id:
                file_info = file
                break
        
        if not file_info:
            return False
        
        # Remove file from storage
        file_path = file_info["path"]
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Remove from list
        kb["files"] = [f for f in kb["files"] if f["id"] != file_id]
        kb["document_count"] = len(kb["files"])
        
        self._save_knowledge_bases()
        
        return True
    
    def get_file(self, kb_id: str, file_id: str) -> Optional[Dict]:
        kb = self.get_knowledge_base(kb_id)
        if not kb or "files" not in kb:
            return None
        
        for file in kb["files"]:
            if file["id"] == file_id:
                return file
        
        return None 