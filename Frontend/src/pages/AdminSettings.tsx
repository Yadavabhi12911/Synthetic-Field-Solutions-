import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  User, 
  Lock, 
  Shield, 
  Bell, 
  ArrowLeft, 
  Camera, 
  Save, 
  Eye, 
  EyeOff,
  Building,
  Mail,
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  getCurrentAdmin, 
  changeAdminPassword, 
  updateAdminProfile, 
  getSystemSettings, 
  updateSystemSettings 
} from '../api';
import toast from 'react-hot-toast';

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
  const navigate = useNavigate();
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
      console.log('Loading admin settings data...');
      const [adminResponse, settingsResponse] = await Promise.all([
        getCurrentAdmin(),
        getSystemSettings()
      ]);

      console.log('Admin response:', adminResponse);
      console.log('Settings response:', settingsResponse);

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

  if (loading) {
    return (
      <div className="min-h-screen pt-16 px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-white">Loading settings...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'system', label: 'System', icon: Settings }
  ];

  return (
    <div className="min-h-screen pt-20 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
           {/* Breadcrumb Navigation */}
          <div className="flex items-center space-x-2 text-sm text-gray-400 mb-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="hover:text-white transition-colors"
            >
             
            </button>
           
            <span className="text-white"></span>
            {activeTab !== 'profile' && (
              <>
                
                <span className="text-teal-400 capitalize">{activeTab}</span>
              </>
            )}
          </div>
          
          <div className="flex items-center justify-between mb-4 mt-10 pt-2">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Settings <span className="text-teal-400">Panel</span>
              </h1>
            </div>
          </div>
          <p className="text-gray-300 text-base sm:text-lg">Manage your profile, security, and system preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Settings</h3>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-teal-400/20 text-teal-400 border border-teal-400/30'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3 mb-6">
                  <User className="w-6 h-6 text-teal-400" />
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Profile Settings</h2>
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
                            <Building className="w-12 h-12 text-white" />
                          )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-teal-400 p-2 rounded-full cursor-pointer hover:bg-teal-500 transition-colors">
                          <Camera className="w-4 h-4 text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{adminProfile?.companyName}</h3>
                        <p className="text-gray-300">{adminProfile?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.companyName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, companyName: e.target.value }))}
                      className="w-full px-4 py-3 bg-zinc-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                      placeholder="Enter company name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-zinc-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                      placeholder="Enter email address"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={profileForm.userName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, userName: e.target.value }))}
                      className="w-full px-4 py-3 bg-zinc-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                      placeholder="Enter username"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={profileForm.mobileNumber}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, mobileNumber: e.target.value }))}
                      className="w-full px-4 py-3 bg-zinc-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                      placeholder="Enter mobile number"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleProfileUpdate}
                    disabled={saving}
                    className="bg-teal-400 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </motion.button>
                </div>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3 mb-6">
                  <Lock className="w-6 h-6 text-teal-400" />
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Change Password</h2>
                </div>

                <div className="max-w-md space-y-6">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.old ? 'text' : 'password'}
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                        className="w-full px-4 py-3 bg-zinc-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors pr-12"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, old: !prev.old }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPasswords.old ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-4 py-3 bg-zinc-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors pr-12"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-4 py-3 bg-zinc-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors pr-12"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-white mb-3">Password Requirements:</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-teal-400" />
                        <span>At least 6 characters long</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-teal-400" />
                        <span>Should be different from current password</span>
                      </li>
                    </ul>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePasswordChange}
                    disabled={saving || !passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className="w-full bg-teal-400 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Changing Password...' : 'Change Password'}
                  </motion.button>
                </div>
              </div>
            )}

            {/* System Settings Tab */}
            {activeTab === 'system' && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3 mb-6">
                  <Settings className="w-6 h-6 text-teal-400" />
                  <h2 className="text-xl sm:text-2xl font-bold text-white">System Settings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Booking Time Limit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Booking Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.bookingTimeLimit}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, bookingTimeLimit: parseInt(e.target.value) || 30 }))}
                      className="w-full px-4 py-3 bg-zinc-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                      min="1"
                      max="120"
                    />
                    <p className="text-xs text-gray-400 mt-1">Time limit for completing a booking</p>
                  </div>

                  {/* Cancellation Time Limit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cancellation Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.cancellationTimeLimit}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, cancellationTimeLimit: parseInt(e.target.value) || 5 }))}
                      className="w-full px-4 py-3 bg-zinc-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                      min="1"
                      max="60"
                    />
                    <p className="text-xs text-gray-400 mt-1">Grace period for cancelling bookings</p>
                  </div>

                  {/* Auto Complete Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Auto Complete Time (minutes)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.autoCompleteTime}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, autoCompleteTime: parseInt(e.target.value) || 60 }))}
                      className="w-full px-4 py-3 bg-zinc-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                      min="30"
                      max="180"
                    />
                    <p className="text-xs text-gray-400 mt-1">Time after which bookings are auto-completed</p>
                  </div>

                  {/* Max Bookings Per User */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Bookings Per User
                    </label>
                    <input
                      type="number"
                      value={settingsForm.maxBookingsPerUser}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, maxBookingsPerUser: parseInt(e.target.value) || 3 }))}
                      className="w-full px-4 py-3 bg-zinc-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                      min="1"
                      max="10"
                    />
                    <p className="text-xs text-gray-400 mt-1">Maximum active bookings per user</p>
                  </div>

                  {/* Maintenance Mode */}
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-400" />
                        <div>
                          <h4 className="text-white font-medium">Maintenance Mode</h4>
                          <p className="text-sm text-gray-300">Temporarily disable new bookings</p>
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
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSettingsUpdate}
                    disabled={saving}
                    className="bg-teal-400 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings; 