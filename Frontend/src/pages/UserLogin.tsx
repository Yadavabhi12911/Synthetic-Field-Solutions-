import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { apiRequest } from '../api';
import { AuthCard } from '../components/layout/AuthCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const UserLogin: React.FC = () => {
  const [formData, setFormData] = useState({ userName: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await apiRequest('/users/login', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      login(data.data.user, 'user', data.data.accessToken);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to book fields and manage your bookings."
      icon={<User className="h-7 w-7" />}
      footer={
        <>
          <p>
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
          <p className="mt-2">
            Field operator?{' '}
            <Link to="/admin/login" className="text-primary hover:underline">
              Operator login
            </Link>
          </p>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username"
          name="userName"
          value={formData.userName}
          onChange={(e) => setFormData((prev) => ({ ...prev, userName: e.target.value }))}
          placeholder="yourname"
          icon={<User className="h-4 w-4" />}
          autoComplete="username"
          required
        />
        <Input
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
          placeholder="Your password"
          icon={<Lock className="h-4 w-4" />}
          autoComplete="current-password"
          required
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />
        <Button type="submit" className="w-full" loading={isLoading}>
          Sign in
        </Button>
      </form>
    </AuthCard>
  );
};

export default UserLogin;
