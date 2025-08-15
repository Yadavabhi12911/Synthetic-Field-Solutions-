import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, CreditCard, Star } from 'lucide-react';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';
import { bookTurf } from '../api';

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

interface BookingModalProps {
  turf: Turf;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ turf, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if selected date is today
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  console.log('Date comparison:', {
    selectedDate: format(selectedDate, 'yyyy-MM-dd'),
    today: format(new Date(), 'yyyy-MM-dd'),
    isToday,
    selectedDateObj: selectedDate,
    currentDateObj: new Date()
  });

  // Helper function to check if a time slot is available for booking today
  const isSlotAvailableToday = (timeSlot: string) => {
    if (!isToday) return true; // All slots available for future dates
    
    console.log('Checking slot availability for:', timeSlot, 'isToday:', isToday);
    
    // Parse time slot (assuming format like "6:00 AM - 7:00 AM" or "6 AM - 7 AM")
    // Try different regex patterns to handle various formats
    let timeMatch = timeSlot.match(/(\d+)(?::(\d+))?\s*(AM|PM)/i);
    let hour, minute, ampm;
    
    if (!timeMatch) {
      // Try alternative format: "6:00-7:00" or "6-7"
      timeMatch = timeSlot.match(/(\d+)(?::(\d+))?/);
      if (timeMatch) {
        console.log('Using alternative time format for:', timeSlot);
        // Assume it's in 24-hour format or default to AM
        hour = parseInt(timeMatch[1], 10);
        minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
        
        // If hour is 12 or less, assume AM, otherwise assume PM
        ampm = hour <= 12 ? 'AM' : 'PM';
        if (hour > 12) hour -= 12;
        
        console.log('Alternative parsing:', { hour, minute, ampm });
      } else {
        console.log('No time match found for:', timeSlot);
        return true;
      }
    } else {
      hour = parseInt(timeMatch[1], 10);
      minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      ampm = timeMatch[3] ? timeMatch[3].toUpperCase() : 'AM';
    }
    
    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    
    const slotStartTime = new Date();
    slotStartTime.setHours(hour, minute, 0, 0);
    const now = new Date();
    
    console.log('Time comparison:', {
      timeSlot,
      parsedHour: hour,
      parsedMinute: minute,
      ampm,
      slotStartTime: slotStartTime.toLocaleTimeString(),
      currentTime: now.toLocaleTimeString(),
      isPassed: now > slotStartTime,
      slotStartTimeMs: slotStartTime.getTime(),
      nowMs: now.getTime(),
      difference: now.getTime() - slotStartTime.getTime()
    });
    
    // If slot time has already passed, it's not available
    if (now > slotStartTime) {
      console.log('Slot has passed:', timeSlot);
      return false;
    }
    
    // Allow booking if slot starts in the next 30 minutes or later
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    const isAvailable = slotStartTime >= thirtyMinutesFromNow;
    
    console.log('Final availability for', timeSlot, ':', isAvailable);
    return isAvailable;
  };

  // Helper function to get slot status message
  const getSlotStatusMessage = (timeSlot: string) => {
    if (!isToday) return null;
    
    // Use the same parsing logic as isSlotAvailableToday
    let timeMatch = timeSlot.match(/(\d+)(?::(\d+))?\s*(AM|PM)/i);
    let hour, minute, ampm;
    
    if (!timeMatch) {
      timeMatch = timeSlot.match(/(\d+)(?::(\d+))?/);
      if (timeMatch) {
        hour = parseInt(timeMatch[1], 10);
        minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
        ampm = hour <= 12 ? 'AM' : 'PM';
        if (hour > 12) hour -= 12;
      } else {
        return null;
      }
    } else {
      hour = parseInt(timeMatch[1], 10);
      minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      ampm = timeMatch[3] ? timeMatch[3].toUpperCase() : 'AM';
    }
    
    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    
    const slotStartTime = new Date();
    slotStartTime.setHours(hour, minute, 0, 0);
    const now = new Date();
    
    // If slot time has already passed
    if (now > slotStartTime) {
      return 'Time Passed';
    }
    
    // If slot starts too soon (less than 30 minutes)
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    if (slotStartTime < thirtyMinutesFromNow) {
      return 'Too Soon';
    }
    
    return null; // Available
  };

