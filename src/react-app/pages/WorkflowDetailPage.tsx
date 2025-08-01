import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { 
  Download, 
  Heart, 
  Share2, 
  Star, 
  Eye, 
  Calendar, 
  User, 
  Tag, 
  Shield, 
  Clock,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Flag,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Workflow, Review, User as UserType } from '../types';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { WorkflowCard } from '../components/WorkflowCard';
import { Breadcrumb } from '../components/Navigation';

// 工作流详情页面组件
export const WorkflowDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedWorkflows, setRelatedWorkflows] = useState<Workflow[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  // 加载工作流详情
  useEffect(() => {
    const loadWorkflowDetail = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [workflowRes, reviewsRes] = await Promise.all([
          api.workflow.getWorkflow(parseInt(id)),
          api.review.getWorkflowReviews(parseInt(id)),
        ]);
        
        setWorkflow(workflowRes.data);
        setReviews(reviewsRes.data.items);
        
        // 加载相关工作流
        if (workflowRes.data.category_id) {
          const relatedRes = await api.workflow.getWorkflows({
            category_id: workflowRes.data.category_id,
            limit: 4,
          });
          setRelatedWorkflows(relatedRes.data.items.filter(w => w.id !== parseInt(id)));
        }
        
        // 检查是否已收藏和购买（模拟）
        setIsFavorited(false);
        setIsPurchased(workflowRes.data.price === 0);
      } catch (error) {
        console.error('Failed to load workflow detail:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkflowDetail();
  }, [id]);

  // 处理图片导航
  const handlePrevImage = () => {
    if (workflow) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? workflow.preview_images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (workflow) {
      setCurrentImageIndex((prev) => 
        prev === workflow.preview_images.length - 1 ? 0 : prev + 1
      );
    }
  };

  // 处理收藏
  const handleFavorite = async () => {
    if (!user || !workflow) return;
    
    try {
      setIsFavorited(!isFavorited);
      // 调用收藏API
    } catch (error) {
      setIsFavorited(isFavorited);
      console.error('Failed to toggle favorite:', error);
    }
  };

  // 处理下载/购买
  const handleDownload = async () => {
    if (!workflow) return;
    
    try {
      if (workflow.price === 0 || isPurchased) {
        // 免费下载或已购买
        console.log('Download workflow:', workflow.id);
      } else {
        // 跳转到购买页面
        window.location.href = `/purchase/${workflow.id}`;
      }
    } catch (error) {
      console.error('Failed to download workflow:', error);
    }
  };

  // 处理分享
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: workflow?.title,
          text: workflow?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // 提交评价
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !workflow || !reviewText.trim()) return;
    
    try {
      setSubmittingReview(true);
      const newReview = await api.review.addReview(workflow.id, {
        rating: reviewRating,
        comment: reviewText.trim(),
      });
      
      setReviews([newReview.data, ...reviews]);
      setReviewText('');
      setReviewRating(5);
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setSubmittingReview(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">工作流未找到</h1>
          <p className="text-gray-600 mb-8">您访问的工作流不存在或已被删除</p>
          <Button onClick={() => window.history.back()}>返回上一页</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 面包屑导航 */}
        <Breadcrumb
          items={[
            { label: '首页', href: '/' },
            { label: '工作流', href: '/workflows' },
            { label: workflow.title },
          ]}
          className="mb-8"
        />

        {/* 主要内容 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* 左侧：图片展示 */}
          <div className="space-y-4">
            {/* 主图 */}
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={workflow.preview_images[currentImageIndex] || '/placeholder-workflow.png'}
                alt={workflow.title}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setIsImageModalOpen(true)}
              />
              
              {/* 图片导航 */}
              {workflow.preview_images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  {/* 图片指示器 */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {workflow.preview_images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={clsx(
                          'w-2 h-2 rounded-full transition-colors',
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* 缩略图 */}
            {workflow.preview_images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {workflow.preview_images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={clsx(
                      'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors',
                      index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                    )}
                  >
                    <img
                      src={image}
                      alt={`${workflow.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 右侧：工作流信息 */}
          <div className="space-y-6">
            {/* 标题和基本信息 */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{workflow.title}</h1>
                {workflow.is_featured && (
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    精选
                  </span>
                )}
              </div>
              
              {/* 评分和统计 */}
              <div className="flex items-center space-x-6 mb-4">
                <div className="flex items-center space-x-1">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={clsx(
                          'w-5 h-5',
                          star <= workflow.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold">{workflow.rating}</span>
                  <span className="text-gray-500">({workflow.review_count} 评价)</span>
                </div>
                
                <div className="flex items-center space-x-1 text-gray-500">
                  <Download className="w-4 h-4" />
                  <span>{workflow.download_count} 下载</span>
                </div>
                
                <div className="flex items-center space-x-1 text-gray-500">
                  <Eye className="w-4 h-4" />
                  <span>{workflow.download_count * 3} 浏览</span>
                </div>
              </div>
              
              {/* 价格 */}
              <div className="mb-6">
                {workflow.price === 0 ? (
                  <span className="text-3xl font-bold text-green-600">免费</span>
                ) : (
                  <span className="text-3xl font-bold text-blue-600">¥{workflow.price}</span>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex space-x-4">
              <Button
                variant="primary"
                size="lg"
                onClick={handleDownload}
                className="flex-1"
              >
                <Download className="w-5 h-5 mr-2" />
                {workflow.price === 0 || isPurchased ? '立即下载' : '立即购买'}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleFavorite}
                className={clsx(
                  isFavorited && 'text-red-500 border-red-500 hover:bg-red-50'
                )}
              >
                <Heart className={clsx('w-5 h-5', isFavorited && 'fill-current')} />
              </Button>
              
              <Button variant="outline" size="lg" onClick={handleShare}>
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* 创作者信息 */}
            <Card className="p-4">
              <div className="flex items-center space-x-4">
                <img
                  src={workflow.creator?.avatar || '/default-avatar.png'}
                  alt={workflow.creator?.username}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {workflow.creator?.username || '未知创作者'}
                  </h3>
                  <p className="text-sm text-gray-500">创作者</p>
                </div>
                <Button variant="outline" size="sm">
                  关注
                </Button>
              </div>
            </Card>

            {/* 工作流详情 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">工作流详情</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">发布时间：{formatDate(workflow.created_at)}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">最后更新：{formatDate(workflow.updated_at)}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">安全检测：已通过</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* 描述和标签 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">工作流描述</h2>
              <div className="prose max-w-none text-gray-700">
                {workflow.description ? (
                  <p className="whitespace-pre-wrap">{workflow.description}</p>
                ) : (
                  <p className="text-gray-500 italic">暂无描述</p>
                )}
              </div>
            </Card>
          </div>
          
          <div>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">标签</h3>
              {workflow.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {workflow.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">暂无标签</p>
              )}
            </Card>
          </div>
        </div>

        {/* 评价区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">用户评价</h2>
              
              {/* 评价表单 */}
              {user && (
                <form onSubmit={handleSubmitReview} className="mb-8 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-4">写评价</h3>
                  
                  {/* 评分 */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      评分
                    </label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className={clsx(
                            'w-6 h-6 transition-colors',
                            star <= reviewRating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300 hover:text-yellow-400'
                          )}
                        >
                          <Star className="w-full h-full" />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* 评价内容 */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      评价内容
                    </label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="分享您的使用体验..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    loading={submittingReview}
                    disabled={!reviewText.trim()}
                  >
                    提交评价
                  </Button>
                </form>
              )}
              
              {/* 评价列表 */}
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-start space-x-4">
                        <img
                          src={review.user?.avatar || '/default-avatar.png'}
                          alt={review.user?.username}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-gray-900">
                              {review.user?.username || '匿名用户'}
                            </h4>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={clsx(
                                    'w-4 h-4',
                                    star <= review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  )}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatDate(review.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-3">{review.comment}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <button className="flex items-center space-x-1 hover:text-blue-600">
                              <ThumbsUp className="w-4 h-4" />
                              <span>有用</span>
                            </button>
                            <button className="flex items-center space-x-1 hover:text-red-600">
                              <Flag className="w-4 h-4" />
                              <span>举报</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">暂无评价</p>
                )}
              </div>
            </Card>
          </div>
          
          {/* 评价统计 */}
          <div>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">评价统计</h3>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = reviews.filter(r => r.rating === rating).length;
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  
                  return (
                    <div key={rating} className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 w-12">
                        <span className="text-sm">{rating}</span>
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>

        {/* 相关推荐 */}
        {relatedWorkflows.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">相关推荐</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedWorkflows.map((relatedWorkflow) => (
                <WorkflowCard
                  key={relatedWorkflow.id}
                  workflow={relatedWorkflow}
                  onView={(id) => window.location.href = `/workflow/${id}`}
                  onDownload={handleDownload}
                  onFavorite={handleFavorite}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 图片模态框 */}
      {isImageModalOpen && workflow && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={workflow.preview_images[currentImageIndex]}
              alt={workflow.title}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            {workflow.preview_images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowDetailPage;