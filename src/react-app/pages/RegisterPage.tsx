import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Check,
  UserCheck,
  Megaphone,
  Github,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { authApi } from '../services/api';

// Google图标组件
const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// 用户角色选项
const USER_ROLES = [
  {
    value: 'user',
    label: '普通用户',
    description: '浏览和购买工作流',
    icon: <User className="w-6 h-6" />,
  },
  {
    value: 'creator',
    label: '创作者',
    description: '上传和销售工作流',
    icon: <UserCheck className="w-6 h-6" />,
  },
  {
    value: 'advertiser',
    label: '广告商',
    description: '投放广告和推广',
    icon: <Megaphone className="w-6 h-6" />,
  },
];

// 注册页面组件
export const RegisterPage: React.FC = () => {
  const { register, oauthLogin } = useAuth();
  const [currentStep, setCurrentStep] = useState(0); // 从0开始，0是选择注册方式
  const [registrationMethod, setRegistrationMethod] = useState<'email' | 'github' | 'google' | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'user' | 'creator' | 'advertiser',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 处理OAuth回调
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const provider = window.location.pathname.includes('github') ? 'github' : 
                    window.location.pathname.includes('google') ? 'google' : null;
    
    if (code && provider) {
      handleOAuthCallback(provider as 'github' | 'google', code);
    }
  }, []);

  // 处理OAuth回调
  const handleOAuthCallback = async (provider: 'github' | 'google', code: string) => {
    try {
      setLoading(true);
      await oauthLogin(provider, code, formData.role);
      // 注册成功后跳转到首页
      window.location.href = '/';
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'OAuth注册失败，请重试' });
    } finally {
      setLoading(false);
    }
  };

  // 处理OAuth注册
  const handleOAuthRegister = async (provider: 'github' | 'google') => {
    try {
      setLoading(true);
      
      // 保存用户选择的角色到localStorage，供回调页面使用
      localStorage.setItem('oauth_selected_role', formData.role);
      
      const redirectUri = `${window.location.origin}/auth/${provider}/callback`;
      const { authUrl } = await authApi.getOAuthUrl(provider, redirectUri);
      window.location.href = authUrl;
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : '获取授权链接失败' });
      setLoading(false);
    }
  };

  // 选择注册方式
  const handleRegistrationMethodSelect = (method: 'email' | 'github' | 'google') => {
    setRegistrationMethod(method);
    if (method === 'email') {
      setCurrentStep(1);
    } else {
      // OAuth注册需要先选择角色
      setCurrentStep(2);
    }
  };

  // 处理表单输入
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 处理角色选择
  const handleRoleSelect = (role: 'user' | 'creator' | 'advertiser') => {
    setFormData(prev => ({ ...prev, role }));
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: '' }));
    }
  };

  // 第一步验证（基本信息）
  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username) {
      newErrors.username = '请输入用户名';
    } else if (formData.username.length < 3) {
      newErrors.username = '用户名至少需要3个字符';
    } else if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(formData.username)) {
      newErrors.username = '用户名只能包含字母、数字、下划线和中文';
    }

    if (!formData.email) {
      newErrors.email = '请输入邮箱地址';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少需要6个字符';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = '密码需要包含大小写字母和数字';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 第二步验证（角色选择和协议）
  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = '请同意服务条款和隐私政策';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理下一步
  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  // 处理上一步
  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  // 处理注册
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    try {
      setLoading(true);
      await register(formData.username, formData.email, formData.password, formData.role);
      // 注册成功后跳转到首页
      window.location.href = '/';
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : '注册失败，请重试' });
    } finally {
      setLoading(false);
    }
  };

  // 密码强度检查
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ['很弱', '弱', '一般', '强', '很强'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 页面标题 */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">WF</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">创建账户</h2>
          <p className="mt-2 text-sm text-gray-600">
            加入工作流分享平台，开始您的高效工作之旅
          </p>
        </div>

        {/* 步骤指示器 - 只在邮箱注册时显示 */}
        {registrationMethod === 'email' && (
          <div className="flex items-center justify-center space-x-4">
            <div className={clsx(
              'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            )}>
              {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <div className={clsx(
              'w-12 h-0.5',
              currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
            )} />
            <div className={clsx(
              'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            )}>
              2
            </div>
          </div>
        )}

        {/* 注册表单 */}
        <Card className="p-8">
          <form onSubmit={handleRegister}>
            {/* 通用错误信息 */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* 第0步：选择注册方式 */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">选择注册方式</h3>
                  <p className="text-sm text-gray-600">选择您喜欢的注册方式快速开始</p>
                </div>

                {/* 注册方式选项 */}
                <div className="space-y-4">
                  {/* GitHub注册 */}
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => handleRegistrationMethodSelect('github')}
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-3 py-4 border-2 hover:border-gray-400 transition-colors"
                  >
                    <Github className="w-5 h-5" />
                    <span>使用 GitHub 注册</span>
                  </Button>

                  {/* Google注册 */}
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => handleRegistrationMethodSelect('google')}
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-3 py-4 border-2 hover:border-gray-400 transition-colors"
                  >
                    <GoogleIcon className="w-5 h-5" />
                    <span>使用 Google 注册</span>
                  </Button>

                  {/* 分割线 */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">或</span>
                    </div>
                  </div>

                  {/* 邮箱注册 */}
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => handleRegistrationMethodSelect('email')}
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-3 py-4 border-2 hover:border-gray-400 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    <span>使用邮箱注册</span>
                  </Button>
                </div>

                {loading && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">正在跳转到授权页面...</p>
                  </div>
                )}
              </div>
            )}

            {/* 第一步：基本信息 */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">基本信息</h3>
                  <p className="text-sm text-gray-600">请填写您的基本注册信息</p>
                </div>

                {/* 用户名输入 */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    用户名
                  </label>
                  <div className="relative">
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="请输入用户名"
                      className={clsx(
                        'pl-10',
                        errors.username && 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      )}
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  )}
                </div>

                {/* 邮箱输入 */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    邮箱地址
                  </label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="请输入邮箱地址"
                      className={clsx(
                        'pl-10',
                        errors.email && 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      )}
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* 密码输入 */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    密码
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="请输入密码"
                      className={clsx(
                        'pl-10 pr-10',
                        errors.password && 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      )}
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {/* 密码强度指示器 */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={clsx(
                              'h-2 rounded-full transition-all duration-300',
                              strengthColors[passwordStrength - 1] || 'bg-gray-200'
                            )}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {strengthLabels[passwordStrength - 1] || ''}
                        </span>
                      </div>
                    </div>
                  )}
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* 确认密码输入 */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    确认密码
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="请再次输入密码"
                      className={clsx(
                        'pl-10 pr-10',
                        errors.confirmPassword && 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      )}
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* 按钮组 */}
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setCurrentStep(0);
                      setRegistrationMethod(null);
                    }}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    返回
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={handleNextStep}
                    className="flex-1"
                  >
                    下一步
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* 第二步：角色选择和协议 */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">选择您的角色</h3>
                  <p className="text-sm text-gray-600">不同角色拥有不同的功能权限</p>
                </div>

                {/* 角色选择 */}
                <div className="space-y-3">
                  {USER_ROLES.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => handleRoleSelect(role.value as any)}
                      className={clsx(
                        'w-full p-4 border-2 rounded-lg text-left transition-all duration-200',
                        formData.role === role.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={clsx(
                          'p-2 rounded-lg',
                          formData.role === role.value ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                        )}>
                          {role.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{role.label}</h4>
                          <p className="text-sm text-gray-600">{role.description}</p>
                        </div>
                        {formData.role === role.value && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* 服务条款同意 */}
                <div>
                  <div className="flex items-start space-x-3">
                    <input
                      id="agreeToTerms"
                      name="agreeToTerms"
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className={clsx(
                        'mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded',
                        errors.agreeToTerms && 'border-red-300'
                      )}
                    />
                    <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                      我已阅读并同意{' '}
                      <a href="/terms" className="text-blue-600 hover:text-blue-500">
                        服务条款
                      </a>{' '}
                      和{' '}
                      <a href="/privacy" className="text-blue-600 hover:text-blue-500">
                        隐私政策
                      </a>
                    </label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
                  )}
                </div>

                {/* 按钮组 */}
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      if (registrationMethod === 'email') {
                        handlePrevStep();
                      } else {
                        setCurrentStep(0);
                        setRegistrationMethod(null);
                      }
                    }}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    上一步
                  </Button>
                  <Button
                    type={registrationMethod === 'email' ? 'submit' : 'button'}
                    variant="primary"
                    size="lg"
                    loading={loading}
                    onClick={registrationMethod !== 'email' ? () => handleOAuthRegister(registrationMethod!) : undefined}
                    className="flex-1"
                  >
                    {loading ? (
                      registrationMethod === 'email' ? '注册中...' : '跳转中...'
                    ) : (
                      registrationMethod === 'email' ? '完成注册' : `使用 ${registrationMethod === 'github' ? 'GitHub' : 'Google'} 注册`
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Card>

        {/* 登录链接 */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            已有账户？{' '}
            <a
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              立即登录
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;