'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userPhoto, setUserPhoto] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccess(message);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to fetch user profile photo based on username
  const fetchUserPhoto = async (username: string) => {
    if (!username) {
      setUserPhoto('');
      return;
    }

    try {
      const response = await fetch(`/api/user/photo?username=${encodeURIComponent(username)}`);
      if (response.ok) {
        const data = await response.json();
        setUserPhoto(data.profilePhoto || '');
      } else {
        setUserPhoto('');
      }
    } catch (err) {
      setUserPhoto('');
    }
  };

  // Debounce the photo fetch
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUserPhoto(formData.username);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data and token in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        router.push('/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen w-screen flex bg-white">
      {/* Left Side: Image and Welcome Text */}
      <div className="hidden md:flex flex-col justify-start items-start bg-gray-100 relative w-7/10 h-full">
        <Image
          src="/login_page.png"
          alt="Start your journey"
          fill
          className="object-cover absolute inset-0 z-0"
        />
        <div className="relative z-10 flex flex-col items-start justify-start h-full w-full p-16">
          <h1 className="text-5xl font-extrabold text-white mb-4 drop-shadow-lg mt-10">Start Your Journey</h1>
          <p className="text-2xl text-white/90 drop-shadow">Plan, explore, and create unforgettable travel experiences</p>
        </div>
      </div>
      {/* Right Side: Login Form */}
      <div className="w-full md:w-1/2 h-full bg-white/80 backdrop-blur-lg flex flex-col justify-center items-center p-16">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back to GlobeTrotter</h2>
            <p className="text-gray-700">Sign in to continue your journey</p>
          </div>
          {/* User Photo Display */}
          {userPhoto && (
            <div className="flex justify-center mb-8">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-200 shadow-lg">
                <Image
                  src={userPhoto}
                  alt="User profile"
                  fill
                  className="object-cover"
                  onError={() => setUserPhoto('')}
                />
              </div>
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-100/70 border border-red-300 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-100/70 border border-green-300 rounded-lg">
              <p className="text-green-700 text-sm font-medium">{success}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username or Email
              </label>
              <input
                type="text"
                id="username"
                name="username"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-5 py-3  text-gray-700 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-white/80 placeholder-gray-700 hover:border-blue-300 shadow-sm"
                placeholder="Enter your username or email"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 font-semibold">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-white/80 placeholder-gray-400 hover:border-blue-300 shadow-sm text-gray-900 pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    // Eye (open)
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12C4.286 8.228 8.349 5.25 12 5.25c3.651 0 7.714 2.978 9.75 6.75-2.036 3.772-6.099 6.75-9.75 6.75-3.651 0-7.714-2.978-9.75-6.75z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z" />
                    </svg>
                  ) : (
                    // Eye Slash (closed)
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 2.25 12c2.036 3.772 6.099 6.75 9.75 6.75 1.772 0 3.543-.443 5.02-1.223M6.53 6.53A6.75 6.75 0 0 1 12 5.25c3.651 0 7.714 2.978 9.75 6.75a10.477 10.477 0 0 1-1.227 1.977M6.53 6.53l10.94 10.94" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center mb-2">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 px-4 rounded-xl font-bold text-lg shadow-md hover:from-blue-600 hover:to-indigo-600 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
            <div className="text-center mt-4">
            <p className="text-gray-700">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-800 font-semibold">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
