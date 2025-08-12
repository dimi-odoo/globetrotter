'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface User {
  _id: string;
  username: string;
  firstName: string;
  email: string;
  profilePhoto?: string;
}

interface Comment {
  _id: string;
  user: User;
  content: string;
  createdAt: string;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  author: User;
  comments: Comment[];
  likes: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchPosts(1);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsProfileDropdownOpen(false);
    router.push('/');
  };

  const fetchPosts = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/community/posts?page=${page}&limit=10`);
      
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
        setPagination(data.pagination);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        })
      });

      if (response.ok) {
        const post = await response.json();
        setPosts([post, ...posts]);
        setNewPost({ title: '', content: '', tags: '' });
        setShowCreatePost(false);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Like response:', data); // Debug log
        setPosts(posts.map(post => {
          if (post._id === postId) {
            const currentLikes = post.likes || [];
            const newLikes = data.isLiked 
              ? [...currentLikes, user!._id]
              : currentLikes.filter(id => id !== user!._id);
            
            console.log('Updating likes:', { currentLikes, newLikes, isLiked: data.isLiked }); // Debug log
            
            return {
              ...post,
              likes: newLikes
            };
          }
          return post;
        }));
      } else {
        const errorData = await response.json();
        console.error('Failed to toggle like:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const addComment = async (postId: string) => {
    const content = commentInputs[postId];
    
    if (!content?.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        const comment = await response.json();
        setPosts(posts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: [...post.comments, comment]
            };
          }
          return post;
        }));
        setCommentInputs({ ...commentInputs, [postId]: '' });
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading community posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                Globe<span className="text-blue-600">trotter</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/plan-trip"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Plan Trip
              </Link>
              <Link
                href="/calendar"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Calendar
              </Link>
              <Link
                href="/community"
                className="text-blue-600 font-medium"
              >
                Community
              </Link>
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">Welcome, {user.firstName}!</span>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium"
                    >
                      {user.profilePhoto ? (
                        <img
                          src={user.profilePhoto}
                          alt="Profile"
                          className="w-6 h-6 rounded-full mr-2 object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-white text-blue-600 rounded-full mr-2 flex items-center justify-center text-sm font-bold">
                          {user.firstName?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      Profile
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          View Profile
                        </Link>
                        <Link
                          href="/my-trips"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          My Trips
                        </Link>
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/30 z-10"></div>
        <Image
          src="/communicty.jpg"
          alt="Travel Community"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div className="relative z-30 h-full flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              Travel Community
            </h1>
            <p className="text-xl md:text-2xl opacity-90 drop-shadow-md max-w-3xl mx-auto">
              Share your adventures and connect with fellow travelers
            </p>
          </div>
        </div>
      </section>

      {/* Community Header */}
      <section className="bg-white shadow-lg -mt-16 relative z-30 mx-4 sm:mx-8 lg:mx-16 rounded-2xl">
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Community</h2>
                <p className="text-gray-600">Share your travel experiences and connect with fellow travelers</p>
              </div>
              <button
                onClick={() => setShowCreatePost(true)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg"
              >
                Create Post
              </button>
            </div>
          </div>
        </div>
      </section>

             {/* Posts Section */}
       <section className="py-20 bg-gray-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Posts List */}
          <div className="space-y-8">
            {posts.map((post) => (
              <div key={post._id} className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 overflow-hidden">
                {/* Post Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                                         <div className="flex items-center">
                       <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-lg">
                         {post.author.username.charAt(0).toUpperCase()}
                       </div>
                      <div className="ml-4">
                        <p className="font-semibold text-gray-900 text-lg">{post.author.username}</p>
                        <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{post.title}</h3>
                  <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">{post.content}</p>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="px-6 py-4 bg-gray-50">
                  <div className="flex items-center space-x-8">
                    <button
                      onClick={() => toggleLike(post._id)}
                      className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                        (post.likes || []).includes(user!._id)
                          ? 'text-red-600'
                          : 'text-gray-600 hover:text-red-600'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      <span>{(post.likes || []).length} likes</span>
                    </button>
                    <span className="text-sm text-gray-600 font-medium">
                      {post.comments.length} comments
                    </span>
                  </div>
                </div>

                                 {/* Comments Section */}
                 <div className="bg-gray-50 border-t-2 border-gray-200">
                   {/* Comments Header */}
                   <div className="px-6 py-4 border-b-2 border-gray-300 bg-white rounded-t-lg">
                     <div className="flex items-center justify-between">
                       <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                         <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                         </svg>
                         Comments ({post.comments.length})
                       </h4>
                       <span className="text-sm text-gray-500">Join the conversation</span>
                     </div>
                   </div>

                   {/* Comments List */}
                   <div className="p-6 space-y-4 bg-white rounded-b-lg">
                     {post.comments.length > 0 ? (
                       post.comments.map((comment) => (
                         <div key={comment._id} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all duration-200 shadow-sm">
                           <div className="flex items-start space-x-3">
                             <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                               {comment.user.username.charAt(0).toUpperCase()}
                             </div>
                             <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                               <p className="font-semibold text-gray-900 text-sm">{comment.user.username}</p>
                               <span className="text-xs text-gray-400">•</span>
                               <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                             </div>
                             <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                             <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-100">
                                 <button className="text-xs text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1">
                                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                   </svg>
                                   Like
                                 </button>
                                 <button className="text-xs text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1">
                                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                   </svg>
                                   Reply
                                 </button>
                               </div>
                             </div>
                           </div>
                         </div>
                       ))
                     ) : (
                       <div className="text-center py-6">
                         <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                           <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                           </svg>
                         </div>
                         <p className="text-gray-500 text-sm">No comments yet. Be the first to share your thoughts!</p>
                       </div>
                     )}

                     {/* Add Comment Section */}
                     <div className="bg-white border-2 border-blue-200 rounded-lg p-4 shadow-md">
                       <div className="flex items-start space-x-3">
                         <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                           {user?.username.charAt(0).toUpperCase()}
                         </div>
                         <div className="flex-1">
                           <div className="mb-2">
                             <p className="text-sm font-medium text-gray-900 mb-1">Add a comment</p>
                             <p className="text-xs text-gray-500">Share your thoughts and experiences</p>
                           </div>
                           <div className="space-y-2">
                             <textarea
                               value={commentInputs[post._id] || ''}
                               onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                               placeholder="What are your thoughts on this post? Share your travel experience..."
                               rows={2}
                               onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && addComment(post._id)}
                             />
                             <div className="flex items-center justify-between">
                               <p className="text-xs text-gray-500">
                                 Press Enter to post, Shift+Enter for new line
                               </p>
                               <button
                                 onClick={() => addComment(post._id)}
                                 disabled={!commentInputs[post._id]?.trim()}
                                 className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                               >
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                 </svg>
                                 Post Comment
                               </button>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center mt-12 space-x-3">
              <button
                onClick={() => fetchPosts(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  pagination.hasPrev
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Previous
              </button>
              
              <span className="px-6 py-3 text-gray-600 font-medium">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => fetchPosts(currentPage + 1)}
                disabled={!pagination.hasNext}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  pagination.hasNext
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          )}

          {posts.length === 0 && !loading && (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-6">
                <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No posts yet</h3>
              <p className="text-gray-600 mb-8 text-lg">Be the first to share your travel story!</p>
              <button
                onClick={() => setShowCreatePost(true)}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
              >
                Create First Post
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Create New Post</h2>
              <button
                onClick={() => setShowCreatePost(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={createPost}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Title *
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full px-4 text-gray-700 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="Enter post title..."
                  maxLength={200}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Content *
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={8}
                  placeholder="Share your travel story, tips, or ask questions..."
                  maxLength={2000}
                  required
                />
              </div>
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tags (optional)
                </label>
                <input
                  type="text"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                  className="w-full px-4 text-gray-700 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="travel, tips, backpacking (comma separated)"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreatePost(false)}
                  className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                >
                  Create Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
