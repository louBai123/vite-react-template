import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { 
  Search, 
  User, 
  ShoppingCart, 
  Heart, 
  Bell, 
  Menu, 
  X, 
  Home,
  Compass,
  TrendingUp,
  Star,
  Upload,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

// 导航链接接口
interface NavLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
}

// 用户菜单项接口
interface UserMenuItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  onClick?: () => void;
  divider?: boolean;
}

// 顶部导航栏组件
export const TopNavigation: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);

  // 主导航链接
  const mainNavLinks: NavLink[] = [
    { label: t('nav.home'), href: '/', icon: <Home className="w-4 h-4" /> },
    { label: t('nav.discover'), href: '/discover', icon: <Compass className="w-4 h-4" /> },
    { label: t('nav.trending'), href: '/trending', icon: <TrendingUp className="w-4 h-4" /> },
    { label: t('nav.featured'), href: '/featured', icon: <Star className="w-4 h-4" /> },
  ];

  // 用户菜单项
  const userMenuItems: UserMenuItem[] = [
    { label: t('nav.user.menu.profile'), href: '/profile', icon: <User className="w-4 h-4" /> },
    { label: t('nav.user.menu.workflows'), href: '/my-workflows', icon: <Heart className="w-4 h-4" /> },
    { label: t('nav.user.menu.purchases'), href: '/purchases', icon: <ShoppingCart className="w-4 h-4" /> },
    { label: t('nav.user.menu.creator'), href: '/creator', icon: <Upload className="w-4 h-4" /> },
    { divider: true, label: '', icon: <></> },
    { label: t('nav.user.menu.settings'), href: '/settings', icon: <Settings className="w-4 h-4" /> },
    { label: t('nav.user.menu.logout'), icon: <LogOut className="w-4 h-4" />, onClick: logout },
  ];

  // 点击外部关闭用户菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // 跳转到搜索页面
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">WF</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                {t('brand.name')}
              </span>
            </a>
          </div>

          {/* 桌面端导航链接 */}
          <div className="hidden md:flex items-center space-x-8">
            {mainNavLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={clsx(
                  'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  link.active
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                )}
              >
                {link.icon}
                <span>{link.label}</span>
              </a>
            ))}
          </div>

          {/* 搜索框 */}
          <div className="flex-1 max-w-lg mx-4 hidden sm:block">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Input
                  type="text"
                  placeholder={t('nav.search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </form>
          </div>

          {/* 右侧操作区 */}
          <div className="flex items-center space-x-4">
            {/* 语言切换器 */}
            <LanguageSwitcher />

            {/* 通知 */}
            {user && (
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
            )}

            {/* 用户菜单或登录按钮 */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <img
                      src={user.avatar_url || '/default-avatar.png'}
                      alt={user.username}
                      className="w-8 h-8 rounded-full"
                    />
                  <span className="hidden sm:block text-sm font-medium">
                    {user.username}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>

                {/* 用户下拉菜单 */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {userMenuItems.map((item, index) => {
                      if (item.divider) {
                        return <div key={index} className="border-t border-gray-100 my-1" />;
                      }

                      return (
                        <a
                          key={index}
                          href={item.href}
                          onClick={item.onClick}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <a href="/login">{t('common.login')}</a>
                </Button>
                <Button variant="primary" size="sm">
                  <a href="/register">{t('common.register')}</a>
                </Button>
              </div>
            )}

            {/* 移动端菜单按钮 */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* 移动端菜单 */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {/* 搜索框 */}
            <div className="px-4 mb-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder={t('nav.search.placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </form>
            </div>

            {/* 导航链接 */}
            <div className="space-y-1">
              {mainNavLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    'flex items-center space-x-3 px-4 py-3 text-base font-medium transition-colors',
                    link.active
                      ? 'text-blue-600 bg-blue-50 border-r-2 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  )}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// 侧边栏导航组件
export const SideNavigation: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useLanguage();
  
  const sideNavLinks: NavLink[] = [
    { label: t('common.categories'), href: '/categories' },
    { label: t('category.automation'), href: '/categories/automation' },
    { label: t('category.data'), href: '/categories/data-processing' },
    { label: t('category.content'), href: '/categories/content-creation' },
    { label: t('category.marketing'), href: '/categories/marketing' },
    { label: 'Office Productivity', href: '/categories/productivity' },
    { label: 'Design & Creative', href: '/categories/design' },
    { label: 'Development Tools', href: '/categories/development' },
  ];

  return (
    <aside className={clsx('w-64 bg-white border-r border-gray-200', className)}>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('nav.categories')}</h3>
        <nav className="space-y-1">
          {sideNavLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={clsx(
                'block px-3 py-2 rounded-md text-sm font-medium transition-colors',
                link.active
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
};

// 面包屑导航组件
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  return (
    <nav className={clsx('flex items-center space-x-2 text-sm', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-gray-400">/</span>
          )}
          {item.href ? (
            <a
              href={item.href}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default TopNavigation;