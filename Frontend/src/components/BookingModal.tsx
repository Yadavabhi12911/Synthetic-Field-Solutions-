import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Star } from 'lucide-react';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { bookTurf } from '../api';
import {
  getSlotStatusMessage,
  hasAvailableSlotsToday,
  isSlotAvailableToday,
} from '../utils/bookingUi';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { cn } from '../lib/cn';

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
  initialSlot?: string;
  initialDate?: Date;
}

const BookingModal: React.FC<BookingModalProps> = ({
  turf,
  onClose,
  initialSlot = '',
  initialDate,
}) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(initialDate ?? new Date());
  const [selectedSlot, setSelectedSlot] = useState(initialSlot);
  const [isLoading, setIsLoading] = useState(false);

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const hasOpenSlotsToday = hasAvailableSlotsToday(turf.turfTiming);

  useEffect(() => {
    if (initialSlot) setSelectedSlot(initialSlot);
  }, [initialSlot]);

  useEffect(() => {
    if (initialDate) setSelectedDate(initialDate);
  }, [initialDate]);

  useEffect(() => {
    if (isToday && !hasOpenSlotsToday) {
      setSelectedDate(addDays(new Date(), 1));
    }
  }, [isToday, hasOpenSlotsToday]);

  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  const renderStars = (rating: number) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'h-4 w-4',
            star <= rating ? 'fill-warning text-warning' : 'text-muted'
          )}
        />
      ))}
    </div>
  );

  const handleBooking = async () => {
    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }

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

        if (now > slotStartTime) {
          toast.error('This time slot has already passed. Please choose another slot or date.', {
            duration: 5000,
          });
          setSelectedDate(addDays(new Date(), 1));
          return;
        }

        const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
        if (slotStartTime < thirtyMinutesFromNow) {
          toast.error('This slot starts too soon. Pick a slot at least 30 minutes from now.', {
            duration: 5000,
          });
          return;
        }
      }
    }

    setIsLoading(true);

    try {
      await bookTurf(turf._id, {
        bookingDate: format(selectedDate, 'yyyy-MM-dd'),
        timeSlot: selectedSlot,
      });

      toast.success('Booking confirmed. Pay at the venue when you arrive.');
      onClose();
      navigate('/bookings');
    } catch (error: unknown) {
      let errorMessage = 'Booking failed. Please try again.';

      if (error instanceof Error && error.message) {
        try {
          const errorData = JSON.parse(error.message);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = error.message;
        }

        if (
          errorMessage.includes('time slot has passed') ||
          errorMessage.includes('starts too soon') ||
          errorMessage.includes('future time slot')
        ) {
          toast.error(errorMessage, { duration: 5000 });
          setSelectedDate(addDays(new Date(), 1));
          return;
        }

        if (errorMessage.includes('already booked')) {
          toast.error('This slot is already booked. Please choose another time.');
          return;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Book ${turf.owner?.companyName || 'Field'}`}
      description={
        turf.averageRating > 0
          ? `${turf.averageRating.toFixed(1)} · ${turf.totalRatings} reviews`
          : undefined
      }
      size="xl"
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleBooking}
            disabled={isLoading || !selectedSlot}
            loading={isLoading}
          >
            Confirm booking
          </Button>
        </div>
      }
    >
      {turf.averageRating > 0 && (
        <div className="mb-6 flex items-center gap-2">{renderStars(turf.averageRating)}</div>
      )}

      <div className="mb-6">
        <h3 className="mb-4 flex items-center text-sm font-semibold text-foreground">
          <Calendar className="mr-2 h-4 w-4 text-primary" />
          Select date
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {dates.map((date, index) => {
            const isSelected =
              format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
            const isTodayDate = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            const hasNoSlotsToday = isTodayDate && !hasOpenSlotsToday;

            return (
              <button
                key={index}
                type="button"
                onClick={() => !hasNoSlotsToday && setSelectedDate(date)}
                disabled={hasNoSlotsToday}
                className={cn(
                  'rounded-md border p-2 text-center text-sm transition-colors',
                  hasNoSlotsToday &&
                    'cursor-not-allowed border-danger/30 bg-danger/10 text-danger',
                  !hasNoSlotsToday &&
                    isSelected &&
                    'border-primary bg-primary text-white',
                  !hasNoSlotsToday &&
                    !isSelected &&
                    'border-border bg-surface-muted text-foreground hover:border-primary'
                )}
              >
                <div className="text-xs">{format(date, 'EEE')}</div>
                <div className="font-semibold">{format(date, 'd')}</div>
                {hasNoSlotsToday && <div className="mt-1 text-xs">No slots</div>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center text-sm font-semibold text-foreground">
            <Clock className="mr-2 h-4 w-4 text-primary" />
            Select time slot
          </h3>
          {isToday && (
            <span className="text-xs text-muted">
              Available:{' '}
              {turf.turfTiming?.filter((slot) => slot.status && isSlotAvailableToday(slot.time))
                .length || 0}{' '}
              / {turf.turfTiming?.length || 0}
            </span>
          )}
        </div>

        {isToday && !hasOpenSlotsToday && (
          <div className="mb-4 rounded-md border border-warning/30 bg-warning/10 p-4">
            <div className="flex items-center gap-2 text-warning">
              <Clock className="h-5 w-5" />
              <span className="font-medium">No slots available for today</span>
            </div>
            <p className="mt-2 text-sm text-muted">
              All time slots for today have passed. Select tomorrow or another date.
            </p>
            <Button
              type="button"
              size="sm"
              className="mt-3"
              onClick={() => setSelectedDate(addDays(new Date(), 1))}
            >
              Book for tomorrow
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {turf.turfTiming && turf.turfTiming.length > 0 ? (
            turf.turfTiming.map((slot, index) => {
              const isAvailable = slot.status && isSlotAvailableToday(slot.time);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => isAvailable && setSelectedSlot(slot.time)}
                  disabled={!isAvailable}
                  className={cn(
                    'rounded-md border p-3 text-left text-sm transition-colors',
                    !isAvailable &&
                      'cursor-not-allowed border-border bg-surface text-muted opacity-50',
                    isAvailable &&
                      selectedSlot === slot.time &&
                      'border-primary bg-primary text-white',
                    isAvailable &&
                      selectedSlot !== slot.time &&
                      'border-border bg-surface-muted text-foreground hover:border-primary'
                  )}
                >
                  <div className="font-medium">{slot.time}</div>
                  <div className="opacity-80">₹{turf.price}</div>
                  {!isAvailable && isToday && (
                    <div className="mt-1 text-xs text-danger">
                      {!slot.status ? 'Not available' : getSlotStatusMessage(slot.time)}
                    </div>
                  )}
                </button>
              );
            })
          ) : (
            <div className="col-span-2 py-4 text-center text-muted">No time slots available</div>
          )}
        </div>
      </div>

      {selectedSlot && (
        <div className="rounded-md border border-border bg-surface-muted p-4">
          <h4 className="mb-3 font-semibold text-foreground">Booking summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted">
              <span>Field</span>
              <span className="text-foreground">
                {turf.owner?.companyName || turf.description}
              </span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Date</span>
              <span className="text-foreground">{format(selectedDate, 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Time</span>
              <span className="text-foreground">{selectedSlot}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Payment</span>
              <span className="text-foreground">Pay at venue</span>
            </div>
            <hr className="my-2 border-border" />
            <div className="flex justify-between font-semibold">
              <span className="text-foreground">Total</span>
              <span className="text-lg text-primary">₹{turf.price}</span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default BookingModal;
