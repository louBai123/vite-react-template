// 数据库和API类型定义

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'creator' | 'admin' | 'advertiser';
  avatar_url?: string;
  balance: number;
  total_earnings: number;
  status: 'active' | 'suspended' | 'deleted';
  created_at: string;
  updated_at: string;
}

export interface Workflow {
  id: number;
  creator_id: number;
  title: string;
  description?: string;
  category_id: number;
  subcategory_id?: number;
  price: number;
  file_url: string;
  preview_images?: string[];
  tags?: string[];
  download_count: number;
  rating: number;
  rating_count: number;
  favorite_count: number;
  comment_count: number;
  status: 'pending' | 'approved' | 'rejected' | 'offline';
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  creator?: User;
  category?: Category;
}

export interface Category {
  id: number;
  name: string;
  parent_id?: number;
  description?: string;
  icon_url?: string;
  sort_order: number;
  is_active: boolean;
  children?: Category[];
}

export interface Transaction {
  id: number;
  user_id: number;
  workflow_id?: number;
  type: 'purchase' | 'recharge' | 'withdrawal' | 'commission';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  payment_id?: string;
  description?: string;
  created_at: string;
}

export interface Review {
  id: number;
  user_id: number;
  workflow_id: number;
  rating: number;
  comment?: string;
  status: 'active' | 'hidden' | 'deleted';
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Advertisement {
  id: number;
  advertiser_id: number;
  title: string;
  content?: string;
  image_url?: string;
  target_url?: string;
  position: 'banner' | 'sidebar' | 'detail' | 'search';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  status: 'pending' | 'active' | 'paused' | 'completed';
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

// API请求和响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  error?: {
    field?: string;
    reason: string;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// 认证相关类型
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: 'user' | 'creator' | 'advertiser';
}

export interface OAuthRegisterRequest {
  provider: 'github' | 'google';
  code: string;
  role?: 'user' | 'creator' | 'advertiser';
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  provider: 'github' | 'google';
}

export interface JWTPayload {
  userId: number;
  username: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

// 搜索和筛选类型
export interface WorkflowSearchParams {
  q?: string;
  category?: number;
  subcategory?: number;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sortBy?: 'latest' | 'popular' | 'rating' | 'price_asc' | 'price_desc';
  page?: number;
  pageSize?: number;
}

export interface WorkflowCreateRequest {
  title: string;
  description?: string;
  category_id: number;
  subcategory_id?: number;
  price: number;
  tags?: string[];
  file_url: string;
  preview_images?: string[];
}

export interface WorkflowUpdateRequest extends Partial<WorkflowCreateRequest> {
  status?: 'pending' | 'approved' | 'rejected' | 'offline';
}

// 统计数据类型
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalWorkflows: number;
  pendingWorkflows: number;
  todayDownloads: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export interface CreatorStats {
  totalEarnings: number;
  monthlyEarnings: number;
  workflowCount: number;
  totalDownloads: number;
  averageRating: number;
}

// Cloudflare Workers环境变量类型
export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  UPLOAD_BUCKET: R2Bucket;
  ENVIRONMENT: 'development' | 'production';
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}