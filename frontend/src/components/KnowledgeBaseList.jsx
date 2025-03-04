import React, { useState, useEffect } from 'react';
import { Card, Button, List, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EnterOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function KnowledgeBaseList() {
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, we would fetch from backend
    // For now, use mock data
    setKnowledgeBases([
      { id: '1', name: '产品规格知识库', createdAt: '2023-05-15', documentCount: 5 },
      { id: '2', name: '技术文档', createdAt: '2023-06-20', documentCount: 3 },
    ]);
    setLoading(false);
  }, []);

  const handleCreate = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (kb) => {
    setEditingId(kb.id);
    form.setFieldsValue({ name: kb.name });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      // In a real app, call API to delete
      setKnowledgeBases(knowledgeBases.filter(kb => kb.id !== id));
      message.success('知识库已删除');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingId) {
        // Update existing knowledge base
        setKnowledgeBases(
          knowledgeBases.map(kb => 
            kb.id === editingId 
              ? { ...kb, name: values.name } 
              : kb
          )
        );
        message.success('知识库已更新');
      } else {
        // Create new knowledge base
        const newKb = {
          id: Date.now().toString(), // mock id
          name: values.name,
          createdAt: new Date().toISOString().split('T')[0],
          documentCount: 0
        };
        setKnowledgeBases([...knowledgeBases, newKb]);
        message.success('知识库已创建');
      }
      
      setModalVisible(false);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const openKnowledgeBase = (id) => {
    navigate(`/knowledge-base/${id}`);
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>知识库管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建知识库
        </Button>
      </div>
      
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={knowledgeBases}
        loading={loading}
        renderItem={(kb) => (
          <List.Item>
            <Card 
              title={kb.name} 
              hoverable 
              actions={[
                <EditOutlined key="edit" onClick={() => handleEdit(kb)} />,
                <Popconfirm
                  title="确定要删除该知识库吗？"
                  onConfirm={() => handleDelete(kb.id)}
                  okText="是"
                  cancelText="否"
                >
                  <DeleteOutlined key="delete" />
                </Popconfirm>,
                <EnterOutlined key="enter" onClick={() => openKnowledgeBase(kb.id)} />
              ]}
            >
              <p>创建时间：{kb.createdAt}</p>
              <p>文档数量：{kb.documentCount}</p>
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title={editingId ? "编辑知识库" : "新建知识库"}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="知识库名称"
            rules={[{ required: true, message: '请输入知识库名称' }]}
          >
            <Input placeholder="请输入知识库名称" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}