// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { TopNavigation } from './components/Navigation';
import HomePage from './pages/HomePage';
import WorkflowDetailPage from './pages/WorkflowDetailPage';
import './index.css';

// 创建 React Query 客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// 主应用组件
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <TopNavigation />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/workflow/:id" element={<WorkflowDetailPage />} />
                {/* 其他路由将在后续添加 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// 404 页面组件
const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-lg text-gray-600 mb-8">页面未找到</p>
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          返回首页
        </a>
      </div>
    </div>
  );
};

// 页脚组件
const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">WF</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                工作流分享平台
              </span>
            </div>
            <p className="text-gray-600 mb-4">
              发现和分享高质量的工作流，提升您的工作效率。
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">微信</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18 0 .659-.52 1.188-1.162 1.188-.642 0-1.162-.529-1.162-1.188 0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18 0 .659-.52 1.188-1.162 1.188-.642 0-1.162-.529-1.162-1.188 0-.651.52-1.18 1.162-1.18z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">微博</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.331 14.666c-1.258 0-2.28-1.021-2.28-2.28s1.022-2.28 2.28-2.28 2.28 1.021 2.28 2.28-1.022 2.28-2.28 2.28zm0-3.56c-.706 0-1.28.574-1.28 1.28s.574 1.28 1.28 1.28 1.28-.574 1.28-1.28-.574-1.28-1.28-1.28z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              产品
            </h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-600 hover:text-gray-900">首页</a></li>
              <li><a href="/discover" className="text-gray-600 hover:text-gray-900">发现</a></li>
              <li><a href="/trending" className="text-gray-600 hover:text-gray-900">热门</a></li>
              <li><a href="/featured" className="text-gray-600 hover:text-gray-900">精选</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              支持
            </h3>
            <ul className="space-y-2">
              <li><a href="/help" className="text-gray-600 hover:text-gray-900">帮助中心</a></li>
              <li><a href="/contact" className="text-gray-600 hover:text-gray-900">联系我们</a></li>
              <li><a href="/privacy" className="text-gray-600 hover:text-gray-900">隐私政策</a></li>
              <li><a href="/terms" className="text-gray-600 hover:text-gray-900">服务条款</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-8 mt-8">
          <p className="text-center text-gray-500">
            © 2024 工作流分享平台. 保留所有权利.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default App;
