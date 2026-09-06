import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Mail, Phone, UserCheck, MapPin, Building, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { registerUser, registerAdmin } from '../api';
import { cn } from '../lib/cn';

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
    <div className="flex min-h-[calc(100vh-var(--shell-header-height))] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface shadow-modal">
        <div className="p-8">
          <div className="mb-8 text-left">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-muted text-primary">
              {userType === 'user' ? <UserCheck className="h-7 w-7" /> : <Shield className="h-7 w-7" />}
            </div>
            <h1 className="type-title">Create account</h1>
            <p className="type-body mt-2">Join to book fields or list your venue.</p>
          </div>

          <div className="mb-6">
            <p className="type-label mb-3">I want to sign up as</p>
            <div className="flex gap-2 rounded-md border border-border bg-surface-muted p-1">
              <button
                type="button"
                onClick={() => setUserType('user')}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-md py-3 px-4 type-label transition-colors',
                  userType === 'user'
                    ? 'bg-primary text-white'
                    : 'text-muted hover:bg-surface hover:text-foreground'
                )}
              >
                <User className="h-4 w-4" />
                <span>Player</span>
              </button>
              <button
                type="button"
                onClick={() => setUserType('turfOwner')}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-md py-3 px-4 type-label transition-colors',
                  userType === 'turfOwner'
                    ? 'bg-primary text-white'
                    : 'text-muted hover:bg-surface hover:text-foreground'
                )}
              >
                <Shield className="h-4 w-4" />
                <span>Field operator</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="type-label mb-2 block">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  required
                  className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted focus:border-primary"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            <div>
              <label className="type-label mb-2 block">
                {userType === 'user' ? 'Full name' : 'Company name'}
              </label>
              <div className="relative">
                {userType === 'user' ? (
                  <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
                ) : (
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
                )}
                <input
                  type="text"
                  name={userType === 'user' ? 'fullName' : 'companyName'}
                  value={userType === 'user' ? formData.fullName : formData.companyName}
                  onChange={handleChange}
                  required
                  className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted focus:border-primary"
                  placeholder={userType === 'user' ? 'Enter your full name' : 'Enter company name'}
                />
              </div>
            </div>

            <div>
              <label className="type-label mb-2 block">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted focus:border-primary"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="type-label mb-2 block">
                Mobile number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted focus:border-primary"
                  placeholder="Enter your mobile number"
                />
              </div>
            </div>

            {userType === 'user' && (
              <div>
                <label className="type-label mb-2 block">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted focus:border-primary"
                    placeholder="Enter your address"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="type-label mb-2 block">
                {userType === 'user' ? 'Profile Picture (optional)' : 'Profile Picture (required)'}
              </label>
              <input
                type="file"
                accept="image/*"
                required={userType === 'turfOwner'}
                onChange={e => setProfilePic(e.target.files?.[0] || null)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-surface-muted file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground"
              />
            </div>

            <div>
              <label className="type-label mb-2 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-10 w-full rounded-md border border-border bg-surface py-2 pl-9 pr-10 text-sm text-foreground placeholder:text-muted focus:border-primary"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="type-label mb-2 block">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="h-10 w-full rounded-md border border-border bg-surface py-2 pl-9 pr-10 text-sm text-foreground placeholder:text-muted focus:border-primary"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" loading={isLoading}>
              {userType === 'user' ? 'Create player account' : 'Create operator account'}
            </Button>
          </form>

          <div className="type-body-sm mt-6 text-left">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;