import os
import json
from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
from knowledge_base import KnowledgeBaseManager
from chat_engine import ChatEngine
from llm_interface.llm_selector import llm

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'data/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max upload

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize knowledge base manager
kb_manager = KnowledgeBaseManager()
chat_engine = ChatEngine(kb_manager)

# Valid file extensions
ALLOWED_EXTENSIONS = {
    'pdf', 'doc', 'docx', 'txt', 'csv', 'xls', 'xlsx'
}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Knowledge base endpoints
@app.route('/api/knowledge-bases', methods=['GET'])
def get_knowledge_bases():
    knowledge_bases = kb_manager.get_all_knowledge_bases()
    return jsonify(knowledge_bases)

@app.route('/api/knowledge-bases', methods=['POST'])
def create_knowledge_base():
    data = request.json
    name = data.get('name')
    
    if not name:
        return jsonify({"error": "知识库名称不能为空"}), 400
    
    knowledge_base = kb_manager.create_knowledge_base(name)
    return jsonify(knowledge_base)

@app.route('/api/knowledge-bases/<kb_id>', methods=['GET'])
def get_knowledge_base(kb_id):
    knowledge_base = kb_manager.get_knowledge_base(kb_id)
    
    if not knowledge_base:
        return jsonify({"error": "知识库不存在"}), 404
    
    return jsonify(knowledge_base)

@app.route('/api/knowledge-bases/<kb_id>', methods=['PUT'])
def update_knowledge_base(kb_id):
    data = request.json
    name = data.get('name')
    
    if not name:
        return jsonify({"error": "知识库名称不能为空"}), 400
    
    knowledge_base = kb_manager.update_knowledge_base(kb_id, name)
    
    if not knowledge_base:
        return jsonify({"error": "知识库不存在"}), 404
    
    return jsonify(knowledge_base)

@app.route('/api/knowledge-bases/<kb_id>', methods=['DELETE'])
def delete_knowledge_base(kb_id):
    success = kb_manager.delete_knowledge_base(kb_id)
    
    if not success:
        return jsonify({"error": "知识库不存在"}), 404
    
    return jsonify({"message": "知识库已删除"})

# File management endpoints
@app.route('/api/knowledge-bases/<kb_id>/files', methods=['GET'])
def get_files(kb_id):
    files = kb_manager.get_files(kb_id)
    return jsonify(files)

@app.route('/api/knowledge-bases/<kb_id>/files', methods=['POST'])
def upload_file(kb_id):
    # Check if knowledge base exists
    kb = kb_manager.get_knowledge_base(kb_id)
    if not kb:
        return jsonify({"error": "知识库不存在"}), 404
    
    # Check if file was included
    if 'file' not in request.files:
        return jsonify({"error": "未找到文件"}), 400
    
    file = request.files['file']
    
    # Check if filename is empty
    if file.filename == '':
        return jsonify({"error": "未选择文件"}), 400
    
    # Check if file type is allowed
    if not allowed_file(file.filename):
        return jsonify({"error": "不支持的文件类型"}), 400
    
    # Save file
    filename = secure_filename(file.filename)
    kb_dir = os.path.join(app.config['UPLOAD_FOLDER'], kb_id)
    os.makedirs(kb_dir, exist_ok=True)
    
    file_path = os.path.join(kb_dir, filename)
    file.save(file_path)
    
    # Get file type and size
    file_extension = filename.rsplit('.', 1)[1].lower()
    file_size = os.path.getsize(file_path) / 1024 / 1024  # Convert to MB
    
    # Add file to knowledge base
    file_info = kb_manager.add_file(
        kb_id, 
        filename, 
        file_path, 
        file_extension, 
        file_size
    )
    
    return jsonify(file_info)

@app.route('/api/knowledge-bases/<kb_id>/files/<file_id>', methods=['DELETE'])
def delete_file(kb_id, file_id):
    success = kb_manager.delete_file(kb_id, file_id)
    
    if not success:
        return jsonify({"error": "文件不存在"}), 404
    
    return jsonify({"message": "文件已删除"})

@app.route('/api/knowledge-bases/<kb_id>/files/<file_id>/preview', methods=['GET'])
def preview_file(kb_id, file_id):
    file_info = kb_manager.get_file(kb_id, file_id)
    if not file_info:
        return jsonify({"error": "文件不存在"}), 404
    
    # Check if file exists
    file_path = file_info["path"]
    if not os.path.exists(file_path):
        return jsonify({"error": "文件不存在"}), 404
    
    # Return file for download/preview
    return send_file(file_path, as_attachment=True, download_name=file_info["name"])

# Chat endpoint
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    
    # Extract parameters
    question = data.get('question')
    kb_id = data.get('knowledgeBaseId')
    conversation_id = data.get('conversationId')
    history = data.get('history', [])
    
    if not question:
        return jsonify({"error": "问题不能为空"}), 400
    
    if not kb_id:
        return jsonify({"error": "知识库ID不能为空"}), 400
    
    # Process query
    result = chat_engine.query(kb_id, question, conversation_id, history)
    
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True) 