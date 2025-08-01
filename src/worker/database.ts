// 数据库操作工具函数
import { Env, User, Workflow, Category, Transaction, Review, PaginatedResponse } from './types';

// 模拟数据库操作（在实际部署时需要连接到真实数据库）
// 这里使用内存数据作为演示

// 模拟数据
const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@workflow.com',
    role: 'admin',
    balance: 0,
    total_earnings: 0,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    username: 'creator1',
    email: 'creator1@example.com',
    role: 'creator',
    balance: 1500.50,
    total_earnings: 3200.75,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockCategories: Category[] = [
  {
    id: 1,
    name: '办公自动化',
    sort_order: 1,
    is_active: true,
    children: [
      { id: 6, name: 'Excel处理', parent_id: 1, sort_order: 1, is_active: true },
      { id: 7, name: '文档生成', parent_id: 1, sort_order: 2, is_active: true },
      { id: 8, name: '邮件自动化', parent_id: 1, sort_order: 3, is_active: true }
    ]
  },
  {
    id: 2,
    name: '数据处理',
    sort_order: 2,
    is_active: true,
    children: [
      { id: 9, name: '数据清洗', parent_id: 2, sort_order: 1, is_active: true },
      { id: 10, name: '数据分析', parent_id: 2, sort_order: 2, is_active: true },
      { id: 11, name: '报表生成', parent_id: 2, sort_order: 3, is_active: true }
    ]
  },
  {
    id: 3,
    name: '设计创作',
    sort_order: 3,
    is_active: true,
    children: [
      { id: 12, name: '图像处理', parent_id: 3, sort_order: 1, is_active: true },
      { id: 13, name: '视频编辑', parent_id: 3, sort_order: 2, is_active: true },
      { id: 14, name: 'UI设计', parent_id: 3, sort_order: 3, is_active: true }
    ]
  },
  {
    id: 4,
    name: '营销推广',
    sort_order: 4,
    is_active: true,
    children: [
      { id: 15, name: '社媒管理', parent_id: 4, sort_order: 1, is_active: true },
      { id: 16, name: '广告投放', parent_id: 4, sort_order: 2, is_active: true }
    ]
  },
  {
    id: 5,
    name: '开发工具',
    sort_order: 5,
    is_active: true,
    children: [
      { id: 17, name: '代码生成', parent_id: 5, sort_order: 1, is_active: true },
      { id: 18, name: '测试自动化', parent_id: 5, sort_order: 2, is_active: true },
      { id: 19, name: '部署脚本', parent_id: 5, sort_order: 3, is_active: true }
    ]
  }
];

