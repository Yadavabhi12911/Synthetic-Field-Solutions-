import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building, Eye, EyeOff, Lock, Mail, Phone, Shield, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { registerAdmin } from '../api';
import { AuthCard } from '../components/layout/AuthCard';
import { Button } from '../components/ui/Button';
import { Input, RequiredMark } from '../components/ui/Input';
import { cn } from '../lib/cn';
import {
  firstRegisterError,
  validateRegisterForm,
  type RegisterErrors,
} from '../lib/registerValidation';

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
  const [errors, setErrors] = useState<RegisterErrors>({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof RegisterErrors]) {
      const next = validateRegisterForm(
        {
          userName: name === 'userName' ? value : formData.userName,
          email: name === 'email' ? value : formData.email,
          fullName: '',
          companyName: name === 'companyName' ? value : formData.companyName,
          mobileNumber: name === 'mobileNumber' ? value : formData.mobileNumber,
          address: '',
          password: name === 'password' ? value : formData.password,
          confirmPassword: name === 'confirmPassword' ? value : formData.confirmPassword,
        },
        { operator: true, photo: adminPic }
      );
      setErrors((prev) => ({ ...prev, [name]: next[name as keyof RegisterErrors] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validateRegisterForm(
      {
        userName: formData.userName,
        email: formData.email,
        fullName: '',
        companyName: formData.companyName,
        mobileNumber: formData.mobileNumber,
        address: '',
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      },
      { operator: true, photo: adminPic }
    );
    setErrors(nextErrors);
    const first = firstRegisterError(nextErrors);
    if (first) {
      const focusId = first === 'photo' ? 'adminPic' : first;
      document.getElementById(focusId)?.focus();
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
      form.append('adminPic', adminPic!);
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
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Username"
          name="userName"
          value={formData.userName}
          onChange={handleChange}
          placeholder="operator username"
          icon={<User className="h-4 w-4" />}
          autoComplete="username"
          required
          error={errors.userName}
        />
        <Input
          label="Company / venue name"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          placeholder="Northside Turf"
          icon={<Building className="h-4 w-4" />}
          autoComplete="organization"
          required
          error={errors.companyName}
        />
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@venue.com"
          icon={<Mail className="h-4 w-4" />}
          autoComplete="email"
          required
          error={errors.email}
        />
        <Input
          label="Mobile number"
          type="tel"
          name="mobileNumber"
          value={formData.mobileNumber}
          onChange={handleChange}
          placeholder="9876543210"
          icon={<Phone className="h-4 w-4" />}
          autoComplete="tel"
          inputMode="numeric"
          required
          error={errors.mobileNumber}
        />
        <Input
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a password"
          icon={<Lock className="h-4 w-4" />}
          autoComplete="new-password"
          required
          error={errors.password}
          hint={errors.password ? undefined : 'At least 8 characters, with a letter and a number'}
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
        <Input
          label="Confirm password"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Repeat password"
          icon={<Lock className="h-4 w-4" />}
          autoComplete="new-password"
          required
          error={errors.confirmPassword}
          trailing={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:text-foreground"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />
        <div className="flex min-w-0 flex-col gap-2">
          <label htmlFor="adminPic" className="type-label">
            Venue photo
            <RequiredMark />
          </label>
          <label
            className={cn(
              'flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-dashed bg-surface px-3 py-3 transition-colors hover:border-primary',
              errors.photo ? 'border-danger' : 'border-border'
            )}
          >
            <span className="shrink-0 rounded-md bg-surface-muted px-3 py-1.5 type-label">
              Choose file
            </span>
            <span className="min-w-0 truncate type-body-sm">
              {adminPic ? adminPic.name : 'PNG or JPG'}
            </span>
            <input
              id="adminPic"
              type="file"
              accept="image/*"
              required
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setAdminPic(file);
                if (errors.photo) {
                  setErrors((prev) => ({
                    ...prev,
                    photo: file ? undefined : 'A photo is required',
                  }));
                }
              }}
            />
          </label>
          {errors.photo ? <p className="type-body-sm text-danger">{errors.photo}</p> : null}
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
