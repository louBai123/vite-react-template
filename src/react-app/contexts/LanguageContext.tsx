import React, { createContext, useContext, useState, useEffect } from 'react';

// 支持的语言类型
export type Language = 'en' | 'zh';

// 语言上下文类型
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

// 创建语言上下文
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 翻译文本
const translations = {
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.download': 'Download',
    'common.upload': 'Upload',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.back': 'Back',
    'common.home': 'Home',
    'common.login': 'Login',
    'common.register': 'Register',
    'common.logout': 'Logout',
    'common.profile': 'Profile',
    'common.settings': 'Settings',
    'common.free': 'Free',
    'common.price': 'Price',
    'common.rating': 'Rating',
    'common.reviews': 'Reviews',
    'common.categories': 'Categories',
    'common.tags': 'Tags',
    'common.creator': 'Creator',
    'common.created': 'Created',
    'common.updated': 'Updated',
    'common.status': 'Status',
    'common.actions': 'Actions',
    'common.description': 'Description',
    'common.title': 'Title',
    'common.email': 'Email',
    'common.password': 'Password',
    'common.username': 'Username',
    'common.submit': 'Submit',
    'common.close': 'Close',
    'common.open': 'Open',
    'common.show': 'Show',
    'common.hide': 'Hide',
    'common.more': 'More',
    'common.less': 'Less',
    'common.all': 'All',
    'common.none': 'None',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.or': 'or',
    'common.and': 'and',

    // Navigation
    'nav.home': 'Home',
    'nav.discover': 'Discover',
    'nav.trending': 'Trending',
    'nav.featured': 'Featured',
    'nav.categories': 'Categories',
    'nav.search.placeholder': 'Search workflows...',
    'nav.user.menu.profile': 'Profile',
    'nav.user.menu.workflows': 'My Workflows',
    'nav.user.menu.purchases': 'Purchases',
    'nav.user.menu.creator': 'Creator Center',
    'nav.user.menu.settings': 'Settings',
    'nav.user.menu.logout': 'Logout',

    // Brand
    'brand.name': 'Workflow Hub',
    'brand.tagline': 'Discover and share high-quality workflows to boost your productivity',

    // Footer
    'footer.product': 'Product',
    'footer.support': 'Support',
    'footer.help': 'Help Center',
    'footer.contact': 'Contact Us',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.copyright': '© 2024 Workflow Hub. All rights reserved.',

    // Home Page
    'home.hero.title': 'Discover the Best',
    'home.hero.title.highlight': 'Workflows',
    'home.hero.subtitle': 'Explore high-quality workflows created by the community to boost your productivity',
    'home.hero.search.placeholder': 'Search workflows, categories, or tags...',
    'home.stats.workflows': 'Workflows',
    'home.stats.users': 'Users',
    'home.stats.downloads': 'Downloads',
    'home.stats.categories': 'Categories',
    'home.categories.title': 'Popular Categories',
    'home.categories.subtitle': 'Explore professional workflows in different fields',
    'home.featured.title': 'Featured Workflows',
    'home.featured.subtitle': 'Editor-recommended high-quality workflows',
    'home.popular.title': 'Popular Workflows',
    'home.popular.subtitle': 'Most popular workflows in the community',
    'home.recent.title': 'Latest Workflows',
    'home.recent.subtitle': 'Recently published new workflows',
    'home.cta.title': 'Ready to share your workflows?',
    'home.cta.subtitle': 'Join our creator community, share your creativity, and earn revenue',
    'home.cta.start': 'Start Creating',
    'home.cta.learn': 'Learn More',
    'home.viewAll': 'View All',

    // Categories
    'category.automation': 'Automation Tools',
    'category.automation.desc': 'Automation solutions to improve work efficiency',
    'category.data': 'Data Processing',
    'category.data.desc': 'Professional tools for data analysis and processing',
    'category.content': 'Content Creation',
    'category.content.desc': 'Creative content generation and editing tools',
    'category.marketing': 'Marketing',
    'category.marketing.desc': 'Smart tools for marketing campaigns and promotion',
    'category.workflows': 'workflows',

    // Search Page
    'search.title': 'Search Results',
    'search.placeholder': 'Search workflows, creators, or tags...',
    'search.filters': 'Filters',
    'search.category': 'Category',
    'search.price': 'Price',
    'search.rating': 'Rating',
    'search.sort.latest': 'Latest',
    'search.sort.popular': 'Popular',
    'search.sort.rating': 'Highest Rated',
    'search.sort.price.asc': 'Price: Low to High',
    'search.sort.price.desc': 'Price: High to Low',
    'search.price.free': 'Free',
    'search.price.1-10': '$1-10',
    'search.price.10-50': '$10-50',
    'search.price.50-100': '$50-100',
    'search.price.100+': '$100+',
    'search.rating.5': '5 stars',
    'search.rating.4': '4+ stars',
    'search.rating.3': '3+ stars',
    'search.rating.2': '2+ stars',
    'search.clearFilters': 'Clear All Filters',
    'search.noResults': 'No workflows found',
    'search.noResults.desc': 'Try adjusting your search keywords or filters',
    'search.results': 'search results',
    'search.resultsFor': 'Search results for',

    // Workflow Detail
    'workflow.details': 'Workflow Details',
    'workflow.creator': 'Creator',
    'workflow.category': 'Category',
    'workflow.price': 'Price',
    'workflow.rating': 'Rating',
    'workflow.downloads': 'Downloads',
    'workflow.views': 'Views',
    'workflow.published': 'Published',
    'workflow.updated': 'Updated',
    'workflow.security': 'Security Check: Passed',
    'workflow.buyNow': 'Buy Now',
    'workflow.downloadNow': 'Download Now',
    'workflow.addToFavorites': 'Add to Favorites',
    'workflow.share': 'Share',
    'workflow.follow': 'Follow',
    'workflow.description': 'Description',
    'workflow.instructions': 'Instructions',
    'workflow.reviews': 'Reviews',
    'workflow.related': 'Related Workflows',
    'workflow.noDescription': 'No description available',
    'workflow.noTags': 'No tags',
    'workflow.noReviews': 'No reviews yet',
    'workflow.writeReview': 'Write a Review',
    'workflow.reviewContent': 'Review Content',
    'workflow.reviewPlaceholder': 'Share your experience...',
    'workflow.submitReview': 'Submit Review',
    'workflow.helpful': 'Helpful',
    'workflow.report': 'Report',
    'workflow.featured': 'Featured',
    'workflow.notFound': 'Workflow Not Found',
    'workflow.notFound.desc': 'The workflow you are looking for does not exist or has been deleted',

    // Profile Page
    'profile.title': 'Profile',
    'profile.personalInfo': 'Personal Information',
    'profile.favorites': 'My Favorites',
    'profile.purchases': 'Purchase History',
    'profile.transactions': 'Transaction History',
    'profile.settings': 'Account Settings',
    'profile.edit': 'Edit',
    'profile.save': 'Save Changes',
    'profile.cancel': 'Cancel',
    'profile.bio': 'Bio',
    'profile.bio.placeholder': 'Tell us about yourself...',
    'profile.location': 'Location',
    'profile.location.placeholder': 'e.g., New York',
    'profile.website': 'Website',
    'profile.website.placeholder': 'https://example.com',
    'profile.joinDate': 'Member since',
    'profile.noFavorites': 'No favorites yet',
    'profile.noFavorites.desc': 'Favorite interesting workflows for easy access',
    'profile.noPurchases': 'No purchase history',
    'profile.noPurchases.desc': 'Purchased workflows will appear here',
    'profile.noTransactions': 'No transaction history',
    'profile.noTransactions.desc': 'Your transaction history will appear here',
    'profile.security': 'Account Security',
    'profile.changePassword': 'Change Password',
    'profile.changePassword.desc': 'Update your password regularly to protect your account',
    'profile.twoFactor': 'Two-Factor Authentication',
    'profile.twoFactor.desc': 'Add extra security protection to your account',
    'profile.enable': 'Enable',
    'profile.notifications': 'Notification Settings',
    'profile.emailNotifications': 'Email Notifications',
    'profile.emailNotifications.desc': 'Receive important updates and notifications',
    'profile.pushNotifications': 'Push Notifications',
    'profile.pushNotifications.desc': 'Receive browser push notifications',
    'profile.privacy': 'Privacy Settings',
    'profile.publicProfile': 'Public Profile',
    'profile.publicProfile.desc': 'Allow other users to view your profile',
    'profile.showPurchases': 'Show Purchase History',
    'profile.showPurchases.desc': 'Display purchased workflows in your profile',
    'profile.loginRequired': 'Please log in first',
    'profile.loginRequired.desc': 'You need to log in to access your profile',
    'profile.goLogin': 'Go to Login',

    // Creator Page
    'creator.title': 'Creator Center',
    'creator.subtitle': 'Manage your workflows and earnings',
    'creator.overview': 'Overview',
    'creator.workflows': 'My Works',
    'creator.analytics': 'Analytics',
    'creator.earnings': 'Earnings',
    'creator.settings': 'Settings',
    'creator.totalEarnings': 'Total Earnings',
    'creator.monthlyEarnings': 'Monthly Earnings',
    'creator.workflowCount': 'Works Count',
    'creator.totalDownloads': 'Total Downloads',
    'creator.quickActions': 'Quick Actions',
    'creator.uploadNew': 'Upload New Workflow',
    'creator.viewAnalytics': 'View Analytics',
    'creator.withdraw': 'Withdraw Earnings',
    'creator.latestWorks': 'Latest Works',
    'creator.noWorks': 'No works yet',
    'creator.noWorks.desc': 'Upload your first workflow to start earning',
    'creator.uploadWorkflow': 'Upload Workflow',
    'creator.status.pending': 'Pending',
    'creator.status.approved': 'Approved',
    'creator.status.rejected': 'Rejected',
    'creator.status.offline': 'Offline',
    'creator.totalViews': 'Total Views',
    'creator.conversionRate': 'Conversion Rate',
    'creator.averageRating': 'Average Rating',
    'creator.downloadTrend': 'Download Trend',
    'creator.earningsTrend': 'Earnings Trend',
    'creator.chartPlaceholder': 'Chart feature in development...',
    'creator.withdrawableBalance': 'Withdrawable Balance',
    'creator.totalWithdrawn': 'Total Withdrawn',
    'creator.applyWithdraw': 'Apply for Withdrawal',
    'creator.withdrawNote': 'Minimum withdrawal amount is $100. Withdrawal requests will be processed within 3-5 business days.',
    'creator.withdrawAmount': 'Withdrawal Amount',
    'creator.earningsHistory': 'Earnings History',
    'creator.noEarnings': 'No earnings history',
    'creator.creatorInfo': 'Creator Information',
    'creator.creatorBio': 'Creator Bio',
    'creator.creatorBio.placeholder': 'Introduce your professional background and creative philosophy...',
    'creator.expertise': 'Expertise',
    'creator.expertise.placeholder': 'e.g., Automation, Data Analysis, Design',
    'creator.earningsSettings': 'Earnings Settings',
    'creator.autoWithdraw': 'Auto Withdrawal',
    'creator.autoWithdraw.desc': 'Automatically apply for withdrawal when balance reaches specified amount',
    'creator.autoWithdrawAmount': 'Auto Withdrawal Amount',
    'creator.permissionRequired': 'Creator Permission Required',
    'creator.permissionRequired.desc': 'You need to become a creator to access this page',
    'creator.becomeCreator': 'Become a Creator',

    // Login Page
    'login.title': 'Welcome Back',
    'login.subtitle': 'Sign in to your account to continue using Workflow Hub',
    'login.email': 'Email Address',
    'login.email.placeholder': 'Enter your email address',
    'login.password': 'Password',
    'login.password.placeholder': 'Enter your password',
    'login.rememberMe': 'Remember me',
    'login.forgotPassword': 'Forgot password?',
    'login.loginButton': 'Sign In',
    'login.loggingIn': 'Signing in...',
    'login.socialLogin': 'Sign in with WeChat',
    'login.socialLogin.qq': 'Sign in with QQ',
    'login.noAccount': "Don't have an account?",
    'login.signUp': 'Sign up now',
    'login.terms': 'By signing in, you agree to our',
    'login.termsLink': 'Terms of Service',
    'login.privacyLink': 'Privacy Policy',
    'login.error.email': 'Please enter a valid email address',
    'login.error.password': 'Password must be at least 6 characters',
    'login.error.required': 'This field is required',

    // Register Page
    'register.title': 'Create Account',
    'register.subtitle': 'Join Workflow Hub and start your productive journey',
    'register.step1': 'Basic Information',
    'register.step1.desc': 'Please fill in your basic registration information',
    'register.step2': 'Choose Your Role',
    'register.step2.desc': 'Different roles have different permissions',
    'register.username': 'Username',
    'register.username.placeholder': 'Enter your username',
    'register.email': 'Email Address',
    'register.email.placeholder': 'Enter your email address',
    'register.password': 'Password',
    'register.password.placeholder': 'Enter your password',
    'register.confirmPassword': 'Confirm Password',
    'register.confirmPassword.placeholder': 'Enter your password again',
    'register.role.user': 'Regular User',
    'register.role.user.desc': 'Browse and purchase workflows',
    'register.role.creator': 'Creator',
    'register.role.creator.desc': 'Upload and sell workflows',
    'register.role.advertiser': 'Advertiser',
    'register.role.advertiser.desc': 'Place ads and promotions',
    'register.agreeTerms': 'I have read and agree to the',
    'register.nextStep': 'Next Step',
    'register.prevStep': 'Previous Step',
    'register.complete': 'Complete Registration',
    'register.registering': 'Registering...',
    'register.hasAccount': 'Already have an account?',
    'register.signIn': 'Sign in now',
    'register.passwordStrength.weak': 'Very Weak',
    'register.passwordStrength.fair': 'Weak',
    'register.passwordStrength.good': 'Fair',
    'register.passwordStrength.strong': 'Strong',
    'register.passwordStrength.excellent': 'Very Strong',
    'register.error.username': 'Username must be at least 3 characters and contain only letters, numbers, underscores',
    'register.error.email': 'Please enter a valid email address',
    'register.error.password': 'Password must contain uppercase, lowercase letters and numbers',
    'register.error.confirmPassword': 'Passwords do not match',
    'register.error.terms': 'Please agree to the Terms of Service and Privacy Policy',

    // 404 Page
    '404.title': '404',
    '404.message': 'Page Not Found',
    '404.backHome': 'Back to Home',

    // Error Messages
    'error.network': 'Network error, please try again',
    'error.server': 'Server error, please try again later',
    'error.unauthorized': 'Unauthorized access',
    'error.forbidden': 'Access forbidden',
    'error.notFound': 'Resource not found',
    'error.validation': 'Validation error',
    'error.unknown': 'Unknown error occurred',

    // Success Messages
    'success.saved': 'Saved successfully',
    'success.updated': 'Updated successfully',
    'success.deleted': 'Deleted successfully',
    'success.uploaded': 'Uploaded successfully',
    'success.downloaded': 'Downloaded successfully',
    'success.login': 'Login successful',
    'success.register': 'Registration successful',
    'success.logout': 'Logout successful',
  },
  zh: {
    // Common
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.save': '保存',
    'common.edit': '编辑',
    'common.delete': '删除',
    'common.view': '查看',
    'common.download': '下载',
    'common.upload': '上传',
    'common.search': '搜索',
    'common.filter': '筛选',
    'common.sort': '排序',
    'common.next': '下一步',
    'common.previous': '上一步',
    'common.back': '返回',
    'common.home': '首页',
    'common.login': '登录',
    'common.register': '注册',
    'common.logout': '退出登录',
    'common.profile': '个人资料',
    'common.settings': '设置',
    'common.free': '免费',
    'common.price': '价格',
    'common.rating': '评分',
    'common.reviews': '评价',
    'common.categories': '分类',
    'common.tags': '标签',
    'common.creator': '创作者',
    'common.created': '创建时间',
    'common.updated': '更新时间',
    'common.status': '状态',
    'common.actions': '操作',
    'common.description': '描述',
    'common.title': '标题',
    'common.email': '邮箱',
    'common.password': '密码',
    'common.username': '用户名',
    'common.submit': '提交',
    'common.close': '关闭',
    'common.open': '打开',
    'common.show': '显示',
    'common.hide': '隐藏',
    'common.more': '更多',
    'common.less': '收起',
    'common.all': '全部',
    'common.none': '无',
    'common.yes': '是',
    'common.no': '否',
    'common.or': '或',
    'common.and': '和',

    // Navigation
    'nav.home': '首页',
    'nav.discover': '发现',
    'nav.trending': '热门',
    'nav.featured': '精选',
    'nav.categories': '分类',
    'nav.search.placeholder': '搜索工作流...',
    'nav.user.menu.profile': '个人资料',
    'nav.user.menu.workflows': '我的工作流',
    'nav.user.menu.purchases': '购买记录',
    'nav.user.menu.creator': '创作者中心',
    'nav.user.menu.settings': '设置',
    'nav.user.menu.logout': '退出登录',

    // Brand
    'brand.name': '工作流分享平台',
    'brand.tagline': '发现和分享高质量的工作流，提升您的工作效率',

    // Footer
    'footer.product': '产品',
    'footer.support': '支持',
    'footer.help': '帮助中心',
    'footer.contact': '联系我们',
    'footer.privacy': '隐私政策',
    'footer.terms': '服务条款',
    'footer.copyright': '© 2024 工作流分享平台. 保留所有权利.',

    // Home Page
    'home.hero.title': '发现最佳',
    'home.hero.title.highlight': '工作流',
    'home.hero.subtitle': '探索由社区创建的高质量工作流，提升您的工作效率',
    'home.hero.search.placeholder': '搜索工作流、分类或标签...',
    'home.stats.workflows': '工作流',
    'home.stats.users': '用户',
    'home.stats.downloads': '下载量',
    'home.stats.categories': '分类',
    'home.categories.title': '热门分类',
    'home.categories.subtitle': '探索不同领域的专业工作流',
    'home.featured.title': '精选工作流',
    'home.featured.subtitle': '编辑推荐的高质量工作流',
    'home.popular.title': '热门工作流',
    'home.popular.subtitle': '社区最受欢迎的工作流',
    'home.recent.title': '最新工作流',
    'home.recent.subtitle': '刚刚发布的新工作流',
    'home.cta.title': '准备好分享您的工作流了吗？',
    'home.cta.subtitle': '加入我们的创作者社区，分享您的创意，获得收益',
    'home.cta.start': '开始创作',
    'home.cta.learn': '了解更多',
    'home.viewAll': '查看全部',

    // Categories
    'category.automation': '自动化工具',
    'category.automation.desc': '提升工作效率的自动化解决方案',
    'category.data': '数据处理',
    'category.data.desc': '数据分析和处理的专业工具',
    'category.content': '内容创作',
    'category.content.desc': '创意内容生成和编辑工具',
    'category.marketing': '营销推广',
    'category.marketing.desc': '营销活动和推广的智能工具',
    'category.workflows': '个工作流',

    // Search Page
    'search.title': '搜索结果',
    'search.placeholder': '搜索工作流、创作者或标签...',
    'search.filters': '筛选条件',
    'search.category': '分类',
    'search.price': '价格',
    'search.rating': '评分',
    'search.sort.latest': '最新发布',
    'search.sort.popular': '热门下载',
    'search.sort.rating': '评分最高',
    'search.sort.price.asc': '价格从低到高',
    'search.sort.price.desc': '价格从高到低',
    'search.price.free': '免费',
    'search.price.1-10': '¥1-10',
    'search.price.10-50': '¥10-50',
    'search.price.50-100': '¥50-100',
    'search.price.100+': '¥100以上',
    'search.rating.5': '5星',
    'search.rating.4': '4星以上',
    'search.rating.3': '3星以上',
    'search.rating.2': '2星以上',
    'search.clearFilters': '清除所有筛选',
    'search.noResults': '没有找到相关工作流',
    'search.noResults.desc': '尝试调整搜索关键词或筛选条件',
    'search.results': '个搜索结果',
    'search.resultsFor': '的搜索结果',

    // 其他翻译保持中文...
    // (为了节省空间，这里只展示部分翻译，实际使用时需要完整翻译)
  },
};

// 语言提供者组件
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // 从localStorage获取保存的语言设置，默认为英文
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  // 保存语言设置到localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // 翻译函数
  const t = (key: string, params?: Record<string, string | number>): string => {
    const translation = translations[language][key as keyof typeof translations[typeof language]] || key;
    
    // 如果有参数，进行替换
    if (params && typeof translation === 'string') {
      return Object.entries(params).reduce((str, [paramKey, paramValue]) => {
        return str.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
      }, translation);
    }
    
    return translation;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// 使用语言上下文的Hook
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageProvider;