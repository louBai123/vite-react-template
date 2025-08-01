import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import {
  ApiResponse,
  PaginatedResponse,
  User,
  Workflow,
  Category,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  WorkflowCreateRequest,
  WorkflowUpdateRequest,
  WorkflowSearchParams,
  DashboardStats,
  CreatorStats,
  Review
} from '../types';

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// 创建axios实例
class ApiClient {
  public client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        // 添加认证token
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response;
      },
      (error: AxiosError<ApiResponse>) => {
        // 统一错误处理
        if (error.response?.status === 401) {
          // 清除token并跳转到登录页
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    // 从localStorage恢复token
    this.token = localStorage.getItem('auth_token');
  }

  // 设置认证token
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // 清除认证token
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // 获取当前token
  getToken(): string | null {
    return this.token;
  }

  // 通用请求方法
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    data?: any,
    params?: any
  ): Promise<T> {
    try {
      const response = await this.client.request<ApiResponse<T>>({
        method,
        url,
        data,
        params,
      });

      if (response.data.success) {
        return response.data.data as T;
      } else {
        throw new Error(response.data.message || '请求失败');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(error.response.data.message || '请求失败');
      }
      throw error;
    }
  }

  // GET请求
  async get<T>(url: string, params?: any): Promise<T> {
    return this.request<T>('GET', url, undefined, params);
  }

  // POST请求
  async post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>('POST', url, data);
  }

  // PUT请求
  async put<T>(url: string, data?: any): Promise<T> {
    return this.request<T>('PUT', url, data);
  }

  // DELETE请求
  async delete<T>(url: string): Promise<T> {
    return this.request<T>('DELETE', url);
  }
}

// 创建API客户端实例
const apiClient = new ApiClient();

// 认证相关API
export const authApi = {
  // 用户注册
  register: (data: RegisterRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  // 用户登录
  login: (data: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/login', data);
  },

  // 获取当前用户信息
  getCurrentUser: (): Promise<User> => {
    return apiClient.get<User>('/user/profile');
  },

  // 更新用户信息
  updateProfile: (data: Partial<User>): Promise<User> => {
    return apiClient.put<User>('/user/profile', data);
  },
};

// 工作流相关API
export const workflowApi = {
  // 获取工作流列表
  getWorkflows: (params: WorkflowSearchParams): Promise<PaginatedResponse<Workflow>> => {
    return apiClient.get<PaginatedResponse<Workflow>>('/workflows', params);
  },

  // 获取工作流详情
  getWorkflow: (id: number): Promise<Workflow> => {
    return apiClient.get<Workflow>(`/workflows/${id}`);
  },

  // 创建工作流
  createWorkflow: (data: WorkflowCreateRequest): Promise<Workflow> => {
    return apiClient.post<Workflow>('/workflows', data);
  },

  // 更新工作流
  updateWorkflow: (id: number, data: WorkflowUpdateRequest): Promise<Workflow> => {
    return apiClient.put<Workflow>(`/workflows/${id}`, data);
  },

  // 删除工作流
  deleteWorkflow: (id: number): Promise<void> => {
    return apiClient.delete<void>(`/workflows/${id}`);
  },

  // 搜索工作流
  searchWorkflows: (params: WorkflowSearchParams): Promise<PaginatedResponse<Workflow>> => {
    return apiClient.get<PaginatedResponse<Workflow>>('/search/workflows', params);
  },
};

// 分类相关API
export const categoryApi = {
  // 获取所有分类
  getCategories: (): Promise<Category[]> => {
    return apiClient.get<Category[]>('/categories');
  },

  // 获取分类详情
  getCategory: (id: number): Promise<Category> => {
    return apiClient.get<Category>(`/categories/${id}`);
  },
};

// 创作者相关API
export const creatorApi = {
  // 获取创作者的工作流
  getCreatorWorkflows: (params: WorkflowSearchParams): Promise<PaginatedResponse<Workflow>> => {
    return apiClient.get<PaginatedResponse<Workflow>>('/creator/workflows', params);
  },

  // 获取创作者统计数据
  getCreatorStats: (): Promise<CreatorStats> => {
    return apiClient.get<CreatorStats>('/creator/stats');
  },
};

// 管理员相关API
export const adminApi = {
  // 获取仪表盘统计数据
  getDashboardStats: (): Promise<DashboardStats> => {
    return apiClient.get<DashboardStats>('/admin/dashboard');
  },

  // 获取待审核工作流
  getPendingWorkflows: (params: WorkflowSearchParams): Promise<PaginatedResponse<Workflow>> => {
    return apiClient.get<PaginatedResponse<Workflow>>('/admin/workflows', {
      ...params,
      status: 'pending',
    });
  },

  // 审核工作流
  reviewWorkflow: (id: number, status: 'approved' | 'rejected', reason?: string): Promise<Workflow> => {
    return apiClient.put<Workflow>(`/admin/workflows/${id}/status`, { status, reason });
  },

  // 获取所有工作流（管理员）
  getAllWorkflows: (params: WorkflowSearchParams): Promise<PaginatedResponse<Workflow>> => {
    return apiClient.get<PaginatedResponse<Workflow>>('/admin/workflows', params);
  },
};

// 评价相关API
export const reviewApi = {
  // 获取工作流评价
  getWorkflowReviews: (workflowId: number, params?: { page?: number; pageSize?: number }): Promise<PaginatedResponse<Review>> => {
    return apiClient.get<PaginatedResponse<Review>>(`/workflows/${workflowId}/reviews`, params);
  },

  // 添加评价
  addReview: (workflowId: number, data: { rating: number; comment?: string }): Promise<Review> => {
    return apiClient.post<Review>(`/workflows/${workflowId}/reviews`, data);
  },

  // 更新评价
  updateReview: (reviewId: number, data: { rating: number; comment?: string }): Promise<Review> => {
    return apiClient.put<Review>(`/reviews/${reviewId}`, data);
  },

  // 删除评价
  deleteReview: (reviewId: number): Promise<void> => {
    return apiClient.delete<void>(`/reviews/${reviewId}`);
  },
};

// 文件上传API
export const uploadApi = {
  // 上传文件
  uploadFile: async (file: File, onProgress?: (progress: number) => void): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.client.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '上传失败');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(error.response.data.message || '上传失败');
      }
      throw error;
    }
  },

  // 上传多个文件
  uploadFiles: async (files: File[], onProgress?: (progress: number) => void): Promise<{ urls: string[] }> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await apiClient.client.post('/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '上传失败');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(error.response.data.message || '上传失败');
      }
      throw error;
    }
  },
};

// 导出API客户端实例
export { apiClient };

// 导出token管理方法
export const tokenManager = {
  setToken: (token: string) => apiClient.setToken(token),
  clearToken: () => apiClient.clearToken(),
  getToken: () => apiClient.getToken(),
};

// 默认导出所有API
export default {
  auth: authApi,
  workflow: workflowApi,
  category: categoryApi,
  creator: creatorApi,
  admin: adminApi,
  review: reviewApi,
  upload: uploadApi,
};