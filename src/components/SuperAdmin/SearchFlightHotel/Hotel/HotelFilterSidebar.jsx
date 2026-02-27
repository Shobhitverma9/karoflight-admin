import React, { useMemo, useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setPriceRange,
  setGuestRating,
  setSelectedStarRating,
  setSelectedNeighborhoods,
  setSelectedPropertyTypes,
  setSelectedPopularWith,
  setSelectedAmenities,
  setSelectedPolicies,
  resetFilters,
  selectFilters,
  selectDynamicFilters,
  selectHotels,
} from "../../features/slices/HotelSearch";
import { 
  FaSearch, 
  FaChevronDown, 
  FaChevronUp, 
  FaMapMarkerAlt,
  FaStar,
  FaDollarSign,
  FaFilter,
  FaTimes
} from "react-icons/fa";
import HotelMapModal from "../../../Modal/HotelMapModal";

const RangeSlider = ({
  min,
  max,
  values = [min, max],
  onChange,
  formatValue,
}) => {
  const sliderRef = useRef(null);
  const [dragging, setDragging] = useState(null);

  const safe = [
    Math.max(min, Math.min(max, values[0] ?? min)),
    Math.max(min, Math.min(max, values[1] ?? max)),
  ];

  const percent = (v) => ((v - min) / (max - min)) * 100;

  const onPointerMove = (e) => {
    if (dragging === null) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = "clientX" in e ? e.clientX : e.touches?.[0]?.clientX;
    if (!x) return;
    const p = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
    const newVal = Math.round(min + p * (max - min));
    const next = [...safe];
    if (dragging === 0) next[0] = Math.min(newVal, safe[1] - 1);
    else next[1] = Math.max(newVal, safe[0] + 1);
    onChange(next);
  };

  const onPointerUp = () => {
    setDragging(null);
    window.removeEventListener("mousemove", onPointerMove);
    window.removeEventListener("mouseup", onPointerUp);
    window.removeEventListener("touchmove", onPointerMove);
    window.removeEventListener("touchend", onPointerUp);
  };

  const onPointerDown = (index, e) => {
    e.preventDefault();
    setDragging(index);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    window.addEventListener("touchmove", onPointerMove, { passive: false });
    window.addEventListener("touchend", onPointerUp);
  };

  const l = percent(safe[0]);
  const r = percent(safe[1]);

  return (
    <div className="space-y-4">
      <div
        ref={sliderRef}
        className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
        onMouseDown={(e) => {
          const rect = sliderRef.current.getBoundingClientRect();
          const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          const val = Math.round(min + p * (max - min));
          if (Math.abs(val - safe[0]) < Math.abs(val - safe[1])) {
            onChange([Math.min(val, safe[1] - 1), safe[1]]);
          } else {
            onChange([safe[0], Math.max(val, safe[0] + 1)]);
          }
        }}
      >
        <div
          className="absolute h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
          style={{ left: `${l}%`, width: `${r - l}%` }}
        />
        {/* Left thumb */}
        <div
          className="absolute w-5 h-5 bg-white border-3 border-orange-500 rounded-full -top-1.5 -ml-2.5 shadow-lg cursor-grab active:cursor-grabbing transition-transform hover:scale-110"
          style={{ left: `${l}%` }}
          onMouseDown={(e) => onPointerDown(0, e)}
          onTouchStart={(e) => onPointerDown(0, e)}
        />
        {/* Right thumb */}
        <div
          className="absolute w-5 h-5 bg-white border-3 border-orange-500 rounded-full -top-1.5 -ml-2.5 shadow-lg cursor-grab active:cursor-grabbing transition-transform hover:scale-110"
          style={{ left: `${r}%` }}
          onMouseDown={(e) => onPointerDown(1, e)}
          onTouchStart={(e) => onPointerDown(1, e)}
        />
      </div>

      <div className="flex justify-between text-sm font-medium text-gray-700">
        <span className="bg-gray-100 px-3 py-1 rounded-lg">
          {formatValue ? formatValue(safe[0]) : safe[0]}
        </span>
        <span className="bg-gray-100 px-3 py-1 rounded-lg">
          {formatValue ? formatValue(safe[1]) : safe[1]}
        </span>
      </div>
    </div>
  );
};

