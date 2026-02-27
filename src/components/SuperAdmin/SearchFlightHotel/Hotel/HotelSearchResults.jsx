// components/HotelDetails/HotelFilterSidebar.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  setPriceRange,
  setGuestRating,
  setSelectedStarRating,
  setSelectedNeighborhoods,
  setSelectedPropertyTypes,
  setSelectedPopularWith,
  setSelectedAmenities,
  setSelectedPolicies
} from "../../../../features/slices/HotelSearch";

const HotelFilterSidebar = ({ dynamicFilters, uiFilters }) => {
  const dispatch = useDispatch();
  
  // Get current filters from Redux
  const filters = useSelector((state) => state.hotelSearch.filters);
  const [priceRange, setPriceRangeLocal] = useState(filters.priceRange);
  const [guestRating, setGuestRatingLocal] = useState(filters.guestRating);

  // Handle price range change
  const handlePriceRangeChange = (min, max) => {
    setPriceRangeLocal([min, max]);
    dispatch(setPriceRange([min, max]));
  };

  // Handle guest rating change
  const handleGuestRatingChange = (rating) => {
    setGuestRatingLocal(rating);
    dispatch(setGuestRating(rating));
  };

  // Handle star rating toggle
  const handleStarRatingToggle = (rating) => {
    const current = [...filters.selectedStarRating];
    if (current.includes(rating)) {
      dispatch(setSelectedStarRating(current.filter(r => r !== rating)));
    } else {
      dispatch(setSelectedStarRating([...current, rating]));
    }
  };

  // Handle neighborhood toggle
  const handleNeighborhoodToggle = (neighborhood) => {
    const current = [...filters.selectedNeighborhoods];
    if (current.includes(neighborhood)) {
      dispatch(setSelectedNeighborhoods(current.filter(n => n !== neighborhood)));
    } else {
      dispatch(setSelectedNeighborhoods([...current, neighborhood]));
    }
  };

  // Handle property type toggle
  const handlePropertyTypeToggle = (type) => {
    const current = [...filters.selectedPropertyTypes];
    if (current.includes(type)) {
      dispatch(setSelectedPropertyTypes(current.filter(t => t !== type)));
    } else {
      dispatch(setSelectedPropertyTypes([...current, type]));
    }
  };

  // Handle meal basis toggle
  const handleMealBasisToggle = (basis) => {
    const current = [...filters.selectedPopularWith];
    if (current.includes(basis)) {
      dispatch(setSelectedPopularWith(current.filter(b => b !== basis)));
    } else {
      dispatch(setSelectedPopularWith([...current, basis]));
    }
  };

  // Handle amenity toggle
  const handleAmenityToggle = (amenity) => {
    const current = [...filters.selectedAmenities];
    if (current.includes(amenity)) {
      dispatch(setSelectedAmenities(current.filter(a => a !== amenity)));
    } else {
      dispatch(setSelectedAmenities([...current, amenity]));
    }
  };

  // Handle policy toggle
  const handlePolicyToggle = (policy) => {
    const current = [...filters.selectedPolicies];
    if (current.includes(policy)) {
      dispatch(setSelectedPolicies(current.filter(p => p !== policy)));
    } else {
      dispatch(setSelectedPolicies([...current, policy]));
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Price Range */}
      <div>
        <h3 className="font-bold text-gray-900 mb-4">Price Range</h3>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Min: ₹{priceRange[0]}</span>
            <span className="text-sm text-gray-600">Max: ₹{priceRange[1]}</span>
          </div>
          <input
            type="range"
            min={dynamicFilters?.minPrice || 0}
            max={dynamicFilters?.maxPrice || 50000}
            value={priceRange[1]}
            onChange={(e) => handlePriceRangeChange(priceRange[0], parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Star Rating */}
      <div>
        <h3 className="font-bold text-gray-900 mb-4">Star Rating</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.selectedStarRating.includes(rating)}
                onChange={() => handleStarRatingToggle(rating)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-700">
                {Array(rating).fill('★').join('')} & above
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Guest Rating */}
      <div>
        <h3 className="font-bold text-gray-900 mb-4">Guest Rating</h3>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">{guestRating}+</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={guestRating}
            onChange={(e) => handleGuestRatingChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Property Type */}
      {dynamicFilters?.propertyTypes?.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 mb-4">Property Type</h3>
          <div className="space-y-2">
            {dynamicFilters.propertyTypes.slice(0, 5).map((type) => (
              <label key={type} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.selectedPropertyTypes.includes(type)}
                  onChange={() => handlePropertyTypeToggle(type)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Meal Basis */}
      {dynamicFilters?.mealBasis?.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 mb-4">Meal Basis</h3>
          <div className="space-y-2">
            {dynamicFilters.mealBasis.slice(0, 5).map((basis) => (
              <label key={basis} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.selectedPopularWith.includes(basis)}
                  onChange={() => handleMealBasisToggle(basis)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700">{basis}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Clear All Filters Button */}
      <button
        onClick={() => {
          dispatch(setPriceRange([dynamicFilters?.minPrice || 0, dynamicFilters?.maxPrice || 50000]));
          dispatch(setGuestRating(7));
          dispatch(setSelectedStarRating([]));
          dispatch(setSelectedNeighborhoods([]));
          dispatch(setSelectedPropertyTypes([]));
          dispatch(setSelectedPopularWith([]));
          dispatch(setSelectedAmenities([]));
          dispatch(setSelectedPolicies([]));
        }}
        className="w-full py-2 text-center text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default HotelFilterSidebar;