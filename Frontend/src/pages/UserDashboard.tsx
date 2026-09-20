import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Star, Search, Filter, Eye } from 'lucide-react';
import { countBookingsByStatus } from '../utils/bookingUi';
import { useAuth } from '../contexts/AuthContext';
import { getUserBookingHistory, getAllTurfs } from '../api';
import { useNavigate } from 'react-router-dom';
import { Page, PageHeader, SectionTitle } from '../components/layout/Page';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { PageSkeleton } from '../components/ui/Skeleton';
import { BookingDetailsModal } from '../components/BookingDetailsModal';
import { TiltSurface } from '../components/landing/TiltSurface';
import { StatCard } from '../components/ui/StatCard';

interface Booking {
  _id: string;
  turfName: string;
  price: number;
  date: string;
  time: string;
  status: string;
  createdAt: string;
  userName?: string;
  userEmail?: string;
  userMobile?: string;
  bookingDate?: string;
  timeSlot?: string;
}

interface Turf {
  _id: string;
  description: string;
  price: number;
  address: string;
  pincode: string;
  ContactNumber: number;
  turfTiming: Array<{ time: string; status: boolean }>;
  photos: Array<{ photos: string }>;
  averageRating: number;
  totalRatings: number;
  owner: {
    _id: string;
    userName: string;
    companyName: string;
  };
  createdAt: string;
  updatedAt: string;
}

const statusTone = (status: string) => {
  if (status === 'confirmed') return 'primary' as const;
  if (status === 'completed') return 'success' as const;
  if (status === 'canceled') return 'danger' as const;
  return 'warning' as const;
};

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [recommendedTurfs, setRecommendedTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([getUserBookingHistory(), getAllTurfs()])
      .then(([bookingsRes, turfsRes]) => {
        const sortedBookings = (bookingsRes.data?.bookingHistory || []).sort(
          (a: Booking, b: Booking) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentBookings(sortedBookings);

        const turfsData = turfsRes.data?.turfs || turfsRes.data || [];
        setRecommendedTurfs(Array.isArray(turfsData) ? turfsData : []);
      })
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const renderStars = (rating: number) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'fill-warning text-warning' : 'text-muted'
          }`}
        />
      ))}
    </div>
  );

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <Page>
        <Card className="border-danger/30">
          <CardBody className="py-12 text-center">
            <p className="text-danger">{error}</p>
            <Button
              type="button"
              variant="secondary"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try again
            </Button>
          </CardBody>
        </Card>
      </Page>
    );
  }

  const bookingStats = countBookingsByStatus(recentBookings);
  const dashboardStats = [
    { label: 'Total bookings', value: bookingStats.total, icon: Calendar },
    { label: 'Upcoming', value: bookingStats.upcoming, icon: Clock },
    { label: 'Completed', value: bookingStats.completed, icon: Star },
    { label: 'Canceled', value: bookingStats.canceled, icon: MapPin },
  ];

  return (
    <Page>
      <PageHeader
        title={`Welcome back, ${user?.fullName || 'Player'}`}
        description="Ready to book your next game?"
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardBody>
            <SectionTitle>Recent bookings</SectionTitle>
            <div className="space-y-3">
              {recentBookings.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="mb-4 text-muted">You have not booked a field yet.</p>
                  <Button type="button" onClick={() => navigate('/turfs')}>
                    Browse fields
                  </Button>
                </div>
              ) : (
                recentBookings.slice(0, 5).map((booking) => (
                  <button
                    key={booking._id}
                    type="button"
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowBookingDetailsModal(true);
                    }}
                    className="w-full rounded-lg border border-border bg-surface-muted p-4 text-left transition-colors hover:border-primary/40"
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <h3 className="type-heading">{booking.turfName}</h3>
                      {booking.price > 0 ? (
                        <span className="type-numeric text-primary">₹{booking.price}</span>
                      ) : (
                        <span className="type-body-sm">Price not set</span>
                      )}
                    </div>
                    <div className="mb-3 flex items-center gap-4 type-body-sm">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {booking.date ||
                          (booking.bookingDate
                            ? new Date(booking.bookingDate).toLocaleDateString()
                            : 'Not set')}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {booking.time || booking.timeSlot}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge tone={statusTone(booking.status)} className="capitalize">
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

        <Card>
          <CardBody>
            <SectionTitle
              action={
                <Button type="button" variant="ghost" size="sm" onClick={() => navigate('/turfs')}>
                  View all
                </Button>
              }
            >
              Available fields
            </SectionTitle>

            <div className="space-y-3">
              {recommendedTurfs.length > 0 ? (
                recommendedTurfs.slice(0, 4).map((turf) => (
                  <TiltSurface key={turf._id} intensity="subtle">
                    <div className="flex gap-4 p-4">
                    <img
                      src={turf.photos?.[0]?.photos || '/default-turf.jpg'}
                      alt={turf.owner?.companyName || 'Turf'}
                      className="h-16 w-16 rounded-md object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="type-heading truncate">
                        {turf.owner?.companyName || 'Turf'}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 type-body-sm">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="truncate">{turf.address}</span>
                      </div>
                      {turf.averageRating > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          {renderStars(turf.averageRating)}
                          <span className="type-meta">
                            {turf.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="type-numeric text-primary">₹{turf.price}/hr</span>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => navigate(`/turf/${turf._id}`)}
                        >
                          Book
                        </Button>
                      </div>
                    </div>
                    </div>
                  </TiltSurface>
                ))
              ) : (
                <p className="py-8 text-center text-muted">No fields available right now.</p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-8">
        <CardBody>
          <SectionTitle>Quick actions</SectionTitle>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Button type="button" onClick={() => navigate('/turfs')}>
              <Search className="h-4 w-4" />
              Find fields
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/bookings')}>
              <Calendar className="h-4 w-4" />
              My bookings
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/preferences')}>
              <Filter className="h-4 w-4" />
              Preferences
            </Button>
          </div>
        </CardBody>
      </Card>

      <BookingDetailsModal
        open={showBookingDetailsModal}
        onClose={() => {
          setShowBookingDetailsModal(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        variant="player"
      />
    </Page>
  );
};

export default UserDashboard;
