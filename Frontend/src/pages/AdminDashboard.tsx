import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Settings, BarChart3, Users, Calendar, MapPin, Edit, Trash2, Star, X, Eye, CheckCircle, Clock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CreateTurfModal from '../components/CreateTurfModal';
import { getAdminTurfs, getAdminBookingHistory, toggleTurfSlotStatus, deleteTurf, updateTurf } from '../api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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
  const [stats, setStats] = useState<Stat[]>([]);
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
        // Optionally, calculate stats here or fetch from a stats endpoint
        setStats([/* fill with calculated or fetched stats */]);
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

  return (
    <div className="min-h-screen pt-20 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mt-10 p-2">
            <div className="flex flex-col items-center justify-center gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                   <span 
                    className="text-teal-400 hover:text-teal-300 cursor-pointer transition-colors duration-300  inline-flex items-center group ml-2"
                    onClick={() => navigate('/admin/settings?tab=profile')}
                    title="Click to view profile & settings"
                  >
                    {user?.companyName}
                   
                  </span>
                </h1>
                
              </div>
              <p className="text-gray-300 text-base sm:text-lg">Manage your turfs and bookings</p>
         
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-teal-400 to-teal-600 hover:from-teal-500 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 shadow-2xl"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Field</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {stats.length > 0 ? (
            stats.map((stat, index) => (
              <motion.div
                key={`stat-${index}`}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-teal-400/50 transition-all duration-300"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                              <div className="text-xl sm:text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-300 text-sm">{stat.label}</div>
            </motion.div>
          ))
        ) : (
          // Placeholder stats when no data is available
          [
            { icon: MapPin, color: 'from-blue-500 to-purple-600', value: turfs.length, label: 'Total Fields' },
            { icon: Calendar, color: 'from-emerald-500 to-teal-600', value: recentBookings.length, label: 'Recent Bookings' },
            { icon: Star, color: 'from-yellow-500 to-orange-600', value: '4.5', label: 'Avg Rating' },
            { icon: Users, color: 'from-purple-500 to-pink-600', value: '0', label: 'Active Users' }
          ].map((stat, index) => (
            <motion.div
              key={`placeholder-stat-${index}`}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-teal-400/50 transition-all duration-300"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-300 text-sm">{stat.label}</div>
              </motion.div>
            ))
          )}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Your Turfs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Your Fields</h2>
              <button className="text-teal-400 hover:text-teal-300 text-sm" onClick={() => setShowAvailableOnly(v => !v)}>
                {showAvailableOnly ? 'Show All Slots' : 'Show Only Available Slots'}
              </button>
            </div>
            
            <div className="space-y-4">
              {turfs.map((turf) => (
                <motion.div
                  key={turf._id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-teal-400/30 transition-all duration-300"
                >
                  <div className="flex space-x-4">
                    <div className="flex space-x-2">
                      {Array.isArray(turf.photos) && turf.photos.length > 0
                        ? turf.photos.map((photo, idx) => (
                            <img
                              key={`${turf._id}-photo-${idx}`}
                              src={photo.photos}
                              alt={turf.description}
                              className="w-16 h-16 rounded-lg object-cover border border-white/20 cursor-pointer"
                              onClick={() => setLightboxImg(photo.photos)}
                            />
                          ))
                        : (
                            <img
                              key={`${turf._id}-placeholder`}
                              src="/placeholder-turf.jpg"
                              alt={turf.description}
                              className="w-16 h-16 rounded-lg object-cover border border-white/20"
                            />
                          )
                      }
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-white">{turf.description}</h3>
                        <div className="flex space-x-2">
                          <button
                            className="p-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                            onClick={() => handleEditTurf(turf._id)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                            onClick={() => handleDeleteTurf(turf._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-300 text-sm mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{turf.address}</span>
                      </div>
                      {turf.averageRating > 0 && (
                        <div className="flex items-center space-x-2 mb-2">
                          {renderStars(turf.averageRating)}
                          <span className="text-sm text-gray-300">
                            {turf.averageRating.toFixed(1)} ({turf.totalRatings} reviews)
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-teal-400 font-semibold pr-1 mr-2">{turf.price}</span>
                        {/* Time slots */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Array.isArray(turf.turfTiming) && turf.turfTiming.length > 0
                            ? turf.turfTiming
                                .filter(slot => !showAvailableOnly || slot.status)
                                .map((slot, idx) => (
                                  <span
                                    key={`${turf._id}-slot-${slot.time}`}
                                    className={`px-2 py-1 rounded text-xs font-medium cursor-pointer ${
                                      slot.status
                                        ? 'bg-teal-500/20 text-teal-400'
                                        : 'bg-gray-500/20 text-gray-400'
                                    }`}
                                    title={slot.status ? 'Available (Click to mark unavailable)' : 'Unavailable (Click to mark available)'}
                                    onClick={() => handleConfirmToggle(turf._id, slot.time, slot.status)}
                                  >
                                    {slot.time}
                                  </span>
                                ))
                            : <span key={`${turf._id}-no-slots`} className="text-gray-400 text-xs">No slots</span>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Recent Bookings</h2>
              <button 
                onClick={() => navigate('/admin/bookings')}
                className="text-teal-400 hover:text-teal-300 text-sm hover:underline transition-colors"
              >
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-teal-400/30 transition-all duration-300 cursor-pointer"
                  onClick={() => handleViewBookingDetails(booking)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-white">{booking.userName}</h3>
                      <p className="text-gray-300 text-sm">{booking.turfName}</p>
                    </div>
                    {booking.amount && booking.amount !== '₹0' ? (
                      <span className="text-teal-400 font-bold">{booking.amount}</span>
                    ) : (
                      <span className="text-gray-400 text-sm">Price not set</span>
                    )}
                  </div>
                  <div className="flex items-center text-gray-300 text-sm mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{booking.date} • {booking.time}</span>
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
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-teal-400 to-teal-600 hover:from-teal-500 hover:to-teal-700 text-white p-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-5 h-5" />
              <span>Add Turf</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white p-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
              onClick={() => navigate('/admin/analytics')}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Analytics</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-700 hover:to-teal-900 text-white p-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
              onClick={() => navigate('/admin/users')}
            >
              <Users className="w-5 h-5" />
              <span>Users</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-teal-700 to-teal-900 hover:from-teal-800 hover:to-teal-950 text-white p-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
              onClick={() => navigate('/admin/settings')}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </motion.button>
          </div>
        </motion.div>
      </div>

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

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-zinc-800 rounded-xl p-8 shadow-2xl border border-teal-400/30 min-w-[300px]">
            <h2 className="text-xl font-bold text-white mb-4">Confirm Slot Status Change</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to mark <span className="font-semibold text-teal-400">{confirmDialog.time}</span> as {confirmDialog.status ? <span className="text-red-400">unavailable</span> : <span className="text-teal-400">available</span>}?
            </p>
            <div className="flex justify-end gap-4">
              <button onClick={handleConfirmDialogNo} className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700">Cancel</button>
              <button onClick={handleConfirmDialogYes} className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700">Yes</button>
            </div>
          </div>
        </div>
      )}

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
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold">👤</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">User Name</p>
                    <p className="font-medium text-gray-900">{selectedBooking.userName || 'N/A'}</p>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-indigo-600 font-bold">📧</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">User Email</p>
                    <p className="font-medium text-gray-900">{selectedBooking.userEmail || 'N/A'}</p>
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

                {/* Row 3 */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time Slot</p>
                    <p className="font-medium text-gray-900">{selectedBooking.time || selectedBooking.timeSlot || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 font-bold">₹</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-medium text-gray-900">{selectedBooking.amount || (selectedBooking.price ? `₹${selectedBooking.price}` : 'N/A')}</p>
                  </div>
                </div>

                {/* Row 4 */}
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
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;