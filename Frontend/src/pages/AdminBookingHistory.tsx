import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Filter, Search, CheckCircle, XCircle, AlertCircle, Eye, X, Star, ArrowLeft } from 'lucide-react';
import { getAdminBookingHistory, cancelBooking } from '../api';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getAdminBookingHistory()
      .then(response => {
        console.log('Admin booking history response:', response);
        setBookings(response.data?.bookingHistory || []);
      })
      .catch(err => {
        console.error('Error loading admin bookings:', err);
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

  const renderStars = (currentRating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= currentRating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-400'
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status === filter;
    const matchesSearch = (booking.turfName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (booking.location?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (booking.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white p-4 sm:p-6 md:p-10 m-2 sm:m-3 md:m-5">
                Booking <span className="text-teal-400">History</span>
              </h1>
            </div>
          </div>
          <p className="text-gray-300 text-base sm:text-lg">Manage and monitor all field bookings</p>
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
              placeholder="Search bookings by field, location, or user..."
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
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
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
                        {booking.userName && (
                          <div className="text-gray-300 text-sm">
                            Booked by: <span className="text-teal-400">{booking.userName}</span>
                          </div>
                        )}
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
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCancelBooking(booking._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
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

      {/* Booking Details Modal */}
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
                      <p className="text-sm text-gray-500">Field Name</p>
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
                      <p className="text-sm text-gray-500">User</p>
                      <p className="font-medium text-gray-900">{selectedBooking.userName || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                      <span className="text-teal-600 font-bold">📱</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mobile Number</p>
                      <p className="font-medium text-gray-900">{selectedBooking.userMobile || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        selectedBooking.status === 'confirmed' ? 'bg-teal-100 text-teal-700' :
                        selectedBooking.status === 'completed' ? 'bg-purple-100 text-purple-700' :
                        selectedBooking.status === 'canceled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {selectedBooking.status}
                      </div>
                    </div>
                  </div>

                  {selectedBooking.status === 'completed' && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Star className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Rating</p>
                        {selectedBooking.rating ? (
                          <div className="flex items-center space-x-2">
                            {renderStars(selectedBooking.rating)}
                            <span className="text-sm text-gray-600">({selectedBooking.rating}/5)</span>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">Not rated yet</p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedBooking.status === 'completed' && selectedBooking.review && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-1">
                        <span className="text-blue-600 text-xs">💬</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Review</p>
                        <p className="text-sm text-gray-700 mt-1">{selectedBooking.review}</p>
                      </div>
                    </div>
                  )}

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
                className="px-6 py-2 bg-teal-400 text-white rounded-lg hover:bg-teal-500 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Cancel Confirmation Modal */}
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
                This action will cancel the booking and cannot be undone. The user will be notified of the cancellation.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-700 font-medium">This action is irreversible</span>
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
    </div>
  );
};

export default AdminBookingHistory; 