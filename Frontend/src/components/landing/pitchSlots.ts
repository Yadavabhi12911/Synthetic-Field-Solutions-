export type PitchSlot = {
  id: string;
  label: string;
  price: string;
  position: [number, number, number];
  available?: boolean;
};

export const PITCH_SLOT_LAYOUT: Array<[number, number, number]> = [
  [-2.15, 0.06, 0.85],
  [0.15, 0.06, -0.45],
  [2.05, 0.06, 1.05],
  [-1.55, 0.06, -1.15],
  [1.65, 0.06, -1.05],
  [0, 0.06, 1.35],
];

export const PITCH_SLOTS: PitchSlot[] = [
  { id: '18', label: '6:00 PM', price: '₹1,200', position: PITCH_SLOT_LAYOUT[0] },
  { id: '19', label: '7:00 PM', price: '₹1,200', position: PITCH_SLOT_LAYOUT[1] },
  { id: '20', label: '8:00 PM', price: '₹1,200', position: PITCH_SLOT_LAYOUT[2] },
];

export function slotsFromTimings(
  timings: Array<{ time: string; status: boolean }> | undefined,
  price?: string | number
): PitchSlot[] {
  if (!timings?.length) return PITCH_SLOTS;

  const formattedPrice =
    typeof price === 'number' ? `₹${price}` : price?.toString() || '';
  const preferred = timings.filter((slot) => slot.status);
  const source = (preferred.length ? preferred : timings).slice(0, 6);

  return source.map((slot, index) => ({
    id: slot.time,
    label: slot.time,
    price: formattedPrice,
    available: slot.status,
    position: PITCH_SLOT_LAYOUT[index % PITCH_SLOT_LAYOUT.length],
  }));
}
