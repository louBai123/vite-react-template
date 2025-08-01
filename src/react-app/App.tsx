// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { TopNavigation } from './components/Navigation';
import HomePage from './pages/HomePage';
import WorkflowDetailPage from './pages/WorkflowDetailPage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import CreatorPage from './pages/CreatorPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { GitHubCallbackPage, GoogleCallbackPage } from './pages/OAuthCallbackPage';
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
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <TopNavigation />
              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/workflow/:id" element={<WorkflowDetailPage />} />
                  <Route path="/category/:id" element={<CategoryPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/creator" element={<CreatorPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/auth/github/callback" element={<GitHubCallbackPage />} />
                  <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

// 404 页面组件
const NotFoundPage: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('404.title')}</h1>
        <p className="text-lg text-gray-600 mb-8">{t('404.message')}</p>
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {t('404.backHome')}
        </a>
      </div>
    </div>
  );
};

// 页脚组件
const Footer: React.FC = () => {
  const { t } = useLanguage();
  
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
                {t('brand.name')}
              </span>
            </div>
            <p className="text-gray-600 mb-4">
              {t('brand.tagline')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Twitter</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">GitHub</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              {t('footer.product')}
            </h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-600 hover:text-gray-900">{t('nav.home')}</a></li>
              <li><a href="/discover" className="text-gray-600 hover:text-gray-900">{t('nav.discover')}</a></li>
              <li><a href="/trending" className="text-gray-600 hover:text-gray-900">{t('nav.trending')}</a></li>
              <li><a href="/featured" className="text-gray-600 hover:text-gray-900">{t('nav.featured')}</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              {t('footer.support')}
            </h3>
            <ul className="space-y-2">
              <li><a href="/help" className="text-gray-600 hover:text-gray-900">{t('footer.help')}</a></li>
              <li><a href="/contact" className="text-gray-600 hover:text-gray-900">{t('footer.contact')}</a></li>
              <li><a href="/privacy" className="text-gray-600 hover:text-gray-900">{t('footer.privacy')}</a></li>
              <li><a href="/terms" className="text-gray-600 hover:text-gray-900">{t('footer.terms')}</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-8 mt-8">
          <p className="text-center text-gray-500">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default App;
