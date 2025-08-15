import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, Mail, Phone, UserCheck, MapPin, Building, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { apiRequest, registerUser, registerAdmin } from '../api';

const UserRegister: React.FC = () => {
  const [userType, setUserType] = useState<'user' | 'turfOwner'>('user');
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    fullName: '',
    mobileNumber: '',
    address: '',
    password: '',
    confirmPassword: '',
    companyName: '', // For turf owners
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (userType === 'turfOwner' && !profilePic) {
      toast.error('Profile picture is required for turf owners');
      return;
    }

    setIsLoading(true);

    try {
      if (userType === 'user') {
        // Register as regular user
        const data = await registerUser({
          userName: formData.userName,
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          mobileNumber: formData.mobileNumber,
          address: formData.address,
          profilePic: profilePic || undefined,
        });
        login(data.user, 'user', data.token);
        toast.success('Registration successful!');
        navigate('/dashboard');
      } else {
        // Register as turf owner
        const adminFormData = new FormData();
        adminFormData.append('userName', formData.userName);
        adminFormData.append('email', formData.email);
        adminFormData.append('companyName', formData.companyName);
        adminFormData.append('mobileNumber', formData.mobileNumber);
        adminFormData.append('password', formData.password);
        adminFormData.append('adminPic', profilePic!);
        
        const data = await registerAdmin(adminFormData);
        login(data.data.user, 'admin', data.data.accessToken);
        toast.success('Turf Owner registration successful!');
        navigate('/admin/dashboard');
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-zinc-800/50 backdrop-blur-lg rounded-2xl p-8 border border-teal-400/20 shadow-2xl">
          <div className="text-center mb-8">
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            >
              {userType === 'user' ? (
                <UserCheck className="w-8 h-8 text-white" />
              ) : (
                <Shield className="w-8 h-8 text-white" />
              )}
            </motion.div>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Join Synthetic Field Solutions</h2>
            <p className="text-gray-300">Create your account to get started</p>
          </div>

          {/* User Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              I want to sign up as:
            </label>
            <div className="flex space-x-2 bg-zinc-700/50 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setUserType('user')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                  userType === 'user'
                    ? 'bg-teal-400 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Regular User</span>
              </button>
              <button
                type="button"
                onClick={() => setUserType('turfOwner')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                  userType === 'turfOwner'
                    ? 'bg-teal-400 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Turf Owner</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-zinc-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {userType === 'user' ? 'Full Name' : 'Company Name'}
              </label>
              <div className="relative">
                {userType === 'user' ? (
                  <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                ) : (
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                )}
                <input
                  type="text"
                  name={userType === 'user' ? 'fullName' : 'companyName'}
                  value={userType === 'user' ? formData.fullName : formData.companyName}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-zinc-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                  placeholder={userType === 'user' ? 'Enter your full name' : 'Enter company name'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-zinc-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                  placeholder="Enter your mobile number"
                />
              </div>
            </div>

            {userType === 'user' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                    placeholder="Enter your address"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {userType === 'user' ? 'Profile Picture (optional)' : 'Profile Picture (required)'}
              </label>
              <input
                type="file"
                accept="image/*"
                required={userType === 'turfOwner'}
                onChange={e => setProfilePic(e.target.files?.[0] || null)}
                className="w-full text-gray-300 bg-zinc-700/50 border border-gray-600 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-zinc-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-zinc-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-teal-400 to-teal-600 hover:from-teal-500 hover:to-teal-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                userType === 'user' ? 'Create User Account' : 'Create Turf Owner Account'
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-400 hover:text-teal-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserRegister;