export interface TurfTimingSlot {
  time: string;
  status: boolean;
}

export type TurfAvailabilityStatus = 'available' | 'limited' | 'unavailable';

const parseSlotStartTime = (timeSlot: string): { hour: number; minute: number } | null => {
  let timeMatch = timeSlot.match(/(\d+)(?::(\d+))?\s*(AM|PM)/i);

  if (!timeMatch) {
    timeMatch = timeSlot.match(/(\d+)(?::(\d+))?/);
    if (!timeMatch) return null;

    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const ampm = hour <= 12 ? 'AM' : 'PM';
    if (hour > 12) hour -= 12;

    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;

    return { hour, minute };
  }

  let hour = parseInt(timeMatch[1], 10);
  const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
  const ampm = timeMatch[3] ? timeMatch[3].toUpperCase() : 'AM';

  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;

  return { hour, minute };
};

export const isSlotAvailableToday = (timeSlot: string, now: Date = new Date()): boolean => {
  const parsed = parseSlotStartTime(timeSlot);
  if (!parsed) return true;

  const slotStartTime = new Date(now);
  slotStartTime.setHours(parsed.hour, parsed.minute, 0, 0);

  if (now > slotStartTime) return false;

  const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
  return slotStartTime >= thirtyMinutesFromNow;
};

export const getSlotStatusMessage = (timeSlot: string, now: Date = new Date()): string | null => {
  const parsed = parseSlotStartTime(timeSlot);
  if (!parsed) return null;

  const slotStartTime = new Date(now);
  slotStartTime.setHours(parsed.hour, parsed.minute, 0, 0);

  if (now > slotStartTime) return 'Time Passed';

  const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
  if (slotStartTime < thirtyMinutesFromNow) return 'Too Soon';

  return null;
};

export const hasAvailableSlotsToday = (
  turfTiming: TurfTimingSlot[] | undefined,
  now: Date = new Date()
): boolean => {
  return turfTiming?.some((slot) => slot.status && isSlotAvailableToday(slot.time, now)) ?? false;
};

export const getTurfAvailabilityStatus = (
  turfTiming: TurfTimingSlot[] | undefined,
  now: Date = new Date()
): TurfAvailabilityStatus => {
  if (!turfTiming?.length) return 'unavailable';

  const openSlots = turfTiming.filter((slot) => slot.status);
  if (!openSlots.length) return 'unavailable';

  const bookableToday = openSlots.filter((slot) => isSlotAvailableToday(slot.time, now));
  if (bookableToday.length === 0) return 'limited';
  if (bookableToday.length <= Math.max(1, Math.floor(openSlots.length * 0.25))) return 'limited';

  return 'available';
};

export const getTurfAvailabilityLabel = (status: TurfAvailabilityStatus): string => {
  switch (status) {
    case 'available':
      return 'Slots open';
    case 'limited':
      return 'Limited slots';
    default:
      return 'Fully booked';
  }
};

interface BookingLike {
  status?: string;
}

export const countBookingsByStatus = (bookings: BookingLike[]) => {
  const normalized = bookings.map((booking) => (booking.status || '').toLowerCase());
  return {
    total: bookings.length,
    upcoming: normalized.filter((status) => status === 'confirmed' || status === 'pending').length,
    completed: normalized.filter((status) => status === 'completed').length,
    canceled: normalized.filter((status) => status === 'canceled' || status === 'cancelled').length,
  };
};

interface TurfLike {
  averageRating?: number;
  totalRatings?: number;
}

export const computeAverageTurfRating = (turfs: TurfLike[]): number | null => {
  const rated = turfs.filter((turf) => (turf.averageRating || 0) > 0);
  if (!rated.length) return null;
  const total = rated.reduce((sum, turf) => sum + (turf.averageRating || 0), 0);
  return total / rated.length;
};
