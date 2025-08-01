import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { 
  Upload, 
  BarChart3, 
  DollarSign, 
  Download, 
  Star, 
  Eye,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  TrendingUp,
  Users,
  Calendar,
  FileText,
  Settings,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Workflow, CreatorStats } from '../types';
import api from '../services/api';
import { WorkflowCard } from '../components/WorkflowCard';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

// 统计卡片组件
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend, className }) => (
  <Card className={clsx('p-6', className)}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        {trend && (
          <div className={clsx(
            'flex items-center mt-2 text-sm',
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          )}>
            <TrendingUp className={clsx('w-4 h-4 mr-1', !trend.isPositive && 'rotate-180')} />
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div className="p-3 bg-blue-50 rounded-lg">
        {icon}
      </div>
    </div>
  </Card>
);

// 工作流状态标签组件
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    pending: { label: '待审核', className: 'bg-yellow-100 text-yellow-800' },
    approved: { label: '已上架', className: 'bg-green-100 text-green-800' },
    rejected: { label: '已拒绝', className: 'bg-red-100 text-red-800' },
    offline: { label: '已下架', className: 'bg-gray-100 text-gray-800' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span className={clsx('inline-flex px-2 py-1 text-xs font-semibold rounded-full', config.className)}>
      {config.label}
    </span>
  );
};

// 创作者中心页面组件
export const CreatorPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  // 标签页配置
  const tabs = [
    { id: 'overview', label: '概览', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'workflows', label: '我的作品', icon: <FileText className="w-4 h-4" /> },
    { id: 'analytics', label: '数据分析', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'earnings', label: '收益管理', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'settings', label: '设置', icon: <Settings className="w-4 h-4" /> },
  ];

  // 加载创作者数据
  useEffect(() => {
    const loadCreatorData = async () => {
      if (!user || user.role !== 'creator') return;

      try {
        setLoading(true);
        const [statsData, workflowsData] = await Promise.all([
          api.creator.getCreatorStats(),
          api.creator.getCreatorWorkflows({ pageSize: 50 }),
        ]);
        
        setStats(statsData);
        setWorkflows(workflowsData.items);
      } catch (error) {
        console.error('Failed to load creator data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCreatorData();
  }, [user]);

  // 处理工作流操作
  const handleEditWorkflow = (id: number) => {
    window.location.href = `/creator/workflow/${id}/edit`;
  };

  const handleDeleteWorkflow = async (id: number) => {
    if (!confirm('确定要删除这个工作流吗？')) return;

    try {
      await api.workflow.deleteWorkflow(id);
      setWorkflows(workflows.filter(w => w.id !== id));
    } catch (error) {
      console.error('Failed to delete workflow:', error);
    }
  };

  const handleViewWorkflow = (id: number) => {
    window.location.href = `/workflow/${id}`;
  };

  // 渲染概览页面
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="总收益"
          value={`¥${stats?.totalEarnings.toFixed(2) || '0.00'}`}
          icon={<DollarSign className="w-6 h-6 text-blue-600" />}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="本月收益"
          value={`¥${stats?.monthlyEarnings.toFixed(2) || '0.00'}`}
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatsCard
          title="作品数量"
          value={stats?.workflowCount || 0}
          icon={<FileText className="w-6 h-6 text-purple-600" />}
        />
        <StatsCard
          title="总下载量"
          value={stats?.totalDownloads || 0}
          icon={<Download className="w-6 h-6 text-orange-600" />}
          trend={{ value: 15.3, isPositive: true }}
        />
      </div>

      {/* 快速操作 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="primary"
            className="flex items-center justify-center space-x-2 h-12"
            onClick={() => window.location.href = '/creator/upload'}
          >
            <Upload className="w-5 h-5" />
            <span>上传新工作流</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2 h-12"
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 className="w-5 h-5" />
            <span>查看数据分析</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2 h-12"
            onClick={() => setActiveTab('earnings')}
          >
            <DollarSign className="w-5 h-5" />
            <span>收益提现</span>
          </Button>
        </div>
      </Card>

      {/* 最新作品 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">最新作品</h3>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('workflows')}
          >
            查看全部
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.slice(0, 3).map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              variant="compact"
              onView={handleViewWorkflow}
              showActions={false}
            />
          ))}
        </div>
      </Card>
    </div>
  );

  // 渲染作品管理页面
  const renderWorkflowsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">我的作品</h2>
        <Button
          variant="primary"
          onClick={() => window.location.href = '/creator/upload'}
        >
          <Plus className="w-4 h-4 mr-2" />
          上传新工作流
        </Button>
      </div>

      {workflows.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    工作流
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    价格
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    下载量
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    评分
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    收益
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workflows.map((workflow) => (
                  <tr key={workflow.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={workflow.preview_images[0] || '/placeholder-workflow.png'}
                          alt={workflow.title}
                          className="w-12 h-12 rounded-lg object-cover mr-4"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {workflow.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(workflow.created_at).toLocaleDateString('zh-CN')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={workflow.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {workflow.price === 0 ? '免费' : `¥${workflow.price.toFixed(2)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {workflow.download_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm text-gray-900">{workflow.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{(workflow.download_count * workflow.price * 0.7).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewWorkflow(workflow.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditWorkflow(workflow.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWorkflow(workflow.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">还没有作品</h3>
          <p className="text-gray-500 mb-6">上传您的第一个工作流开始赚取收益</p>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/creator/upload'}
          >
            <Plus className="w-4 h-4 mr-2" />
            上传工作流
          </Button>
        </Card>
      )}
    </div>
  );

  // 渲染数据分析页面
  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">数据分析</h2>
      
      {/* 概览统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="总浏览量"
          value="12,345"
          icon={<Eye className="w-6 h-6 text-blue-600" />}
          trend={{ value: 5.2, isPositive: true }}
        />
        <StatsCard
          title="转化率"
          value="3.2%"
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          trend={{ value: 0.8, isPositive: true }}
        />
        <StatsCard
          title="平均评分"
          value={stats?.averageRating.toFixed(1) || '0.0'}
          icon={<Star className="w-6 h-6 text-yellow-600" />}
        />
      </div>

      {/* 图表占位符 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">下载趋势</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">图表功能开发中...</p>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">收益趋势</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">图表功能开发中...</p>
          </div>
        </Card>
      </div>
    </div>
  );

  // 渲染收益管理页面
  const renderEarningsTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">收益管理</h2>
      
      {/* 收益概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="可提现余额"
          value={`¥${stats?.totalEarnings.toFixed(2) || '0.00'}`}
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
        />
        <StatsCard
          title="本月收益"
          value={`¥${stats?.monthlyEarnings.toFixed(2) || '0.00'}`}
          icon={<Calendar className="w-6 h-6 text-blue-600" />}
        />
        <StatsCard
          title="累计提现"
          value="¥0.00"
          icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
        />
      </div>

      {/* 提现操作 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">申请提现</h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-800">
              最低提现金额为¥100，提现申请将在3-5个工作日内处理
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            placeholder="提现金额"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="100"
            max={stats?.totalEarnings || 0}
          />
          <Button variant="primary">申请提现</Button>
        </div>
      </Card>

      {/* 收益记录 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">收益记录</h3>
        <div className="text-center py-8 text-gray-500">
          暂无收益记录
        </div>
      </Card>
    </div>
  );

  // 渲染设置页面
  const renderSettingsTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">创作者设置</h2>
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">创作者信息</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              创作者简介
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="介绍一下您的专业背景和创作理念..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              专业领域
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="如：自动化、数据分析、设计等"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">收益设置</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">自动提现</h4>
              <p className="text-sm text-gray-500">当余额达到指定金额时自动申请提现</p>
            </div>
            <input type="checkbox" className="toggle" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              自动提现金额
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="500"
              min="100"
            />
          </div>
        </div>
      </Card>
    </div>
  );

  // 检查用户权限
  if (!user || user.role !== 'creator') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-4">需要创作者权限</h2>
          <p className="text-gray-600 mb-6">您需要成为创作者才能访问此页面</p>
          <Button onClick={() => window.location.href = '/become-creator'}>
            申请成为创作者
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">创作者中心</h1>
          <p className="text-gray-600">管理您的工作流和收益</p>
        </div>

        {/* 标签页导航 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* 标签页内容 */}
        <div>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'workflows' && renderWorkflowsTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
          {activeTab === 'earnings' && renderEarningsTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </div>
      </div>
    </div>
  );
};

export default CreatorPage;