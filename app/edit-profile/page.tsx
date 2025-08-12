"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { defaultAvatars } from "@/lib/defaultAvatars";

interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city: string;
  country: string;
  occupation?: string;
  description: string;
  profilePhoto: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  country: string;
  occupation: string;
  description: string;
  profilePhoto: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
    country: "",
    occupation: "",
    description: "",
    profilePhoto: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Warn user about unsaved changes when leaving the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setFormData({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          phoneNumber: data.user.phoneNumber || "",
          dateOfBirth: data.user.dateOfBirth || "",
          gender: data.user.gender || "",
          address: data.user.address || "",
          city: data.user.city || "",
          country: data.user.country || "",
          occupation: data.user.occupation || "",
          description: data.user.description || "",
          profilePhoto: data.user.profilePhoto || defaultAvatars[0]?.url || ""
        });
      } else if (response.status === 401) {
        // Token expired or invalid - redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/auth/login');
      } else {
        setMessage({ type: 'error', text: 'Failed to load profile data' });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.length > 50) {
      newErrors.firstName = "First name cannot exceed 50 characters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.length > 50) {
      newErrors.lastName = "Last name cannot exceed 50 characters";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description cannot exceed 500 characters";
    }

    if (formData.occupation && formData.occupation.length > 100) {
      newErrors.occupation = "Occupation cannot exceed 100 characters";
    }

    if (formData.address && formData.address.length > 200) {
      newErrors.address = "Address cannot exceed 200 characters";
    }

    // Validate profile photo is set
    if (!formData.profilePhoto || formData.profilePhoto.trim() === '') {
      newErrors.profilePhoto = "Profile photo is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);
    
    // Clear error for this field
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAvatarSelect = (avatar: string) => {
    setFormData(prev => ({ ...prev, profilePhoto: avatar }));
    setHasUnsavedChanges(true);
    setShowAvatarSelector(false);
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        setHasUnsavedChanges(false);
        router.push('/profile');
      }
    } else {
      router.push('/profile');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setUser(data.user);
        
        // Update user data in localStorage if it exists
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const updatedUser = { ...userData, ...data.user };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        // Redirect to profile page after successful update
        setTimeout(() => {
          setHasUnsavedChanges(false);
          router.push('/profile');
        }, 2000);
      } else {
        const errorMessage = data.details || data.error || 'Failed to update profile';
        setMessage({ type: 'error', text: errorMessage });
        
        // If it's a validation error with details, try to parse field-specific errors
        if (data.error === 'Validation failed' && data.details) {
          console.error('Validation details:', data.details);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'An error occurred while updating your profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
              <p className="mt-2 text-gray-600">Update your personal information and preferences</p>
            </div>
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Alert Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Main Form */}
        <div className="relative">
          <form onSubmit={handleSubmit} className="space-y-8">
            {loading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading...</p>
                </div>
              </div>
            )}
          {/* Profile Photo Section */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Photo</h2>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Image
                  src={formData.profilePhoto || "/placeholder-avatar.jpg"}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Change Photo
                </button>
                <p className="mt-2 text-sm text-gray-500">Choose from our available avatars</p>
                {errors.profilePhoto && <p className="mt-1 text-sm text-red-600">{errors.profilePhoto}</p>}
              </div>
            </div>

            {/* Avatar Selector */}
            {showAvatarSelector && (
              <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Select Avatar</h3>
                <div className="grid grid-cols-6 gap-3">
                  {defaultAvatars.map((avatar, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleAvatarSelect(avatar.url)}
                      className={`p-2 rounded-lg border-2 transition-colors ${
                        formData.profilePhoto === avatar.url
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={avatar.url}
                        alt={avatar.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Personal Information */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-3 text-gray-700 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your first name"
                />
                {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 text-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your last name"
                />
                {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className={`w-full px-3 text-gray-700 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your phone number"
                />
                {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-3 text-gray-700 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-2">
                  Occupation
                </label>
                <input
                  type="text"
                  id="occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  className={`w-full px-3 text-gray-700 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.occupation ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your occupation"
                />
                {errors.occupation && <p className="mt-1 text-sm text-red-600">{errors.occupation}</p>}
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Location</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 text-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.address ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full address"
                />
                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`w-full px-3 text-gray-700 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.city ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your city"
                />
                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={`w-full px-3 text-gray-700 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.country ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your country"
                />
                {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">About You</h2>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className={`w-full px-3 text-gray-700 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Tell us about yourself, your travel interests, and what makes you excited about exploring the world..."
              />
              <div className="mt-2 flex justify-between items-center">
                <span className={`text-sm ${
                  formData.description.length > 450 
                    ? 'text-amber-600' 
                    : formData.description.length > 500 
                      ? 'text-red-600' 
                      : 'text-gray-500'
                }`}>
                  {formData.description.length}/500 characters
                </span>
                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
