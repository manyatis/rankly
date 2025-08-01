'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Calendar, Clock } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published';
  category: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  readTime: number; // minutes
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch published blog posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/blog');
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        } else {
          console.error('Failed to fetch blog posts');
          // Fallback to empty array or show error message
          setPosts([]);
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Strategy': 'bg-blue-600',
      'Technical': 'bg-green-600',
      'Best Practices': 'bg-purple-600',
      'Case Study': 'bg-orange-600',
      'Industry': 'bg-red-600'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-600';
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            News From The Rankly Team
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Stay ahead of the curve with expert insights, strategies, and best practices for optimizing your content across AI-powered search engines.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid gap-8 md:gap-12">
          {posts.map((post) => (
            <article
              key={post.id}
              onClick={() => router.push(`/blog/${post.slug}`)}
              className="bg-gray-900 border border-gray-700 rounded-xl p-8 hover:border-gray-600 transition-all duration-300 hover:shadow-xl cursor-pointer group"
            >
              {/* Category Badge */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(post.category)}`}>
                  {post.category}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                {post.title}
              </h2>

              {/* Meta Information */}
              <div className="flex items-center space-x-6 mb-6 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime} min read</span>
                </div>
                <span>By {post.author}</span>
              </div>

              {/* Excerpt */}
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                {post.excerpt}
              </p>

              {/* Read More Button */}
              <div className="inline-flex items-center text-blue-400 group-hover:text-blue-300 font-medium transition-colors">
                Read full article
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </article>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-8">
            {/* Skeleton Blog Posts */}
            {[...Array(3)].map((_, i) => (
              <article key={i} className="bg-gray-900 border border-gray-700 rounded-xl p-8">
                {/* Category Badge Skeleton */}
                <div className="mb-4">
                  <div className="h-6 bg-gray-600 rounded-full w-24 animate-pulse"></div>
                </div>

                {/* Title Skeleton */}
                <div className="mb-4">
                  <div className="h-8 bg-gray-600 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-8 bg-gray-700 rounded w-1/2 animate-pulse"></div>
                </div>

                {/* Meta Information Skeleton */}
                <div className="flex items-center space-x-6 mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-gray-600 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-600 rounded w-24 animate-pulse"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-gray-600 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-600 rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="h-4 bg-gray-600 rounded w-20 animate-pulse"></div>
                </div>

                {/* Excerpt Skeleton */}
                <div className="space-y-2 mb-6">
                  <div className="h-4 bg-gray-700 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-700 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
                </div>

                {/* Read More Button Skeleton */}
                <div className="h-4 bg-gray-600 rounded w-32 animate-pulse"></div>
              </article>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-white mb-4">No blog posts yet</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              We&apos;re working on creating valuable content about AI Engine Optimization. Check back soon for insights and best practices!
            </p>
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="mt-20 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-gray-700 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Stay Updated</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Get the latest insights on AI Engine Optimization delivered straight to your inbox. No spam, just valuable content to help you stay ahead.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}