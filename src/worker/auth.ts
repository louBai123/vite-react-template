// 认证相关工具函数
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Env, User, JWTPayload, ApiResponse } from './types';
import { Database } from './database';

// JWT工具函数
export class AuthService {
  constructor(private env: Env, private db: Database) {}

  // 生成JWT Token
  async generateToken(user: User): Promise<string> {
    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24小时过期
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, this.env.JWT_SECRET);
  }

  // 验证JWT Token
  async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const payload = jwt.verify(token, this.env.JWT_SECRET) as JWTPayload;
      
      // 检查token是否过期
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }
      
      return payload;
    } catch (error) {
      return null;
    }
  }

  // 从请求头中提取token
  extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  // 验证用户权限
  async verifyPermission(token: string, requiredRoles: string[] = []): Promise<{ user: User; payload: JWTPayload } | null> {
    const payload = await this.verifyToken(token);
    if (!payload) return null;

    const user = await this.db.getUserById(payload.userId);
    if (!user || user.status !== 'active') return null;

    if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
      return null;
    }

    return { user, payload };
  }

  // 密码哈希
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  // 验证密码
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  // 用户注册
  async register(username: string, email: string, password: string, role: 'user' | 'creator' | 'advertiser' = 'user'): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      // 检查用户名是否已存在
      const existingUserByUsername = await this.db.getUserByUsername(username);
      if (existingUserByUsername) {
        return {
          code: 400,
          message: '用户名已存在',
          error: {
            field: 'username',
            reason: '该用户名已被使用'
          },
          timestamp: new Date().toISOString()
        };
      }

      // 检查邮箱是否已存在
      const existingUserByEmail = await this.db.getUserByEmail(email);
      if (existingUserByEmail) {
        return {
          code: 400,
          message: '邮箱已存在',
          error: {
            field: 'email',
            reason: '该邮箱已被注册'
          },
          timestamp: new Date().toISOString()
        };
      }

      // 密码强度验证
      if (password.length < 6) {
        return {
          code: 400,
          message: '密码强度不足',
          error: {
            field: 'password',
            reason: '密码长度至少6位'
          },
          timestamp: new Date().toISOString()
        };
      }

      // 创建用户
      const hashedPassword = await this.hashPassword(password);
      const newUser = await this.db.createUser({
        username,
        email,
        password_hash: hashedPassword,
        role,
        balance: 0,
        total_earnings: 0,
        status: 'active'
      } as any);

      // 生成token
      const token = await this.generateToken(newUser);

      // 移除密码哈希
      const { password_hash: _, ...userWithoutPassword } = newUser as any;

      return {
        code: 200,
        message: '注册成功',
        data: {
          user: userWithoutPassword as User,
          token
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        code: 500,
        message: '注册失败',
        error: {
          reason: '服务器内部错误'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // 用户登录
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      // 查找用户
      const user = await this.db.getUserByEmail(email);
      if (!user) {
        return {
          code: 401,
          message: '登录失败',
          error: {
            field: 'email',
            reason: '用户不存在'
          },
          timestamp: new Date().toISOString()
        };
      }

      // 检查用户状态
      if (user.status !== 'active') {
        return {
          code: 401,
          message: '账户已被禁用',
          error: {
            reason: '请联系管理员'
          },
          timestamp: new Date().toISOString()
        };
      }

      // 验证密码
      const isPasswordValid = await this.verifyPassword(password, (user as any).password_hash);
      if (!isPasswordValid) {
        return {
          code: 401,
          message: '登录失败',
          error: {
            field: 'password',
            reason: '密码错误'
          },
          timestamp: new Date().toISOString()
        };
      }

      // 生成token
      const token = await this.generateToken(user);

      return {
        code: 200,
        message: '登录成功',
        data: {
          user,
          token
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        code: 500,
        message: '登录失败',
        error: {
          reason: '服务器内部错误'
        },
        timestamp: new Date().toISOString()
      };
    }
  }
}

// 响应工具函数
export function createSuccessResponse<T>(data: T, message: string = 'success'): ApiResponse<T> {
  return {
    code: 200,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}

export function createErrorResponse(code: number, message: string, field?: string, reason?: string): ApiResponse {
  return {
    code,
    message,
    error: field && reason ? { field, reason } : { reason: reason || message },
    timestamp: new Date().toISOString()
  };
}

// 输入验证工具
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>"'&]/g, '');
}