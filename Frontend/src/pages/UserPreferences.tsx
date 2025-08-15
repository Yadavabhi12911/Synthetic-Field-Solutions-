import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  ArrowLeft,
  Camera,
  Lock,
  Bell,
  Globe
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCurrentUser, updateUserDetails, updateUserPreferences } from '../api';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  userName: string;
  email: string;
  fullName: string;
  profilePic?: string;
  mobileNumber?: string;
  address?: string;
  preferences?: {
    notifications: boolean;
    language: string;
  };
}

const UserPreferences: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    return tabParam || 'preferences';
  });

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    userName: '',
    email: '',
    mobileNumber: '',
    address: '',
    profilePic: null as File | null,
  });

  const [preferences, setPreferences] = useState({
    notifications: true
  });

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const loadUserData = async () => {
    try {
      const response = await getCurrentUser();
      console.log('User data response:', response);
      const userData = response.data;
      setUser(userData);
      
      setFormData({
        fullName: userData.fullName || '',
        userName: userData.userName || '',
        email: userData.email || '',
        mobileNumber: userData.mobileNumber || '',
        address: userData.address || '',
        profilePic: null,
      });

             setPreferences({
         notifications: userData.preferences?.notifications ?? true
       });
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, profilePic: e.target.files![0] }));
    }
  };

  const handlePreferenceChange = (field: string, value: any) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let updatedUser = null;
      let profileChanged = false;
      let preferencesChanged = false;
      let changesMade = [];

      // Handle profile updates
      const updateData: any = {};
      
      if (formData.fullName.trim() !== (user?.fullName || '').trim()) {
        updateData.fullName = formData.fullName.trim();
        changesMade.push('Full Name');
      }
      if (formData.userName.trim() !== (user?.userName || '').trim()) {
        updateData.userName = formData.userName.trim();
        changesMade.push('Username');
      }
      if (formData.mobileNumber.trim() !== (user?.mobileNumber || '').trim()) {
        updateData.mobileNumber = formData.mobileNumber.trim();
        changesMade.push('Mobile Number');
      }
      if (formData.address.trim() !== (user?.address || '').trim()) {
        updateData.address = formData.address.trim();
        changesMade.push('Address');
      }
      if (formData.profilePic) {
        updateData.profilePic = formData.profilePic;
        changesMade.push('Profile Picture');
      }

      if (Object.keys(updateData).length > 0) {
        profileChanged = true;
        const response = await updateUserDetails(updateData);
        console.log('Profile update response:', response);
        
        if (response.data?.user) {
          updatedUser = response.data.user;
        }
      }

      // Handle preference updates
      const preferenceUpdates: any = {};
      if (preferences.notifications !== user?.preferences?.notifications) {
        preferenceUpdates.notifications = preferences.notifications;
        changesMade.push('Notification Settings');
      }
      
      

      if (Object.keys(preferenceUpdates).length > 0) {
        preferencesChanged = true;
        const response = await updateUserPreferences(preferenceUpdates);
        console.log('Preferences update response:', response);
        
        if (response.data?.user) {
          updatedUser = response.data.user;
        }
      }

      // Update local state with the latest user data
      if (updatedUser) {
        setUser(updatedUser);
        setFormData(prev => ({
          ...prev,
          fullName: updatedUser.fullName || prev.fullName,
          userName: updatedUser.userName || prev.userName,
          mobileNumber: updatedUser.mobileNumber || prev.mobileNumber,
          address: updatedUser.address || prev.address,
          profilePic: null // Reset profile pic after upload
        }));
                 setPreferences({
           notifications: updatedUser.preferences?.notifications ?? true
         });
      }

      // Show specific success message based on what was changed
      if (changesMade.length > 0) {
        if (profileChanged && !preferencesChanged) {
          toast.success('Profile updated successfully!');
        } else if (preferencesChanged && !profileChanged) {
          toast.success('Preferences updated successfully!');
        } else {
          toast.success('Profile & Preferences updated successfully!');
        }
      } else {
        toast('No changes detected. Everything is up to date!');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-white">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white pt-10 mt-5">
              <span className="text-teal-400">Preferences</span>
            </h1>
          </div>
          <p className="text-gray-300 text-base sm:text-lg">Manage your account settings and preferences</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-white/10 backdrop-blur-lg rounded-xl p-1 border border-white/20">
                         {[
               { id: 'profile', label: 'Profile', icon: User },
               { id: 'preferences', label: 'Preferences', icon: Settings },
               { id: 'notifications', label: 'Notifications', icon: Bell }
             ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  navigate(`/preferences?tab=${tab.id}`);
                }}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-teal-400 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
        >
          {activeTab === 'profile' && (
            <div className="space-y-6">
                              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Profile Information</h2>
              
              {/* Profile Picture */}
              <div className="flex items-center space-x-6">
                <div className="relative group">
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 overflow-hidden">
                    {user?.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt={user.fullName}
                        className="w-24 h-24 rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <User className="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-300" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-gradient-to-r from-teal-400 to-teal-500 p-2 rounded-full cursor-pointer hover:from-teal-500 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110">
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{user?.fullName}</h3>
                  <p className="text-gray-300 mb-2">{user?.email}</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                    <span className="text-sm text-teal-400 font-medium">Active</span>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                  <input
                    type="text"
                    value={formData.userName}
                    onChange={(e) => handleInputChange('userName', e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-gray-400 cursor-not-allowed"
                    placeholder="Email cannot be changed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                    placeholder="Enter mobile number"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-zinc-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors resize-none"
                    placeholder="Enter your address"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">General Preferences</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-teal-400" />
                    <div>
                      <h3 className="font-medium text-white">Push Notifications</h3>
                      <p className="text-sm text-gray-300">Receive notifications about bookings and updates</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.notifications}
                      onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                      className="sr-only peer"
                    />
                                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-400"></div>
                  </label>
                </div>

                
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Notification Settings</h2>
              
              <div className="space-y-4">
                {[
                  { title: 'Booking Confirmations', desc: 'Get notified when your booking is confirmed' },
                  { title: 'Booking Reminders', desc: 'Receive reminders before your scheduled game' },
                  { title: 'Special Offers', desc: 'Get notified about special deals and promotions' },
                  { title: 'Turf Updates', desc: 'Receive updates about turf availability and changes' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <h3 className="font-medium text-white">{item.title}</h3>
                      <p className="text-sm text-gray-300">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-400"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <motion.button
              onClick={handleSave}
              disabled={saving}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-teal-400 hover:bg-teal-500 disabled:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>
                                 {saving 
                   ? 'Saving...' 
                   : activeTab === 'profile' 
                     ? 'Save Profile Changes' 
                     : activeTab === 'preferences' 
                       ? 'Save Preferences' 
                       : activeTab === 'notifications' 
                         ? 'Save Notification Settings' 
                         : 'Save Changes'
                 }
              </span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserPreferences; 