// 认证相关工具函数
import { Env, User, JWTPayload, ApiResponse, OAuthUserInfo } from './types';
import { Database } from './database';

// JWT工具函数
export class AuthService {
  constructor(private env: Env, private db: Database) { }

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

    return await this.signJWT(payload, this.env.JWT_SECRET);
  }

  // 验证JWT Token
  async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const payload = await this.verifyJWT(token, this.env.JWT_SECRET);

      // 检查token是否过期
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      return payload;
    } catch (error) {
      return null;
    }
  }

  // JWT签名函数（使用Web Crypto API）
  private async signJWT(payload: JWTPayload, secret: string): Promise<string> {
    const header = { alg: 'HS256', typ: 'JWT' };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));

    const data = `${encodedHeader}.${encodedPayload}`;
    const signature = await this.hmacSign(data, secret);

    return `${data}.${signature}`;
  }

  // JWT验证函数（使用Web Crypto API）
  private async verifyJWT(token: string, secret: string): Promise<JWTPayload> {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;

    const expectedSignature = await this.hmacSign(data, secret);
    if (signature !== expectedSignature) {
      throw new Error('Invalid JWT signature');
    }

    return JSON.parse(this.base64UrlDecode(encodedPayload));
  }

  // HMAC签名
  private async hmacSign(data: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    return this.base64UrlEncode(new Uint8Array(signature));
  }

  // Base64 URL编码
  private base64UrlEncode(data: string | Uint8Array): string {
    const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    const base64 = btoa(String.fromCharCode(...bytes));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  // Base64 URL解码
  private base64UrlDecode(data: string): string {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    return atob(padded);
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

  // 密码哈希（使用Web Crypto API）
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // 验证密码
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const hashedInput = await this.hashPassword(password);
    return hashedInput === hashedPassword;
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

  // GitHub OAuth认证
  async authenticateWithGitHub(code: string): Promise<OAuthUserInfo | null> {
    try {
      // 交换access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.env.GITHUB_CLIENT_ID,
          client_secret: this.env.GITHUB_CLIENT_SECRET,
          code: code,
        }),
      });

      const tokenData = await tokenResponse.json() as any;
      if (!tokenData.access_token) {
        return null;
      }

      // 获取用户信息
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${tokenData.access_token}`,
          'User-Agent': 'WorkflowPlatform',
        },
      });

      const userData = await userResponse.json() as any;

      // 获取用户邮箱（如果公开）
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `token ${tokenData.access_token}`,
          'User-Agent': 'WorkflowPlatform',
        },
      });

      const emailData = await emailResponse.json() as any;
      const primaryEmail = emailData.find((email: any) => email.primary)?.email || userData.email;

      return {
        id: userData.id.toString(),
        email: primaryEmail,
        name: userData.name || userData.login,
        avatar_url: userData.avatar_url,
        provider: 'github',
      };
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      return null;
    }
  }

  // Google OAuth认证
  async authenticateWithGoogle(code: string): Promise<OAuthUserInfo | null> {
    try {
      // 交换access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.env.GOOGLE_CLIENT_ID,
          client_secret: this.env.GOOGLE_CLIENT_SECRET,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: `${this.env.ENVIRONMENT === 'production' ? 'https://www.chaofengq.com' : 'http://localhost:5173'}/auth/google/callback`,
        }),
      });

      const tokenData = await tokenResponse.json() as any;
      if (!tokenData.access_token) {
        return null;
      }

      // 获取用户信息
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      const userData = await userResponse.json() as any;

      return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        avatar_url: userData.picture,
        provider: 'google',
      };
    } catch (error) {
      console.error('Google OAuth error:', error);
      return null;
    }
  }

  // OAuth注册/登录
  async oauthRegister(provider: 'github' | 'google', code: string, role: 'user' | 'creator' | 'advertiser' = 'user'): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      // 获取OAuth用户信息
      let oauthUser: OAuthUserInfo | null = null;

      if (provider === 'github') {
        oauthUser = await this.authenticateWithGitHub(code);
      } else if (provider === 'google') {
        oauthUser = await this.authenticateWithGoogle(code);
      }

      if (!oauthUser) {
        return {
          code: 400,
          message: 'OAuth认证失败',
          error: {
            reason: '无法获取用户信息'
          },
          timestamp: new Date().toISOString()
        };
      }

      // 检查用户是否已存在
      let existingUser = await this.db.getUserByEmail(oauthUser.email);

      if (existingUser) {
        // 用户已存在，直接登录
        if (existingUser.status !== 'active') {
          return {
            code: 401,
            message: '账户已被禁用',
            error: {
              reason: '请联系管理员'
            },
            timestamp: new Date().toISOString()
          };
        }

        // 更新头像（如果有）
        if (oauthUser.avatar_url && existingUser.avatar_url !== oauthUser.avatar_url) {
          existingUser = await this.db.updateUser(existingUser.id, { avatar_url: oauthUser.avatar_url });
        }

        const token = await this.generateToken(existingUser!);
        return {
          code: 200,
          message: '登录成功',
          data: {
            user: existingUser!,
            token
          },
          timestamp: new Date().toISOString()
        };
      }

      // 创建新用户
      const username = await this.generateUniqueUsername(oauthUser.name);
      const newUser = await this.db.createUser({
        username,
        email: oauthUser.email,
        password_hash: '', // OAuth用户不需要密码
        role,
        avatar_url: oauthUser.avatar_url,
        balance: 0,
        total_earnings: 0,
        status: 'active'
      } as any);

      const token = await this.generateToken(newUser);

      return {
        code: 200,
        message: '注册成功',
        data: {
          user: newUser,
          token
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('OAuth register error:', error);
      return {
        code: 500,
        message: 'OAuth注册失败',
        error: {
          reason: '服务器内部错误'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // 生成唯一用户名
  private async generateUniqueUsername(baseName: string): Promise<string> {
    // 清理用户名，只保留字母数字和下划线
    let cleanName = baseName.replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, '').substring(0, 15);
    if (!cleanName) {
      cleanName = 'user';
    }

    let username = cleanName;
    let counter = 1;

    // 检查用户名是否已存在，如果存在则添加数字后缀
    while (await this.db.getUserByUsername(username)) {
      username = `${cleanName}${counter}`;
      counter++;
    }

    return username;
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