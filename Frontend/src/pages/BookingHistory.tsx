import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Search, AlertCircle, Eye, Star, X } from 'lucide-react';
import { getUserBookingHistory, cancelBooking, submitRating } from '../api';
import toast from 'react-hot-toast';
import { Page, PageHeader } from '../components/layout/Page';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PageSkeleton } from '../components/ui/Skeleton';
import { Modal } from '../components/ui/Modal';
import { BookingDetailsModal } from '../components/BookingDetailsModal';
import { StatCard } from '../components/ui/StatCard';
import { TiltSurface } from '../components/landing/TiltSurface';

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
  userMobile?: string;
}

const BookingHistory: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getUserBookingHistory()
      .then(response => {
        setBookings(response.data?.bookingHistory || []);
      })
      .catch(err => {
        console.error('Error loading bookings:', err);
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
  
  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [bookingToRate, setBookingToRate] = useState<Booking | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

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
      const response = await getUserBookingHistory();
      setBookings(response.data?.bookingHistory || []);
      
      // Close modal
      setShowCancelModal(false);
      setBookingToCancel(null);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      
      // Check for specific error messages
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('Cannot cancel booking after')) {
        toast.error('Cannot cancel booking after the slot time has started');
      } else {
        toast.error('Failed to cancel booking. Please try again.');
      }
    }
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setBookingToCancel(null);
  };

  const handleRateBooking = (booking: Booking) => {
    setBookingToRate(booking);
    setRating(booking.rating || 0);
    setReview(booking.review || '');
    setShowRatingModal(true);
  };

  const closeRatingModal = () => {
    setShowRatingModal(false);
    setBookingToRate(null);
    setRating(0);
    setReview('');
  };

  const submitRatingHandler = async () => {
    if (!bookingToRate || rating === 0) return;
    
    setSubmittingRating(true);
    try {
      await submitRating(bookingToRate._id, rating, review);
      toast.success(bookingToRate.rating ? 'Rating updated successfully!' : 'Rating submitted successfully!');
      
      // Refresh the bookings list
      const response = await getUserBookingHistory();
      setBookings(response.data?.bookingHistory || []);
      
      closeRatingModal();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating. Please try again.');
    } finally {
      setSubmittingRating(false);
    }
  };

  // Helper function to check if a booking can be cancelled
  const canCancelBooking = (booking: Booking) => {
    if (booking.status !== 'confirmed') return false;
    
    const now = new Date();
    const bookingDate = new Date(booking.bookingDate);
    
    // If booking date is in the past, it cannot be cancelled
    if (bookingDate < now) return false;
    
    // If booking date is today, check if slot time has started
    if (bookingDate.toDateString() === now.toDateString()) {
      // Parse time slot (assuming format like "6:00 AM - 7:00 AM")
      const timeMatch = booking.timeSlot.match(/(\d+)(?::(\d+))?\s*(AM|PM)/i);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1], 10);
        const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
        const ampm = timeMatch[3].toUpperCase();
        
        if (ampm === 'PM' && hour !== 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;
        
        const slotStartTime = new Date(bookingDate);
        slotStartTime.setHours(hour, minute, 0, 0);
        
        // Add 5 minutes grace period
        const gracePeriodEnd = new Date(slotStartTime.getTime() + 5 * 60 * 1000);
        
        if (now >= gracePeriodEnd) return false;
      }
    }
    
    return true;
  };

  const renderStars = (currentRating: number, interactive: boolean = false, onStarClick?: (star: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive && onStarClick ? () => onStarClick(star) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
              star <= currentRating
                ? 'fill-warning text-warning'
                : 'text-muted'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };



  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status === filter;
    const matchesSearch = (booking.turfName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (booking.location?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <Page>
        <Card className="border-danger/30">
          <CardBody className="py-12 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-danger" />
            <h3 className="type-heading mb-2">Could not load bookings</h3>
            <p className="type-body">{error}</p>
          </CardBody>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        title="My bookings"
        description="Track and manage your field reservations."
      />

      <Card className="mb-6 border-primary/20 bg-primary-muted/30">
        <CardBody className="space-y-2 type-body-sm">
          <p>Bookings complete automatically after the slot ends. You can rate your visit once completed.</p>
          <p>Cancellation is allowed up to 5 minutes after the slot start time.</p>
        </CardBody>
      </Card>

      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bookings..."
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
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <Card>
              <CardBody className="py-12 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-muted" />
                <h3 className="type-heading mb-2">No bookings found</h3>
                <p className="type-body">Try adjusting your search or filter.</p>
              </CardBody>
            </Card>
          ) : (
            filteredBookings.map((booking) => (
              <TiltSurface key={booking._id} intensity="subtle">
                <Card className="border-0 bg-transparent shadow-none hover:border-transparent">
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
                        <div className="flex items-center text-sm text-muted">
                          <MapPin className="mr-2 h-4 w-4" />
                          <span>{booking.location || 'Location not available'}</span>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        {booking.price > 0 ? (
                          <div className="mb-2 text-xl font-semibold text-primary">
                            ₹{booking.price}
                          </div>
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
                        canCancelBooking(booking) ? (
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => handleCancelBooking(booking._id)}
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </Button>
                        ) : (
                          <Button type="button" variant="secondary" size="sm" disabled>
                            Cannot cancel
                          </Button>
                        )
                      )}
                      {booking.status === 'completed' && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRateBooking(booking)}
                        >
                          <Star className="h-4 w-4" />
                          {booking.rating ? 'Update rating' : 'Rate visit'}
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleViewDetails(booking)}
                      >
                        <Eye className="h-4 w-4" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
                </CardBody>
              </Card>
              </TiltSurface>
            ))
          )}
      </div>

      <BookingDetailsModal
        open={showDetailsModal}
        onClose={closeDetailsModal}
        booking={selectedBooking}
        variant="player"
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
          This action will cancel your booking and cannot be undone. You may need to book again if you change your mind.
        </p>
        <div className="mt-4 rounded-md border border-danger/30 bg-danger/10 p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-danger" />
            <span className="text-sm font-medium text-danger">This action is irreversible</span>
          </div>
        </div>
        <div className="mt-3 rounded-md border border-warning/30 bg-warning/10 p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-warning" />
            <span className="text-sm text-warning">
              Cancellation is only allowed up to 5 minutes after the slot start time
            </span>
          </div>
        </div>
      </Modal>

      <Modal
        open={showRatingModal && !!bookingToRate}
        onClose={closeRatingModal}
        title={bookingToRate?.rating ? 'Update your rating' : 'Rate your experience'}
        description={bookingToRate?.turfName}
        size="sm"
        footer={
          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={closeRatingModal}>
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={submitRatingHandler}
              disabled={rating === 0 || submittingRating}
              loading={submittingRating}
            >
              <Star className="h-4 w-4" />
              {bookingToRate?.rating ? 'Update rating' : 'Submit rating'}
            </Button>
          </div>
        }
      >
        <div>
          <label className="mb-3 block type-label">
            How would you rate your experience?
          </label>
          <div className="flex justify-center">{renderStars(rating, true, setRating)}</div>
          <p className="mt-2 text-center text-sm text-muted">
            {rating === 0 && 'Select a rating'}
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very good'}
            {rating === 5 && 'Excellent'}
          </p>
        </div>

        <div className="mt-6">
          <label htmlFor="review-text" className="mb-2 block type-label">
            Share your experience (optional)
          </label>
          <textarea
            id="review-text"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Tell us about your experience at this field..."
            className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
            rows={4}
            maxLength={500}
          />
          <p className="mt-1 text-right text-xs text-muted">{review.length}/500</p>
        </div>
      </Modal>
    </Page>
  );
};

export default BookingHistory;