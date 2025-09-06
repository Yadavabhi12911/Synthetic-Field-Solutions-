import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Star, X } from 'lucide-react';
import { getAllTurfs } from '../api';

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

const TurfListing: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [filteredTurfs, setFilteredTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [priceRange, setPriceRange] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState('');

  useEffect(() => {
    setLoading(true);
    getAllTurfs()
      .then(response => {
        // Handle new response structure with pagination
        const turfsData = response.data.turfs || response.data;
        setTurfs(turfsData);
        setFilteredTurfs(turfsData);
      })
      .catch(err => {
        console.error('Error loading turfs:', err);
        setError('Failed to load turfs');
      })
      .finally(() => setLoading(false));
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...turfs];

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(turf => 
        turf.description.toLowerCase().includes(searchLower) ||
        turf.address.toLowerCase().includes(searchLower) ||
        turf.pincode.toLowerCase().includes(searchLower) ||
        turf.owner?.companyName?.toLowerCase().includes(searchLower) ||
        turf.owner?.userName?.toLowerCase().includes(searchLower)
      );
    }

    // Price range filter
    if (priceRange) {
      switch (priceRange) {
        case '0-1000':
          filtered = filtered.filter(turf => turf.price <= 1000);
          break;
        case '1000-1500':
          filtered = filtered.filter(turf => turf.price > 1000 && turf.price <= 1500);
          break;
        case '1500+':
          filtered = filtered.filter(turf => turf.price > 1500);
          break;
      }
    }

    // Location filter
    if (location) {
      filtered = filtered.filter(turf => 
        turf.address.toLowerCase().includes(location.toLowerCase()) ||
        turf.pincode.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Rating filter
    if (rating) {
      const minRating = parseFloat(rating.replace('+', ''));
      filtered = filtered.filter(turf => turf.averageRating >= minRating);
    }

    setFilteredTurfs(filtered);
  }, [turfs, searchTerm, priceRange, location, rating]);

  const clearFilters = () => {
    setSearchTerm('');
    setPriceRange('');
    setLocation('');
    setRating('');
  };

  const hasActiveFilters = searchTerm || priceRange || location || rating;

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

  return (
    <div className="min-h-screen pt-20 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col justify-center gap-3 items-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white pt-10 mt-5">
              Find Your Perfect <span className="text-teal-400">Turf</span>
            </h1>
            <p className="text-gray-300 text-base sm:text-lg">Discover amazing sports facilities near you</p>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex flex-col md:flex-row gap-4"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by location, name, or facilities..."
              className="w-full pl-12 pr-4 py-4 bg-zinc-700 backdrop-blur-lg border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
            />
            <div className="absolute -bottom-6 left-0 text-xs text-gray-500">
              💡 <Link to="/register" className="text-teal-400 hover:text-teal-300 underline">Sign up</Link> for advanced search filters
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilterOpen(!filterOpen)}
            className={`backdrop-blur-lg border px-6 py-4 rounded-2xl flex items-center space-x-2 transition-colors ${
              hasActiveFilters 
                ? 'bg-teal-500/20 border-teal-400 text-teal-400' 
                : 'bg-white/10 border-gray-600 hover:border-teal-400 text-white'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
            )}
          </motion.button>
        </motion.div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex flex-wrap gap-2 items-center"
          >
            <span className="text-gray-300 text-sm">Active filters:</span>
            {searchTerm && (
              <span className="bg-teal-500/20 text-teal-400 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="hover:text-teal-300">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {priceRange && (
              <span className="bg-teal-500/20 text-teal-400 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                Price: {priceRange}
                <button onClick={() => setPriceRange('')} className="hover:text-teal-300">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {location && (
              <span className="bg-teal-500/20 text-teal-400 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                Location: {location}
                <button onClick={() => setLocation('')} className="hover:text-teal-300">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {rating && (
              <span className="bg-teal-500/20 text-teal-400 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                Rating: {rating}
                <button onClick={() => setRating('')} className="hover:text-teal-300">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-gray-400 hover:text-white text-sm underline"
            >
              Clear all
            </button>
          </motion.div>
        )}

        {/* Filter Panel */}
        {filterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Filter Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Price Range</label>
                <select 
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-700 border border-gray-600 rounded-xl text-white focus:border-teal-400 focus:outline-none"
                >
                  <option value="" className="bg-slate-700 text-white">All Prices</option>
                  <option value="0-1000" className="bg-slate-700 text-white">₹0 - ₹1000</option>
                  <option value="1000-1500" className="bg-slate-700 text-white">₹1000 - ₹1500</option>
                  <option value="1500+" className="bg-slate-700 text-white">₹1500+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                <select 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-700 border border-gray-600 rounded-xl text-white focus:border-teal-400 focus:outline-none"
                >
                  <option value="" className="bg-slate-700 text-white">All Locations</option>
                  <option value="downtown" className="bg-slate-700 text-white">Downtown</option>
                  <option value="city-center" className="bg-slate-700 text-white">City Center</option>
                  <option value="north-zone" className="bg-slate-700 text-white">North Zone</option>
                  <option value="south-city" className="bg-slate-700 text-white">South City</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                <select 
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-700 border border-gray-600 rounded-xl text-white focus:border-teal-400 focus:outline-none"
                >
                  <option value="" className="bg-slate-700 text-white">All Ratings</option>
                  <option value="4.5+" className="bg-slate-700 text-white">4.5+ Stars</option>
                  <option value="4+" className="bg-slate-700 text-white">4+ Stars</option>
                  <option value="3+" className="bg-slate-700 text-white">3+ Stars</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results Count */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <p className="text-gray-300">
              Showing {filteredTurfs.length} of {turfs.length} turfs
              {hasActiveFilters && ' (filtered)'}
            </p>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 animate-pulse">
                <div className="h-48 bg-gray-700"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded mb-4 w-3/4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-700 rounded w-20"></div>
                    <div className="h-8 bg-gray-700 rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-red-400 text-lg">{error}</div>
          </motion.div>
        )}

        {/* No Results */}
        {!loading && !error && filteredTurfs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 text-lg mb-4">No turfs found matching your criteria</div>
            <button
              onClick={clearFilters}
              className="bg-teal-400 hover:bg-teal-500 text-white px-6 py-2 rounded-xl transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        )}

        {/* Turf Grid */}
        {!loading && !error && filteredTurfs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
          {filteredTurfs.map((turf, index) => (
            <Link to={`/turf/${turf._id}`} key={turf._id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 hover:border-teal-400/50 transition-all duration-300 cursor-pointer"
              >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={turf.photos && turf.photos.length > 0 ? turf.photos[0].photos : '/default-turf.jpg'}
                  alt={turf.description}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = '/default-turf.jpg';
                  }}
                />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                  Available
                </div>
                {turf.averageRating > 0 && (
                  <div className="absolute bottom-4 left-4 flex items-center bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span>{turf.averageRating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{turf.owner?.companyName || 'Turf'}</h3>
                
                <div className="flex items-center text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{turf.address}</span>
                </div>

                {turf.averageRating > 0 && (
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {renderStars(turf.averageRating)}
                      <span className="text-sm text-gray-300">
                        {turf.averageRating.toFixed(1)} ({turf.totalRatings} reviews)
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-teal-500/20 text-teal-400 rounded-lg text-xs">
                    Sports
                  </span>
                  <span className="px-2 py-1 bg-teal-500/20 text-teal-400 rounded-lg text-xs">
                    Professional
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center text-teal-400 font-bold text-lg">
                    <span>₹{turf.price}/hour</span>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-teal-400 to-teal-600 hover:from-teal-500 hover:to-teal-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300"
                  >
                    View Details
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </Link>
          ))}
        </motion.div>
        )}

        {/* Load More */}
        {!loading && !error && filteredTurfs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/10 backdrop-blur-lg border border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300"
            >
              Load More Turfs
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TurfListing;