  // Check if any slots are available for today
  const hasAvailableSlotsToday = turf.turfTiming?.some(slot => 
    slot.status && isSlotAvailableToday(slot.time)
  ) || false;

  // Auto-select next available date if no slots available for today
  React.useEffect(() => {
    if (isToday && !hasAvailableSlotsToday) {
      const tomorrow = addDays(new Date(), 1);
      setSelectedDate(tomorrow);
    }
  }, [isToday, hasAvailableSlotsToday]);

  // Current time display
  const [currentTime, setCurrentTime] = useState(new Date());
  
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Force re-render when current time changes to update slot availability
  React.useEffect(() => {
    // This will trigger re-render when currentTime changes
  }, [currentTime]);

  console.log('BookingModal turf data:', turf);
  console.log('Turf timing:', turf?.turfTiming);
  console.log('Sample time slot format:', turf?.turfTiming?.[0]?.time);
  console.log('Current time:', new Date().toLocaleTimeString());
  console.log('Is today:', isToday);
  
  // Test time validation with sample times
  if (turf?.turfTiming?.length > 0) {
    console.log('Testing time validation:');
    turf.turfTiming.slice(0, 3).forEach(slot => {
      console.log(`Slot: ${slot.time}, Available: ${isSlotAvailableToday(slot.time)}`);
    });
  }

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

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

  const handleBooking = async () => {
    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }

