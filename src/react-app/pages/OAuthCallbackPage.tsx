import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface OAuthCallbackPageProps {
  provider: 'github' | 'google';
}

export const OAuthCallbackPage: React.FC<OAuthCallbackPageProps> = ({ provider }) => {
  const { oauthLogin } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          setStatus('error');
          setMessage('用户取消了授权或授权失败');
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('未收到授权码，请重试');
          return;
        }

        // 从localStorage获取角色选择（如果有）
        const selectedRole = localStorage.getItem('oauth_selected_role') || 'user';
        localStorage.removeItem('oauth_selected_role');

        await oauthLogin(provider, code, selectedRole);
        setStatus('success');
        setMessage('注册成功！正在跳转...');
        
        // 延迟跳转到首页
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'OAuth认证失败');
      }
    };

    handleCallback();
  }, [provider, oauthLogin]);

  const getProviderName = () => {
    return provider === 'github' ? 'GitHub' : 'Google';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">WF</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {getProviderName()} 授权
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            正在处理您的授权信息...
          </p>
        </div>

        <Card className="p-8">
          <div className="text-center">
            {status === 'loading' && (
              <div className="space-y-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                <p className="text-gray-600">正在验证授权信息...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">注册成功！</h3>
                  <p className="text-gray-600">{message}</p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <XCircle className="w-12 h-12 text-red-600 mx-auto" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">授权失败</h3>
                  <p className="text-gray-600 mb-4">{message}</p>
                  <div className="space-y-2">
                    <a
                      href="/register"
                      className="inline-block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      重新注册
                    </a>
                    <a
                      href="/login"
                      className="inline-block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      返回登录
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

// GitHub回调页面
export const GitHubCallbackPage: React.FC = () => {
  return <OAuthCallbackPage provider="github" />;
};

// Google回调页面
export const GoogleCallbackPage: React.FC = () => {
  return <OAuthCallbackPage provider="google" />;
};

export default OAuthCallbackPage;