const FilterSection = ({ 
  title, 
  isExpanded, 
  onToggle, 
  children, 
  count = 0,
  icon: Icon = FaFilter 
}) => (
  <div className="border-b border-gray-100 pb-4 last:border-b-0">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-3 text-left hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className="text-orange-500" />}
        <h3 className="font-semibold text-gray-800">{title}</h3>
        {count > 0 && (
          <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
      <span className="text-gray-400 transition-transform duration-200">
        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
      </span>
    </button>
    
    {isExpanded && (
      <div className="mt-3 animate-fadeIn">
        {children}
      </div>
    )}
  </div>
);

const HotelFilterSidebar = () => {
  const dispatch = useDispatch();
  
  // Select state from Redux
  const filters = useSelector(selectFilters);
  const dynamicFilters = useSelector(selectDynamicFilters) || {};
  const hotels = useSelector(selectHotels) || [];

  // Local state
  const [mapOpen, setMapOpen] = useState(false);
  const [placeQuery, setPlaceQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    star: true,
    property: false,
    places: false,
    meal: false,
    amenities: false,
    policies: false,
    guestRating: false,
  });

  // Toggle section
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Extract data from dynamic filters
  const {
    minPrice = 0,
    maxPrice = 50000,
    stars = [],
    propertyTypes = [],
    mealBasis = [],
    places = [],
    amenities = []
  } = dynamicFilters;

  // Calculate counts
  const counts = useMemo(() => {
    const result = {
      star: filters.selectedStarRating?.length || 0,
      property: filters.selectedPropertyTypes?.length || 0,
      places: filters.selectedNeighborhoods?.length || 0,
      meal: filters.selectedPopularWith?.length || 0,
      amenities: filters.selectedAmenities?.length || 0,
      policies: filters.selectedPolicies?.length || 0,
    };
    result.total = Object.values(result).reduce((sum, val) => sum + val, 0);
    return result;
  }, [filters]);

  // Filter places based on search
  const filteredPlaces = useMemo(() => {
    if (!placeQuery.trim()) return places.slice(0, 20);
    const query = placeQuery.toLowerCase();
    return places
      .filter(place => place.toLowerCase().includes(query))
      .slice(0, 20);
  }, [places, placeQuery]);

  // Price formatter
  const formatPrice = (price) => `₹${Math.round(price).toLocaleString()}`;

  // Handle price range change
  const handlePriceChange = (values) => {
    dispatch(setPriceRange(values));
  };

  // Handle guest rating change
  const handleGuestRatingChange = (rating) => {
    dispatch(setGuestRating(rating));
  };

  // Toggle functions
  const toggleStarRating = (rating) => {
    const current = [...(filters.selectedStarRating || [])];
    const updated = current.includes(rating)
      ? current.filter(r => r !== rating)
      : [...current, rating];
    dispatch(setSelectedStarRating(updated));
  };

  const togglePropertyType = (type) => {
    const current = [...(filters.selectedPropertyTypes || [])];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    dispatch(setSelectedPropertyTypes(updated));
  };

  const toggleNeighborhood = (place) => {
    const current = [...(filters.selectedNeighborhoods || [])];
    const updated = current.includes(place)
      ? current.filter(p => p !== place)
      : [...current, place];
    dispatch(setSelectedNeighborhoods(updated));
  };

  const togglePopularWith = (basis) => {
    const current = [...(filters.selectedPopularWith || [])];
    const updated = current.includes(basis)
      ? current.filter(b => b !== basis)
      : [...current, basis];
    dispatch(setSelectedPopularWith(updated));
  };

  const toggleAmenity = (amenity) => {
    const current = [...(filters.selectedAmenities || [])];
    const updated = current.includes(amenity)
      ? current.filter(a => a !== amenity)
      : [...current, amenity];
    dispatch(setSelectedAmenities(updated));
  };

  const togglePolicy = (policy) => {
    const current = [...(filters.selectedPolicies || [])];
    const updated = current.includes(policy)
      ? current.filter(p => p !== policy)
      : [...current, policy];
    dispatch(setSelectedPolicies(updated));
  };

  // Reset all filters
  const handleResetAll = () => {
    dispatch(resetFilters());
    setPlaceQuery("");
  };

  return (
    <>
      <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden sticky top-6">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-orange-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <FaFilter className="text-white text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <p className="text-sm text-gray-600">
                  Refine your search results
                </p>
              </div>
            </div>
            {counts.total > 0 && (
              <button
                onClick={handleResetAll}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FaTimes />
                Clear All ({counts.total})
              </button>
            )}
          </div>
          
          {/* Active Filters Summary */}
          {counts.total > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {filters.selectedStarRating?.map(rating => (
                <span
                  key={rating}
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                >
                  <FaStar className="text-yellow-500" />
                  {rating} Star
                </span>
              ))}
              {filters.selectedPropertyTypes?.map(type => (
                <span
                  key={type}
                  className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                >
                  {type}
                </span>
              ))}
              {filters.selectedAmenities?.slice(0, 2).map(amenity => (
                <span
                  key={amenity}
                  className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                >
                  {amenity}
                </span>
              ))}
              {counts.total > 3 && (
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                  +{counts.total - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Filters Content */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Price Range */}
          <FilterSection
            title="Price Range"
            isExpanded={expandedSections.price}
            onToggle={() => toggleSection("price")}
            count={filters.priceRange?.[0] !== minPrice || filters.priceRange?.[1] !== maxPrice ? 1 : 0}
            icon={FaDollarSign}
          >
            <RangeSlider
              min={minPrice}
              max={maxPrice}
              values={filters.priceRange || [minPrice, maxPrice]}
              onChange={handlePriceChange}
              formatValue={formatPrice}
            />
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { label: "Budget", range: [minPrice, 3000] },
                { label: "Mid-range", range: [3000, 8000] },
                { label: "Premium", range: [8000, 15000] },
                { label: "Luxury", range: [15000, maxPrice] },
              ].map(({ label, range }) => (
                <button
                  key={label}
                  onClick={() => handlePriceChange(range)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filters.priceRange?.[0] === range[0] && filters.priceRange?.[1] === range[1]
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Star Rating */}
          <FilterSection
            title="Star Rating"
            isExpanded={expandedSections.star}
            onToggle={() => toggleSection("star")}
            count={counts.star}
            icon={FaStar}
          >
            <div className="space-y-3">
              {stars.map(rating => (
                <label
                  key={rating}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={(filters.selectedStarRating || []).includes(rating)}
                      onChange={() => toggleStarRating(rating)}
                      className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <div className="flex items-center gap-1">
                      {[...Array(rating)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-500" />
                      ))}
                    </div>
                    <span className="font-medium text-gray-700">{rating} Star{rating !== 1 ? 's' : ''}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {hotels.filter(h => Math.round(h.rating || 0) === rating).length}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Property Type */}
          {propertyTypes.length > 0 && (
            <FilterSection
              title="Property Type"
              isExpanded={expandedSections.property}
              onToggle={() => toggleSection("property")}
              count={counts.property}
            >
              <div className="space-y-2">
                {propertyTypes.map(type => (
                  <label
                    key={type}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={(filters.selectedPropertyTypes || []).includes(type)}
                        onChange={() => togglePropertyType(type)}
                        className="w-4 h-4 text-orange-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">{type}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {hotels.filter(h => h.propertyType === type).length}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>
          )}

          {/* Popular Places */}
          {places.length > 0 && (
            <FilterSection
              title="Popular Places"
              isExpanded={expandedSections.places}
              onToggle={() => toggleSection("places")}
              count={counts.places}
              icon={FaMapMarkerAlt}
            >
              <div className="relative mb-3">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={placeQuery}
                  onChange={(e) => setPlaceQuery(e.target.value)}
                  placeholder="Search places..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredPlaces.map(place => (
                  <label
                    key={place}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={(filters.selectedNeighborhoods || []).includes(place)}
                        onChange={() => toggleNeighborhood(place)}
                        className="w-4 h-4 text-orange-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">{place}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {hotels.filter(h => h.popularPlace === place).length}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>
          )}

          {/* Meal Basis */}
          {mealBasis.length > 0 && (
            <FilterSection
              title="Meal Basis"
              isExpanded={expandedSections.meal}
              onToggle={() => toggleSection("meal")}
              count={counts.meal}
            >
              <div className="space-y-2">
                {mealBasis.map(basis => (
                  <label
                    key={basis}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={(filters.selectedPopularWith || []).includes(basis)}
                        onChange={() => togglePopularWith(basis)}
                        className="w-4 h-4 text-orange-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">{basis}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {hotels.filter(h => h.mealBasis === basis).length}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>
          )}

          {/* Amenities */}
          {amenities.length > 0 && (
            <FilterSection
              title="Amenities"
              isExpanded={expandedSections.amenities}
              onToggle={() => toggleSection("amenities")}
              count={counts.amenities}
            >
              <div className="space-y-2">
                {amenities.map(amenity => (
                  <label
                    key={amenity}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={(filters.selectedAmenities || []).includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="w-4 h-4 text-orange-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {hotels.filter(h => h.amenities?.includes(amenity)).length}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>
          )}

          {/* Guest Rating */}
          <FilterSection
            title="Guest Rating"
            isExpanded={expandedSections.guestRating}
            onToggle={() => toggleSection("guestRating")}
            count={filters.guestRating > 7 ? 1 : 0}
          >
            <div className="space-y-4">
              <input
                type="range"
                min="1"
                max="10"
                value={filters.guestRating || 7}
                onChange={(e) => handleGuestRatingChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm">
                <span className={`px-3 py-1 rounded-full ${filters.guestRating >= 8 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  8+ Excellent
                </span>
                <span className={`px-3 py-1 rounded-full ${filters.guestRating >= 7 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                  7+ Very Good
                </span>
                <span className={`px-3 py-1 rounded-full ${filters.guestRating >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                  5+ Good
                </span>
              </div>
            </div>
          </FilterSection>

          {/* Policies */}
          <FilterSection
            title="Policies"
            isExpanded={expandedSections.policies}
            onToggle={() => toggleSection("policies")}
            count={counts.policies}
          >
            <div className="space-y-3">
              {["Free cancellation", "Pay at Hotel", "No prepayment needed", "Book without credit card"].map(policy => (
                <label
                  key={policy}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={(filters.selectedPolicies || []).includes(policy)}
                      onChange={() => togglePolicy(policy)}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">{policy}</span>
                  </div>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Map Button */}
          <button
            onClick={() => setMapOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            <FaMapMarkerAlt />
            View on Map
          </button>
        </div>
      </div>

      {/* Map Modal */}
      <HotelMapModal
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        hotels={hotels}
      />
    </>
  );
};

export default HotelFilterSidebar;