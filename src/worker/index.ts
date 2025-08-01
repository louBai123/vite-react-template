import { Hono, Context, Next } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { Env, User, JWTPayload } from './types';
import { Database } from './database';
import { AuthService, createSuccessResponse, createErrorResponse, validateEmail, validateUsername, sanitizeInput } from './auth';

// 自定义Context类型
type AppContext = {
  Bindings: Env;
  Variables: {
    user: User;
    payload: JWTPayload;
  };
};

const app = new Hono<AppContext>();

// 中间件
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://your-domain.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use('*', logger());
app.use('/api/*', prettyJSON());

// 认证中间件
const authMiddleware = async (c: Context<AppContext>, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json(createErrorResponse(401, '未提供认证信息'), 401);
  }

  const db = new Database(c.env);
  const authService = new AuthService(c.env, db);
  const token = authService.extractTokenFromHeader(authHeader);

  if (!token) {
    return c.json(createErrorResponse(401, '无效的认证格式'), 401);
  }

  const authResult = await authService.verifyPermission(token);
  if (!authResult) {
    return c.json(createErrorResponse(401, '认证失败或已过期'), 401);
  }

  c.set('user', authResult.user);
  c.set('payload', authResult.payload);
  await next();
};

// 管理员权限中间件
const adminMiddleware = async (c: Context<AppContext>, next: Next) => {
  const user = c.get('user');
  if (!user || user.role !== 'admin') {
    return c.json(createErrorResponse(403, '需要管理员权限'), 403);
  }
  await next();
};

// 创作者权限中间件
const creatorMiddleware = async (c: Context<AppContext>, next: Next) => {
  const user = c.get('user');
  if (!user || !['creator', 'admin'].includes(user.role)) {
    return c.json(createErrorResponse(403, '需要创作者权限'), 403);
  }
  await next();
};

// 基础路由
app.get('/api/', (c) => {
  return c.json(createSuccessResponse({
    name: '工作流分享平台',
    version: '1.0.0',
    description: '基于React + Hono + Cloudflare Workers的工作流分享平台'
  }));
});

// 认证相关路由
app.post('/api/auth/register', async (c) => {
  try {
    const body = await c.req.json();
    const { username, email, password, role = 'user' } = body;

    // 输入验证
    if (!username || !email || !password) {
      return c.json(createErrorResponse(400, '缺少必要参数', 'form', '用户名、邮箱和密码不能为空'), 400);
    }

    if (!validateUsername(username)) {
      return c.json(createErrorResponse(400, '用户名格式错误', 'username', '用户名只能包含字母、数字和下划线，长度3-20位'), 400);
    }

    if (!validateEmail(email)) {
      return c.json(createErrorResponse(400, '邮箱格式错误', 'email', '请输入有效的邮箱地址'), 400);
    }

    const db = new Database(c.env);
    const authService = new AuthService(c.env, db);

    const result = await authService.register(
      sanitizeInput(username),
      sanitizeInput(email),
      password,
      role
    );

    return c.json(result, result.code as any);
  } catch (error) {
    return c.json(createErrorResponse(500, '注册失败', 'server', '服务器内部错误'), 500);
  }
});

app.post('/api/auth/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json(createErrorResponse(400, '缺少必要参数', 'form', '邮箱和密码不能为空'), 400);
    }

    if (!validateEmail(email)) {
      return c.json(createErrorResponse(400, '邮箱格式错误', 'email', '请输入有效的邮箱地址'), 400);
    }

    const db = new Database(c.env);
    const authService = new AuthService(c.env, db);

    const result = await authService.login(sanitizeInput(email), password);
    return c.json(result, result.code as any);
  } catch (error) {
    return c.json(createErrorResponse(500, '登录失败', 'server', '服务器内部错误'), 500);
  }
});

// OAuth注册/登录路由
app.post('/api/auth/oauth/:provider', async (c) => {
  try {
    const provider = c.req.param('provider') as 'github' | 'google';
    const body = await c.req.json();
    const { code, role = 'user' } = body;

    if (!['github', 'google'].includes(provider)) {
      return c.json(createErrorResponse(400, '不支持的OAuth提供商'), 400);
    }

    if (!code) {
      return c.json(createErrorResponse(400, '缺少授权码', 'code', '请提供OAuth授权码'), 400);
    }

    const db = new Database(c.env);
    const authService = new AuthService(c.env, db);

    const result = await authService.oauthRegister(provider, code, role);
    return c.json(result, result.code as any);
  } catch (error) {
    return c.json(createErrorResponse(500, 'OAuth认证失败', 'server', '服务器内部错误'), 500);
  }
});

