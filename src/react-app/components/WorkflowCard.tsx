import React, { useState } from 'react';
import clsx from 'clsx';
import { Star, Download, Heart, Eye, Tag, User, Calendar } from 'lucide-react';
import { Workflow } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

// 工作流卡片属性接口
interface WorkflowCardProps {
  workflow: Workflow;
  onFavorite?: (id: number) => void;
  onDownload?: (id: number) => void;
  onView?: (id: number) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

// 评分星星组件
const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' | 'lg' }> = ({ 
  rating, 
  size = 'sm' 
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="flex items-center space-x-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={clsx(
            sizeClasses[size],
            star <= rating
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300'
          )}
        />
      ))}
    </div>
  );
};

// 价格显示组件
const PriceDisplay: React.FC<{ price: number; className?: string }> = ({ 
  price, 
  className 
}) => {
  if (price === 0) {
    return (
      <span className={clsx('text-green-600 font-semibold', className)}>
        免费
      </span>
    );
  }

  return (
    <span className={clsx('text-blue-600 font-semibold', className)}>
      ¥{price.toFixed(2)}
    </span>
  );
};

// 标签组件
const TagList: React.FC<{ tags: string[]; maxTags?: number; className?: string }> = ({ 
  tags, 
  maxTags = 3, 
  className 
}) => {
  const displayTags = tags.slice(0, maxTags);
  const remainingCount = tags.length - maxTags;

  return (
    <div className={clsx('flex flex-wrap gap-1', className)}>
      {displayTags.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
        >
          <Tag className="w-3 h-3 mr-1" />
          {tag}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
          +{remainingCount}
        </span>
      )}
    </div>
  );
};

// 工作流卡片组件
export const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  onFavorite,
  onDownload,
  onView,
  showActions = true,
  variant = 'default',
  className,
}) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 处理收藏
  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavorite) {
      setIsFavorited(!isFavorited);
      try {
        await onFavorite(workflow.id);
      } catch (error) {
        setIsFavorited(isFavorited); // 回滚状态
      }
    }
  };

  // 处理下载
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload && !isLoading) {
      setIsLoading(true);
      try {
        await onDownload(workflow.id);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 处理查看
  const handleView = () => {
    if (onView) {
      onView(workflow.id);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // 紧凑版本
  if (variant === 'compact') {
    return (
      <Card 
        className={clsx('hover:shadow-md transition-shadow cursor-pointer', className)}
        onClick={handleView}
      >
        <div className="flex items-center space-x-4">
          {/* 预览图 */}
          <div className="flex-shrink-0">
            <img
              src={workflow.preview_images[0] || '/placeholder-workflow.png'}
              alt={workflow.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
          </div>
          
          {/* 内容 */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {workflow.title}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <StarRating rating={workflow.rating} />
              <span className="text-xs text-gray-500">
                ({workflow.review_count})
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <PriceDisplay price={workflow.price} className="text-sm" />
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Download className="w-3 h-3" />
                <span>{workflow.download_count}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // 详细版本
  if (variant === 'detailed') {
    return (
      <Card 
        className={clsx('hover:shadow-lg transition-all duration-300', className)}
        hoverable
      >
        {/* 预览图 */}
        <div className="relative aspect-video mb-4 cursor-pointer" onClick={handleView}>
          <img
            src={workflow.preview_images[0] || '/placeholder-workflow.png'}
            alt={workflow.title}
            className="w-full h-full object-cover rounded-lg"
          />
          {workflow.is_featured && (
            <div className="absolute top-2 left-2">
              <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                精选
              </span>
            </div>
          )}
          {showActions && (
            <div className="absolute top-2 right-2">
              <Button
                variant="ghost"
                size="sm"
                className="bg-white/80 hover:bg-white"
                onClick={handleFavorite}
              >
                <Heart 
                  className={clsx(
                    'w-4 h-4',
                    isFavorited ? 'text-red-500 fill-current' : 'text-gray-600'
                  )} 
                />
              </Button>
            </div>
          )}
        </div>

        {/* 内容 */}
        <div className="space-y-3">
          {/* 标题和评分 */}
          <div>
            <h3 
              className="text-lg font-semibold text-gray-900 mb-1 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={handleView}
            >
              {workflow.title}
            </h3>
            <div className="flex items-center space-x-2">
              <StarRating rating={workflow.rating} size="md" />
              <span className="text-sm text-gray-500">
                ({workflow.review_count} 评价)
              </span>
            </div>
          </div>

          {/* 描述 */}
          {workflow.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {workflow.description}
            </p>
          )}

          {/* 标签 */}
          {workflow.tags.length > 0 && (
            <TagList tags={workflow.tags} maxTags={4} />
          )}

          {/* 创作者信息 */}
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <User className="w-4 h-4" />
            <span>{workflow.creator?.username || '未知创作者'}</span>
            <Calendar className="w-4 h-4 ml-2" />
            <span>{formatDate(workflow.created_at)}</span>
          </div>

          {/* 底部信息 */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Download className="w-4 h-4" />
                <span>{workflow.download_count}</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Eye className="w-4 h-4" />
                <span>{workflow.download_count * 3}</span> {/* 假设浏览量是下载量的3倍 */}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <PriceDisplay price={workflow.price} className="text-lg" />
              {showActions && (
                <Button
                  variant="primary"
                  size="sm"
                  loading={isLoading}
                  onClick={handleDownload}
                >
                  {workflow.price === 0 ? '免费下载' : '立即购买'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // 默认版本
  return (
    <Card 
      className={clsx('hover:shadow-lg transition-all duration-300', className)}
      hoverable
    >
      {/* 预览图 */}
      <div className="relative aspect-video mb-3 cursor-pointer" onClick={handleView}>
        <img
          src={workflow.preview_images[0] || '/placeholder-workflow.png'}
          alt={workflow.title}
          className="w-full h-full object-cover rounded-lg"
        />
        {workflow.is_featured && (
          <div className="absolute top-2 left-2">
            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              精选
            </span>
          </div>
        )}
        {showActions && (
          <div className="absolute top-2 right-2">
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/80 hover:bg-white"
              onClick={handleFavorite}
            >
              <Heart 
                className={clsx(
                  'w-4 h-4',
                  isFavorited ? 'text-red-500 fill-current' : 'text-gray-600'
                )} 
              />
            </Button>
          </div>
        )}
      </div>

      {/* 内容 */}
      <div className="space-y-2">
        {/* 标题 */}
        <h3 
          className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors line-clamp-1"
          onClick={handleView}
        >
          {workflow.title}
        </h3>

        {/* 评分和统计 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <StarRating rating={workflow.rating} />
            <span className="text-xs text-gray-500">
              ({workflow.review_count})
            </span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Download className="w-3 h-3" />
            <span>{workflow.download_count}</span>
          </div>
        </div>

        {/* 标签 */}
        {workflow.tags.length > 0 && (
          <TagList tags={workflow.tags} maxTags={2} />
        )}

        {/* 底部 */}
        <div className="flex items-center justify-between pt-2">
          <PriceDisplay price={workflow.price} />
          {showActions && (
            <Button
              variant="primary"
              size="sm"
              loading={isLoading}
              onClick={handleDownload}
            >
              {workflow.price === 0 ? '下载' : '购买'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default WorkflowCard;