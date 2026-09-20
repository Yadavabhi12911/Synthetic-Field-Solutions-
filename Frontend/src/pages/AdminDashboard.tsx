import React, { useState, useEffect } from 'react';
import { Plus, Settings, BarChart3, Users, Calendar, MapPin, Edit, Trash2, Star, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CreateTurfModal from '../components/CreateTurfModal';
import { getAdminTurfs, getAdminBookingHistory, toggleTurfSlotStatus, deleteTurf, updateTurf } from '../api';
import { computeAverageTurfRating, countBookingsByStatus } from '../utils/bookingUi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Page, PageHeader, SectionTitle } from '../components/layout/Page';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { PageSkeleton } from '../components/ui/Skeleton';
import { cn } from '../lib/cn';
import { BookingDetailsModal } from '../components/BookingDetailsModal';
import { Modal } from '../components/ui/Modal';
import { StatCard } from '../components/ui/StatCard';

interface Turf {
  _id: string;
  description: string;
  price: string;
  address: string;
  pincode: string;
  ContactNumber: number;
  turfTiming: Array<{ time: string; status: boolean }>;
  owner: string;
  photos: Array<{ photos: string }>;
  averageRating: number;
  totalRatings: number;
}

interface Booking {
  id: string;
  userName: string;
  userEmail?: string;
  userMobile?: string;
  turfName: string;
  amount: string;
  date: string;
  time: string;
  status: string;
  createdAt: string;
  price?: number;
  bookingDate?: string;
  timeSlot?: string;
}

interface Stat {
  color: string;
  icon: React.ElementType;
  value: string | number;
  label: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ turfId: string; time: string; status: boolean } | null>(null);
  const [editingTurf, setEditingTurf] = useState<Turf | null>(null);
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAdminTurfs(),
      getAdminBookingHistory()
    ])
      .then(([turfsRes, bookingsRes]) => {
        setTurfs(turfsRes.data);
        // Sort bookings by createdAt date in descending order (newest first)
        const sortedBookings = (bookingsRes.data?.bookingHistory || []).sort((a: Booking, b: Booking) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setRecentBookings(sortedBookings);
      })
      .catch(err => setError('Failed to load admin dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-warning text-warning'
                : 'text-muted'
            }`}
          />
        ))}
      </div>
    );
  };

  const handleToggleSlot = async (turfId: string, time: string, currentStatus: boolean) => {
    try {
      await toggleTurfSlotStatus(turfId, time);
      setTurfs(prevTurfs => prevTurfs.map(turf =>
        turf._id === turfId
          ? {
              ...turf,
              turfTiming: turf.turfTiming.map(slot =>
                slot.time === time ? { ...slot, status: !slot.status } : slot
              )
            }
          : turf
      ));
      toast.success('Slot status updated!');
    } catch (error) {
      toast.error('Failed to update slot status');
    }
  };

  const handleConfirmToggle = (turfId: string, time: string, status: boolean) => {
    setConfirmDialog({ turfId, time, status });
  };

  const handleConfirmDialogYes = async () => {
    if (confirmDialog) {
      await handleToggleSlot(confirmDialog.turfId, confirmDialog.time, confirmDialog.status);
      setConfirmDialog(null);
    }
  };

  const handleConfirmDialogNo = () => {
    setConfirmDialog(null);
  };

  const handleDeleteTurf = async (turfId: string) => {
    if (!window.confirm('Are you sure you want to delete this turf?')) return;
    try {
      await deleteTurf(turfId);
      setTurfs(prev => prev.filter(turf => turf._id !== turfId));
      toast.success('Turf deleted!');
    } catch (err: any) {
      toast.error('Failed to delete turf: ' + (err.message || 'Unknown error'));
    }
  };

  const handleEditTurf = (turfId: string) => {
    const turf = turfs.find(t => t._id === turfId);
    if (turf) setEditingTurf(turf);
  };

  const handleViewBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowBookingDetailsModal(true);
  };

  const closeBookingDetailsModal = () => {
    setShowBookingDetailsModal(false);
    setSelectedBooking(null);
  };

  const bookingStats = countBookingsByStatus(recentBookings);
  const averageRating = computeAverageTurfRating(turfs);
  const dashboardStats: Stat[] = [
    { icon: MapPin, color: '', value: turfs.length, label: 'Total fields' },
    { icon: Calendar, color: '', value: bookingStats.upcoming, label: 'Upcoming bookings' },
    {
      icon: Star,
      color: '',
      value: averageRating ? averageRating.toFixed(1) : 'n/a',
      label: 'Avg field rating',
    },
    { icon: Users, color: '', value: bookingStats.completed, label: 'Completed bookings' },
  ];

  const bookingStatusTone = (status: string) => {
    if (status === 'confirmed') return 'primary' as const;
    if (status === 'completed') return 'success' as const;
    if (status === 'canceled') return 'danger' as const;
    return 'warning' as const;
  };

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <Page>
        <Card className="border-danger/30">
          <CardBody className="py-12 text-center">
            <p className="text-danger">{error}</p>
            <Button type="button" variant="secondary" className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardBody>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        title={user?.companyName || 'Operator dashboard'}
        description="Manage your fields and bookings."
        action={
          <Button type="button" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            Add field
          </Button>
        }
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardBody>
            <SectionTitle
              action={
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAvailableOnly((v) => !v)}>
                  {showAvailableOnly ? 'Show all slots' : 'Available only'}
                </Button>
              }
            >
              Your fields
            </SectionTitle>

            <div className="space-y-4">
              {turfs.length === 0 ? (
                <p className="py-8 text-center text-muted">No fields yet. Add your first field to get started.</p>
              ) : (
                turfs.map((turf) => (
                  <div
                    key={turf._id}
                    className="rounded-lg border border-border bg-surface-muted p-4"
                  >
                    <div className="flex gap-4">
                      <div className="flex gap-2">
                        {turf.photos?.length ? (
                          turf.photos.map((photo, idx) => (
                            <img
                              key={`${turf._id}-photo-${idx}`}
                              src={photo.photos}
                              alt={turf.description}
                              className="h-16 w-16 cursor-pointer rounded-md border border-border object-cover"
                              onClick={() => setLightboxImg(photo.photos)}
                            />
                          ))
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-primary-muted text-primary">
                            <MapPin className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <h3 className="type-heading line-clamp-2">{turf.description}</h3>
                          <div className="flex gap-1">
                            <Button type="button" variant="ghost" size="sm" onClick={() => handleEditTurf(turf._id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="danger" size="sm" onClick={() => handleDeleteTurf(turf._id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mb-2 flex items-center type-body-sm">
                          <MapPin className="mr-1 h-4 w-4" />
                          <span className="truncate">{turf.address}</span>
                        </div>
                        {turf.averageRating > 0 && (
                          <div className="mb-2 flex items-center gap-2">
                            {renderStars(turf.averageRating)}
                            <span className="text-xs text-muted">
                              {turf.averageRating.toFixed(1)} ({turf.totalRatings})
                            </span>
                          </div>
                        )}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="type-numeric text-primary">
                            {String(turf.price).startsWith('₹') ? turf.price : `₹${turf.price}`}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {turf.turfTiming?.length ? (
                              turf.turfTiming
                                .filter((slot) => !showAvailableOnly || slot.status)
                                .map((slot) => (
                                  <button
                                    key={`${turf._id}-slot-${slot.time}`}
                                    type="button"
                                    onClick={() => handleConfirmToggle(turf._id, slot.time, slot.status)}
                                    className={cn(
                                      'rounded px-2 py-1 text-xs font-medium transition-colors',
                                      slot.status
                                        ? 'bg-primary-muted text-primary hover:bg-primary/20'
                                        : 'bg-surface text-muted hover:bg-surface-muted'
                                    )}
                                    title={
                                      slot.status
                                        ? 'Available - click to mark unavailable'
                                        : 'Unavailable - click to mark available'
                                    }
                                  >
                                    {slot.time}
                                  </button>
                                ))
                            ) : (
                              <span className="text-xs text-muted">No slots</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <SectionTitle
              action={
                <Button type="button" variant="ghost" size="sm" onClick={() => navigate('/admin/bookings')}>
                  View all
                </Button>
              }
            >
              Recent bookings
            </SectionTitle>

            <div className="space-y-3">
              {recentBookings.length === 0 ? (
                <p className="py-8 text-center text-muted">No bookings yet.</p>
              ) : (
                recentBookings.slice(0, 5).map((booking) => (
                  <button
                    key={booking.id}
                    type="button"
                    onClick={() => handleViewBookingDetails(booking)}
                    className="w-full rounded-lg border border-border bg-surface-muted p-4 text-left transition-colors hover:border-primary/40"
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="type-heading">{booking.userName}</h3>
                        <p className="text-sm text-muted">{booking.turfName}</p>
                      </div>
                      {booking.amount && booking.amount !== '₹0' ? (
                        <span className="font-semibold text-primary">{booking.amount}</span>
                      ) : (
                        <span className="text-sm text-muted">Price not set</span>
                      )}
                    </div>
                    <div className="mb-3 flex items-center text-sm text-muted">
                      <Calendar className="mr-2 h-4 w-4" />
                      {booking.date} • {booking.time}
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge tone={bookingStatusTone(booking.status)} className="capitalize">
                        {booking.status}
                      </Badge>
                      <Eye className="h-4 w-4 text-muted" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-8">
        <CardBody>
          <SectionTitle>Quick actions</SectionTitle>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Button type="button" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              Add field
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/admin/analytics')}>
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/admin/users')}>
              <Users className="h-4 w-4" />
              Users
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/admin/settings')}>
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Create Turf Modal */}
      {showCreateModal && (
        <CreateTurfModal onClose={() => setShowCreateModal(false)} />
      )}

      {editingTurf && (
        <CreateTurfModal
          onClose={() => setEditingTurf(null)}
          initialData={{
            _id: editingTurf._id,
            description: editingTurf.description,
            price: editingTurf.price,
            address: editingTurf.address,
            pincode: editingTurf.pincode,
            contactNumber: editingTurf.ContactNumber?.toString() || '',
            turfTiming: Array.isArray(editingTurf.turfTiming)
              ? editingTurf.turfTiming.map(slot => slot.time)
              : [],
            photos: editingTurf.photos,
          }}
          mode="edit"
          onSubmit={async (form, turfId) => {
            try {
              await updateTurf(turfId!, form);
              const turfsRes = await getAdminTurfs();
              setTurfs(turfsRes.data);
              toast.success('Turf updated!');
              setEditingTurf(null);
            } catch (err: any) {
              toast.error('Failed to update turf: ' + (err.message || 'Unknown error'));
            }
          }}
        />
      )}

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setLightboxImg(null)}>
          <div className="relative" onClick={e => e.stopPropagation()}>
            <img src={lightboxImg} alt="Preview" className="max-w-[90vw] max-h-[80vh] rounded-xl shadow-2xl" />
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute top-2 right-2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {confirmDialog && (
        <Modal
          open={!!confirmDialog}
          onClose={handleConfirmDialogNo}
          title="Confirm slot change"
          size="sm"
          footer={
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={handleConfirmDialogNo}>
                Cancel
              </Button>
              <Button type="button" onClick={handleConfirmDialogYes}>
                Confirm
              </Button>
            </div>
          }
        >
          <p className="text-sm text-muted">
            Mark <span className="font-medium text-foreground">{confirmDialog.time}</span> as{' '}
            {confirmDialog.status ? 'unavailable' : 'available'}?
          </p>
        </Modal>
      )}

      <BookingDetailsModal
        open={showBookingDetailsModal}
        onClose={closeBookingDetailsModal}
        booking={selectedBooking}
        variant="operator"
      />
    </Page>
  );
};

export default AdminDashboard;