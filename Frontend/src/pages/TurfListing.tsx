import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, Star, X } from 'lucide-react';
import { getAllTurfs } from '../api';
import {
  getTurfAvailabilityLabel,
  getTurfAvailabilityStatus,
} from '../utils/bookingUi';
import { Page, PageHeader } from '../components/layout/Page';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { TiltSurface } from '../components/landing/TiltSurface';
import { AmbientVideo } from '../components/landing/AmbientVideo';

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

  const availabilityTone = (
    status: ReturnType<typeof getTurfAvailabilityStatus>
  ) => {
    if (status === 'available') return 'success' as const;
    if (status === 'limited') return 'warning' as const;
    return 'danger' as const;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-warning text-warning'
                : 'text-muted'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Page>
      <PageHeader
        title="Browse fields"
        description="Find turfs near you and check real-time slot availability."
      />

      <AmbientVideo
        src="/athletes-on-turf.mp4"
        label="Athletes playing on turf"
        className="mb-8"
        videoClassName="h-48 w-full sm:h-64 lg:h-72"
        overlayClassName="bg-gradient-to-r from-black/55 via-black/20 to-transparent"
      />

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start">
        <div className="min-w-0 flex-1">
          <Input
            name="field-search"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by location, name, or operator..."
            icon={<Search className="h-4 w-4" />}
            autoComplete="off"
            hint="Sign up for saved preferences and faster booking."
          />
        </div>

        <Button
          type="button"
          variant={hasActiveFilters ? 'primary' : 'secondary'}
          onClick={() => setFilterOpen(!filterOpen)}
          className="h-11 shrink-0"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 h-2 w-2 rounded-full bg-white" />
          )}
        </Button>
      </div>

      {hasActiveFilters && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="type-body-sm">Active filters:</span>
          {searchTerm && (
            <Badge tone="primary" className="gap-1.5 pr-1.5">
              Search: &quot;{searchTerm}&quot;
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="rounded-full p-0.5 hover:bg-primary/20"
                aria-label="Remove search filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {priceRange && (
            <Badge tone="primary" className="gap-1.5 pr-1.5">
              Price: {priceRange}
              <button
                type="button"
                onClick={() => setPriceRange('')}
                className="rounded-full p-0.5 hover:bg-primary/20"
                aria-label="Remove price filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {location && (
            <Badge tone="primary" className="gap-1.5 pr-1.5">
              Location: {location}
              <button
                type="button"
                onClick={() => setLocation('')}
                className="rounded-full p-0.5 hover:bg-primary/20"
                aria-label="Remove location filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {rating && (
            <Badge tone="primary" className="gap-1.5 pr-1.5">
              Rating: {rating}
              <button
                type="button"
                onClick={() => setRating('')}
                className="rounded-full p-0.5 hover:bg-primary/20"
                aria-label="Remove rating filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}

      {filterOpen && (
        <Card className="mb-6">
          <CardBody>
            <h3 className="type-heading mb-4">
              Filter options
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-2">
                <label className="type-label">
                  Price range
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-foreground"
                >
                  <option value="">All prices</option>
                  <option value="0-1000">₹0 – ₹1000</option>
                  <option value="1000-1500">₹1000 – ₹1500</option>
                  <option value="1500+">₹1500+</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="type-label">
                  Location
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-foreground"
                >
                  <option value="">All locations</option>
                  <option value="downtown">Downtown</option>
                  <option value="city-center">City Center</option>
                  <option value="north-zone">North Zone</option>
                  <option value="south-city">South City</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="type-label">
                  Rating
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-foreground"
                >
                  <option value="">All ratings</option>
                  <option value="4.5+">4.5+ stars</option>
                  <option value="4+">4+ stars</option>
                  <option value="3+">3+ stars</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {!loading && !error && (
        <p className="type-body-sm mb-6">
          Showing {filteredTurfs.length} of {turfs.length} fields
          {hasActiveFilters && ' (filtered)'}
        </p>
      )}

      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="h-48 rounded-none" />
              <CardBody className="space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <Card className="border-danger/30">
          <CardBody className="py-12 text-center">
            <p className="text-danger">{error}</p>
            <Button
              type="button"
              variant="secondary"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </CardBody>
        </Card>
      )}

      {!loading && !error && filteredTurfs.length === 0 && (
        <Card>
          <CardBody className="py-12 text-center">
            <p className="text-muted">No fields match your filters.</p>
            <Button type="button" className="mt-4" onClick={clearFilters}>
              Clear filters
            </Button>
          </CardBody>
        </Card>
      )}

      {!loading && !error && filteredTurfs.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTurfs.map((turf) => {
            const availabilityStatus = getTurfAvailabilityStatus(turf.turfTiming);
            const availabilityLabel = getTurfAvailabilityLabel(availabilityStatus);

            return (
              <Link
                key={turf._id}
                to={`/turf/${turf._id}`}
                className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <TiltSurface className="h-full" innerClassName="h-full overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={
                        turf.photos?.length
                          ? turf.photos[0].photos
                          : '/default-turf.jpg'
                      }
                      alt={turf.owner?.companyName || 'Turf'}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = '/default-turf.jpg';
                      }}
                    />
                    <div className="absolute right-3 top-3">
                      <Badge tone={availabilityTone(availabilityStatus)}>
                        {availabilityLabel}
                      </Badge>
                    </div>
                    {turf.averageRating > 0 && (
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-xs text-foreground">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        {turf.averageRating.toFixed(1)}
                      </div>
                    )}
                  </div>

                  <CardBody>
                    <h3 className="type-heading">
                      {turf.owner?.companyName || 'Turf'}
                    </h3>

                    <div className="mt-2 flex items-start gap-2 type-body-sm">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      <span className="line-clamp-2">{turf.address}</span>
                    </div>

                    {turf.averageRating > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        {renderStars(turf.averageRating)}
                        <span className="type-meta">
                          {turf.averageRating.toFixed(1)} ({turf.totalRatings}{' '}
                          reviews)
                        </span>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="type-numeric text-lg text-primary">
                        ₹{turf.price}
                        <span className="type-body-sm font-normal">
                          /hr
                        </span>
                      </span>
                      <Button type="button" size="sm" tabIndex={-1}>
                        View details
                      </Button>
                    </div>
                  </CardBody>
                </TiltSurface>
              </Link>
            );
          })}
        </div>
      )}
    </Page>
  );
};

export default TurfListing;