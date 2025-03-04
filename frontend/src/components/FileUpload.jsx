import React, { useState } from 'react';
import { Upload, Button, message, Progress, List, Space } from 'antd';
import { UploadOutlined, FileTextOutlined, FilePdfOutlined, FileExcelOutlined, FileUnknownOutlined } from '@ant-design/icons';

export default function FileUpload({ knowledgeBaseId, onFileUploaded = () => {} }) {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (['pdf'].includes(extension)) {
      return <FilePdfOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />;
    } else if (['doc', 'docx', 'txt'].includes(extension)) {
      return <FileTextOutlined style={{ fontSize: '24px', color: '#1890ff' }} />;
    } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
      return <FileExcelOutlined style={{ fontSize: '24px', color: '#52c41a' }} />;
    } else {
      return <FileUnknownOutlined style={{ fontSize: '24px', color: '#faad14' }} />;
    }
  };

  const props = {
    onRemove: file => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: file => {
      // Check file type
      const acceptedTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      
      const isAcceptedType = acceptedTypes.includes(file.type);
      if (!isAcceptedType) {
        message.error(`${file.name} 不是支持的文件类型`);
        return Upload.LIST_IGNORE;
      }
      
      // Check file size (10MB limit)
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('文件大小不能超过10MB');
        return Upload.LIST_IGNORE;
      }
      
      setFileList([...fileList, file]);
      return false; // Prevent auto upload
    },
    fileList,
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('请先选择文件');
      return;
    }

    setUploading(true);
    
    // Initialize progress for each file
    const initialProgress = {};
    fileList.forEach(file => {
      initialProgress[file.uid] = 0;
    });
    setUploadProgress(initialProgress);

    // Upload files one by one
    for (let file of fileList) {
      try {
        // Create a FormData object
        const formData = new FormData();
        formData.append('file', file);
        
        // Set up progress tracking
        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.floor((event.loaded / event.total) * 100);
            setUploadProgress(prev => ({
              ...prev,
              [file.uid]: percent
            }));
          }
        };
        
        // Handle response
        const response = await new Promise((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                resolve(JSON.parse(xhr.responseText));
              } catch (e) {
                reject(new Error('解析响应失败'));
              }
            } else {
              reject(new Error(`上传失败: ${xhr.status}`));
            }
          };
          
          xhr.onerror = () => reject(new Error('网络错误'));
          
          xhr.open('POST', `/api/knowledge-bases/${knowledgeBaseId}/files`);
          xhr.send(formData);
        });
        
        // Notify parent component about successfully uploaded file
        onFileUploaded(response);
        
        message.success(`${file.name} 上传成功`);
      } catch (error) {
        console.error('Upload error:', error);
        message.error(`${file.name} 上传失败: ${error.message}`);
      }
    }
    
    // Clear file list when all uploads are done
    setFileList([]);
    setUploading(false);
    setUploadProgress({});
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Upload {...props} showUploadList={false}>
          <Button icon={<UploadOutlined />}>选择文件</Button>
        </Upload>
        
        <Button
          type="primary"
          onClick={handleUpload}
          disabled={fileList.length === 0}
          loading={uploading}
          style={{ marginTop: 16 }}
        >
          {uploading ? '上传中' : '开始上传'}
        </Button>
        
        <List
          itemLayout="horizontal"
          dataSource={fileList}
          renderItem={file => (
            <List.Item
              actions={[
                <Button 
                  size="small" 
                  danger 
                  disabled={uploading}
                  onClick={() => props.onRemove(file)}
                >
                  移除
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={getFileIcon(file.name)}
                title={file.name}
                description={`${(file.size/1024/1024).toFixed(2)} MB`}
              />
              {uploading && uploadProgress[file.uid] !== undefined && (
                <Progress percent={uploadProgress[file.uid]} status="active" />
              )}
            </List.Item>
          )}
        />
      </Space>
    </div>
  );
} 