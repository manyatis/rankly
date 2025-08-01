'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Calendar, Clock, ArrowLeft, User, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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
  readTime: number;
  viewCount: number;
  citations?: string[];
}

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        // First, fetch all posts to find the one with matching slug
        const response = await fetch('/api/blog');
        if (response.ok) {
          const posts = await response.json();
          const matchingPost = posts.find((p: BlogPost) => p.slug === params.slug);
          
          if (matchingPost) {
            setPost(matchingPost);
            // Track the view
            trackView(matchingPost.slug);
          } else {
            setError('Blog post not found');
          }
        } else {
          setError('Failed to fetch blog post');
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
        setError('Error loading blog post');
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchPost();
    }
  }, [params.slug]);

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

  const shareOnTwitter = () => {
    if (!post) return;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this article: ${post.title}`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const shareOnFacebook = () => {
    if (!post) return;
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    if (!post) return;
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post.title);
    const summary = encodeURIComponent(post.excerpt);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`, '_blank');
  };

  const trackView = async (slug: string) => {
    try {
      await fetch(`/api/blog/${slug}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      // Silently fail - view tracking shouldn't break the user experience
      console.log('Failed to track view:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-24 mb-4"></div>
            <div className="h-12 bg-gray-700 rounded w-3/4 mb-6"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Post Not Found</h1>
          <p className="text-gray-400 mb-8">{error || 'The blog post you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => router.push('/blog')}
            className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <article className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/blog')}
          className="inline-flex items-center text-gray-400 hover:text-white font-medium transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </button>

        {/* Category Badge */}
        <div className="mb-6">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${getCategoryColor(post.category)}`}>
            {post.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-gray-400 pb-8 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>{post.author}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>{post.readTime} min read</span>
          </div>
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>{post.viewCount.toLocaleString()} views</span>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg prose-invert max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-3xl font-bold text-white mt-8 mb-4">{children}</h1>,
              h2: ({ children }) => <h2 className="text-2xl font-bold text-white mt-8 mb-4">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xl font-bold text-white mt-6 mb-3">{children}</h3>,
              p: ({ children }) => <p className="text-gray-300 mb-6 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside text-gray-300 mb-6 space-y-2">{children}</ol>,
              li: ({ children }) => <li className="text-gray-300">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-600 pl-6 my-6 text-gray-400 italic">
                  {children}
                </blockquote>
              ),
              code: (props: { inline?: boolean; children?: React.ReactNode }) => 
                props.inline ? (
                  <code className="bg-gray-800 text-blue-400 px-1.5 py-0.5 rounded text-sm">{props.children}</code>
                ) : (
                  <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 overflow-x-auto mb-6">
                    <code className="text-gray-300 text-sm">{props.children}</code>
                  </pre>
                ),
              a: ({ href, children }) => (
                <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
              strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
              em: ({ children }) => <em className="text-gray-300 italic">{children}</em>,
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* References Section */}
        {post.citations && post.citations.length > 0 && (
          <div className="mt-16 p-6 bg-gray-900 border border-gray-700 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              References
            </h3>
            <div className="space-y-2">
              {post.citations.map((citation, index) => (
                <div key={index} className="text-sm text-gray-400 break-words">
                  <span className="text-gray-500 mr-2">[{index + 1}]</span>
                  <a 
                    href={citation} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline transition-colors"
                  >
                    {citation}
                  </a>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4 italic">
              Sources were accessed and verified at the time of publication using AI-powered web search.
            </p>
          </div>
        )}

        {/* Author Box */}
        <div className="mt-8 p-6 bg-gray-900 border border-gray-700 rounded-xl">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">{post.author}</h3>
              <p className="text-gray-400">Content Writer at Rankly</p>
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="mt-12 flex items-center justify-between border-t border-gray-800 pt-8">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">Share this article</h4>
            <div className="flex space-x-4">
              <button 
                onClick={shareOnTwitter}
                className="text-gray-400 hover:text-blue-400 transition-colors"
                title="Share on Twitter"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </button>
              <button 
                onClick={shareOnFacebook}
                className="text-gray-400 hover:text-blue-600 transition-colors"
                title="Share on Facebook"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button 
                onClick={shareOnLinkedIn}
                className="text-gray-400 hover:text-blue-700 transition-colors"
                title="Share on LinkedIn"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <button
            onClick={() => router.push('/blog')}
            className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Back to all posts
            <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
          </button>
        </div>
      </article>

      <Footer />
    </div>
  );
}