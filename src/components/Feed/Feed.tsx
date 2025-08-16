import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, TrendingUp } from 'lucide-react';
import { FeedPost } from './FeedPost';
import { Post } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { suggestConnections } from '../../lib/ai';

export const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState<'update' | 'advice' | 'announcement'>('update');
  const [isPosting, setIsPosting] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
    if (user) {
      fetchSuggestions();
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:users(name, bio)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('id', user!.id);

      if (error) throw error;
      
      const connections = suggestConnections(user!, data || []);
      setSuggestions(connections);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !user) return;

    setIsPosting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          content: newPost.trim(),
          author_id: user.id,
          post_type: postType,
          likes_count: 0,
        });

      if (error) throw error;

      setNewPost('');
      await fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Professional Feed</h1>
            <p className="text-gray-600">Stay updated with industry insights and career advice</p>
          </div>

          {/* Create Post */}
          {user && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <form onSubmit={handlePostSubmit} className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <select
                      value={postType}
                      onChange={(e) => setPostType(e.target.value as any)}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="update">Share an update</option>
                      <option value="advice">Give career advice</option>
                      <option value="announcement">Make an announcement</option>
                    </select>
                  </div>
                </div>
                
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="What's on your mind? Share insights, career tips, or updates..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newPost.trim() || isPosting}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{isPosting ? 'Posting...' : 'Post'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Posts */}
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <TrendingUp className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600">Be the first to share something with the community!</p>
              </div>
            ) : (
              posts.map((post) => (
                <FeedPost key={post.id} post={post} />
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Suggested Connections */}
          {suggestions.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <h2 className="text-lg font-semibold text-gray-900">Suggested Connections</h2>
              </div>
              
              <div className="space-y-3">
                {suggestions.slice(0, 3).map((suggestion) => (
                  <div key={suggestion.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-xs">
                        {suggestion.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{suggestion.name}</p>
                      <p className="text-xs text-gray-500">
                        {suggestion.common_skills.length} common skills
                      </p>
                    </div>
                    <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Platform Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Jobs</span>
                <span className="text-sm font-medium text-gray-900">
                  {posts.filter(p => p.post_type === 'announcement').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Career Posts</span>
                <span className="text-sm font-medium text-gray-900">
                  {posts.filter(p => p.post_type === 'advice').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Community Updates</span>
                <span className="text-sm font-medium text-gray-900">
                  {posts.filter(p => p.post_type === 'update').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};