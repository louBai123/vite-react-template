import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  Target,
  Zap
} from 'lucide-react';
import { Workflow, Category } from '../types';
import api from '../services/api';
import { WorkflowCard } from '../components/WorkflowCard';
import { SearchBox } from '../components/SearchAndFilter';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

// 统计数据接口
interface Stats {
  totalWorkflows: number;
  totalUsers: number;
  totalDownloads: number;
  totalCategories: number;
}

// 特色分类接口
interface FeaturedCategory {
  id: number;
  name: string;
  description: string;
  icon: React.ReactNode;
  workflowCount: number;
  color: string;
}

// 首页组件
export const HomePage: React.FC = () => {
  const [featuredWorkflows, setFeaturedWorkflows] = useState<Workflow[]>([]);
  const [popularWorkflows, setPopularWorkflows] = useState<Workflow[]>([]);
  const [recentWorkflows, setRecentWorkflows] = useState<Workflow[]>([]);
  const [, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalWorkflows: 0,
    totalUsers: 0,
    totalDownloads: 0,
    totalCategories: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // 特色分类数据
  const featuredCategories: FeaturedCategory[] = [
    {
      id: 1,
      name: '自动化工具',
      description: '提升工作效率的自动化解决方案',
      icon: <Zap className="w-8 h-8" />,
      workflowCount: 156,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 2,
      name: '数据处理',
      description: '数据分析和处理的专业工具',
      icon: <Target className="w-8 h-8" />,
      workflowCount: 89,
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 3,
      name: '内容创作',
      description: '创意内容生成和编辑工具',
      icon: <Sparkles className="w-8 h-8" />,
      workflowCount: 124,
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 4,
      name: '营销推广',
      description: '营销活动和推广的智能工具',
      icon: <TrendingUp className="w-8 h-8" />,
      workflowCount: 67,
      color: 'from-orange-500 to-red-500',
    },
  ];

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 并行加载数据
        const [featuredRes, popularRes, recentRes, categoriesRes] = await Promise.all([
          api.workflow.getWorkflows({ featured: true, pageSize: 8 }),
          api.workflow.getWorkflows({ sortBy: 'hot', pageSize: 8 }),
          api.workflow.getWorkflows({ sortBy: 'latest', pageSize: 8 }),
          api.category.getCategories(),
        ]);

        setFeaturedWorkflows(featuredRes.items);
        setPopularWorkflows(popularRes.items);
        setRecentWorkflows(recentRes.items);
        setCategories(categoriesRes);

        // 模拟统计数据
        setStats({
          totalWorkflows: 1250,
          totalUsers: 8900,
          totalDownloads: 45600,
          totalCategories: categoriesRes.length,
        });
      } catch (error) {
        console.error('Failed to load homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 处理搜索
  const handleSearch = (query: string) => {
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  // 处理工作流操作
  const handleWorkflowView = (id: number) => {
    window.location.href = `/workflow/${id}`;
  };

  const handleWorkflowDownload = async (id: number) => {
    try {
      // 这里应该调用下载API
      console.log('Download workflow:', id);
    } catch (error) {
      console.error('Failed to download workflow:', error);
    }
  };

  const handleWorkflowFavorite = async (id: number) => {
    try {
      // 这里应该调用收藏API
      console.log('Favorite workflow:', id);
    } catch (error) {
      console.error('Failed to favorite workflow:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 英雄区域 */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              发现最佳
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                工作流
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              探索由社区创建的高质量工作流，提升您的工作效率
            </p>
            
            {/* 搜索框 */}
            <div className="max-w-2xl mx-auto">
              <SearchBox
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
                placeholder="搜索工作流、分类或标签..."
                className="bg-white/10 backdrop-blur-sm border-white/20"
              />
            </div>

            {/* 统计数据 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto pt-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold">{stats.totalWorkflows.toLocaleString()}</div>
                <div className="text-blue-200">工作流</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <div className="text-blue-200">用户</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold">{stats.totalDownloads.toLocaleString()}</div>
                <div className="text-blue-200">下载量</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold">{stats.totalCategories}</div>
                <div className="text-blue-200">分类</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 特色分类 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">热门分类</h2>
            <p className="text-lg text-gray-600">探索不同领域的专业工作流</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCategories.map((category) => (
              <Card
                key={category.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() => window.location.href = `/categories/${category.id}`}
              >
                <div className={clsx(
                  'h-32 bg-gradient-to-br flex items-center justify-center text-white mb-4 rounded-lg',
                  category.color
                )}>
                  {category.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-gray-500">
                      {category.workflowCount} 个工作流
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 精选工作流 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">精选工作流</h2>
              <p className="text-lg text-gray-600">编辑推荐的高质量工作流</p>
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <span>查看全部</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredWorkflows.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                onView={handleWorkflowView}
                onDownload={handleWorkflowDownload}
                onFavorite={handleWorkflowFavorite}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 热门工作流 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">热门工作流</h2>
              <p className="text-lg text-gray-600">社区最受欢迎的工作流</p>
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <span>查看全部</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularWorkflows.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                onView={handleWorkflowView}
                onDownload={handleWorkflowDownload}
                onFavorite={handleWorkflowFavorite}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 最新工作流 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">最新工作流</h2>
              <p className="text-lg text-gray-600">刚刚发布的新工作流</p>
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <span>查看全部</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentWorkflows.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                onView={handleWorkflowView}
                onDownload={handleWorkflowDownload}
                onFavorite={handleWorkflowFavorite}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA 区域 */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            准备好分享您的工作流了吗？
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            加入我们的创作者社区，分享您的创意，获得收益
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              开始创作
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              了解更多
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;