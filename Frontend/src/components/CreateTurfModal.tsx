import React, { useState } from 'react';
import { Image } from 'lucide-react';
import toast from 'react-hot-toast';
import { createTurf } from '../api';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { cn } from '../lib/cn';

interface CreateTurfModalProps {
  onClose: () => void;
  initialData?: {
    _id?: string;
    description: string;
    price: string;
    address: string;
    pincode: string;
    contactNumber: string;
    turfTiming?: string[];
    photos?: { photos: string; public_id?: string }[];
  };
  onSubmit?: (formData: FormData, turfId?: string) => Promise<void>;
  mode?: 'create' | 'edit';
}

const CreateTurfModal: React.FC<CreateTurfModalProps> = ({
  onClose,
  initialData,
  onSubmit,
  mode = 'create',
}) => {
  const [formData, setFormData] = useState({
    description: initialData?.description || '',
    price: initialData?.price || '',
    address: initialData?.address || '',
    pincode: initialData?.pincode || '',
    contactNumber: initialData?.contactNumber || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>(initialData?.turfTiming || []);
  const [existingPhotos, setExistingPhotos] = useState<{ photos: string; public_id: string }[]>(
    (initialData?.photos || []).map((p, idx) => ({
      photos: p.photos,
      public_id: p.public_id || `noid-${idx}`,
    }))
  );
  const [removedPhotos, setRemovedPhotos] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files).slice(0, 5));
    }
  };

  const handleSlotChange = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const form = new FormData();
      form.append('description', formData.description);
      form.append('price', formData.price);
      form.append('address', formData.address);
      form.append('pincode', formData.pincode);
      form.append('ContactNumber', formData.contactNumber);
      photos.forEach((photo) => form.append('turfPhotos', photo));
      selectedSlots.forEach((slot) => form.append('turfTiming', slot));
      if (mode === 'edit') {
        existingPhotos.forEach((obj) => form.append('existingPhotos', JSON.stringify(obj)));
        removedPhotos.forEach((id) => form.append('removedPhotos', id));
      }
      if (onSubmit) {
        await onSubmit(form, initialData?._id);
      } else {
        await createTurf(form);
        toast.success('Turf created successfully!');
      }
      setFormData({ description: '', price: '', address: '', pincode: '', contactNumber: '' });
      setPhotos([]);
      setSelectedSlots([]);
      setExistingPhotos([]);
      setRemovedPhotos([]);
      onClose();
    } catch {
      toast.error(`Failed to ${mode === 'edit' ? 'update' : 'create'} turf. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={mode === 'edit' ? 'Edit field' : 'Create new field'}
      size="xl"
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="create-turf-form" loading={isLoading}>
            {mode === 'edit' ? 'Update field' : 'Create field'}
          </Button>
        </div>
      }
    >
      <form id="create-turf-form" onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="description" className="mb-2 block type-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
            placeholder="Describe your field (facilities, size, surface type, etc.)"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Price per hour (₹)"
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            placeholder="1000"
          />
          <Input
            label="Contact number"
            type="tel"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            required
            placeholder="Enter contact number"
          />
        </div>

        <div>
          <label htmlFor="address" className="mb-2 block type-label">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            rows={2}
            className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
            placeholder="Enter complete address"
          />
        </div>

        <Input
          label="Pincode"
          type="text"
          name="pincode"
          value={formData.pincode}
          onChange={handleChange}
          required
          placeholder="Enter pincode"
        />

        <div>
          <p className="mb-2 type-label">Field photos</p>
          <div className="rounded-md border border-dashed border-border p-6 text-center hover:border-primary">
            <Image className="mx-auto mb-4 h-12 w-12 text-muted" />
            <p className="mb-2 text-sm text-muted">Click to upload photos</p>
            <p className="text-xs text-muted">PNG, JPG up to 5MB (max 5 photos)</p>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              id="photos"
              onChange={handleFileChange}
            />
            <label htmlFor="photos">
              <span className="mt-4 inline-block cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">
                Choose files
              </span>
            </label>
          </div>
          {photos.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {photos.map((file, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-primary-muted px-2 py-1 text-xs text-primary"
                >
                  {file.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="mb-4 type-label">Available time slots</p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {Array.from({ length: 24 }, (_, i) => {
              const hour = i.toString().padStart(2, '0');
              const slot = `${hour}:00`;
              const checked = selectedSlots.includes(slot);
              return (
                <label
                  key={i}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm transition-colors',
                    checked
                      ? 'border-primary bg-primary-muted text-primary'
                      : 'border-border bg-surface-muted text-foreground hover:border-primary'
                  )}
                >
                  <input
                    type="checkbox"
                    className="rounded border-border text-primary focus:ring-primary"
                    checked={checked}
                    onChange={() => handleSlotChange(slot)}
                  />
                  <span>{slot}</span>
                </label>
              );
            })}
          </div>
        </div>

        {mode === 'edit' && existingPhotos.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {existingPhotos.map((img, idx) => (
              <div key={img.public_id} className="group relative">
                <img
                  src={img.photos}
                  alt="Existing field"
                  className="h-16 w-16 rounded border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setRemovedPhotos((rm) => [...rm, img.public_id || `noid-${idx}`]);
                    setExistingPhotos((photos) => photos.filter((_, i) => i !== idx));
                  }}
                  className="absolute right-0 top-0 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove photo"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </form>
    </Modal>
  );
};

export default CreateTurfModal;
