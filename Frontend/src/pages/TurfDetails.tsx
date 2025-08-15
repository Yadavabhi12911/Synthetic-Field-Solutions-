import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Clock, Phone, Calendar, Check, X, ChevronLeft, ChevronRight, User, MessageCircle } from 'lucide-react';
import BookingModal from '../components/BookingModal';
import { getTurfById, getTurfReviews } from '../api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

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
  const handleBookingClick = () => {
    if (!user) {
      toast.error('Please login to book a turf');
      navigate('/login');
      return;
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
        console.log('Turf data:', response.data);
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
        console.log('Reviews data:', response.data);
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
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-400'
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
    return (
      <div className="min-h-screen pt-16 px-4 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-white text-lg">Loading turf details...</div>
        </div>
      </div>
    );
  }

  if (error || !turf) {
    return (
      <div className="min-h-screen pt-16 px-4 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-red-400 text-lg">{error || 'Turf not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mt-10">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">
                {turf?.description || 'Turf Details'}
              </h1>
              <div className="flex items-center justify-start text-gray-300 mt-5">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{turf?.address}</span>
              </div>
              {turf.averageRating > 0 && (
                <div className="flex justify-between">
                 <div className='flex items-center space-x-2'>
                   {renderStars(turf.averageRating)}
                  <span className="text-white font-semibold">{turf.averageRating.toFixed(1)}</span>
                  <span className="text-gray-300">({turf.totalRatings} reviews)</span>
                 </div>

                    <div className="text-right">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-teal-400">₹{turf?.price}</div>
              <div className="text-gray-300 text-sm sm:text-base">per hour</div>
            </div>
                </div>
              )}
            </div>
          
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Images and Details */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <div className="relative mb-4">
                <img
                  src={turf?.photos && turf.photos.length > 0 ? turf.photos[selectedImage]?.photos : '/default-turf.jpg'}
                  alt={turf?.description}
                  className="w-full h-80 object-cover rounded-2xl"
                />
                {turf?.photos && turf.photos.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImage + 1} / {turf.photos.length}
                    </div>
                    

                  </>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {turf?.photos && turf.photos.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {turf.photos.map((photo, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setSelectedImage(index)}
                      className={`relative h-20 rounded-xl overflow-hidden ${
                        selectedImage === index ? 'ring-2 ring-teal-400' : ''
                      }`}
                    >
                      <img src={photo.photos} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                      {selectedImage === index && (
                        <div className="absolute inset-0 bg-teal-500/20 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">About This Turf</h2>
              <p className="text-gray-300 leading-relaxed">{turf?.description}</p>
            </motion.div>

            {/* Facilities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Facilities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-teal-400" />
                  <span className="text-white">Professional Ground</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-teal-400" />
                  <span className="text-white">Flood Lights</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-teal-400" />
                  <span className="text-white">Parking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-teal-400" />
                  <span className="text-white">Changing Rooms</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-teal-400" />
                  <span className="text-white">Water Supply</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-teal-400" />
                  <span className="text-white">Equipment</span>
                </div>
              </div>
            </motion.div>

            {/* Reviews Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                  <MessageCircle className="w-6 h-6 mr-2" />
                  Reviews
                </h2>
                {turf.averageRating > 0 && (
                  <div className="flex items-center space-x-2">
                    {renderStars(turf.averageRating)}
                    <span className="text-white font-semibold">{turf.averageRating.toFixed(1)}</span>
                    <span className="text-gray-300">({turf.totalRatings} reviews)</span>
                  </div>
                )}
              </div>

              {reviewsLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-300">Loading reviews...</div>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <motion.div
                      key={review._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 rounded-xl p-4 border border-white/10"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
                            {review.user.profilePic ? (
                              <img
                                src={review.user.profilePic}
                                alt={review.user.fullName || review.user.userName}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <User className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="text-white font-semibold">
                              {review.user.fullName || review.user.userName}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      {review.review && (
                        <p className="text-gray-300 leading-relaxed">{review.review}</p>
                      )}
                      <div className="mt-3 text-sm text-gray-400">
                        Booked for {new Date(review.bookingDate).toLocaleDateString()} at {review.timeSlot}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400">No reviews yet. Be the first to review this turf!</div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Booking Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 sticky top-24"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Book Your Slot</h2>
              
              {/* Contact */}
              <div className="flex items-center text-gray-300 mb-6">
                <Phone className="w-5 h-5 mr-3" />
                <span>{turf?.ContactNumber}</span>
              </div>

              {/* Time Slots */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Available Slots Today
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
                  {turf?.turfTiming && turf.turfTiming.length > 0 ? (
                    turf.turfTiming.map((slot, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        onClick={handleBookingClick}
                        className={`w-full p-3 rounded-xl border transition-all duration-300 ${
                          slot.status 
                            ? 'bg-white/5 border-teal-400/30 hover:border-teal-400 text-white hover:bg-teal-400/10'
                            : 'bg-white/5 border-gray-500/30 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={!slot.status}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{slot.time}</span>
                          <span className="text-sm">₹{turf?.price}</span>
                        </div>
                        {!slot.status && (
                          <div className="text-xs mt-1">Not Available</div>
                        )}
                      </motion.button>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-400">
                      No time slots available
                    </div>
                  )}
                </div>
              </div>

              {/* Book Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBookingClick}
                className="w-full bg-gradient-to-r from-teal-400 to-teal-600 hover:from-teal-500 hover:to-teal-700 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Now</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          turf={turf}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
  );
};

export default TurfDetails;