// 获取OAuth授权URL
app.get('/api/auth/oauth/:provider/url', async (c) => {
  try {
    const provider = c.req.param('provider') as 'github' | 'google';
    const redirectUri = c.req.query('redirect_uri') || `${c.env.ENVIRONMENT === 'production' ? 'https://your-domain.com' : 'http://localhost:5173'}/auth/${provider}/callback`;

    let authUrl = '';
    
    if (provider === 'github') {
      const params = new URLSearchParams({
        client_id: c.env.GITHUB_CLIENT_ID,
        redirect_uri: redirectUri,
        scope: 'user:email',
        state: Math.random().toString(36).substring(7), // 简单的state参数
      });
      authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
    } else if (provider === 'google') {
      const params = new URLSearchParams({
        client_id: c.env.GOOGLE_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        state: Math.random().toString(36).substring(7),
      });
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    } else {
      return c.json(createErrorResponse(400, '不支持的OAuth提供商'), 400);
    }

    return c.json(createSuccessResponse({ authUrl }));
  } catch (error) {
    return c.json(createErrorResponse(500, '获取授权URL失败', 'server', '服务器内部错误'), 500);
  }
});

// 用户相关路由
app.get('/api/user/profile', authMiddleware, async (c) => {
  const user = c.get('user');
  return c.json(createSuccessResponse(user));
});

app.put('/api/user/profile', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const { username, avatar_url } = body;

    const db = new Database(c.env);
    const updates: any = {};

    if (username && username !== user.username) {
      if (!validateUsername(username)) {
        return c.json(createErrorResponse(400, '用户名格式错误', 'username', '用户名只能包含字母、数字和下划线，长度3-20位'), 400);
      }

      const existingUser = await db.getUserByUsername(username);
      if (existingUser && existingUser.id !== user.id) {
        return c.json(createErrorResponse(400, '用户名已存在', 'username', '该用户名已被使用'), 400);
      }

      updates.username = sanitizeInput(username);
    }

    if (avatar_url) {
      updates.avatar_url = sanitizeInput(avatar_url);
    }

    const updatedUser = await db.updateUser(user.id, updates);
    return c.json(createSuccessResponse(updatedUser, '个人信息更新成功'));
  } catch (error) {
    return c.json(createErrorResponse(500, '更新失败', 'server', '服务器内部错误'), 500);
  }
});

// 分类相关路由
app.get('/api/categories', async (c) => {
  try {
    const db = new Database(c.env);
    const categories = await db.getCategories();
    return c.json(createSuccessResponse(categories));
  } catch (error) {
    return c.json(createErrorResponse(500, '获取分类失败', 'server', '服务器内部错误'), 500);
  }
});

app.get('/api/categories/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json(createErrorResponse(400, '无效的分类ID'), 400);
    }

    const db = new Database(c.env);
    const category = await db.getCategoryById(id);

    if (!category) {
      return c.json(createErrorResponse(404, '分类不存在'), 404);
    }

    return c.json(createSuccessResponse(category));
  } catch (error) {
    return c.json(createErrorResponse(500, '获取分类失败', 'server', '服务器内部错误'), 500);
  }
});

// 工作流相关路由
app.get('/api/workflows', async (c) => {
  try {
    const query = c.req.query();
    const params = {
      page: query.page ? parseInt(query.page) : 1,
      pageSize: query.pageSize ? parseInt(query.pageSize) : 20,
      category: query.category ? parseInt(query.category) : undefined,
      status: query.status || 'approved',
      featured: query.featured === 'true' ? true : undefined,
      search: query.search,
      sortBy: query.sortBy || 'hot'
    };

    const db = new Database(c.env);
    const result = await db.getWorkflows(params);
    return c.json(createSuccessResponse(result));
  } catch (error) {
    return c.json(createErrorResponse(500, '获取工作流列表失败', 'server', '服务器内部错误'), 500);
  }
});

app.get('/api/workflows/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json(createErrorResponse(400, '无效的工作流ID'), 400);
    }

    const db = new Database(c.env);
    const workflow = await db.getWorkflowById(id);

    if (!workflow) {
      return c.json(createErrorResponse(404, '工作流不存在'), 404);
    }

    return c.json(createSuccessResponse(workflow));
  } catch (error) {
    return c.json(createErrorResponse(500, '获取工作流详情失败', 'server', '服务器内部错误'), 500);
  }
});

