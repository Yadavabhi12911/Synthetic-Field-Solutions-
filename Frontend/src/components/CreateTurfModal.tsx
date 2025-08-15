import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, MapPin, DollarSign, Clock, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import { createTurf } from '../api';

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
    photos?: { photos: string }[];
  };
  onSubmit?: (formData: FormData, turfId?: string) => Promise<void>;
  mode?: "create" | "edit";
}

const CreateTurfModal: React.FC<CreateTurfModalProps> = ({ onClose, initialData, onSubmit, mode = "create" }) => {
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
  const [existingPhotos, setExistingPhotos] = useState<{ photos: string, public_id: string }[]>(
    (initialData?.photos || []).map((p, idx) => ({
      photos: p.photos,
      public_id: p.public_id || `noid-${idx}`
    }))
  );
  const [removedPhotos, setRemovedPhotos] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files).slice(0, 5)); // Max 5 photos
    }
  };

  const handleSlotChange = (slot: string) => {
    setSelectedSlots(prev =>
      prev.includes(slot)
        ? prev.filter(s => s !== slot)
        : [...prev, slot]
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
      photos.forEach(photo => form.append('turfPhotos', photo));
      selectedSlots.forEach(slot => form.append('turfTiming', slot));
      if (mode === 'edit') {
        existingPhotos.forEach(obj => form.append('existingPhotos', JSON.stringify(obj)));
        removedPhotos.forEach(id => form.append('removedPhotos', id));
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
    } catch (error) {
      toast.error(`Failed to ${mode === 'edit' ? 'update' : 'create'} turf. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">{mode === 'edit' ? 'Edit Turf' : 'Create New Turf'}</h2>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
                                  className="w-full px-4 py-3 bg-zinc-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors resize-none"
              placeholder="Describe your turf (facilities, size, surface type, etc.)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price per Hour (₹)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                                      className="w-full pl-10 pr-4 py-3 bg-zinc-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                  placeholder="1000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contact Number
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-zinc-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                placeholder="Enter contact number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={2}
                className="w-full pl-10 pr-4 py-3 bg-zinc-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors resize-none"
                placeholder="Enter complete address"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Pincode
            </label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-zinc-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
              placeholder="Enter pincode"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Turf Photos
            </label>
            <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-teal-400 transition-colors">
              <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-2">Click to upload photos</p>
              <p className="text-gray-500 text-sm">PNG, JPG up to 5MB (Max 5 photos)</p>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                id="photos"
                onChange={handleFileChange}
              />
              <label
                htmlFor="photos"
                className="mt-4 inline-block bg-teal-400 hover:bg-teal-500 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                Choose Files
              </label>
            </div>
            {photos.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {photos.map((file, idx) => (
                  <span key={idx} className="text-xs text-teal-300 bg-teal-900/30 px-2 py-1 rounded">
                    {file.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4">
              Available Time Slots
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Array.from({ length: 24 }, (_, i) => {
                const hour = i.toString().padStart(2, '0');
                const slot = `${hour}:00`;
                return (
                  <label key={i} className="flex items-center space-x-2 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-600 text-teal-400 focus:ring-teal-400"
                      checked={selectedSlots.includes(slot)}
                      onChange={() => handleSlotChange(slot)}
                    />
                    <span className="text-white text-sm">{slot}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {mode === 'edit' && existingPhotos.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {existingPhotos.map((img, idx) => (
                <div key={img.public_id} className="relative group">
                  <img src={img.photos} alt="Existing Turf" className="w-16 h-16 object-cover rounded border" />
                  <button type="button" onClick={() => {
                    setRemovedPhotos(rm => [...rm, img.public_id || `noid-${idx}`]);
                    setExistingPhotos(photos => photos.filter((_, i) => i !== idx));
                  }} className="absolute top-0 right-0 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-teal-400 hover:bg-teal-500 text-white font-semibold text-lg transition-colors disabled:opacity-60"
              disabled={isLoading}
            >
              {isLoading ? (mode === 'edit' ? 'Updating...' : 'Creating...') : (mode === 'edit' ? 'Update Turf' : 'Create Turf')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateTurfModal;