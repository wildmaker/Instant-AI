import axios from 'axios';

interface KnowledgeBaseCreateParams {
  name: string;
  description?: string;
}

// 模拟 API 响应
const mockCreateResponse = (payload: KnowledgeBaseCreateParams) => {
  return {
    id: `kb-${Date.now()}`,
    ...payload,
    createdAt: new Date().toISOString(),
  };
};

// 模拟文件上传响应
const mockUploadResponse = (kbId: string, file: File) => {
  return {
    id: `file-${Date.now()}`,
    knowledgeBaseId: kbId,
    name: file.name,
    size: file.size,
    type: file.type,
    createdAt: new Date().toISOString(),
  };
};

export const knowledgeApi = {
  async create(payload: KnowledgeBaseCreateParams) {
    // 模拟 API 调用
    // 实际项目中应该使用 axios 调用后端 API
    // const { data } = await axios.post('/api/knowledge-bases', payload);
    // return data;
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockCreateResponse(payload);
  },
  
  async uploadFile(kbId: string, file: File, onProgress?: (progress: number) => void) {
    // 模拟上传进度
    if (onProgress) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        onProgress(progress);
        if (progress >= 100) clearInterval(interval);
      }, 300);
    }
    
    // 模拟 API 调用
    // 实际项目中应该使用 axios 调用后端 API
    // const formData = new FormData();
    // formData.append('file', file);
    // const { data } = await axios.post(`/api/knowledge-bases/${kbId}/files`, formData, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data'
    //   },
    //   onUploadProgress: (progressEvent) => {
    //     if (onProgress && progressEvent.total) {
    //       onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
    //     }
    //   }
    // });
    // return data;
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    return mockUploadResponse(kbId, file);
  }
};