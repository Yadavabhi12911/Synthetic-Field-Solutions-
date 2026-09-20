import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { registerAdmin, registerUser } from '../api';
import { AuthCard } from '../components/layout/AuthCard';
import { Button } from '../components/ui/Button';
import { Input, RequiredMark } from '../components/ui/Input';
import { cn } from '../lib/cn';
import {
  firstRegisterError,
  validateRegisterForm,
  type RegisterErrors,
} from '../lib/registerValidation';

function readApiError(error: unknown) {
  if (!(error instanceof Error) || !error.message) {
    return 'Registration failed. Please try again.';
  }
  try {
    const parsed = JSON.parse(error.message) as { message?: string };
    if (parsed.message) return parsed.message;
  } catch {
    const cleaned = error.message.replace(/<[^>]+>/g, '').trim();
    if (cleaned && cleaned.length < 180) return cleaned;
  }
  return 'Registration failed. Please try again.';
}

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
    companyName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const isPlayer = userType === 'user';
  const passwordMismatch =
    formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword;

  const description = useMemo(
    () =>
      isPlayer
        ? 'Set up a player account to browse fields and hold a slot.'
        : 'Set up an operator account to list your venue and manage bookings.',
    [isPlayer]
  );

  const currentErrors = (): RegisterErrors =>
    validateRegisterForm(formData, { operator: !isPlayer, photo: profilePic });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof RegisterErrors]) {
      const next = validateRegisterForm(
        { ...formData, [name]: value },
        { operator: !isPlayer, photo: profilePic }
      );
      setErrors((prev) => ({ ...prev, [name]: next[name as keyof RegisterErrors] }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = currentErrors();
    setErrors(nextErrors);

    const first = firstRegisterError(nextErrors);
    if (first) {
      const focusId = first === 'photo' ? 'profilePic' : first;
      document.getElementById(focusId)?.focus();
      return;
    }

    setIsLoading(true);

    try {
      if (isPlayer) {
        const data = await registerUser({
          userName: formData.userName,
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          mobileNumber: formData.mobileNumber,
          address: formData.address,
          profilePic: profilePic || undefined,
        });
        const payload = data.data ?? data;
        login(payload.user, 'user', payload.token);
        toast.success('Registration successful!');
        navigate('/dashboard');
        return;
      }

      const adminFormData = new FormData();
      adminFormData.append('userName', formData.userName);
      adminFormData.append('email', formData.email);
      adminFormData.append('companyName', formData.companyName);
      adminFormData.append('mobileNumber', formData.mobileNumber);
      adminFormData.append('password', formData.password);
      adminFormData.append('adminPic', profilePic!);

      const data = await registerAdmin(adminFormData);
      login(data.data.user, 'admin', data.data.accessToken);
      toast.success('Operator account created');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(readApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      wide
      tilt={false}
      title="Create account"
      description={description}
      icon={isPlayer ? <UserCheck className="h-7 w-7" /> : <Shield className="h-7 w-7" />}
      footer={
        <p>
          Already have an account?{' '}
          <Link to={isPlayer ? '/login' : '/admin/login'} className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="space-y-2">
          <p id="account-type-label" className="type-label">
            Account type
          </p>
          <div
            role="radiogroup"
            aria-labelledby="account-type-label"
            className="grid gap-2 sm:grid-cols-2"
          >
            <RoleCard
              selected={isPlayer}
              title="Player"
              copy="Book turfs by the hour."
              icon={<User className="h-4 w-4" />}
              onSelect={() => {
                setUserType('user');
                setErrors({});
                setProfilePic(null);
              }}
            />
            <RoleCard
              selected={!isPlayer}
              title="Operator"
              copy="List and run your venue."
              icon={<Shield className="h-4 w-4" />}
              onSelect={() => {
                setUserType('turfOwner');
                setErrors({});
                setProfilePic(null);
              }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Username"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="yourname"
            icon={<User className="h-4 w-4" />}
            required
            error={errors.userName}
          />
          <Input
            label={isPlayer ? 'Full name' : 'Venue name'}
            name={isPlayer ? 'fullName' : 'companyName'}
            value={isPlayer ? formData.fullName : formData.companyName}
            onChange={handleChange}
            autoComplete={isPlayer ? 'name' : 'organization'}
            placeholder={isPlayer ? 'Rahul sharma' : 'Northside Turf'}
            icon={
              isPlayer ? <UserCheck className="h-4 w-4" /> : <Building className="h-4 w-4" />
            }
            required
            error={isPlayer ? errors.fullName : errors.companyName}
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            inputMode="email"
            placeholder="you@email.com"
            icon={<Mail className="h-4 w-4" />}
            required
            error={errors.email}
          />
          <Input
            label="Mobile number"
            type="tel"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            autoComplete="tel"
            inputMode="numeric"
            placeholder="9876543210"
            icon={<Phone className="h-4 w-4" />}
            required={!isPlayer}
            error={errors.mobileNumber}
          />
          {isPlayer && (
            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              autoComplete="street-address"
              placeholder="Area, city"
              icon={<MapPin className="h-4 w-4" />}
            />
          )}
          <Input
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            placeholder="Create a password"
            icon={<Lock className="h-4 w-4" />}
            required
            error={errors.password}
            hint={errors.password ? undefined : 'At least 8 characters, with a letter and a number'}
            trailing={
              <VisibilityToggle
                visible={showPassword}
                label="password"
                onToggle={() => setShowPassword((open) => !open)}
              />
            }
          />
          <Input
            label="Confirm password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            placeholder="Repeat password"
            icon={<Lock className="h-4 w-4" />}
            required
            error={errors.confirmPassword || (passwordMismatch ? 'Passwords do not match' : undefined)}
            trailing={
              <VisibilityToggle
                visible={showConfirmPassword}
                label="confirm password"
                onToggle={() => setShowConfirmPassword((open) => !open)}
              />
            }
          />
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <label htmlFor="profilePic" className="type-label">
            {isPlayer ? 'Profile photo' : 'Venue photo'}
            {isPlayer ? (
              <span className="ml-1 font-normal text-muted">optional</span>
            ) : (
              <RequiredMark />
            )}
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
              {profilePic ? profilePic.name : 'PNG or JPG'}
            </span>
            <input
              id="profilePic"
              type="file"
              accept="image/*"
              required={!isPlayer}
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setProfilePic(file);
                if (errors.photo) {
                  const next = validateRegisterForm(formData, {
                    operator: !isPlayer,
                    photo: file,
                  });
                  setErrors((prev) => ({ ...prev, photo: next.photo }));
                }
              }}
            />
          </label>
          {errors.photo ? <p className="type-body-sm text-danger">{errors.photo}</p> : null}
        </div>

        <Button type="submit" className="w-full" loading={isLoading}>
          {isPlayer ? 'Create player account' : 'Create operator account'}
        </Button>
      </form>
    </AuthCard>
  );
};

function RoleCard({
  selected,
  title,
  copy,
  icon,
  onSelect,
}: {
  selected: boolean;
  title: string;
  copy: string;
  icon: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'rounded-md border px-4 py-3 text-left transition-colors',
        selected
          ? 'border-primary bg-primary-muted text-foreground'
          : 'border-border bg-surface text-muted hover:border-primary/40 hover:text-foreground'
      )}
    >
      <span className="flex items-center gap-2 type-label text-foreground">
        {icon}
        {title}
      </span>
      <span className="mt-1 block type-body-sm">{copy}</span>
    </button>
  );
}

function VisibilityToggle({
  visible,
  label,
  onToggle,
}: {
  visible: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:text-foreground"
      aria-label={visible ? `Hide ${label}` : `Show ${label}`}
    >
      {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

export default UserRegister;
