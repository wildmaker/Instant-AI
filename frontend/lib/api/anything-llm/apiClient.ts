import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// 定义API基础配置
const BASE_URL = process.env.NEXT_PUBLIC_ANYTHING_LLM_API_URL || 'http://localhost:3001'
const API_BASE_URL = `${BASE_URL}/api/v1`
const API_KEY = process.env.NEXT_PUBLIC_ANYTHING_LLM_API_KEY || ''

// 创建axios实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30秒超时
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 添加API密钥到请求头(如果配置了)
    if (API_KEY) {
      config.headers.Authorization = `Bearer ${API_KEY}`
    }
    
    // 添加 API 版本
    config.headers['X-API-Version'] = '2.0.3';
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    const response = error.response
    if (response) {
      // 处理特定错误
      console.error('API错误:', response.status, response.data)
    } else {
      // 网络错误或请求被取消
      console.error('API请求失败:', error.message)
    }
    return Promise.reject(error)
  }
)

// API客户端类
class AnythingLLMApiClient {
  private instance: AxiosInstance

  constructor() {
    this.instance = axiosInstance
  }

  // 检查API服务状态
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.instance.get('/health')
      return response.status === 200
    } catch (error) {
      console.error('API健康检查失败:', error)
      return false
    }
  }

  // GET请求
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.get(url, config)
      return response.data
    } catch (error) {
      console.error(`GET请求失败 [${url}]:`, error)
      throw error
    }
  }

  // POST请求
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.post(url, data, config)
      return response.data
    } catch (error) {
      console.error(`POST请求失败 [${url}]:`, error)
      throw error
    }
  }

  // PUT请求
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.put(url, data, config)
      return response.data
    } catch (error) {
      console.error(`PUT请求失败 [${url}]:`, error)
      throw error
    }
  }

  // DELETE请求
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.delete(url, config)
      return response.data
    } catch (error) {
      console.error(`DELETE请求失败 [${url}]:`, error)
      throw error
    }
  }

  // 文件上传
  async uploadFile<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    try {
      const uploadConfig: AxiosRequestConfig = {
        ...config,
        headers: {
          ...config?.headers,
          'Content-Type': 'multipart/form-data',
        },
      }

      const response: AxiosResponse<T> = await this.instance.post(url, formData, uploadConfig)
      return response.data
    } catch (error) {
      console.error(`文件上传失败 [${url}]:`, error)
      throw error
    }
  }

  // 获取流式响应的完整URL
  getStreamUrl(endpoint: string): string {
    // 移除前导斜杠以避免双斜杠
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint
    // 使用BASE_URL为基础，并添加/api/v1前缀
    return `${BASE_URL}/api/v1/${cleanEndpoint}`
  }
}

// 导出API客户端实例
export const apiClient = new AnythingLLMApiClient()