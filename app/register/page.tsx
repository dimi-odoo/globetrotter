'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { defaultAvatars } from '@/lib/defaultAvatars';
import AvatarPickerModal from '@/components/AvatarPickerModal';
import { User, Mail, Lock, Phone, MapPin, Globe, Camera, Eye, EyeOff, Check, X } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(defaultAvatars[0].url);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    city: '',
    country: '',
    description: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep1 = () => {
    return formData.firstName && formData.lastName && selectedAvatar;
  };

  const validateStep2 = () => {
    return formData.username && formData.email && formData.password && 
           formData.confirmPassword && formData.password === formData.confirmPassword &&
           formData.password.length >= 6;
  };

  const validateStep3 = () => {
    return formData.phoneNumber && formData.city && formData.country;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          profilePhoto: selectedAvatar
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/login?message=Registration successful! Please login.');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepProgress = () => (step / 3) * 100;

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  const PasswordStrength = ({ password }: { password: string }) => {
    const checks = [
      { label: 'At least 6 characters', valid: password.length >= 6 },
      { label: 'Contains uppercase', valid: /[A-Z]/.test(password) },
      { label: 'Contains lowercase', valid: /[a-z]/.test(password) },
      { label: 'Contains number', valid: /\d/.test(password) },
    ];

    return (
      <div className="mt-2 space-y-2">
        {checks.map((check, index) => (
          <div key={index} className="flex items-center text-xs gap-2">
            {check.valid ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <X className="w-3 h-3 text-red-400" />
            )}
            <span className={check.valid ? 'text-green-600' : 'text-gray-500'}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Globe className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Globetrotter
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Create Your Account
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Join thousands of travelers and start your journey today
          </p>
          
          {/* Progress Bar */}
          <div className="w-full max-w-md mx-auto mb-8">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span className={step >= 1 ? 'text-indigo-600 font-medium' : ''}>Profile</span>
              <span className={step >= 2 ? 'text-indigo-600 font-medium' : ''}>Account</span>
              <span className={step >= 3 ? 'text-indigo-600 font-medium' : ''}>Details</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out"
                style={{ width: `${getStepProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <X className="w-5 h-5 text-red-500" />
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Profile Information */}
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Let's start with your profile</h2>
                  <p className="text-gray-600">Tell us about yourself</p>
                </div>

                {/* Avatar Selection */}
                <div className="flex flex-col items-center space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Choose your profile photo
                  </label>
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl ring-4 ring-indigo-100 transition-all duration-300 group-hover:ring-indigo-200">
                      <Image 
                        src={selectedAvatar} 
                        alt="Profile avatar" 
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAvatarModalOpen(true)}
                      className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border text-gray-700 border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                        placeholder="First name"
                        suppressHydrationWarning={true}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border text-gray-700 border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                        placeholder="Last name"
                        suppressHydrationWarning={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Account Information */}
            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Set up your account</h2>
                  <p className="text-gray-600">Create your login credentials</p>
                </div>

                <div className="space-y-6">
                  {/* Username */}
                  <div className="space-y-2">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      Username *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="username"
                        name="username"
                        required
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border text-gray-700 border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                        placeholder="johndoe"
                        suppressHydrationWarning={true}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border text-gray-700 border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                        placeholder="john@example.com"
                        suppressHydrationWarning={true}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          name="password"
                          required
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-10 py-3 border text-gray-700 border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                          placeholder="••••••••"
                          suppressHydrationWarning={true}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10 p-1 rounded-md hover:bg-gray-100"
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {formData.password && <PasswordStrength password={formData.password} />}
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          name="confirmPassword"
                          required
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-10 py-3 border text-gray-700 border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 ${
                            formData.confirmPassword && formData.password !== formData.confirmPassword
                              ? 'border-red-300 focus:ring-red-500'
                              : 'border-gray-200'
                          }`}
                          placeholder="••••••••"
                          suppressHydrationWarning={true}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10 p-1 rounded-md hover:bg-gray-100"
                          title={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-sm text-red-600">Passwords do not match</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Contact Information */}
            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Contact details</h2>
                  <p className="text-gray-600">Help us connect with you</p>
                </div>

                <div className="space-y-6">
                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        required
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                        placeholder="+91 98765 43210"
                        suppressHydrationWarning={true}
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          id="city"
                          name="city"
                          required
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border text-gray-700 border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                          placeholder="Mumbai"
                          suppressHydrationWarning={true}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                        Country *
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          id="country"
                          name="country"
                          required
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border text-gray-700 border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                          placeholder="India"
                          suppressHydrationWarning={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={prevStep}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  step === 1
                    ? 'invisible'
                    : 'text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={
                    (step === 1 && !validateStep1()) ||
                    (step === 2 && !validateStep2())
                  }
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !validateStep3()}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Sign In Link */}
          <div className="text-center mt-8 pt-6 border-t border-gray-100">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        isOpen={isAvatarModalOpen}
        avatars={defaultAvatars}
        selectedUrl={selectedAvatar}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelect={(url) => {
          setSelectedAvatar(url);
          setIsAvatarModalOpen(false);
        }}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}