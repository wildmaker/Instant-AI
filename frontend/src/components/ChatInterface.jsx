import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, List, Tag, Typography, Spin, Divider, Space } from 'antd';
import { SendOutlined, SyncOutlined } from '@ant-design/icons';

const { Text } = Typography;

const suggestedQueries = [
  "查询 YFR-150EX 的底阀离地高度",
  "SLR-50 的搅拌桨尺寸是多少？",
  "统计材质为玻璃的产品型号种类数",
  "查找价格低于 2000 元的设备型号"
];

export default function ChatInterface({ knowledgeBaseId }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      content: inputText,
      isBot: false,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      // In a real implementation, we would send the conversation history for context
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: inputText,
          knowledgeBaseId,
          conversationId,
          history: messages.map(m => ({
            role: m.isBot ? 'assistant' : 'user',
            content: m.content
          }))
        })
      });

      if (!response.ok) throw new Error('请求失败');

      const data = await response.json();
      
      // If this is a new conversation, store the ID
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        content: data.answer,
        isBot: true,
        timestamp: new Date().toISOString(),
        sources: data.sources || [] // Document sources, if provided
      }]);

    } catch (error) {
      console.error('API请求错误:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        content: '请求失败，请稍后重试',
        isBot: true,
        timestamp: new Date().toISOString(),
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuery = (query) => {
    setInputText(query);
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderSources = (sources) => {
    if (!sources || sources.length === 0) return null;
    
    return (
      <div style={{ marginTop: 8 }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>来源文档:</Text>
        <div style={{ marginTop: 4 }}>
          {sources.map((source, index) => (
            <Tag key={index} color="blue">{source}</Tag>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card 
      title={<div>知识库问答 <Text type="secondary" style={{ fontSize: '14px' }}>({knowledgeBaseId ? `知识库 #${knowledgeBaseId}` : '通用模式'})</Text></div>}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      {messages.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: 40, marginBottom: 40 }}>
          <h3>开始你的提问</h3>
          <p style={{ color: '#888' }}>你可以查询知识库中的信息，支持自然语言提问</p>
          
          <Divider>推荐问题</Divider>
          
          <Space wrap>
            {suggestedQueries.map((query, index) => (
              <Tag 
                key={index} 
                color="blue" 
                style={{ cursor: 'pointer', padding: '4px 8px', margin: '4px' }}
                onClick={() => handleSuggestedQuery(query)}
              >
                {query}
              </Tag>
            ))}
          </Space>
        </div>
      ) : (
        <List
          className="chat-message-list"
          style={{ 
            overflowY: 'auto',
            flex: 1,
            padding: '8px 0'
          }}
          dataSource={messages}
          renderItem={item => (
            <List.Item style={{ 
              justifyContent: item.isBot ? 'flex-start' : 'flex-end',
              padding: '8px 16px'
            }}>
              <div style={{ 
                maxWidth: '80%',
                background: item.isBot ? '#f0f0f0' : '#1890ff',
                color: item.isBot ? 'rgba(0, 0, 0, 0.85)' : '#fff',
                padding: '12px 16px',
                borderRadius: '12px',
                position: 'relative'
              }}>
                <div>{item.content}</div>
                {item.isBot && renderSources(item.sources)}
                <div style={{ 
                  fontSize: '10px', 
                  marginTop: 4,
                  color: item.isBot ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.7)',
                  textAlign: 'right'
                }}>
                  {formatMessageTime(item.timestamp)}
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
      <div ref={messagesEndRef} />
      
      <div style={{ marginTop: 16, display: 'flex' }}>
        <Input.TextArea
          placeholder="输入问题..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          autoSize={{ minRows: 1, maxRows: 4 }}
          disabled={loading}
          style={{ flex: 1 }}
        />
        <Button 
          type="primary" 
          onClick={handleSend} 
          style={{ marginLeft: 8 }}
          disabled={!inputText.trim() || loading}
          icon={loading ? <SyncOutlined spin /> : <SendOutlined />}
        />
      </div>
    </Card>
  );
}