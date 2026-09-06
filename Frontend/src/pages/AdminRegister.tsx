import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { registerAdmin } from '../api';
import { AuthCard } from '../components/layout/AuthCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/cn';
import { Eye, EyeOff, Lock } from 'lucide-react';

const AdminRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    companyName: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [adminPic, setAdminPic] = useState<File | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!adminPic) {
      toast.error('Venue logo or photo is required');
      return;
    }

    setIsLoading(true);
    try {
      const form = new FormData();
      form.append('userName', formData.userName);
      form.append('email', formData.email);
      form.append('companyName', formData.companyName);
      form.append('mobileNumber', formData.mobileNumber);
      form.append('password', formData.password);
      form.append('adminPic', adminPic);
      const data = await registerAdmin(form);
      login(data.data.user, 'admin', data.data.accessToken);
      toast.success('Registration successful!');
      navigate('/admin/dashboard');
    } catch {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordField = (
    name: 'password' | 'confirmPassword',
    label: string,
    show: boolean,
    toggle: () => void
  ) => (
    <div className="flex flex-col gap-2">
      <label className="type-label">{label}</label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={formData[name]}
          onChange={(e) => setFormData((prev) => ({ ...prev, [name]: e.target.value }))}
          required
          className={cn(
            'h-10 w-full rounded-md border border-border bg-surface py-2 pl-9 pr-10 text-sm text-foreground placeholder:text-muted focus:border-primary'
          )}
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <AuthCard
      title="Register your venue"
      description="Create an operator account to list fields and manage bookings."
      icon={<Shield className="h-7 w-7" />}
      footer={
        <>
          Already registered?{' '}
          <Link to="/admin/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username"
          name="userName"
          value={formData.userName}
          onChange={(e) => setFormData((prev) => ({ ...prev, userName: e.target.value }))}
          required
        />
        <Input
          label="Company / venue name"
          name="companyName"
          value={formData.companyName}
          onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
          required
        />
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          required
        />
        <Input
          label="Mobile number"
          type="tel"
          name="mobileNumber"
          value={formData.mobileNumber}
          onChange={(e) => setFormData((prev) => ({ ...prev, mobileNumber: e.target.value }))}
          required
        />
        {passwordField('password', 'Password', showPassword, () => setShowPassword(!showPassword))}
        {passwordField(
          'confirmPassword',
          'Confirm password',
          showConfirmPassword,
          () => setShowConfirmPassword(!showConfirmPassword)
        )}
        <div className="flex flex-col gap-2">
          <label className="type-label">Venue photo</label>
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) => setAdminPic(e.target.files?.[0] || null)}
            className="text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-primary-muted file:px-3 file:py-2 file:text-sm file:text-primary"
          />
        </div>
        <Button type="submit" className="w-full" loading={isLoading}>
          <Building className="h-4 w-4" />
          Create operator account
        </Button>
      </form>
    </AuthCard>
  );
};

export default AdminRegister;
