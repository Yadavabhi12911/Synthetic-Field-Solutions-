import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { loginAdmin } from '../api';
import { AuthCard } from '../components/layout/AuthCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const AdminLogin: React.FC = () => {
  const [formData, setFormData] = useState({ userName: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await loginAdmin(formData.userName, formData.password);
      login(data.data.user, 'admin', data.data.accessToken);
      toast.success('Operator login successful!');
      navigate('/admin/dashboard');
    } catch {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Operator portal"
      description="Sign in to manage fields, slots, and bookings."
      icon={<Shield className="h-7 w-7" />}
      footer={
        <>
          <p>
            New operator?{' '}
            <Link to="/admin/register" className="text-primary hover:underline">
              Register your venue
            </Link>
          </p>
          <p className="mt-2">
            Player account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Player login
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
          placeholder="operator username"
          icon={<Shield className="h-4 w-4" />}
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

export default AdminLogin;
