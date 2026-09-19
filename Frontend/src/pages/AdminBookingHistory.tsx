import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Search, AlertCircle, Eye, X } from 'lucide-react';
import { getAdminBookingHistory, cancelBooking } from '../api';
import toast from 'react-hot-toast';
import { Page, PageHeader } from '../components/layout/Page';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PageSkeleton } from '../components/ui/Skeleton';
import { Modal } from '../components/ui/Modal';
import { BookingDetailsModal } from '../components/BookingDetailsModal';

interface Booking {
  _id: string;
  turfName: string;
  location: string;
  status: string;
  bookingDate: string;
  timeSlot: string;
  price: number;
  ownerName?: string;
  ownerMobile?: string;
  photos?: Array<{ photos: string }>;
  rating?: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  userEmail?: string;
  userMobile?: string;
}

const AdminBookingHistory: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getAdminBookingHistory()
      .then(response => {
        setBookings(response.data?.bookingHistory || []);
      })
      .catch(err => {
        console.error('Error loading admin bookings:', err);
        setError('Failed to load bookings');
      })
      .finally(() => setLoading(false));
  }, []);

  const getStatusTone = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'primary' as const;
      case 'completed':
        return 'success' as const;
      case 'canceled':
        return 'danger' as const;
      default:
        return 'warning' as const;
    }
  };

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedBooking(null);
  };

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

  const handleCancelBooking = async (bookingId: string) => {
    setBookingToCancel(bookingId);
    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;
    
    try {
      await cancelBooking(bookingToCancel);
      toast.success('Booking cancelled successfully!');
      
      // Refresh the bookings list
      const response = await getAdminBookingHistory();
      setBookings(response.data?.bookingHistory || []);
      
      // Close modal
      setShowCancelModal(false);
      setBookingToCancel(null);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(errorMessage);
    }
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setBookingToCancel(null);
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status === filter;
    const matchesSearch = (booking.turfName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (booking.location?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (booking.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <Page>
        <Card className="border-danger/30">
          <CardBody className="py-12 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-danger" />
            <p className="text-danger">{error}</p>
          </CardBody>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        title="Booking history"
        description="Manage and monitor all field bookings."
      />

      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by field, location, or user..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'confirmed', label: 'Confirmed' },
            { key: 'completed', label: 'Completed' },
            { key: 'canceled', label: 'Cancelled' },
          ].map((filterOption) => (
            <Button
              key={filterOption.key}
              type="button"
              size="sm"
              variant={filter === filterOption.key ? 'primary' : 'secondary'}
              onClick={() => setFilter(filterOption.key)}
            >
              {filterOption.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Total', value: bookings.length },
          { label: 'Confirmed', value: bookings.filter((b) => b.status === 'confirmed').length },
          { label: 'Completed', value: bookings.filter((b) => b.status === 'completed').length },
          { label: 'Cancelled', value: bookings.filter((b) => b.status === 'canceled').length },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardBody>
              <div className="type-numeric text-2xl text-foreground">{stat.value}</div>
              <div className="text-sm text-muted">{stat.label}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <Card>
            <CardBody className="py-12 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-muted" />
              <h3 className="mb-2 type-heading">No bookings found</h3>
              <p className="text-muted">Try adjusting your search or filter.</p>
            </CardBody>
          </Card>
        ) : (
          filteredBookings.map((booking) => (
            <Card key={booking._id}>
              <CardBody>
                <div className="flex flex-col gap-6 md:flex-row">
                  <div className="h-32 w-full overflow-hidden rounded-lg md:w-32">
                    {booking.photos?.[0]?.photos ? (
                      <img
                        src={booking.photos[0].photos}
                        alt={booking.turfName}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div
                      className={`flex h-full w-full items-center justify-center bg-primary-muted ${
                        booking.photos?.[0]?.photos ? 'hidden' : ''
                      }`}
                    >
                      <Calendar className="h-8 w-8 text-primary" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <h3 className="mb-2 type-heading">
                          {booking.turfName || 'Turf'}
                        </h3>
                        <div className="mb-2 flex items-center text-sm text-muted">
                          <MapPin className="mr-2 h-4 w-4" />
                          {booking.location || 'Location not available'}
                        </div>
                        {booking.userName && (
                          <p className="text-sm text-muted">
                            Booked by <span className="text-foreground">{booking.userName}</span>
                          </p>
                        )}
                      </div>
                      <div className="text-left sm:text-right">
                        {booking.price > 0 ? (
                          <div className="mb-2 text-xl font-semibold text-primary">₹{booking.price}</div>
                        ) : (
                          <div className="mb-2 text-sm text-muted">Price not set</div>
                        )}
                        <Badge tone={getStatusTone(booking.status)} className="capitalize">
                          {booking.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-sm text-muted md:grid-cols-3">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        Play: {new Date(booking.bookingDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {booking.timeSlot}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        Booked: {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                      {booking.status === 'confirmed' && (
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => handleCancelBooking(booking._id)}
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                      )}
                      <Button type="button" size="sm" onClick={() => handleViewDetails(booking)}>
                        <Eye className="h-4 w-4" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      <BookingDetailsModal
        open={showDetailsModal}
        onClose={closeDetailsModal}
        booking={selectedBooking}
        variant="operator"
      />

      <Modal
        open={showCancelModal}
        onClose={closeCancelModal}
        title="Cancel booking"
        description="Are you sure you want to proceed?"
        size="sm"
        footer={
          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={closeCancelModal}>
              Keep booking
            </Button>
            <Button type="button" variant="danger" className="flex-1" onClick={confirmCancelBooking}>
              Cancel booking
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted">
          This action will cancel the booking and cannot be undone. The player will be notified of the cancellation.
        </p>
        <div className="mt-4 rounded-md border border-danger/30 bg-danger/10 p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-danger" />
            <span className="text-sm font-medium text-danger">This action is irreversible</span>
          </div>
        </div>
      </Modal>
    </Page>
  );
};

export default AdminBookingHistory; 