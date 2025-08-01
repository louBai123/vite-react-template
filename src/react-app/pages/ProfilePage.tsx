import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { 
  User, 
  Settings, 
  Heart, 
  Download, 
  CreditCard, 
  History,
  Upload,
  Camera,
  Save,
  Edit3,
  Mail,
  Calendar,
  MapPin,
  Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Workflow, Transaction } from '../types';
import api from '../services/api';
import { WorkflowCard } from '../components/WorkflowCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

// 侧边栏菜单项
interface SidebarMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

// 个人中心页面组件
export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [favoriteWorkflows, setFavoriteWorkflows] = useState<Workflow[]>([]);
  const [purchasedWorkflows, setPurchasedWorkflows] = useState<Workflow[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // 个人信息表单状态
  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: '',
    website: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  // 侧边栏菜单
  const sidebarMenuItems: SidebarMenuItem[] = [
    { id: 'profile', label: '个人信息', icon: <User className="w-5 h-5" /> },
    { id: 'favorites', label: '我的收藏', icon: <Heart className="w-5 h-5" />, count: favoriteWorkflows.length },
    { id: 'purchases', label: '购买记录', icon: <Download className="w-5 h-5" />, count: purchasedWorkflows.length },
    { id: 'transactions', label: '交易记录', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'settings', label: '账户设置', icon: <Settings className="w-5 h-5" /> },
  ];

  // 加载用户数据
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // 这里应该调用实际的API来获取用户的收藏、购买记录等
        // 目前使用模拟数据
        setFavoriteWorkflows([]);
        setPurchasedWorkflows([]);
        setTransactions([]);
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  // 处理个人信息更新
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      const updatedUser = await api.auth.updateProfile(profileForm);
      updateUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理头像上传
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setLoading(true);
      const result = await api.upload.uploadFile(file);
      const updatedUser = await api.auth.updateProfile({ avatar_url: result.url });
      updateUser(updatedUser);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    } finally {
      setLoading(false);
    }
  };

  // 渲染个人信息页面
  const renderProfileTab = () => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">个人信息</h2>
        <Button
          variant={isEditing ? 'outline' : 'primary'}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <>
              <X className="w-4 h-4 mr-2" />
              取消
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4 mr-2" />
              编辑
            </>
          )}
        </Button>
      </div>

      <form onSubmit={handleProfileUpdate}>
        <div className="space-y-6">
          {/* 头像 */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={user?.avatar_url || '/default-avatar.png'}
                alt={user?.username}
                className="w-24 h-24 rounded-full object-cover"
              />
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{user?.username}</h3>
              <p className="text-gray-500">{user?.role === 'creator' ? '创作者' : '用户'}</p>
              <p className="text-sm text-gray-400">
                注册时间：{user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : ''}
              </p>
            </div>
          </div>

          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用户名
              </label>
              <Input
                type="text"
                value={profileForm.username}
                onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-50' : ''}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱
              </label>
              <Input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-50' : ''}
              />
            </div>
          </div>

          {/* 个人简介 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              个人简介
            </label>
            <textarea
              value={profileForm.bio}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              disabled={!isEditing}
              rows={4}
              className={clsx(
                'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                !isEditing && 'bg-gray-50'
              )}
              placeholder="介绍一下自己..."
            />
          </div>

          {/* 其他信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                所在地区
              </label>
              <Input
                type="text"
                value={profileForm.location}
                onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-50' : ''}
                placeholder="如：北京市"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                个人网站
              </label>
              <Input
                type="url"
                value={profileForm.website}
                onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-50' : ''}
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* 保存按钮 */}
          {isEditing && (
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                取消
              </Button>
              <Button
                type="submit"
                loading={loading}
              >
                <Save className="w-4 h-4 mr-2" />
                保存更改
              </Button>
            </div>
          )}
        </div>
      </form>
    </Card>
  );

  // 渲染收藏页面
  const renderFavoritesTab = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">我的收藏</h2>
        <span className="text-gray-500">{favoriteWorkflows.length} 个工作流</span>
      </div>

      {favoriteWorkflows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteWorkflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onView={(id) => window.location.href = `/workflow/${id}`}
              onDownload={(id) => console.log('Download:', id)}
              onFavorite={(id) => console.log('Unfavorite:', id)}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无收藏</h3>
          <p className="text-gray-500 mb-6">收藏感兴趣的工作流，方便随时查看</p>
          <Button onClick={() => window.location.href = '/'}>
            去发现工作流
          </Button>
        </Card>
      )}
    </div>
  );

  // 渲染购买记录页面
  const renderPurchasesTab = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">购买记录</h2>
        <span className="text-gray-500">{purchasedWorkflows.length} 个工作流</span>
      </div>

      {purchasedWorkflows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchasedWorkflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onView={(id) => window.location.href = `/workflow/${id}`}
              onDownload={(id) => console.log('Download:', id)}
              onFavorite={(id) => console.log('Favorite:', id)}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Download className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无购买记录</h3>
          <p className="text-gray-500 mb-6">购买的工作流会显示在这里</p>
          <Button onClick={() => window.location.href = '/'}>
            去购买工作流
          </Button>
        </Card>
      )}
    </div>
  );

  // 渲染交易记录页面
  const renderTransactionsTab = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">交易记录</h2>
      </div>

      {transactions.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    交易时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金额
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.created_at).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.type === 'purchase' ? '购买' : '充值'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        transaction.status === 'completed' && 'bg-green-100 text-green-800',
                        transaction.status === 'pending' && 'bg-yellow-100 text-yellow-800',
                        transaction.status === 'failed' && 'bg-red-100 text-red-800'
                      )}>
                        {transaction.status === 'completed' && '已完成'}
                        {transaction.status === 'pending' && '处理中'}
                        {transaction.status === 'failed' && '失败'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无交易记录</h3>
          <p className="text-gray-500">您的交易记录会显示在这里</p>
        </Card>
      )}
    </div>
  );

  // 渲染设置页面
  const renderSettingsTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">账户安全</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">修改密码</h4>
              <p className="text-sm text-gray-500">定期更新密码以保护账户安全</p>
            </div>
            <Button variant="outline">修改密码</Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">两步验证</h4>
              <p className="text-sm text-gray-500">为账户添加额外的安全保护</p>
            </div>
            <Button variant="outline">启用</Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">通知设置</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">邮件通知</h4>
              <p className="text-sm text-gray-500">接收重要更新和通知</p>
            </div>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">推送通知</h4>
              <p className="text-sm text-gray-500">接收浏览器推送通知</p>
            </div>
            <input type="checkbox" className="toggle" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">隐私设置</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">公开个人资料</h4>
              <p className="text-sm text-gray-500">允许其他用户查看您的个人资料</p>
            </div>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">显示购买记录</h4>
              <p className="text-sm text-gray-500">在个人资料中显示购买的工作流</p>
            </div>
            <input type="checkbox" className="toggle" />
          </div>
        </div>
      </Card>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">请先登录</h2>
          <p className="text-gray-600 mb-6">您需要登录才能访问个人中心</p>
          <Button onClick={() => window.location.href = '/login'}>
            去登录
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 侧边栏 */}
          <div className="lg:w-64 flex-shrink-0">
            <Card className="p-4">
              <nav className="space-y-1">
                {sidebarMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={clsx(
                      'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      activeTab === item.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* 主内容区 */}
          <div className="flex-1">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'favorites' && renderFavoritesTab()}
            {activeTab === 'purchases' && renderPurchasesTab()}
            {activeTab === 'transactions' && renderTransactionsTab()}
            {activeTab === 'settings' && renderSettingsTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;