import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Tabs, Card, List, Button, Popconfirm, Empty, message } from 'antd';
import { FileTextOutlined, DeleteOutlined, EyeOutlined, LeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import FileUpload from './FileUpload';
import ChatInterface from './ChatInterface';

const { Content, Sider } = Layout;
const { TabPane } = Tabs;

export default function KnowledgeBaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [knowledgeBase, setKnowledgeBase] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch knowledge base details
    const fetchKnowledgeBase = async () => {
      try {
        const response = await fetch(`/api/knowledge-bases/${id}`);
        if (!response.ok) throw new Error('获取知识库失败');
        const data = await response.json();
        setKnowledgeBase(data);
      } catch (error) {
        console.error('Error fetching knowledge base:', error);
        message.error('获取知识库失败');
      }
    };

    // Fetch files
    const fetchFiles = async () => {
      try {
        const response = await fetch(`/api/knowledge-bases/${id}/files`);
        if (!response.ok) throw new Error('获取文件列表失败');
        const data = await response.json();
        setFiles(data);
      } catch (error) {
        console.error('Error fetching files:', error);
        message.error('获取文件列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchKnowledgeBase();
    fetchFiles();
  }, [id]);

  const handleDeleteFile = async (fileId) => {
    try {
      const response = await fetch(`/api/knowledge-bases/${id}/files/${fileId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('删除文件失败');
      
      // Filter out the deleted file
      setFiles(files.filter(file => file.id !== fileId));
      message.success('文件已删除');
    } catch (error) {
      console.error('Error deleting file:', error);
      message.error('删除文件失败');
    }
  };

  const handlePreviewFile = (file) => {
    // Open file preview in a new tab
    window.open(`/api/knowledge-bases/${id}/files/${file.id}/preview`, '_blank');
  };

  const getFileIcon = (type) => {
    switch(type) {
      case 'pdf':
        return <FileTextOutlined style={{ color: '#ff4d4f' }} />;
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileTextOutlined style={{ color: '#52c41a' }} />;
      case 'docx':
      case 'doc':
      case 'txt':
        return <FileTextOutlined style={{ color: '#1890ff' }} />;
      default:
        return <FileTextOutlined />;
    }
  };

  const handleFileUploaded = (newFile) => {
    setFiles(prev => [...prev, newFile]);
  };

  if (loading) {
    return <div style={{ padding: 24, textAlign: 'center' }}>加载中...</div>;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={350} theme="light" style={{ padding: '16px 0' }}>
        <div style={{ padding: '0 16px', marginBottom: 16 }}>
          <Button 
            icon={<LeftOutlined />} 
            onClick={() => navigate('/')}
            style={{ marginBottom: 16 }}
          >
            返回知识库列表
          </Button>
          <h2>{knowledgeBase?.name || '知识库详情'}</h2>
          <p>创建时间: {knowledgeBase?.created_at || '-'}</p>
        </div>
        
        <div style={{ padding: '0 16px' }}>
          <h3>文件管理</h3>
          
          <FileUpload 
            knowledgeBaseId={id} 
            onFileUploaded={handleFileUploaded}
          />
          
          <Card title="已上传文件" size="small" style={{ marginTop: 16 }}>
            {files.length === 0 ? (
              <Empty description="暂无文件" />
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={files}
                renderItem={file => (
                  <List.Item
                    actions={[
                      <Button 
                        icon={<EyeOutlined />} 
                        size="small"
                        onClick={() => handlePreviewFile(file)}
                      >
                        预览
                      </Button>,
                      <Popconfirm
                        title="确定要删除该文件吗？"
                        onConfirm={() => handleDeleteFile(file.id)}
                        okText="是"
                        cancelText="否"
                      >
                        <Button icon={<DeleteOutlined />} size="small" danger>
                          删除
                        </Button>
                      </Popconfirm>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={getFileIcon(file.type)}
                      title={file.name}
                      description={`${file.size.toFixed(2)} MB · 上传于 ${file.uploaded_at}`}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </div>
      </Sider>
      
      <Content style={{ padding: 24 }}>
        <ChatInterface knowledgeBaseId={id} />
      </Content>
    </Layout>
  );
} 