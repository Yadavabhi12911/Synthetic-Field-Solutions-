import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Star, Search, Filter, X, Eye, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserBookingHistory, getAllTurfs } from '../api';
import { useNavigate } from 'react-router-dom';

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
    Promise.all([
      getUserBookingHistory(),
      getAllTurfs()
    ])
      .then(([bookingsRes, turfsRes]) => {
        // Sort bookings by createdAt date in descending order (newest first)
        const sortedBookings = (bookingsRes.data?.bookingHistory || []).sort((a: Booking, b: Booking) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setRecentBookings(sortedBookings);
        
        // Handle new API response structure with pagination
        const turfsData = turfsRes.data?.turfs || turfsRes.data || [];
        setRecommendedTurfs(Array.isArray(turfsData) ? turfsData : []);
      })
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-400'
            }`}
          />
        ))}
      </div>
    );
  };

  const handleViewBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowBookingDetailsModal(true);
  };

  const closeBookingDetailsModal = () => {
    setShowBookingDetailsModal(false);
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-white text-lg">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-400 text-lg">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col justify-center gap-3 items-center  ">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white pt-10 mt-5">
             <span className="text-teal-400">{user?.fullName}</span>
            </h1>
            <p className="text-gray-300 text-base sm:text-lg">Ready to book your next game?</p>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { label: 'Total Bookings', value: '12', icon: Calendar, color: 'from-teal-400 to-teal-600' },
            { label: 'Hours Played', value: '24', icon: Clock, color: 'from-blue-500 to-purple-600' },
            { label: 'Favorite Turfs', value: '3', icon: Star, color: 'from-purple-500 to-pink-600' },
            { label: 'Cities Visited', value: '2', icon: MapPin, color: 'from-orange-500 to-red-600' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-teal-400/50 transition-all duration-300"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-300 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Recent Bookings</h2>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <motion.div
                  key={booking._id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer"
                  onClick={() => handleViewBookingDetails(booking)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white">{booking.turfName}</h3>
                    {booking.price > 0 ? (
                      <span className="text-teal-400 font-bold">₹{booking.price}</span>
                    ) : (
                      <span className="text-gray-400 text-sm">Price not set</span>
                    )}
                  </div>
                  <div className="flex items-center text-gray-300 text-sm mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{booking.date}</span>
                    <Clock className="w-4 h-4 ml-4 mr-2" />
                    <span>{booking.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' 
                        ? 'bg-teal-500/20 text-teal-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {booking.status}
                    </span>
                    <Eye className="w-4 h-4 text-gray-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recommended Turfs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Recommended for You</h2>
              <button 
                onClick={() => navigate('/turfs')}
                className="text-emerald-400 hover:text-emerald-300 text-sm"
              >
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {Array.isArray(recommendedTurfs) && recommendedTurfs.length > 0 ? (
                recommendedTurfs.map((turf) => (
                <motion.div
                  key={turf._id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-teal-400/30 transition-all duration-300"
                >
                  <div className="flex space-x-4">
                    <img 
                      src={turf.photos && turf.photos.length > 0 ? turf.photos[0].photos : '/default-turf.jpg'} 
                      alt={turf.description}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{turf.owner?.companyName || 'Turf'}</h3>
                      <div className="flex items-center text-gray-300 text-sm mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{turf.address}</span>
                        {turf.averageRating > 0 && (
                          <>
                            <div className="ml-4 flex items-center space-x-1">
                              {renderStars(turf.averageRating)}
                              <span className="ml-1">{turf.averageRating.toFixed(1)}</span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-teal-400 font-semibold">₹{turf.price}/hour</span>
                        <button 
                          onClick={() => navigate(`/turf/${turf._id}`)}
                          className="bg-teal-400 hover:bg-teal-500 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>No recommended turfs available</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              onClick={() => navigate('/turfs')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
                              className="bg-gradient-to-r from-teal-400 to-teal-600 hover:from-teal-500 hover:to-teal-700 text-white p-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Search className="w-5 h-5" />
              <span>Find Turfs</span>
            </motion.button>
            
            <motion.button
              onClick={() => navigate('/bookings')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
                              className="bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white p-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Calendar className="w-5 h-5" />
              <span>My Bookings</span>
            </motion.button>
            
            <motion.button
              onClick={() => navigate('/preferences')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
                              className="bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-700 hover:to-teal-900 text-white p-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Filter className="w-5 h-5" />
              <span>Preferences</span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Booking Details Modal */}
      {showBookingDetailsModal && selectedBooking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeBookingDetailsModal}
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
                onClick={closeBookingDetailsModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {/* Turf Image Placeholder */}
              <div className="w-full h-48 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center">
                <div className="text-center text-white">
                  <Calendar className="w-12 h-12 mx-auto mb-3" />
                  <p className="font-medium">{selectedBooking.turfName}</p>
                </div>
              </div>

              {/* Booking Info Grid - 4 rows × 2 columns */}
              <div className="grid grid-cols-2 gap-4">
                {/* Row 1 */}
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
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time Slot</p>
                    <p className="font-medium text-gray-900">{selectedBooking.time || selectedBooking.timeSlot || 'N/A'}</p>
                  </div>
                </div>

                {/* Row 2 */}
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

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Play Date</p>
                    <p className="font-medium text-gray-900">
                      {selectedBooking.date || (selectedBooking.bookingDate ? new Date(selectedBooking.bookingDate).toLocaleDateString() : 'N/A')}
                    </p>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                    <span className="text-teal-600 font-bold">📱</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Your Mobile</p>
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

                {/* Row 4 - Empty cells for consistent layout */}
                <div></div>
                <div></div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default UserDashboard;