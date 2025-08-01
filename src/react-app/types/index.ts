// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  field?: string;
  details?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 用户相关类型
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'creator' | 'advertiser' | 'admin';
  avatar_url?: string;
  bio?: string;
  total_earnings: number;
  created_at: string;
  updated_at: string;
}

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

export interface AuthResponse {
  user: User;
  token: string;
}

// 工作流相关类型
export interface Workflow {
  id: number;
  creator_id: number;
  creator?: User;
  title: string;
  description?: string;
  category_id: number;
  category?: Category;
  subcategory_id?: number;
  subcategory?: Category;
  price: number;
  tags: string[];
  file_url: string;
  preview_images: string[];
  download_count: number;
  rating: number;
  review_count: number;
  status: 'pending' | 'approved' | 'rejected' | 'offline';
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowCreateRequest {
  title: string;
  description?: string;
  category_id: number;
  subcategory_id?: number;
  price: number;
  tags: string[];
  file_url: string;
  preview_images: string[];
}

export interface WorkflowUpdateRequest extends Partial<WorkflowCreateRequest> {
  status?: 'pending' | 'approved' | 'rejected' | 'offline';
  is_featured?: boolean;
}

export interface WorkflowSearchParams {
  page?: number;
  pageSize?: number;
  category?: number;
  status?: string;
  featured?: boolean;
  search?: string;
  sortBy?: 'hot' | 'latest' | 'rating' | 'price_low' | 'price_high';
  creatorId?: number;
}

// 分类相关类型
export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  parent_id?: number;
  children?: Category[];
  workflow_count: number;
  created_at: string;
  updated_at: string;
}

// 交易相关类型
export interface Transaction {
  id: number;
  user_id: number;
  workflow_id: number;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  created_at: string;
  updated_at: string;
}

// 评价相关类型
export interface Review {
  id: number;
  user_id: number;
  workflow_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

// 广告相关类型
export interface Advertisement {
  id: number;
  advertiser_id: number;
  title: string;
  content: string;
  image_url?: string;
  target_url: string;
  position: 'banner' | 'sidebar' | 'popup';
  status: 'active' | 'inactive' | 'expired';
  start_date: string;
  end_date: string;
  budget: number;
  spent: number;
  clicks: number;
  impressions: number;
  created_at: string;
  updated_at: string;
}

// 统计相关类型
export interface DashboardStats {
  totalUsers: number;
  totalWorkflows: number;
  totalTransactions: number;
  totalRevenue: number;
  monthlyUsers: number;
  monthlyWorkflows: number;
  monthlyTransactions: number;
  monthlyRevenue: number;
}

export interface CreatorStats {
  totalEarnings: number;
  monthlyEarnings: number;
  workflowCount: number;
  totalDownloads: number;
  averageRating: number;
}

// 表单相关类型
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'file' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  options?: { value: string | number; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
}

export interface FormErrors {
  [key: string]: string;
}

// 组件Props类型
export interface WorkflowCardProps {
  workflow: Workflow;
  onFavorite?: (id: number) => void;
  onDownload?: (id: number) => void;
  showActions?: boolean;
}

export interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showSizeChanger?: boolean;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
}

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

// 路由相关类型
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
  protected?: boolean;
  roles?: string[];
  title?: string;
}

// 主题相关类型
export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  fontSize: 'sm' | 'md' | 'lg';
}

// 通知相关类型
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  closable?: boolean;
}

// 上传相关类型
export interface UploadFile {
  uid: string;
  name: string;
  status: 'uploading' | 'done' | 'error';
  url?: string;
  percent?: number;
  response?: any;
}

export interface UploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxCount?: number;
  onUpload: (files: File[]) => Promise<UploadFile[]>;
  onChange?: (files: UploadFile[]) => void;
  children?: React.ReactNode;
}

// 筛选相关类型
export interface FilterOption {
  label: string;
  value: string | number;
  count?: number;
}

export interface FilterGroup {
  key: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range' | 'select';
  options: FilterOption[];
  multiple?: boolean;
}

export interface FilterState {
  [key: string]: string | number | string[] | number[];
}

// 工具函数类型
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

// 错误处理类型
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

// 本地存储类型
export interface StorageItem<T> {
  value: T;
  timestamp: number;
  expiry?: number;
}

// 权限相关类型
export interface Permission {
  resource: string;
  action: string;
  granted: boolean;
}

export interface RolePermissions {
  role: string;
  permissions: Permission[];
}

// 导出所有类型
export * from './api';
export * from './components';
export * from './hooks';