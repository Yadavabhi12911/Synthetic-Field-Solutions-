import React, { useState, useEffect } from 'react';
import { Users, Search, Eye, Trash2, Shield, UserCheck, UserX, Mail, Phone } from 'lucide-react';
import { getAllUsers, deleteUserByAdmin, toggleUserStatus } from '../api';
import toast from 'react-hot-toast';
import { Page, PageHeader } from '../components/layout/Page';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PageSkeleton } from '../components/ui/Skeleton';
import { Modal, DetailField } from '../components/ui/Modal';

interface User {
  _id: string;
  userName: string;
  email: string;
  fullName: string;
  mobileNumber?: string;
  address?: string;
  profilePic?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  bookingCount?: number;
  lastLogin?: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      setUsers(response.data || []);
      setFilteredUsers(response.data || []);
    } catch (err: any) {
      console.error('Error loading users:', err);
      const errorMessage = err.message || 'Failed to load users';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search users
  useEffect(() => {
    let filtered = [...users];

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.userName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.fullName.toLowerCase().includes(searchLower) ||
        user.mobileNumber?.toLowerCase().includes(searchLower) ||
        user.address?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (statusFilter === 'active') return user.isActive !== false;
        if (statusFilter === 'inactive') return user.isActive === false;
        return true;
      });
    }

    // Sort users
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof User];
      let bValue: any = b[sortBy as keyof User];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter, sortBy, sortOrder]);

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteUserByAdmin(userToDelete);
      toast.success('User deleted successfully!');
      await loadUsers(); // Reload users
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      await toggleUserStatus(userId);
      toast.success('User status updated successfully!');
      
      // Update local state immediately
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId 
            ? { ...user, isActive: !user.isActive }
            : user
        )
      );
      
      // Also update selected user if modal is open
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const getStatusTone = (isActive: boolean | undefined) =>
    isActive !== false ? ('success' as const) : ('danger' as const);

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <Page>
        <Card className="border-danger/30">
          <CardBody className="py-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-danger" />
            <p className="text-danger">{error}</p>
          </CardBody>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        title="User management"
        description="Manage and monitor registered players."
      />

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Total users', value: users.length },
          { label: 'Active', value: users.filter((u) => u.isActive !== false).length },
          { label: 'Inactive', value: users.filter((u) => u.isActive === false).length },
          {
            label: 'New this month',
            value: users.filter((u) => {
              const userDate = new Date(u.createdAt);
              const now = new Date();
              return (
                userDate.getMonth() === now.getMonth() &&
                userDate.getFullYear() === now.getFullYear()
              );
            }).length,
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardBody>
              <div className="type-numeric text-2xl text-foreground">{stat.value}</div>
              <div className="text-sm text-muted">{stat.label}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-foreground"
          >
            <option value="all">All users</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-foreground"
          >
            <option value="createdAt">Joined date</option>
            <option value="userName">Username</option>
            <option value="fullName">Full name</option>
          </select>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? 'Asc' : 'Desc'}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardBody className="py-12 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-muted" />
              <h3 className="mb-2 type-heading">No users found</h3>
              <p className="text-muted">Try adjusting your search or filter criteria.</p>
            </CardBody>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user._id}>
              <CardBody>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-muted">
                      {user.profilePic ? (
                        <img
                          src={user.profilePic}
                          alt={user.fullName}
                          className="h-12 w-12 object-cover"
                        />
                      ) : (
                        <Users className="h-6 w-6 text-primary" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="type-heading">{user.fullName}</h3>
                        <Badge tone={getStatusTone(user.isActive)}>
                          {user.isActive !== false ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted">@{user.userName}</p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                        {user.mobileNumber && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.mobileNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="text-sm text-muted">
                      <div>Joined {new Date(user.createdAt).toLocaleDateString()}</div>
                      <div>{user.bookingCount || 0} bookings</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewUser(user)}
                        aria-label={`View ${user.fullName}`}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      <Button
                        type="button"
                        variant={user.isActive !== false ? 'danger' : 'primary'}
                        size="sm"
                        onClick={() => handleToggleUserStatus(user._id)}
                      >
                        {user.isActive !== false ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                        {user.isActive !== false ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteUser(user._id)}
                        aria-label={`Delete ${user.fullName}`}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      <Modal
        open={showUserModal && !!selectedUser}
        onClose={() => setShowUserModal(false)}
        title="User details"
        description={selectedUser ? `@${selectedUser.userName}` : undefined}
        size="lg"
        footer={
          selectedUser ? (
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant={selectedUser.isActive !== false ? 'danger' : 'primary'}
                onClick={() => handleToggleUserStatus(selectedUser._id)}
              >
                {selectedUser.isActive !== false ? 'Deactivate' : 'Activate'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowUserModal(false)}>
                Close
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedUser && (
          <>
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary-muted">
                {selectedUser.profilePic ? (
                  <img
                    src={selectedUser.profilePic}
                    alt={selectedUser.fullName}
                    className="h-20 w-20 object-cover"
                  />
                ) : (
                  <Users className="h-10 w-10 text-primary" />
                )}
              </div>
              <h4 className="type-heading">{selectedUser.fullName}</h4>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <DetailField label="Email" value={selectedUser.email} />
              {selectedUser.mobileNumber && (
                <DetailField label="Phone" value={selectedUser.mobileNumber} />
              )}
              {selectedUser.address && <DetailField label="Address" value={selectedUser.address} />}
              <DetailField
                label="Joined"
                value={new Date(selectedUser.createdAt).toLocaleDateString()}
              />
              <div>
                <p className="type-meta">Status</p>
                <Badge tone={getStatusTone(selectedUser.isActive)} className="mt-1">
                  {selectedUser.isActive !== false ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <DetailField label="Total bookings" value={selectedUser.bookingCount || 0} />
            </div>
          </>
        )}
      </Modal>

      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete user"
        description="Are you sure you want to proceed?"
        size="sm"
        footer={
          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" className="flex-1" onClick={confirmDeleteUser}>
              Delete user
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted">
          This action will permanently delete the user and all their associated data. This action cannot be undone.
        </p>
        <div className="mt-4 rounded-md border border-danger/30 bg-danger/10 p-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-danger" />
            <span className="text-sm font-medium text-danger">This action is irreversible</span>
          </div>
        </div>
      </Modal>
    </Page>
  );
};

export default AdminUsers; 