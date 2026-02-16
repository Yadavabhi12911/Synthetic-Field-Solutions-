import cron from 'node-cron';
import axios from 'axios';
import { Booking } from '../models/booking.models.js';
import { Turf } from '../models/turf.model.js';

// Function to parse time slot and calculate end time
const parseTimeSlot = (timeSlot) => {
  // Assuming timeSlot format is like "6:00 AM - 7:00 AM" or "6 AM - 7 AM"
  const timeMatch = timeSlot.match(/(\d+)(?::(\d+))?\s*(AM|PM)/i);
  if (!timeMatch) return null;
  
  let hour = parseInt(timeMatch[1], 10);
  const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
  const ampm = timeMatch[3].toUpperCase();
  
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  
  return { hour, minute };
};

// Function to check if a booking time has expired
const isBookingExpired = (booking) => {
  const now = new Date();
  const bookingDate = new Date(booking.bookingDate);
  
  // If booking date is in the past, it's expired
  if (bookingDate < now) return true;
  
  // If booking date is today, check the time slot
  if (bookingDate.toDateString() === now.toDateString()) {
    const timeInfo = parseTimeSlot(booking.timeSlot);
    if (!timeInfo) return false; // Can't parse time, assume not expired
    
    const bookingEndTime = new Date(bookingDate);
    bookingEndTime.setHours(timeInfo.hour + 1, timeInfo.minute, 0, 0); // Add 1 hour for slot duration
    
    return now >= bookingEndTime;
  }
  
  return false;
};

// Function to automatically complete expired bookings
const completeExpiredBookings = async () => {
  try {
    console.log('Running automatic booking completion check...');
    
    // Find all confirmed bookings
    const confirmedBookings = await Booking.find({ status: 'confirmed' });
    
    let completedCount = 0;
    
    for (const booking of confirmedBookings) {
      if (isBookingExpired(booking)) {
        console.log(`Completing expired booking: ${booking._id}`);
        
        // Update status without running document validators (bookingDate validator would fail for past dates)
        await Booking.updateOne({ _id: booking._id }, { $set: { status: 'completed' } });
        
        completedCount++;
      }
    }
    
    if (completedCount > 0) {
      console.log(`Automatically completed ${completedCount} expired bookings`);
    } else {
      console.log('No expired bookings found');
    }
    
  } catch (error) {
    console.error('Error in automatic booking completion:', error);
  }
};

// Initialize cron jobs
const initializeCronJobs = () => {
  // Run every 5 minutes to check for expired bookings
  cron.schedule('*/5 * * * *', completeExpiredBookings, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Adjust timezone as needed
  });
  
  // Health check: ping configured URL every 5 minutes to keep instances warm
  const performHealthCheck = async () => {
    try {
      const url = process.env.HEALTH_CHECK_URL || `http://localhost:${process.env.PORT || 8000}/`;
      const res = await axios.get(url, { timeout: 5000 });
      console.log(`Health check success for ${url} - status: ${res.status}`);
    } catch (err) {
      console.error('Health check failed:', err.message || err);
    }
  };

  // Run health check immediately, then every 5 minutes
  performHealthCheck();
  cron.schedule('*/5 * * * *', performHealthCheck, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  console.log('Cron jobs initialized - checking for expired bookings every 5 minutes');
};

export { initializeCronJobs, completeExpiredBookings }; 