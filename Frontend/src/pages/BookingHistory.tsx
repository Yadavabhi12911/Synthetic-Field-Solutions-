import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Filter, Search, CheckCircle, XCircle, AlertCircle, Eye, X, Star } from 'lucide-react';
import { getUserBookingHistory, cancelBooking, submitRating } from '../api';
import toast from 'react-hot-toast';

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
        console.log('Booking history response:', response);
        console.log('Bookings data:', response.data?.bookingHistory);
        
        // Debug: Check status values
        const statuses = response.data?.bookingHistory?.map((b: Booking) => b.status) || [];
        console.log('Available statuses:', [...new Set(statuses)]);
        
        // Debug: Check photos data
        const photosData = response.data?.bookingHistory?.map((b: Booking) => ({
          turfName: b.turfName,
          photos: b.photos,
          hasPhotos: b.photos && b.photos.length > 0
        })) || [];
        console.log('Photos data:', photosData);
        
        setBookings(response.data?.bookingHistory || []);
      })
      .catch(err => {
        console.error('Error loading bookings:', err);
        setError('Failed to load bookings');
      })
      .finally(() => setLoading(false));
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-teal-400" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-purple-400" />;
      case 'canceled':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-teal-500/20 text-teal-400';
      case 'completed':
        return 'bg-purple-500/20 text-purple-400';
      case 'canceled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-yellow-500/20 text-yellow-400';
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
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-400'
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
    return (
      <div className="min-h-screen pt-16 px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-white">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16 px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Error</h3>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col justify-center gap-3 items-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white pt-10 mt-5">
              My <span className="text-teal-400">Bookings</span>
            </h1>
            <p className="text-gray-300 text-base sm:text-lg">Track and manage your turf bookings</p>
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                <span className="text-blue-300 text-sm">
                  Bookings are automatically completed when the time expires. You can rate your experience after completion.
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <XCircle className="w-5 h-5 text-orange-400" />
                <span className="text-orange-300 text-sm">
                  Cancellation is only allowed up to 5 minutes after the slot start time.
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex flex-col md:flex-row gap-4"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search bookings..."
                              className="w-full pl-12 pr-4 py-3 bg-zinc-700 backdrop-blur-lg border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
            />
          </div>
          
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'confirmed', label: 'Confirmed' },
              { key: 'completed', label: 'Completed' },
              { key: 'canceled', label: 'Cancelled' }
            ].map((filterOption) => (
              <motion.button
                key={filterOption.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(filterOption.key)}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  filter === filterOption.key
                    ? 'bg-teal-400 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {filterOption.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { label: 'Total Bookings', value: bookings.length, color: 'from-teal-400 to-teal-600' },
            { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, color: 'from-blue-500 to-purple-600' },
            { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, color: 'from-purple-500 to-pink-600' },
            { label: 'Cancelled', value: bookings.filter(b => b.status === 'canceled').length, color: 'from-red-500 to-orange-600' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-300 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bookings List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No bookings found</h3>
              <p className="text-gray-300">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredBookings.map((booking, index) => (
                              <motion.div
                  key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-teal-400/50 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden">
                    {booking.photos && booking.photos.length > 0 && booking.photos[0]?.photos ? (
                      <img
                        src={booking.photos[0].photos}
                        alt={booking.turfName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('Image failed to load:', booking.photos?.[0]?.photos);
                          // Fallback to placeholder if image fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', booking.photos?.[0]?.photos);
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center ${booking.photos && booking.photos.length > 0 && booking.photos[0]?.photos ? 'hidden' : ''}`}>
                      <div className="text-center text-white">
                        <Calendar className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-xs font-medium truncate px-2">{booking.turfName}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{booking.turfName || 'Turf'}</h3>
                        <div className="flex items-center text-gray-300 mb-2">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{booking.location || 'Location not available'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {booking.price > 0 ? (
                          <div className="text-xl sm:text-2xl font-bold text-teal-400 mb-2">₹{booking.price}</div>
                        ) : (
                          <div className="text-sm text-gray-400 mb-2">Price not set</div>
                        )}
                        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="capitalize">{booking.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center text-gray-300">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Play Date: {new Date(booking.bookingDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Time: {booking.timeSlot}</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Booked: {new Date(booking.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4 space-x-3">
                      {booking.status === 'confirmed' && (
                        <>
                          {canCancelBooking(booking) ? (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleCancelBooking(booking._id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                            >
                              <X className="w-4 h-4" />
                              <span>Cancel</span>
                            </motion.button>
                          ) : (
                            <div className="bg-gray-500/20 text-gray-400 px-4 py-2 rounded-lg flex items-center space-x-2 cursor-not-allowed">
                              <X className="w-4 h-4" />
                              <span>Cannot Cancel</span>
                            </div>
                          )}
                        </>
                      )}
                      {booking.status === 'completed' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRateBooking(booking)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <Star className="w-4 h-4" />
                          <span>{booking.rating ? 'Update Rating' : 'Rate Experience'}</span>
                        </motion.button>
                      )}
                      {booking.status === 'completed' && booking.rating && (
                        <div className="flex items-center space-x-2 bg-yellow-500/20 text-yellow-400 px-3 py-2 rounded-lg">
                          <span className="text-sm font-medium">Rated:</span>
                          {renderStars(booking.rating)}
                        </div>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewDetails(booking)}
                        className="bg-teal-400 hover:bg-teal-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* Modern Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeDetailsModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Booking Details</h3>
                  <p className="text-sm text-gray-500">Complete booking information</p>
                </div>
              </div>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {/* Turf Image */}
              {selectedBooking.photos && selectedBooking.photos.length > 0 && selectedBooking.photos[0]?.photos ? (
                <div className="w-full h-48 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl overflow-hidden">
                  <img
                    src={selectedBooking.photos[0].photos}
                    alt={selectedBooking.turfName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('Modal image failed to load:', selectedBooking.photos?.[0]?.photos);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <Calendar className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-medium">{selectedBooking.turfName}</p>
                  </div>
                </div>
              )}

              {/* Booking Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Turf Name</p>
                      <p className="font-medium text-gray-900">{selectedBooking.turfName || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">{selectedBooking.location || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time Slot</p>
                      <p className="font-medium text-gray-900">{selectedBooking.timeSlot}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600 font-bold">₹</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      {selectedBooking.price > 0 ? (
                        <p className="font-medium text-gray-900">₹{selectedBooking.price}</p>
                      ) : (
                        <p className="font-medium text-gray-500">Price not set</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Play Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedBooking.bookingDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <span className="text-indigo-600 font-bold">👤</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Owner</p>
                      <p className="font-medium text-gray-900">{selectedBooking.ownerName || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                      <span className="text-teal-600 font-bold">📱</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Admin Mobile</p>
                      <p className="font-medium text-gray-900">{selectedBooking.ownerMobile || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        selectedBooking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                        selectedBooking.status === 'completed' ? 'bg-purple-100 text-purple-700' :
                        selectedBooking.status === 'canceled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {selectedBooking.status}
                      </div>
                    </div>
                  </div>



                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Booked On</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedBooking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeDetailsModal}
                className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modern Cancel Confirmation Modal */}
      {showCancelModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeCancelModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Cancel Booking</h3>
                <p className="text-sm text-gray-500">Are you sure you want to proceed?</p>
              </div>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                This action will cancel your booking and cannot be undone. You may need to book again if you change your mind.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-700 font-medium">This action is irreversible</span>
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-700 font-medium">
                    Cancellation is only allowed up to 5 minutes after the slot start time
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={closeCancelModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Keep Booking
              </button>
              <button
                onClick={confirmCancelBooking}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel Booking</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Rating Modal */}
      {showRatingModal && bookingToRate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeRatingModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl rating-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {bookingToRate.rating ? 'Update Your Rating' : 'Rate Your Experience'}
                </h3>
                <p className="text-sm text-gray-500">{bookingToRate.turfName}</p>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Rating Stars */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How would you rate your experience?
                </label>
                <div className="flex justify-center">
                  {renderStars(rating, true, setRating)}
                </div>
                <div className="text-center mt-2">
                  <span className="text-sm text-gray-500">
                    {rating === 0 && 'Select a rating'}
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share your experience (optional)
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Tell us about your experience at this turf..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                  rows={4}
                  maxLength={500}
                />
                <div className="text-right mt-1">
                  <span className="text-xs text-gray-500">{review.length}/500</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={closeRatingModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={submitRatingHandler}
                disabled={rating === 0 || submittingRating}
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
              >
                {submittingRating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4" />
                    <span>{bookingToRate.rating ? 'Update Rating' : 'Submit Rating'}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default BookingHistory;