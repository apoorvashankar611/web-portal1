import React from 'react';
import { Heart, MessageCircle, Share, Clock } from 'lucide-react';
import { Post } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface FeedPostProps {
  post: Post;
}

export const FeedPost: React.FC<FeedPostProps> = ({ post }) => {
  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'advice':
        return 'bg-green-100 text-green-800';
      case 'announcement':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'advice':
        return 'Career Advice';
      case 'announcement':
        return 'Announcement';
      default:
        return 'Update';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {post.user?.name?.charAt(0) || 'U'}
          </span>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-gray-900">{post.user?.name || 'Anonymous'}</h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getPostTypeColor(post.post_type)}`}
            >
              {getPostTypeLabel(post.post_type)}
            </span>
            <div className="flex items-center space-x-1 text-gray-500 text-sm">
              <Clock className="h-4 w-4" />
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
            </div>
          </div>
          
          <div className="text-gray-700 mb-4 whitespace-pre-wrap">
            {post.content}
          </div>
          
          <div className="flex items-center space-x-6 text-gray-500">
            <button className="flex items-center space-x-2 hover:text-red-500 transition-colors">
              <Heart className="h-4 w-4" />
              <span className="text-sm">{post.likes_count}</span>
            </button>
            
            <button className="flex items-center space-x-2 hover:text-blue-500 transition-colors">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">Comment</span>
            </button>
            
            <button className="flex items-center space-x-2 hover:text-green-500 transition-colors">
              <Share className="h-4 w-4" />
              <span className="text-sm">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};