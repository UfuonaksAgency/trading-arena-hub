import { Link } from 'react-router-dom';
import { Calendar, Clock, Tag } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image_url?: string;
  tags?: string[];
  reading_time?: number;
  published_at?: string;
  author_id: string;
  view_count?: number;
}

interface BlogCardProps {
  post: BlogPost;
  className?: string;
}

const BlogCard = ({ post, className = '' }: BlogCardProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className={`bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 group overflow-hidden ${className}`}>
      <Link to={`/blog/${post.slug}`}>
        {post.featured_image_url && (
          <div className="aspect-video overflow-hidden">
            <img 
              src={post.featured_image_url} 
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        
        <div className="p-6">
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-white/10 text-white/80 text-xs font-medium rounded-full flex items-center"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <h3 className="text-lg font-semibold mb-3 text-white group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
          
          {post.excerpt && (
            <p className="text-white/70 text-sm mb-4 leading-relaxed line-clamp-3">
              {post.excerpt}
            </p>
          )}
          
          <div className="flex items-center justify-between text-white/60 text-xs">
            <div className="flex items-center space-x-4">
              {post.published_at && (
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(post.published_at)}
                </div>
              )}
              {post.reading_time && (
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {post.reading_time} min read
                </div>
              )}
            </div>
            
            {post.view_count !== undefined && post.view_count > 0 && (
              <span>{post.view_count.toLocaleString()} views</span>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default BlogCard;