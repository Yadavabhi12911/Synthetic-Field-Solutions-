import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Lock, 
  Camera, 
  Save, 
  Eye, 
  EyeOff,
  Building,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { 
  getCurrentAdmin, 
  changeAdminPassword, 
  updateAdminProfile, 
  getSystemSettings, 
  updateSystemSettings 
} from '../api';
import toast from 'react-hot-toast';
import { Page, PageHeader } from '../components/layout/Page';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PageSkeleton } from '../components/ui/Skeleton';
import { cn } from '../lib/cn';

interface AdminProfile {
  _id: string;
  userName: string;
  companyName: string;
  email: string;
  mobileNumber: string;
  adminPic?: string;
}

interface SystemSettings {
  bookingTimeLimit: number;
  cancellationTimeLimit: number;
  autoCompleteTime: number;
  maxBookingsPerUser: number;
  maintenanceMode: boolean;
}

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [searchParams] = useSearchParams();

  // Profile form states
  const [profileForm, setProfileForm] = useState({
    userName: '',
    companyName: '',
    email: '',
    mobileNumber: '',
    adminPic: undefined as File | undefined
  });

  // Password form states
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  // System settings form states
  const [settingsForm, setSettingsForm] = useState({
    bookingTimeLimit: 30,
    cancellationTimeLimit: 5,
    autoCompleteTime: 60,
    maxBookingsPerUser: 3,
    maintenanceMode: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [adminResponse, settingsResponse] = await Promise.all([
        getCurrentAdmin(),
        getSystemSettings()
      ]);

      const admin = adminResponse.data;
      setAdminProfile(admin);
      setProfileForm({
        userName: admin.userName || '',
        companyName: admin.companyName || '',
        email: admin.email || '',
        mobileNumber: admin.mobileNumber || '',
        adminPic: undefined
      });

      const settings = settingsResponse.data;
      setSystemSettings(settings);
      setSettingsForm({
        bookingTimeLimit: settings.bookingTimeLimit || 30,
        cancellationTimeLimit: settings.cancellationTimeLimit || 5,
        autoCompleteTime: settings.autoCompleteTime || 60,
        maxBookingsPerUser: settings.maxBookingsPerUser || 3,
        maintenanceMode: settings.maintenanceMode || false
      });
    } catch (error: any) {
      console.error('Error loading settings:', error);
      const errorMessage = error.message || 'Failed to load settings';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setSaving(true);
    try {
      await updateAdminProfile(profileForm);
      toast.success('Profile updated successfully!');
      await loadData(); // Reload data
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setSaving(true);
    try {
      await changeAdminPassword(passwordForm.oldPassword, passwordForm.newPassword);
      toast.success('Password changed successfully!');
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsUpdate = async () => {
    setSaving(true);
    try {
      await updateSystemSettings(settingsForm);
      toast.success('System settings updated successfully!');
      await loadData(); // Reload data
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update system settings');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileForm(prev => ({ ...prev, adminPic: file }));
    }
  };

  useEffect(() => {
    const initialTab = searchParams.get('tab') || 'profile';
    setActiveTab(initialTab as 'profile' | 'password' | 'system');
  }, [searchParams]);

  if (loading) return <PageSkeleton />;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'system', label: 'System', icon: Settings },
  ];

  const fieldClass =
    'h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted focus:border-primary';

  return (
    <Page>
      <PageHeader
        title="Settings"
        description="Manage your profile, security, and system preferences."
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <Card className="lg:col-span-1 h-fit">
          <CardBody>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Sections</h3>
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors',
                      activeTab === tab.id
                        ? 'bg-primary-muted text-primary'
                        : 'text-muted hover:bg-surface-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </CardBody>
        </Card>

        <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card>
                <CardBody>
                <div className="mb-6 flex items-center gap-3">
                  <User className="h-5 w-5 text-primary" />
                  <h2 className="type-heading">Profile settings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Picture */}
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center overflow-hidden">
                                                  {profileForm.adminPic ? (
                          <img
                            src={URL.createObjectURL(profileForm.adminPic)}
                            alt="Profile"
                            className="w-24 h-24 object-cover"
                          />
                        ) : adminProfile?.adminPic ? (
                          <img
                            src={adminProfile.adminPic}
                            alt="Profile"
                            className="w-24 h-24 object-cover"
                          />
                        ) : (
                            <Building className="w-12 h-12 text-foreground" />
                          )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-teal-400 p-2 rounded-full cursor-pointer hover:bg-teal-500 transition-colors">
                          <Camera className="w-4 h-4 text-foreground" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div>
                        <h3 className="type-heading">{adminProfile?.companyName}</h3>
                        <p className="text-muted">{adminProfile?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="mb-2 block type-label">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.companyName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, companyName: e.target.value }))}
                      className={fieldClass}
                      placeholder="Enter company name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block type-label">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      className={fieldClass}
                      placeholder="Enter email address"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="mb-2 block type-label">
                      Username
                    </label>
                    <input
                      type="text"
                      value={profileForm.userName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, userName: e.target.value }))}
                      className={fieldClass}
                      placeholder="Enter username"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="mb-2 block type-label">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={profileForm.mobileNumber}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, mobileNumber: e.target.value }))}
                      className={fieldClass}
                      placeholder="Enter mobile number"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button type="button" onClick={handleProfileUpdate} loading={saving}>
                    <Save className="h-4 w-4" />
                    Save changes
                  </Button>
                </div>
                </CardBody>
              </Card>
            )}

            {activeTab === 'password' && (
              <Card>
                <CardBody>
                <div className="mb-6 flex items-center gap-3">
                  <Lock className="h-5 w-5 text-primary" />
                  <h2 className="type-heading">Change password</h2>
                </div>

                <div className="max-w-md space-y-6">
                  {/* Current Password */}
                  <div>
                    <label className="mb-2 block type-label">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.old ? 'text' : 'password'}
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                        className={cn(fieldClass, 'pr-12')}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, old: !prev.old }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-foreground"
                      >
                        {showPasswords.old ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="mb-2 block type-label">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className={cn(fieldClass, 'pr-12')}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-foreground"
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="mb-2 block type-label">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className={cn(fieldClass, 'pr-12')}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-foreground"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <h4 className="type-label mb-3">Password Requirements:</h4>
                    <ul className="space-y-2 text-sm text-muted">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span>At least 6 characters long</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span>Should be different from current password</span>
                      </li>
                    </ul>
                  </div>

                  <Button
                    type="button"
                    className="w-full"
                    onClick={handlePasswordChange}
                    disabled={saving || !passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    loading={saving}
                  >
                    Change password
                  </Button>
                </div>
                </CardBody>
              </Card>
            )}

            {activeTab === 'system' && (
              <Card>
                <CardBody>
                <div className="mb-6 flex items-center gap-3">
                  <Settings className="h-5 w-5 text-primary" />
                  <h2 className="type-heading">System settings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Booking Time Limit */}
                  <div>
                    <label className="mb-2 block type-label">
                      Booking Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.bookingTimeLimit}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, bookingTimeLimit: parseInt(e.target.value) || 30 }))}
                      className={fieldClass}
                      min="1"
                      max="120"
                    />
                    <p className="text-xs text-gray-400 mt-1">Time limit for completing a booking</p>
                  </div>

                  {/* Cancellation Time Limit */}
                  <div>
                    <label className="mb-2 block type-label">
                      Cancellation Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.cancellationTimeLimit}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, cancellationTimeLimit: parseInt(e.target.value) || 5 }))}
                      className={fieldClass}
                      min="1"
                      max="60"
                    />
                    <p className="text-xs text-gray-400 mt-1">Grace period for cancelling bookings</p>
                  </div>

                  {/* Auto Complete Time */}
                  <div>
                    <label className="mb-2 block type-label">
                      Auto Complete Time (minutes)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.autoCompleteTime}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, autoCompleteTime: parseInt(e.target.value) || 60 }))}
                      className={fieldClass}
                      min="30"
                      max="180"
                    />
                    <p className="text-xs text-gray-400 mt-1">Time after which bookings are auto-completed</p>
                  </div>

                  {/* Max Bookings Per User */}
                  <div>
                    <label className="mb-2 block type-label">
                      Max Bookings Per User
                    </label>
                    <input
                      type="number"
                      value={settingsForm.maxBookingsPerUser}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, maxBookingsPerUser: parseInt(e.target.value) || 3 }))}
                      className={fieldClass}
                      min="1"
                      max="10"
                    />
                    <p className="text-xs text-gray-400 mt-1">Maximum active bookings per user</p>
                  </div>

                  {/* Maintenance Mode */}
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-6 w-6 text-warning" />
                        <div>
                          <h4 className="text-foreground font-medium">Maintenance Mode</h4>
                          <p className="text-sm text-muted">Temporarily disable new bookings</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.maintenanceMode}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-400"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button type="button" onClick={handleSettingsUpdate} loading={saving}>
                    <Save className="h-4 w-4" />
                    Save settings
                  </Button>
                </div>
                </CardBody>
              </Card>
            )}
        </div>
      </div>
    </Page>
  );
};

export default AdminSettings; 