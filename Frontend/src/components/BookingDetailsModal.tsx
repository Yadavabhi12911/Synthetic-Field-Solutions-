import React from 'react';
import { Calendar, Star } from 'lucide-react';
import { Modal, DetailField } from './ui/Modal';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

export interface BookingDetailsData {
  turfName: string;
  location?: string;
  status: string;
  bookingDate?: string;
  date?: string;
  timeSlot?: string;
  time?: string;
  price?: number;
  amount?: string;
  ownerName?: string;
  ownerMobile?: string;
  userName?: string;
  userEmail?: string;
  userMobile?: string;
  photos?: Array<{ photos: string }>;
  createdAt?: string;
  rating?: number;
  review?: string;
}

interface BookingDetailsModalProps {
  open: boolean;
  onClose: () => void;
  booking: BookingDetailsData | null;
  variant?: 'player' | 'operator';
}

const statusTone = (status: string) => {
  if (status === 'confirmed') return 'primary' as const;
  if (status === 'completed') return 'success' as const;
  if (status === 'canceled') return 'danger' as const;
  return 'warning' as const;
};

export function BookingDetailsModal({
  open,
  onClose,
  booking,
  variant = 'player',
}: BookingDetailsModalProps) {
  if (!booking) return null;

  const playDate = booking.bookingDate
    ? new Date(booking.bookingDate).toLocaleDateString()
    : booking.date || 'N/A';
  const time = booking.timeSlot || booking.time || 'N/A';
  const price =
    booking.price && booking.price > 0
      ? `₹${booking.price}`
      : booking.amount && booking.amount !== '₹0'
      ? booking.amount
      : 'Not set';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Booking details"
      description={booking.turfName}
      size="lg"
      footer={
        <div className="flex justify-end">
          <Button type="button" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      {booking.photos?.[0]?.photos ? (
        <div className="mb-4 h-48 overflow-hidden rounded-lg border border-border">
          <img
            src={booking.photos[0].photos}
            alt={booking.turfName}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="mb-4 flex h-32 items-center justify-center rounded-lg border border-border bg-primary-muted">
          <Calendar className="h-8 w-8 text-primary" />
        </div>
      )}

      <div className="mb-4">
        <Badge tone={statusTone(booking.status)} className="capitalize">
          {booking.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DetailField label="Field" value={booking.turfName || 'N/A'} />
        <DetailField label="Location" value={booking.location || 'N/A'} />
        <DetailField label="Play date" value={playDate} />
        <DetailField label="Time slot" value={time} />
        <DetailField label="Price" value={price} />
        {variant === 'player' && (
          <>
            <DetailField label="Operator" value={booking.ownerName || 'N/A'} />
            <DetailField label="Operator contact" value={booking.ownerMobile || 'N/A'} />
          </>
        )}
        {variant === 'operator' && (
          <>
            <DetailField label="Player" value={booking.userName || 'N/A'} />
            <DetailField label="Player email" value={booking.userEmail || 'N/A'} />
            <DetailField label="Player contact" value={booking.userMobile || 'N/A'} />
          </>
        )}
        {variant === 'operator' && booking.status === 'completed' && (
          <DetailField
            label="Rating"
            value={
              booking.rating ? (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  {booking.rating}/5
                </span>
              ) : (
                'Not rated yet'
              )
            }
          />
        )}
        {variant === 'operator' && booking.status === 'completed' && booking.review && (
          <div className="sm:col-span-2">
            <DetailField label="Review" value={booking.review} />
          </div>
        )}
        {booking.createdAt && (
          <DetailField
            label="Booked on"
            value={new Date(booking.createdAt).toLocaleDateString()}
          />
        )}
      </div>
    </Modal>
  );
}
