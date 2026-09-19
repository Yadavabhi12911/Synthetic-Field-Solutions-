import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Clock, Phone, Calendar, Check, ChevronLeft, ChevronRight, User, MessageCircle } from 'lucide-react';
import BookingModal from '../components/BookingModal';
import { getTurfById, getTurfReviews } from '../api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Page, PageHeader, SectionTitle } from '../components/layout/Page';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageSkeleton } from '../components/ui/Skeleton';
import { cn } from '../lib/cn';
import { PitchStage } from '../components/landing/PitchStage';
import { slotsFromTimings } from '../components/landing/pitchSlots';

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

interface Review {
  _id: string;
  rating: number;
  review?: string;
  bookingDate: string;
  timeSlot: string;
  createdAt: string;
  user: {
    _id: string;
    userName: string;
    fullName: string;
    profilePic?: string;
  };
}

const TurfDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [turf, setTurf] = useState<Turf | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllImages, setShowAllImages] = useState(false);
  const autoPlayRef = useRef<number | null>(null);

  // Auto-play functionality
  useEffect(() => {
    if (!turf?.photos || turf.photos.length <= 1) {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
      return;
    }

    autoPlayRef.current = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % turf.photos.length);
    }, 3000); // Change image every 3 seconds

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [turf?.photos]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, []);

  // Handle booking button click with authentication check
  const handleBookingClick = (slotTime?: string) => {
    if (!user) {
      toast.error('Please login to book a field');
      navigate('/login');
      return;
    }
    if (slotTime) {
      setSelectedSlot(slotTime);
    }
    setShowBookingModal(true);
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setReviewsLoading(true);
    
    // Load turf details
    getTurfById(id)
      .then(response => {
        setTurf(response.data);
      })
      .catch(err => {
        console.error('Error loading turf:', err);
        setError('Failed to load turf details');
      })
      .finally(() => setLoading(false));

    // Load reviews
    getTurfReviews(id)
      .then(response => {
        setReviews(response.data);
      })
      .catch(err => {
        console.error('Error loading reviews:', err);
        // Don't set error for reviews as it's not critical
      })
      .finally(() => setReviewsLoading(false));
  }, [id]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? 'fill-warning text-warning'
                : 'text-muted'
            }`}
          />
        ))}
      </div>
    );
  };

  const nextImage = () => {
    if (turf?.photos) {
      setSelectedImage((prev) => (prev + 1) % turf.photos.length);
    }
  };

  const prevImage = () => {
    if (turf?.photos) {
      setSelectedImage((prev) => (prev - 1 + turf.photos.length) % turf.photos.length);
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  if (error || !turf) {
    return (
      <Page>
        <Card className="border-danger/30">
          <CardBody className="py-12 text-center">
            <p className="text-danger">{error || 'Turf not found'}</p>
            <Button
              type="button"
              variant="secondary"
              className="mt-4"
              onClick={() => navigate('/turfs')}
            >
              Back to browse
            </Button>
          </CardBody>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        title={turf.owner?.companyName || turf.description || 'Field details'}
        description={turf.address}
        action={
          <div className="text-right">
            <div className="type-numeric text-2xl text-primary">₹{turf.price}</div>
            <div className="type-meta mt-1">per hour</div>
          </div>
        }
      />

      {turf.averageRating > 0 && (
        <div className="mb-6 flex items-center gap-2">
          {renderStars(turf.averageRating)}
          <span className="type-label">
            {turf.averageRating.toFixed(1)}
          </span>
          <span className="type-body-sm">({turf.totalRatings} reviews)</span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
          {/* Images and Details */}
          <div className="lg:col-span-2">
            <Card className="mb-8 overflow-hidden">
              <div className="relative">
                <img
                  src={turf.photos?.length ? turf.photos[selectedImage]?.photos : '/default-turf.jpg'}
                  alt={turf.description}
                  className="h-80 w-full object-cover"
                />
                {turf.photos && turf.photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground transition-colors hover:bg-background"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      type="button"
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground transition-colors hover:bg-background"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-sm text-foreground">
                      {selectedImage + 1} / {turf.photos.length}
                    </div>
                  </>
                )}
              </div>

              {turf.photos && turf.photos.length > 1 && (
                <CardBody className="grid grid-cols-4 gap-2 border-t border-border">
                  {turf.photos.map((photo, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        'relative h-20 overflow-hidden rounded-md',
                        selectedImage === index && 'ring-2 ring-primary'
                      )}
                    >
                      <img
                        src={photo.photos}
                        alt={`View ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </CardBody>
              )}
            </Card>

            <Card className="mb-8">
              <CardBody>
                <SectionTitle>About this field</SectionTitle>
                <p className="type-body type-measure">{turf.description}</p>
              </CardBody>
            </Card>

            <Card className="mb-8">
              <CardBody>
                <SectionTitle>Facilities</SectionTitle>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {[
                    'Professional ground',
                    'Flood lights',
                    'Parking',
                    'Changing rooms',
                    'Water supply',
                    'Equipment',
                  ].map((facility) => (
                    <div key={facility} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-foreground">{facility}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="type-heading flex items-center">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Reviews
                </h2>
                {turf.averageRating > 0 && (
                  <div className="flex items-center gap-2">
                    {renderStars(turf.averageRating)}
                    <span className="font-medium text-foreground">
                      {turf.averageRating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {reviewsLoading ? (
                <p className="py-8 text-center text-muted">Loading reviews...</p>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="rounded-lg border border-border bg-surface-muted p-4"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-muted">
                            {review.user.profilePic ? (
                              <img
                                src={review.user.profilePic}
                                alt={review.user.fullName || review.user.userName}
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="type-label">
                              {review.user.fullName || review.user.userName}
                            </div>
                            <div className="type-meta mt-0.5">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {renderStars(review.rating)}
                      </div>
                      {review.review && (
                        <p className="type-body-sm">{review.review}</p>
                      )}
                      <div className="type-meta mt-3">
                        Booked for {new Date(review.bookingDate).toLocaleDateString()} at{' '}
                        {review.timeSlot}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-muted">
                  No reviews yet. Be the first to review this field.
                </p>
              )}
              </CardBody>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-[calc(var(--shell-header-height)+1rem)] space-y-4">
              <PitchStage
                compact
                slots={slotsFromTimings(turf.turfTiming, turf.price)}
                selectedSlotId={selectedSlot || undefined}
                onSelectSlot={(id) => {
                  const slot = turf.turfTiming.find((item) => item.time === id);
                  if (slot?.status) setSelectedSlot(id);
                }}
                title={turf.owner?.companyName || 'This field'}
                subtitle="Tap a glowing hour to hold it"
              />
            <Card>
              <CardBody>
              <SectionTitle>Book your slot</SectionTitle>

              <div className="mb-6 flex items-center type-body-sm">
                <Phone className="mr-3 h-5 w-5" />
                <span>{turf.ContactNumber}</span>
              </div>

              <div className="mb-6">
                <h3 className="type-label mb-4 flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Available slots today
                </h3>
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {turf.turfTiming?.length ? (
                    turf.turfTiming.map((slot, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => slot.status && handleBookingClick(slot.time)}
                        disabled={!slot.status}
                        className={cn(
                          'w-full rounded-md border p-3 text-left transition-[color,background-color,transform,border-color] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.99]',
                          slot.status
                            ? selectedSlot === slot.time
                              ? 'border-primary bg-primary-muted text-foreground'
                              : 'border-primary/30 bg-surface-muted text-foreground hover:border-primary hover:bg-primary-muted'
                            : 'cursor-not-allowed border-border text-muted'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="type-label">{slot.time}</span>
                          <span className="type-numeric type-body-sm">₹{turf.price}</span>
                        </div>
                        {!slot.status && (
                          <div className="type-meta mt-1">Not available</div>
                        )}
                      </button>
                    ))
                  ) : (
                    <p className="py-4 text-center text-muted">No time slots available</p>
                  )}
                </div>
              </div>

              <Button
                type="button"
                size="lg"
                className="w-full"
                onClick={() => handleBookingClick(selectedSlot || undefined)}
              >
                <Calendar className="h-5 w-5" />
                Book now
              </Button>
              </CardBody>
            </Card>
            </div>
          </div>
        </div>

      {showBookingModal && (
        <BookingModal
          turf={turf}
          initialSlot={selectedSlot}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedSlot('');
          }}
        />
      )}
    </Page>
  );
};

export default TurfDetails;