app.post('/api/workflows', authMiddleware, creatorMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const { title, description, category_id, subcategory_id, price = 0, tags = [], file_url, preview_images = [] } = body;

    // 输入验证
    if (!title || !category_id || !file_url) {
      return c.json(createErrorResponse(400, '缺少必要参数', 'form', '标题、分类和文件URL不能为空'), 400);
    }

    if (price < 0) {
      return c.json(createErrorResponse(400, '价格不能为负数', 'price', '请输入有效的价格'), 400);
    }

    const db = new Database(c.env);
    const workflow = await db.createWorkflow({
      creator_id: user.id,
      title: sanitizeInput(title),
      description: description ? sanitizeInput(description) : undefined,
      category_id,
      subcategory_id,
      price: parseFloat(price.toString()),
      tags: tags.map((tag: string) => sanitizeInput(tag)),
      file_url: sanitizeInput(file_url),
      preview_images: preview_images.map((img: string) => sanitizeInput(img)),
      status: 'pending',
      is_featured: false
    });

    return c.json(createSuccessResponse(workflow, '工作流创建成功，等待审核'), 201);
  } catch (error) {
    return c.json(createErrorResponse(500, '创建工作流失败', 'server', '服务器内部错误'), 500);
  }
});

// 创作者中心路由
app.get('/api/creator/workflows', authMiddleware, creatorMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const query = c.req.query();
    const params = {
      page: query.page ? parseInt(query.page) : 1,
      pageSize: query.pageSize ? parseInt(query.pageSize) : 20,
      creatorId: user.id,
      status: query.status
    };

    const db = new Database(c.env);
    const result = await db.getWorkflows(params);
    return c.json(createSuccessResponse(result));
  } catch (error) {
    return c.json(createErrorResponse(500, '获取创作者工作流失败', 'server', '服务器内部错误'), 500);
  }
});

app.get('/api/creator/stats', authMiddleware, creatorMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const db = new Database(c.env);

    // 获取创作者的工作流
    const workflows = await db.getWorkflows({ creatorId: user.id, pageSize: 1000 });

    const stats = {
      totalEarnings: user.total_earnings,
      monthlyEarnings: user.total_earnings * 0.3, // 假设30%是本月收入
      workflowCount: workflows.items.length,
      totalDownloads: workflows.items.reduce((sum, w) => sum + w.download_count, 0),
      averageRating: workflows.items.length > 0
        ? workflows.items.reduce((sum, w) => sum + w.rating, 0) / workflows.items.length
        : 0
    };

    return c.json(createSuccessResponse(stats));
  } catch (error) {
    return c.json(createErrorResponse(500, '获取创作者统计失败', 'server', '服务器内部错误'), 500);
  }
});

// 管理员路由
app.get('/api/admin/dashboard', authMiddleware, adminMiddleware, async (c) => {
  try {
    const db = new Database(c.env);
    const stats = await db.getDashboardStats();
    return c.json(createSuccessResponse(stats));
  } catch (error) {
    return c.json(createErrorResponse(500, '获取仪表盘数据失败', 'server', '服务器内部错误'), 500);
  }
});

app.get('/api/admin/workflows', authMiddleware, adminMiddleware, async (c) => {
  try {
    const query = c.req.query();
    const params = {
      page: query.page ? parseInt(query.page) : 1,
      pageSize: query.pageSize ? parseInt(query.pageSize) : 20,
      status: query.status,
      search: query.search,
      sortBy: query.sortBy
    };

    const db = new Database(c.env);
    const result = await db.getWorkflows(params);
    return c.json(createSuccessResponse(result));
  } catch (error) {
    return c.json(createErrorResponse(500, '获取工作流管理列表失败', 'server', '服务器内部错误'), 500);
  }
});

app.put('/api/admin/workflows/:id/status', authMiddleware, adminMiddleware, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    const { status } = body;

    if (!['pending', 'approved', 'rejected', 'offline'].includes(status)) {
      return c.json(createErrorResponse(400, '无效的状态值'), 400);
    }

    const db = new Database(c.env);
    const workflow = await db.updateWorkflow(id, { status });

    if (!workflow) {
      return c.json(createErrorResponse(404, '工作流不存在'), 404);
    }

    return c.json(createSuccessResponse(workflow, '工作流状态更新成功'));
  } catch (error) {
    return c.json(createErrorResponse(500, '更新工作流状态失败', 'server', '服务器内部错误'), 500);
  }
});

// 搜索路由
app.get('/api/search/workflows', async (c) => {
  try {
    const query = c.req.query();
    const params = {
      page: query.page ? parseInt(query.page) : 1,
      pageSize: query.pageSize ? parseInt(query.pageSize) : 20,
      search: query.q,
      category: query.category ? parseInt(query.category) : undefined,
      sortBy: query.sortBy || 'hot',
      status: 'approved'
    };

    const db = new Database(c.env);
    const result = await db.getWorkflows(params);
    return c.json(createSuccessResponse(result));
  } catch (error) {
    return c.json(createErrorResponse(500, '搜索失败', 'server', '服务器内部错误'), 500);
  }
});

// 错误处理
app.notFound((c) => {
  return c.json(createErrorResponse(404, '接口不存在'), 404);
});

app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json(createErrorResponse(500, '服务器内部错误'), 500);
});

export default app;
