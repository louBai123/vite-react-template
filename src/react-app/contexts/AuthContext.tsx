import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthResponse } from '../types';
import { authApi, tokenManager } from '../services/api';

// 认证状态类型
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// 认证动作类型
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'CLEAR_ERROR' };

// 初始状态
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// 认证reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...initialState,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// 认证上下文类型
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role?: string) => Promise<void>;
  oauthLogin: (provider: 'github' | 'google', code: string, role?: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者组件
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 检查认证状态
  const checkAuth = async () => {
    const token = tokenManager.getToken();
    if (!token) {
      return;
    }

    dispatch({ type: 'AUTH_START' });
    try {
      const user = await authApi.getCurrentUser();
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      });
    } catch (error) {
      // Token无效，清除本地存储
      tokenManager.clearToken();
      dispatch({
        type: 'AUTH_FAILURE',
        payload: '认证已过期，请重新登录',
      });
    }
  };

  // 用户登录
  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response: AuthResponse = await authApi.login({ email, password });
      
      // 保存token
      tokenManager.setToken(response.token);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          token: response.token,
        },
      });
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : '登录失败',
      });
      throw error;
    }
  };

  // 用户注册
  const register = async (username: string, email: string, password: string, role: string = 'user') => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response: AuthResponse = await authApi.register({
        username,
        email,
        password,
        role: role as 'user' | 'creator' | 'advertiser',
      });
      
      // 保存token
      tokenManager.setToken(response.token);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          token: response.token,
        },
      });
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : '注册失败',
      });
      throw error;
    }
  };

  // OAuth登录
  const oauthLogin = async (provider: 'github' | 'google', code: string, role: string = 'user') => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response: AuthResponse = await authApi.oauthLogin(provider, code, role);
      
      // 保存token
      tokenManager.setToken(response.token);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          token: response.token,
        },
      });
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'OAuth登录失败',
      });
      throw error;
    }
  };

  // 用户登出
  const logout = () => {
    tokenManager.clearToken();
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  // 更新用户信息
  const updateUser = async (userData: Partial<User>) => {
    try {
      const updatedUser = await authApi.updateProfile(userData);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    } catch (error) {
      throw error;
    }
  };

  // 清除错误
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // 组件挂载时检查认证状态
  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    oauthLogin,
    logout,
    updateUser,
    clearError,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 使用认证上下文的Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 权限检查Hook
export const usePermission = () => {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (roles: string | string[]): boolean => {
    if (!isAuthenticated || !user) return false;
    
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  const isCreator = (): boolean => {
    return hasRole(['creator', 'admin']);
  };

  const isAdvertiser = (): boolean => {
    return hasRole(['advertiser', 'admin']);
  };

  const canManageWorkflow = (creatorId: number): boolean => {
    if (!isAuthenticated || !user) return false;
    return user.role === 'admin' || user.id === creatorId;
  };

  return {
    hasRole,
    isAdmin,
    isCreator,
    isAdvertiser,
    canManageWorkflow,
  };
};

// 导出认证上下文
export default AuthContext;