const mockWorkflows: Workflow[] = [
  {
    id: 1,
    creator_id: 2,
    title: 'Excel数据自动处理工作流',
    description: '自动处理Excel表格数据，包括数据清洗、格式化和报表生成',
    category_id: 1,
    subcategory_id: 6,
    price: 29.90,
    file_url: '/files/excel-automation.json',
    preview_images: ['/images/excel-preview-1.jpg', '/images/excel-preview-2.jpg'],
    tags: ['Excel', '自动化', '数据处理', '办公'],
    download_count: 1234,
    rating: 4.5,
    rating_count: 89,
    favorite_count: 156,
    comment_count: 23,
    status: 'approved',
    is_featured: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    creator_id: 2,
    title: '社交媒体内容自动发布',
    description: '自动化社交媒体内容发布，支持多平台同步发布',
    category_id: 4,
    subcategory_id: 15,
    price: 0,
    file_url: '/files/social-media-automation.json',
    preview_images: ['/images/social-preview-1.jpg'],
    tags: ['社交媒体', '自动发布', '营销', '免费'],
    download_count: 2567,
    rating: 4.2,
    rating_count: 145,
    favorite_count: 289,
    comment_count: 67,
    status: 'approved',
    is_featured: false,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    creator_id: 2,
    title: '图像批量处理工作流',
    description: '批量处理图像，包括尺寸调整、格式转换、水印添加等功能',
    category_id: 3,
    subcategory_id: 12,
    price: 19.90,
    file_url: '/files/image-batch-processing.json',
    preview_images: ['/images/image-preview-1.jpg', '/images/image-preview-2.jpg', '/images/image-preview-3.jpg'],
    tags: ['图像处理', '批量操作', '设计', '自动化'],
    download_count: 876,
    rating: 4.7,
    rating_count: 54,
    favorite_count: 123,
    comment_count: 18,
    status: 'approved',
    is_featured: true,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

// 数据库操作函数
export class Database {
  constructor(private env: Env) {}

  // 用户相关操作
  async getUserById(id: number): Promise<User | null> {
    return mockUsers.find(user => user.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return mockUsers.find(user => user.email === email) || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return mockUsers.find(user => user.username === username) || null;
  }

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: mockUsers.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockUsers.push(newUser);
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | null> {
    const userIndex = mockUsers.findIndex(user => user.id === id);
    if (userIndex === -1) return null;
    
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return mockUsers[userIndex];
  }

  // 分类相关操作
  async getCategories(): Promise<Category[]> {
    return mockCategories;
  }

  async getCategoryById(id: number): Promise<Category | null> {
    const findCategory = (categories: Category[]): Category | null => {
      for (const category of categories) {
        if (category.id === id) return category;
        if (category.children) {
          const found = findCategory(category.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findCategory(mockCategories);
  }

  // 工作流相关操作
  async getWorkflows(params: {
    page?: number;
    pageSize?: number;
    category?: number;
    status?: string;
    creatorId?: number;
    featured?: boolean;
    search?: string;
    sortBy?: string;
  } = {}): Promise<PaginatedResponse<Workflow>> {
    let filteredWorkflows = [...mockWorkflows];

    // 筛选
    if (params.category) {
      filteredWorkflows = filteredWorkflows.filter(w => w.category_id === params.category);
    }
    if (params.status) {
      filteredWorkflows = filteredWorkflows.filter(w => w.status === params.status);
    }
    if (params.creatorId) {
      filteredWorkflows = filteredWorkflows.filter(w => w.creator_id === params.creatorId);
    }
    if (params.featured !== undefined) {
      filteredWorkflows = filteredWorkflows.filter(w => w.is_featured === params.featured);
    }
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredWorkflows = filteredWorkflows.filter(w => 
        w.title.toLowerCase().includes(searchLower) ||
        w.description?.toLowerCase().includes(searchLower) ||
        w.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // 排序
    switch (params.sortBy) {
      case 'latest':
        filteredWorkflows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'popular':
        filteredWorkflows.sort((a, b) => b.download_count - a.download_count);
        break;
      case 'rating':
        filteredWorkflows.sort((a, b) => b.rating - a.rating);
        break;
      case 'price_asc':
        filteredWorkflows.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filteredWorkflows.sort((a, b) => b.price - a.price);
        break;
      default:
        // 默认按热度排序（综合下载量和评分）
        filteredWorkflows.sort((a, b) => {
          const scoreA = a.download_count * 0.6 + a.rating * a.rating_count * 0.4;
          const scoreB = b.download_count * 0.6 + b.rating * b.rating_count * 0.4;
          return scoreB - scoreA;
        });
    }

    // 分页
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const total = filteredWorkflows.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = filteredWorkflows.slice(startIndex, endIndex);

    // 添加关联数据
    const itemsWithRelations = items.map(workflow => ({
      ...workflow,
      creator: mockUsers.find(user => user.id === workflow.creator_id),
      category: this.findCategoryById(workflow.category_id)
    }));

    return {
      items: itemsWithRelations,
      pagination: {
        current: page,
        pageSize,
        total,
        totalPages
      }
    };
  }

  async getWorkflowById(id: number): Promise<Workflow | null> {
    const workflow = mockWorkflows.find(w => w.id === id);
    if (!workflow) return null;

    return {
      ...workflow,
      creator: mockUsers.find(user => user.id === workflow.creator_id),
      category: this.findCategoryById(workflow.category_id)
    };
  }

  async createWorkflow(workflowData: Omit<Workflow, 'id' | 'download_count' | 'rating' | 'rating_count' | 'favorite_count' | 'comment_count' | 'created_at' | 'updated_at'>): Promise<Workflow> {
    const newWorkflow: Workflow = {
      ...workflowData,
      id: mockWorkflows.length + 1,
      download_count: 0,
      rating: 0,
      rating_count: 0,
      favorite_count: 0,
      comment_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockWorkflows.push(newWorkflow);
    return newWorkflow;
  }

  async updateWorkflow(id: number, updates: Partial<Workflow>): Promise<Workflow | null> {
    const workflowIndex = mockWorkflows.findIndex(w => w.id === id);
    if (workflowIndex === -1) return null;
    
    mockWorkflows[workflowIndex] = {
      ...mockWorkflows[workflowIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return mockWorkflows[workflowIndex];
  }

  async deleteWorkflow(id: number): Promise<boolean> {
    const workflowIndex = mockWorkflows.findIndex(w => w.id === id);
    if (workflowIndex === -1) return false;
    
    mockWorkflows.splice(workflowIndex, 1);
    return true;
  }

  // 辅助方法
  private findCategoryById(id: number): Category | undefined {
    const findInCategories = (categories: Category[]): Category | undefined => {
      for (const category of categories) {
        if (category.id === id) return category;
        if (category.children) {
          const found = findInCategories(category.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return findInCategories(mockCategories);
  }

  // 统计数据
  async getDashboardStats(): Promise<any> {
    return {
      totalUsers: mockUsers.length,
      activeUsers: mockUsers.filter(u => u.status === 'active').length,
      newUsers: mockUsers.filter(u => {
        const createdDate = new Date(u.created_at);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - createdDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }).length,
      totalWorkflows: mockWorkflows.length,
      pendingWorkflows: mockWorkflows.filter(w => w.status === 'pending').length,
      todayDownloads: mockWorkflows.reduce((sum, w) => sum + w.download_count, 0),
      totalRevenue: mockWorkflows.reduce((sum, w) => sum + (w.price * w.download_count), 0),
      monthlyRevenue: mockWorkflows.reduce((sum, w) => sum + (w.price * w.download_count * 0.3), 0) // 假设30%是本月收入
    };
  }
}