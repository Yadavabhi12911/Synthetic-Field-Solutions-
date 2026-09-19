import React, { useState, useEffect } from 'react';
import { Settings, User, Bell, Camera, Save } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCurrentUser, updateUserDetails, updateUserPreferences } from '../api';
import toast from 'react-hot-toast';
import { Page, PageHeader } from '../components/layout/Page';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageSkeleton } from '../components/ui/Skeleton';
import { cn } from '../lib/cn';

interface User {
  _id: string;
  userName: string;
  email: string;
  fullName: string;
  profilePic?: string;
  mobileNumber?: string;
  address?: string;
  preferences?: { notifications: boolean; language: string };
}

const fieldClass =
  'h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted focus:border-primary';

const UserPreferences: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'preferences');

  const [formData, setFormData] = useState({
    fullName: '',
    userName: '',
    email: '',
    mobileNumber: '',
    address: '',
    profilePic: null as File | null,
  });

  const [preferences, setPreferences] = useState({ notifications: true });

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) setActiveTab(tabParam);
  }, [searchParams]);

  const loadUserData = async () => {
    try {
      const response = await getCurrentUser();
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
      setPreferences({ notifications: userData.preferences?.notifications ?? true });
    } catch {
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let updatedUser = null;
      const changesMade: string[] = [];
      const updateData: Record<string, unknown> = {};

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
        const response = await updateUserDetails(updateData);
        if (response.data?.user) updatedUser = response.data.user;
      }

      if (preferences.notifications !== user?.preferences?.notifications) {
        const response = await updateUserPreferences({ notifications: preferences.notifications });
        if (response.data?.user) updatedUser = response.data.user;
        changesMade.push('Notification Settings');
      }

      if (updatedUser) {
        setUser(updatedUser);
        setFormData((prev) => ({
          ...prev,
          fullName: updatedUser.fullName || prev.fullName,
          userName: updatedUser.userName || prev.userName,
          mobileNumber: updatedUser.mobileNumber || prev.mobileNumber,
          address: updatedUser.address || prev.address,
          profilePic: null,
        }));
        setPreferences({ notifications: updatedUser.preferences?.notifications ?? true });
      }

      if (changesMade.length > 0) {
        toast.success('Changes saved successfully!');
      } else {
        toast('No changes detected.');
      }
    } catch {
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageSkeleton />;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <Page className="max-w-4xl">
      <PageHeader
        title="Preferences"
        description="Manage your account settings and notification preferences."
      />

      <div className="mb-6 flex gap-1 rounded-lg border border-border bg-surface-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              navigate(`/preferences?tab=${tab.id}`);
            }}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'text-muted hover:text-foreground'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <CardBody>
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="type-heading">Profile information</h2>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary-muted">
                    {user?.profilePic ? (
                      <img src={user.profilePic} alt={user.fullName} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-primary" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-primary p-2 text-foreground hover:bg-primary-hover">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        setFormData((prev) => ({ ...prev, profilePic: e.target.files![0] }))
                      }
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">{user?.fullName}</h3>
                  <p className="text-sm text-muted">{user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  { key: 'fullName', label: 'Full name', type: 'text' },
                  { key: 'userName', label: 'Username', type: 'text' },
                  { key: 'mobileNumber', label: 'Mobile number', type: 'tel' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="mb-2 block type-label">{field.label}</label>
                    <input
                      type={field.type}
                      value={formData[field.key as keyof typeof formData] as string}
                      onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      className={fieldClass}
                    />
                  </div>
                ))}
                <div>
                  <label className="mb-2 block type-label">Email</label>
                  <input type="email" value={formData.email} disabled className={cn(fieldClass, 'cursor-not-allowed opacity-60')} />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block type-label">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                    rows={3}
                    className={cn(fieldClass, 'h-auto py-2')}
                  />
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'preferences' || activeTab === 'notifications') && (
            <div className="space-y-4">
              <h2 className="type-heading">
                {activeTab === 'preferences' ? 'General preferences' : 'Notification settings'}
              </h2>
              <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted p-4">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-medium text-foreground">Push notifications</h3>
                    <p className="text-sm text-muted">Receive updates about bookings and account activity.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.notifications}
                  onChange={(e) => setPreferences({ notifications: e.target.checked })}
                  className="h-4 w-4 accent-primary"
                />
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <Button type="button" onClick={handleSave} loading={saving}>
              <Save className="h-4 w-4" />
              Save changes
            </Button>
          </div>
        </CardBody>
      </Card>
    </Page>
  );
};

export default UserPreferences;