    // Additional frontend validation for current day bookings
    if (isToday) {
      const timeMatch = selectedSlot.match(/(\d+)(?::(\d+))?\s*(AM|PM)/i);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1], 10);
        const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
        const ampm = timeMatch[3].toUpperCase();
        
        if (ampm === 'PM' && hour !== 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;
        
        const slotStartTime = new Date();
        slotStartTime.setHours(hour, minute, 0, 0);
        const now = new Date();
        
        // If slot time has already passed
        if (now > slotStartTime) {
          const currentTime = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });
          const slotTime = slotStartTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });
          toast.error(`Cannot book slot at ${slotTime} as current time is ${currentTime}. Please book a future time slot.`, {
            duration: 5000,
            icon: '⏰',
          });
          setSelectedDate(addDays(new Date(), 1));
          return;
        }
        
        // If slot starts too soon (less than 30 minutes)
        const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
        if (slotStartTime < thirtyMinutesFromNow) {
          toast.error('This time slot starts too soon. Please book a slot that starts at least 30 minutes from now.', {
            duration: 5000,
            icon: '⏰',
          });
          setSelectedDate(addDays(new Date(), 1));
          return;
        }
      }
    }

    console.log('Attempting to book:', {
      turfId: turf._id,
      bookingDate: format(selectedDate, 'yyyy-MM-dd'),
      timeSlot: selectedSlot,
      isToday: isToday
    });

    setIsLoading(true);

    try {
      await bookTurf(turf._id, {
        bookingDate: format(selectedDate, 'yyyy-MM-dd'),
        timeSlot: selectedSlot
      });
      toast.success('Booking confirmed successfully!');
      onClose();
    } catch (error) {
      console.error('Booking error:', error);
      console.error('Error message:', error.message);
      console.error('Error type:', typeof error.message);
      
      let errorMessage = 'Booking failed. Please try again.';
      
      try {
        // The error message might be a JSON string or plain text
        if (error.message) {
          let errorData;
          try {
            // Try to parse as JSON first
            errorData = JSON.parse(error.message);
            console.log('Parsed error data:', errorData);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (parseError) {
            console.log('Error message is not JSON, using as plain text');
            // If not JSON, use the message as is
            errorMessage = error.message;
          }
          
          console.log('Final error message:', errorMessage);
          
          // Check for specific error patterns
          if (errorMessage.includes('time slot has passed') || 
              errorMessage.includes('next available slot') ||
              errorMessage.includes('Cannot book slot at') ||
              errorMessage.includes('starts too soon') ||
              errorMessage.includes('future time slot')) {
            
            // Show the specific error message
            toast.error(errorMessage, {
              duration: 5000,
              icon: '⏰',
            });
            
            // Auto-select tomorrow's date
            setSelectedDate(addDays(new Date(), 1));
            return;
          }
          
          // If it's a generic booking error, show a helpful message
          if (errorMessage.includes('already booked') || 
              errorMessage.includes('slot is already')) {
            toast.error('This slot is already booked. Please select another time slot.', {
              duration: 4000,
            });
            return;
          }
        }
      } catch (e) {
        console.error('Error parsing error message:', e);
        errorMessage = 'Booking failed. Please try again.';
      }
      
      // If we still have a generic error message, check if it's a time-related issue
      if (errorMessage === 'Booking failed. Please try again.' && isToday) {
        toast.error('This time slot is not available. Please select a future time slot or book for another day.', {
          duration: 5000,
          icon: '⏰',
        });
        // Auto-select tomorrow's date
        setSelectedDate(addDays(new Date(), 1));
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-zinc-800/90 backdrop-blur-lg rounded-2xl p-6 border border-teal-400/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Book {turf.owner?.companyName || 'Turf'}</h2>
            {turf.averageRating > 0 && (
              <div className="flex items-center space-x-2 mt-1">
                {renderStars(turf.averageRating)}
                <span className="text-white font-semibold">{turf.averageRating.toFixed(1)}</span>
                <span className="text-gray-300 text-sm">({turf.totalRatings} reviews)</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-700/50 rounded-xl text-gray-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date Selection */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Select Date
            </h3>
            {isToday && (
              <div className="text-sm text-gray-300 bg-zinc-700/50 px-3 py-1 rounded-lg">
                Current Time: {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false 
                })}
              </div>
            )}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {dates.map((date, index) => {
              const isSelected = format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
              const isTodayDate = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              const hasNoSlotsToday = isTodayDate && !hasAvailableSlotsToday;
              
              return (
                <motion.button
                  key={index}
                  whileHover={!hasNoSlotsToday ? { scale: 1.05 } : {}}
                  whileTap={!hasNoSlotsToday ? { scale: 0.95 } : {}}
                  onClick={() => !hasNoSlotsToday && setSelectedDate(date)}
                  disabled={hasNoSlotsToday}
                  className={`p-3 rounded-xl border transition-all duration-300 ${
                    hasNoSlotsToday
                      ? 'bg-red-500/20 border-red-500/30 text-red-400 cursor-not-allowed'
                      : isSelected
                      ? 'bg-teal-400 border-teal-400 text-white'
                      : 'bg-zinc-700/50 border-gray-600 text-gray-300 hover:border-teal-400'
                  }`}
                >
                  <div className="text-xs">{format(date, 'EEE')}</div>
                  <div className="font-semibold">{format(date, 'd')}</div>
                  {hasNoSlotsToday && (
                    <div className="text-xs mt-1 text-red-400">No Slots</div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Time Slot Selection */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Select Time Slot
            </h3>
            {isToday && (
              <div className="text-xs text-gray-400">
                Available slots: {turf.turfTiming?.filter(slot => 
                  slot.status && isSlotAvailableToday(slot.time)
                ).length || 0} / {turf.turfTiming?.length || 0}
              </div>
            )}
            <button
              onClick={() => {
                console.log('=== DEBUG TEST ===');
                console.log('Current time:', new Date().toLocaleTimeString());
                console.log('Is today:', isToday);
                turf.turfTiming?.forEach(slot => {
                  console.log(`Slot: ${slot.time}, Available: ${isSlotAvailableToday(slot.time)}`);
                });
              }}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Debug
            </button>
          </div>
          
          {/* Show message when no slots available for today */}
          {isToday && !hasAvailableSlotsToday && (
            <div className="mb-4 p-4 bg-orange-500/20 border border-orange-500/30 rounded-xl">
              <div className="flex items-center space-x-2 text-orange-300">
                <Clock className="w-5 h-5" />
                <span className="font-medium">No slots available for today</span>
              </div>
              <p className="text-orange-200 text-sm mt-2">
                All time slots for today have passed. Please select tomorrow or another date to book your slot.
              </p>
              <button
                onClick={() => setSelectedDate(addDays(new Date(), 1))}
                className="mt-3 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Book for Tomorrow
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            {turf.turfTiming && turf.turfTiming.length > 0 ? (
              turf.turfTiming.map((slot, index) => {
                const isAvailable = slot.status && isSlotAvailableToday(slot.time);
                console.log('Slot rendering:', {
                  time: slot.time,
                  status: slot.status,
                  isAvailable,
                  isToday
                });
                return (
                  <motion.button
                    key={index}
                    whileHover={isAvailable ? { scale: 1.02 } : {}}
                    whileTap={isAvailable ? { scale: 0.98 } : {}}
                    onClick={() => isAvailable && setSelectedSlot(slot.time)}
                    disabled={!isAvailable}
                    className={`p-3 rounded-xl border transition-all duration-300 ${
                      !isAvailable
                        ? 'bg-zinc-800/50 border-gray-700 text-gray-500 cursor-not-allowed'
                        : selectedSlot === slot.time
                        ? 'bg-teal-400 border-teal-400 text-white'
                        : 'bg-zinc-700/50 border-gray-600 text-gray-300 hover:border-teal-400'
                    }`}
                  >
                    <div className="font-medium">{slot.time}</div>
                    <div className="text-sm opacity-80">₹{turf.price}</div>
                    {!isAvailable && isToday && (
                      <div className="text-xs mt-1 text-red-400">
                        {!slot.status ? 'Not Available' : getSlotStatusMessage(slot.time)}
                      </div>
                    )}
                  </motion.button>
                );
              })
            ) : (
              <div className="col-span-2 text-center py-4 text-gray-400">
                No time slots available
              </div>
            )}
          </div>
        </div>

        {/* Booking Summary */}
        {selectedSlot && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-700/50 rounded-xl p-4 border border-teal-400/20 mb-6"
          >
            <h4 className="font-semibold text-white mb-3">Booking Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Turf:</span>
                <span className="text-white">{turf.owner?.companyName || 'Turf'}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Date:</span>
                <span className="text-white">{format(selectedDate, 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Time:</span>
                <span className="text-white">{selectedSlot}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Duration:</span>
                <span className="text-white">1 hour</span>
              </div>
              <hr className="border-gray-600 my-2" />
              <div className="flex justify-between font-semibold">
                <span className="text-white">Total Amount:</span>
                <span className="text-teal-400 text-lg">
                  ₹{turf.price}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Payment Method */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Method
          </h3>
          <div className="space-y-3">
            {['Credit/Debit Card', 'UPI', 'Net Banking', 'Pay at Venue'].map((method, index) => (
              <label key={index} className="flex items-center space-x-3 p-3 bg-zinc-700/50 rounded-xl border border-gray-600 hover:border-teal-400 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value={method}
                  className="text-teal-400 focus:ring-teal-400"
                  defaultChecked={index === 0}
                />
                <span className="text-white">{method}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-zinc-700/50 transition-colors"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBooking}
            disabled={isLoading || !selectedSlot}
            className="px-6 py-3 bg-gradient-to-r from-teal-400 to-teal-600 hover:from-teal-500 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              'Confirm Booking'
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BookingModal;