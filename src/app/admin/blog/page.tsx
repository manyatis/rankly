'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

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
  citations?: string[];
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'Strategy',
    author: 'Rankly Team',
    status: 'draft' as 'draft' | 'published',
    readTime: 5,
    citations: [] as string[]
  });
  const [aiFormData, setAiFormData] = useState({
    prompt: '',
    category: 'Strategy',
    tone: 'professional'
  });
  const [aiGenerating, setAiGenerating] = useState(false);
  const [viewingPost, setViewingPost] = useState<BlogPost | null>(null);
  const [newCitation, setNewCitation] = useState('');

  // Fetch all blog posts (including drafts) from API
  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isAIDialogOpen) {
          setIsAIDialogOpen(false);
        } else if (isCreateDialogOpen) {
          setIsCreateDialogOpen(false);
          setEditingPost(null);
          setNewCitation('');
          setFormData({ 
            title: '', 
            content: '', 
            excerpt: '', 
            category: 'Strategy', 
            author: 'Rankly Team', 
            status: 'draft',
            readTime: 5,
            citations: []
          });
        }
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isAIDialogOpen, isCreateDialogOpen]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/blog?admin=true');
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else if (response.status === 403) {
        setError('Admin access required. You do not have permission to manage blog posts.');
      } else if (response.status === 401) {
        setError('Please log in to access the blog management.');
      } else {
        setError('Failed to fetch blog posts. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setError('Error fetching blog posts. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          category: formData.category,
          status: formData.status,
          author: formData.author,
          citations: formData.citations
        }),
      });

      if (response.ok) {
        const newPost = await response.json();
        setPosts([newPost, ...posts]);
        setFormData({ 
          title: '', 
          content: '', 
          excerpt: '', 
          category: 'Strategy', 
          author: 'Rankly Team', 
          status: 'draft',
          readTime: 5,
          citations: []
        });
        setIsCreateDialogOpen(false);
      } else {
        console.error('Failed to create blog post');
        alert('Failed to create blog post. Please try again.');
      }
    } catch (error) {
      console.error('Error creating blog post:', error);
      alert('Error creating blog post. Please try again.');
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category,
      author: post.author,
      status: post.status,
      readTime: post.readTime,
      citations: post.citations || []
    });
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;

    try {
      const response = await fetch(`/api/blog/${editingPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          category: formData.category,
          status: formData.status,
          author: formData.author,
          citations: formData.citations
        }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        const updatedPosts = posts.map(post => 
          post.id === editingPost.id ? updatedPost : post
        );
        setPosts(updatedPosts);
        setEditingPost(null);
        setFormData({ 
          title: '', 
          content: '', 
          excerpt: '', 
          category: 'Strategy', 
          author: 'Rankly Team', 
          status: 'draft',
          readTime: 5,
          citations: []
        });
      } else {
        console.error('Failed to update blog post');
        alert('Failed to update blog post. Please try again.');
      }
    } catch (error) {
      console.error('Error updating blog post:', error);
      alert('Error updating blog post. Please try again.');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/blog/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId));
      } else {
        console.error('Failed to delete blog post');
        alert('Failed to delete blog post. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
      alert('Error deleting blog post. Please try again.');
    }
  };

  const handleGenerateAIPost = async () => {
    if (!aiFormData.prompt.trim()) {
      alert('Please enter a prompt for the AI to generate content.');
      return;
    }

    setAiGenerating(true);
    try {
      const response = await fetch('/api/blog/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiFormData.prompt,
          category: aiFormData.category,
          tone: aiFormData.tone
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Populate the create form with AI-generated content
        setFormData({
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          category: data.category,
          author: data.author,
          status: 'draft',
          readTime: data.suggestedReadTime || 5,
          citations: data.citations || []
        });
        
        // Close AI dialog and open create dialog
        setIsAIDialogOpen(false);
        setIsCreateDialogOpen(true);
        
        // Reset AI form
        setAiFormData({
          prompt: '',
          category: 'Strategy',
          tone: 'professional'
        });
      } else {
        console.error('Failed to generate AI content:', data.error);
        alert(data.error || 'Failed to generate content. Please try again.');
      }
    } catch (error) {
      console.error('Error generating AI content:', error);
      alert('Error generating content. Please try again.');
    } finally {
      setAiGenerating(false);
    }
  };

  const categories = ['Strategy', 'Technical', 'Best Practices', 'Case Study', 'Industry'];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const addCitation = () => {
    if (newCitation.trim()) {
      const currentCitations = formData.citations || [];
      const updatedCitations = [...currentCitations, newCitation.trim()];
      setFormData({ ...formData, citations: updatedCitations });
      setNewCitation('');
    }
  };

  const removeCitation = (index: number) => {
    const currentCitations = formData.citations || [];
    const updatedCitations = [...currentCitations];
    updatedCitations.splice(index, 1);
    setFormData({ ...formData, citations: updatedCitations });
  };

  const clearAllCitations = () => {
    setFormData({ ...formData, citations: [] });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="text-white">Loading...</div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-900/20 border border-red-600 rounded-lg p-6 text-center">
              <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
              <p className="text-red-300 mb-4">{error}</p>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-8 py-12">
          
          {/* Header Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Blog Management</h1>
            <p className="text-xl text-gray-400 mb-8">Create and manage industry insights and articles</p>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setIsAIDialogOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
              >
                ⚡ Create New AI Post
              </button>
              
              <button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
              >
                ➕ Create New Post
              </button>
            </div>
          </div>

          {/* Posts List */}
          <div className="bg-gray-900 rounded-lg p-8">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-xl mb-4">No blog posts yet</p>
                <p className="text-gray-500">Click the buttons above to create your first post</p>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">All Posts ({posts.length})</h2>
                {posts.map((post) => (
                  <div key={post.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">{post.title}</h3>
                        <p className="text-gray-400 mb-2">{post.excerpt}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>By {post.author}</span>
                          <span>•</span>
                          <span>{post.category}</span>
                          <span>•</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          post.status === 'published' 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-yellow-900 text-yellow-300'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => {
                          handleEditPost(post);
                          setIsCreateDialogOpen(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </button>
                      <button 
                        onClick={() => setViewingPost(post)}
                        className="text-gray-400 hover:text-gray-300 text-sm flex items-center"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-400 hover:text-red-300 text-sm flex items-center"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
      <Footer />

      {/* AI Generation Modal */}
      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Generate AI Blog Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-1">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What would you like to write about?
              </label>
              <Textarea
                value={aiFormData.prompt}
                onChange={(e) => setAiFormData({ ...aiFormData, prompt: e.target.value })}
                placeholder="e.g., 'How to optimize your website for AI search engines like ChatGPT and Claude' or 'The future of SEO in the age of AI'"
                className="bg-gray-800 border-gray-600 text-white"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={aiFormData.category}
                  onChange={(e) => setAiFormData({ ...aiFormData, category: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
                <select
                  value={aiFormData.tone}
                  onChange={(e) => setAiFormData({ ...aiFormData, tone: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white"
                >
                  <option value="professional">Professional</option>
                  <option value="conversational">Conversational</option>
                  <option value="technical">Technical</option>
                  <option value="educational">Educational</option>
                </select>
              </div>
            </div>
            
            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-blue-300 font-medium text-sm">How it works</p>
                  <p className="text-blue-200 text-sm mt-1">
                    AI will generate a complete blog post with title, excerpt, and content. You can then review and edit it before publishing.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAIDialogOpen(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateAIPost}
                disabled={!aiFormData.prompt.trim() || aiGenerating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {aiGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Post Modal */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">{editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter post title"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Author</label>
                <Input
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Read Time (minutes)</label>
                <Input
                  type="number"
                  value={formData.readTime}
                  onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) || 5 })}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Excerpt</label>
              <Textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief description of the post"
                className="bg-gray-800 border-gray-600 text-white"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your blog post content here..."
                className="bg-gray-800 border-gray-600 text-white"
                rows={8}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            {/* References Section */}
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">
                  References ({formData.citations?.length || 0})
                </label>
                {(formData.citations?.length || 0) > 0 && (
                  <button
                    type="button"
                    onClick={clearAllCitations}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Add new citation */}
              <div className="flex gap-2 mb-3">
                <Input
                  value={newCitation}
                  onChange={(e) => setNewCitation(e.target.value)}
                  placeholder="Add reference URL (e.g., https://example.com/article)"
                  className="bg-gray-900 border-gray-600 text-white text-sm flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCitation();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addCitation}
                  disabled={!newCitation.trim()}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 text-sm"
                >
                  Add
                </Button>
              </div>

              {/* Citations list */}
              {(formData.citations?.length || 0) > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {(formData.citations || []).map((citation, index) => (
                    <div key={index} className="flex items-start justify-between bg-gray-900 rounded p-2">
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-500 text-xs mr-2">[{index + 1}]</span>
                        <a 
                          href={citation} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-xs break-all"
                        >
                          {citation}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCitation(index)}
                        className="text-red-400 hover:text-red-300 ml-2 flex-shrink-0"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">No references added yet</p>
                  <p className="text-gray-600 text-xs mt-1">Add URLs to sources used in this blog post</p>
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-3 italic">
                References will be displayed at the bottom of the published blog post.
              </p>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setEditingPost(null);
                  setNewCitation('');
                  setFormData({ 
                    title: '', 
                    content: '', 
                    excerpt: '', 
                    category: 'Strategy', 
                    author: 'Rankly Team', 
                    status: 'draft',
                    readTime: 5,
                    citations: []
                  });
                }}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                onClick={editingPost ? handleUpdatePost : handleCreatePost}
                disabled={!formData.title || !formData.content}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingPost ? 'Update Post' : 'Create Post'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Post Modal */}
      <Dialog open={!!viewingPost} onOpenChange={(open) => !open && setViewingPost(null)}>
        <DialogContent className="max-w-4xl bg-gray-900 border-gray-700 max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white">{viewingPost?.title}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 p-4">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                viewingPost?.status === 'published' 
                  ? 'bg-green-900 text-green-300' 
                  : 'bg-yellow-900 text-yellow-300'
              }`}>
                {viewingPost?.status}
              </span>
              <span className="text-sm text-gray-400">By {viewingPost?.author}</span>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-400">{viewingPost?.category}</span>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-400">{viewingPost?.readTime} min read</span>
            </div>
            
            {viewingPost?.excerpt && (
              <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Excerpt</h3>
                <p className="text-gray-400">{viewingPost.excerpt}</p>
              </div>
            )}
            
            <div className="prose prose-invert max-w-none">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Content</h3>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="whitespace-pre-wrap text-gray-300" dangerouslySetInnerHTML={{ 
                  __html: viewingPost?.content?.replace(/\n/g, '<br />') || '' 
                }} />
              </div>
            </div>

            {/* References in View Modal */}
            {viewingPost?.citations && viewingPost.citations.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">References ({viewingPost.citations.length})</h3>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {viewingPost.citations.map((citation, index) => (
                      <div key={index} className="text-sm text-gray-400 break-all">
                        <span className="text-gray-500 mr-2">[{index + 1}]</span>
                        <a 
                          href={citation} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          {citation}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 p-4 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={() => setViewingPost(null)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                handleEditPost(viewingPost!);
                setViewingPost(null);
                setIsCreateDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Post
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}