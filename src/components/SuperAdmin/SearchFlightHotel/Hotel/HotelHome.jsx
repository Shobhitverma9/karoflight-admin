// Admin/src/components/SearchFlightHotel/HotelHome.jsx

import React, { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  ChevronDown,
  Filter,
  Check,
  X,
} from "lucide-react";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import {
  setUiSearch,
  setUiFilters,
  updateSearchQuery,
  updateRoomInfo,
  addRoom as addRoomAction,
  setCity,
  setCheckinDate,
  setCheckoutDate,
  searchHotels,
} from "../../../../features/slices/HotelSearch";
import { cities } from "../../../../Data/citiesAndNationalities";

const HotelHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state selectors
  const { uiSearch, uiFilters, searchQuery, hotels, loading, error } =
    useSelector((state) => state.hotelSearch);

  const [showFilters, setShowFilters] = React.useState(false);
  const [showGuestPicker, setShowGuestPicker] = React.useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowGuestPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // City Search Component - UPDATED VERSION
  const CitySearch = ({ value, onChange, placeholder, label }) => {
    const [searchTerm, setSearchTerm] = React.useState(value);
    const [showDropdown, setShowDropdown] = React.useState(false);
    const [filteredCities, setFilteredCities] = React.useState(cities); // Show all cities by default
    const cityDropdownRef = useRef(null);

    useEffect(() => {
      setSearchTerm(value);
    }, [value]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          cityDropdownRef.current &&
          !cityDropdownRef.current.contains(event.target)
        ) {
          setShowDropdown(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter cities based on search term
    const handleSearch = (term) => {
      setSearchTerm(term);

      if (term.length >= 1) {
        const filtered = cities
          .filter((city) => {
            const searchLower = term.toLowerCase();
            return (
              city.cityName.toLowerCase().includes(searchLower) ||
              city.countryName.toLowerCase().includes(searchLower)
            );
          })
          .slice(0, 10); // Limit to 10 results

        setFilteredCities(filtered);
        setShowDropdown(true);
      } else if (term === "") {
        // Show all cities when input is empty
        setFilteredCities(cities);
        setShowDropdown(true);
      } else {
        setFilteredCities([]);
        setShowDropdown(false);
      }
    };

    // Select a city
    const handleSelect = (city) => {
      const formattedValue = `${city.cityName}, ${city.countryName}`;
      setSearchTerm(formattedValue);
      onChange(formattedValue, city.city);
      setShowDropdown(false);
    };

    // Show dropdown on focus
    const handleFocus = () => {
      if (filteredCities.length > 0) {
        setShowDropdown(true);
      }
    };

    return (
      <div ref={cityDropdownRef} className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={handleFocus}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition hover:border-blue-400"
          />
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
        </div>

        {/* Dropdown - UPDATED DESIGN */}
        {showDropdown && filteredCities.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-blue-200 rounded-lg shadow-xl z-50 overflow-hidden">
            {/* Header */}
            <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
              <h3 className="font-semibold text-blue-800 text-sm">
                POPULAR DESTINATIONS
              </h3>
            </div>

            {/* Cities List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredCities.map((city, index) => (
                <div
                  key={index}
                  onClick={() => handleSelect(city)}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors group"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <MapPin className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900 group-hover:text-blue-800 transition-colors">
                            {city.cityName}
                          </div>
                          <div className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">
                            {city.countryName}
                          </div>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400 transform rotate-270 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            {filteredCities.length === cities.length && (
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  Showing {filteredCities.length} popular destinations
                </p>
              </div>
            )}
          </div>
        )}

        {/* No results */}
        {showDropdown &&
          searchTerm.length >= 1 &&
          filteredCities.length === 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 text-gray-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No destinations found</p>
                <p className="text-gray-400 text-xs mt-1">
                  Try a different search term
                </p>
              </div>
            </div>
          )}
      </div>
    );
  };

  // Update UI search data
  const updateUiSearch = (field, value, cityCode = null) => {
    dispatch(setUiSearch({ [field]: value }));

    // Also update TripJack searchQuery
    if (field === "location" && cityCode) {
      dispatch(setCity(cityCode));
    } else if (field === "checkIn") {
      dispatch(setCheckinDate(value));
    } else if (field === "checkOut") {
      dispatch(setCheckoutDate(value));
    }
  };

  // Handle guest change
  const handleGuestChange = (type, operation) => {
    const newValue =
      operation === "increment"
        ? uiSearch[type] + 1
        : Math.max(type === "adults" ? 1 : 0, uiSearch[type] - 1);

    dispatch(setUiSearch({ [type]: newValue }));

    // Update room info for TripJack
    if (type === "adults" || type === "children") {
      const updatedRoomInfo = searchQuery.roomInfo.map((room, idx) => {
        if (idx === 0) {
          // Update first room for now
          return {
            ...room,
            numberOfAdults: type === "adults" ? newValue : uiSearch.adults,
            numberOfChild: type === "children" ? newValue : uiSearch.children,
          };
        }
        return room;
      });
      dispatch(updateRoomInfo(updatedRoomInfo));
    }
  };

  // Add room
  const addRoom = () => {
    dispatch(setUiSearch({ rooms: uiSearch.rooms + 1 }));
    dispatch(addRoomAction());
  };

  // Get guest summary
  const getGuestSummary = () => {
    return `${uiSearch.adults + uiSearch.children} Guests - ${
      uiSearch.rooms
    } Room${uiSearch.rooms > 1 ? "s" : ""}`;
  };

  // Handle filter toggle
  const handleFilterToggle = (category, key) => {
    const newFilters = {
      ...uiFilters,
      [category]: {
        ...uiFilters[category],
        [key]: !uiFilters[category][key],
      },
    };
    dispatch(setUiFilters(newFilters));
  };

  // Build search payload
  const buildSearchPayload = () => {
    const selectedRatings = Object.entries(uiFilters.starRating)
      .filter(([_, isSelected]) => isSelected)
      .map(([rating, _]) => parseInt(rating));

    return {
      checkinDate: searchQuery.checkinDate,
      checkoutDate: searchQuery.checkoutDate,
      roomInfo: searchQuery.roomInfo,
      searchCriteria: {
        city: searchQuery.searchCriteria.city,
        nationality: "106", // India
        currency: "INR",
      },
      searchPreferences: {
        ratings: selectedRatings.length > 0 ? selectedRatings : [3, 4, 5], // Default to 3,4,5 if none selected
        fsc: true,
      },
    };
  };

  // Handle search
  const handleSearch = async () => {
    // Validation
    if (!uiSearch.location || !uiSearch.checkIn || !uiSearch.checkOut) {
      alert("Please fill all required fields");
      return;
    }

    if (!searchQuery.searchCriteria.city) {
      alert("Please select a valid city from the dropdown");
      return;
    }

    const searchPayload = buildSearchPayload();

    console.log("Search Payload:", searchPayload);

    try {
      const result = await dispatch(searchHotels(searchPayload)).unwrap();
      console.log("Search Result:", result);

      // Navigate to results page
      navigate("/hotel-search-results", {
        state: {
          searchParams: {
            location: uiSearch.location,
            checkIn: uiSearch.checkIn,
            checkOut: uiSearch.checkOut,
            adults: uiSearch.adults,
            children: uiSearch.children,
            rooms: uiSearch.rooms,
            filters: uiFilters,
          },
        },
      });
    } catch (err) {
      console.error("Search error:", err);
      alert("Hotel search failed. Please try again.");
    }
  };

  // Set default dates (today and tomorrow)
  React.useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    if (!uiSearch.checkIn) {
      updateUiSearch("checkIn", formatDate(today));
    }
    if (!uiSearch.checkOut) {
      updateUiSearch("checkOut", formatDate(tomorrow));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Where - Using UPDATED CitySearch */}
            <div className="lg:col-span-3">
              <CitySearch
                value={uiSearch.location}
                onChange={(value, cityCode) =>
                  updateUiSearch("location", value, cityCode)
                }
                placeholder="City, area, or landmark"
                label="Where"
              />
            </div>

            {/* Check-in */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-in
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={uiSearch.checkIn}
                  onChange={(e) => updateUiSearch("checkIn", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition hover:border-blue-400"
                  min={new Date().toISOString().split("T")[0]}
                />
                {/* <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" /> */}
              </div>
            </div>

            {/* Check-out */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-out
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={uiSearch.checkOut}
                  onChange={(e) => updateUiSearch("checkOut", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition hover:border-blue-400"
                  min={
                    uiSearch.checkIn || new Date().toISOString().split("T")[0]
                  }
                />
                {/* <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" /> */}
              </div>
            </div>

            {/* Guests & Rooms */}
            <div className="lg:col-span-3 relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guests & Rooms
              </label>
              <button
                onClick={() => setShowGuestPicker(!showGuestPicker)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left flex items-center justify-between focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:bg-gray-50 transition hover:border-blue-400"
              >
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-gray-700">{getGuestSummary()}</span>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>

              {/* Guest Picker Dropdown */}
              {showGuestPicker && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-6 min-w-[320px]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">
                      Guests & Rooms
                    </h3>
                    <button
                      onClick={() => setShowGuestPicker(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Room 1 (Always visible) */}
                  <div className="mb-6">
                    <div className="flex items-center mb-4 text-blue-500">
                      <div className="w-5 h-5 mr-2">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-6v7H3V6H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" />
                        </svg>
                      </div>
                      <span className="font-medium">Room 1</span>
                    </div>

                    {/* Adults */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">
                            Adults
                          </div>
                          <div className="text-sm text-gray-500">Ages 18+</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            handleGuestChange("adults", "decrement")
                          }
                          disabled={uiSearch.adults <= 1}
                          className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-colors ${
                            uiSearch.adults <= 1
                              ? "border-gray-200 text-gray-300 cursor-not-allowed"
                              : "border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600"
                          }`}
                        >
                          <AiOutlineMinus size={14} />
                        </button>
                        <span className="text-base font-semibold text-gray-900 w-8 text-center">
                          {uiSearch.adults}
                        </span>
                        <button
                          onClick={() =>
                            handleGuestChange("adults", "increment")
                          }
                          className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors"
                        >
                          <AiOutlinePlus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-5 h-5 mr-3 text-gray-400">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm10 0c.83 0 1.5-.67 1.5-1.5S17.83 8 17 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-5 6c2.33 0 4.32-1.45 5.12-3.5h-1.67c-.69 1.19-1.97 2-3.45 2s-2.75-.81-3.45-2H6.88c.8 2.05 2.79 3.5 5.12 3.5z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            Children
                          </div>
                          <div className="text-sm text-gray-500">Ages 0-17</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            handleGuestChange("children", "decrement")
                          }
                          disabled={uiSearch.children <= 0}
                          className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-colors ${
                            uiSearch.children <= 0
                              ? "border-gray-200 text-gray-300 cursor-not-allowed"
                              : "border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600"
                          }`}
                        >
                          <AiOutlineMinus size={14} />
                        </button>
                        <span className="text-base font-semibold text-gray-900 w-8 text-center">
                          {uiSearch.children}
                        </span>
                        <button
                          onClick={() =>
                            handleGuestChange("children", "increment")
                          }
                          className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors"
                        >
                          <AiOutlinePlus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Add Another Room */}
                  <button
                    onClick={addRoom}
                    className="w-full py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-500 font-medium hover:bg-blue-50 mb-4 transition-colors"
                  >
                    + Add Another Room
                  </button>

                  {/* Done Button */}
                  <button
                    onClick={() => setShowGuestPicker(false)}
                    className="w-full py-3 bg-blue-800 text-white rounded-lg font-semibold hover:bg-blue-900 flex items-center justify-center transition-colors"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* Search Button */}
            <div className="lg:col-span-12 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-8 py-3 bg-blue-800 text-white rounded-lg font-semibold hover:bg-blue-900 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Searching...
                      </>
                    ) : (
                      "Search Hotels"
                    )}
                  </button>

                  {/* Filters Toggle Button */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition hover:border-blue-400"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                    <ChevronDown
                      className={`w-4 h-4 transform transition-transform ${
                        showFilters ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Filter Hotels
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Star Rating Filter */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Star Rating</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(uiFilters.starRating).map(
                  ([rating, isSelected]) => {
                    const ratingNum = parseInt(rating);
                    const stars = Array(ratingNum).fill("★").join("");
                    return (
                      <button
                        key={rating}
                        onClick={() => handleFilterToggle("starRating", rating)}
                        className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition ${
                          isSelected
                            ? "bg-blue-50 border-blue-500 text-blue-700"
                            : "bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        <span className="text-yellow-500">{stars}</span>
                        <span>
                          {rating} Star{ratingNum > 1 ? "s" : ""}
                        </span>
                        {isSelected && <Check className="w-4 h-4" />}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Amenities Filter */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(uiFilters.amenities).map(
                  ([amenity, isSelected]) => {
                    const label =
                      amenity === "freeCancellation"
                        ? "Free Cancellation"
                        : "Breakfast Included";
                    return (
                      <button
                        key={amenity}
                        onClick={() => handleFilterToggle("amenities", amenity)}
                        className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition ${
                          isSelected
                            ? "bg-blue-50 border-blue-500 text-blue-700"
                            : "bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {label}
                        {isSelected && <Check className="w-4 h-4" />}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Special Deals Filter */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Special Deals</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(uiFilters.specialDeals).map(
                  ([deal, isSelected]) => (
                    <button
                      key={deal}
                      onClick={() => handleFilterToggle("specialDeals", deal)}
                      className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition ${
                        isSelected
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {deal === "dealsTonight" ? "Deals Tonight" : deal}
                      {isSelected && <Check className="w-4 h-4" />}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Apply Filters Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-800 text-white rounded-lg font-medium hover:bg-blue-900 transition shadow-sm hover:shadow"
              >
                Apply Filters & Search
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Stay
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing hotels with the best prices. Book now and enjoy
            exclusive deals!
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800 mb-4"></div>
            <p className="text-gray-600">Searching for hotels...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-2xl mx-auto">
            <div className="text-red-500 mb-3">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Search Failed
            </h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={handleSearch}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Search Results Preview */}
        {hotels.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Search Results ({hotels.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.slice(0, 6).map((hotel) => (
                <div
                  key={hotel.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 bg-gray-200 relative">
                    {hotel.image ? (
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400">
                          No image available
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-blue-800 text-white px-3 py-1 rounded-full text-sm font-medium">
                      ★ {hotel.rating.toFixed(1)}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 truncate">
                      {hotel.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 truncate">
                      {hotel.address}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-blue-800">
                          ₹{hotel.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500"> / night</span>
                      </div>
                      // Change it to:
                      <button
                        onClick={() => {
                          const hotelNameForUrl = hotel.name
                            .split(/\s{2,}/)[0]
                            .trim()
                            .replace(/\s+/g, "-")
                            .replace(/-+/g, "-")
                            .toLowerCase();
                          navigate(`/hotel/${hotelNameForUrl}/${hotel.id}`, {
                            state: { hotel },
                          });
                        }}
                        className="px-4 py-2 bg-blue-800 text-white text-sm font-medium rounded-lg hover:bg-blue-900 transition"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {hotels.length > 6 && (
              <div className="text-center mt-8">
                <button
                  onClick={() => navigate("/hotel-search-results")}
                  className="px-6 py-3 bg-blue-800 text-white rounded-lg font-medium hover:bg-blue-900 transition"
                >
                  View All {hotels.length} Hotels
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty State - When no search has been made */}
        {!loading && !error && hotels.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 mb-6 text-gray-300">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.5,19.5h-19c-0.276,0-0.5,0.224-0.5,0.5s0.224,0.5,0.5,0.5h19c0.276,0,0.5-0.224,0.5-0.5S21.776,19.5,21.5,19.5z" />
                <path d="M19.5,2.5h-15c-0.276,0-0.5,0.224-0.5,0.5v14c0,0.276,0.224,0.5,0.5,0.5h15c0.276,0,0.5-0.224,0.5-0.5V3C20,2.724,19.776,2.5,19.5,2.5zM19,17H5V3.5h14V17z" />
                <circle cx="7" cy="7" r="1.5" />
                <path d="M14.5,8c-0.828,0-1.5-0.672-1.5-1.5S13.672,5,14.5,5S16,5.672,16,6.5S15.328,8,14.5,8z M14.5,6c-0.276,0-0.5,0.224-0.5,0.5S14.224,7,14.5,7S15,6.776,15,6.5S14.776,6,14.5,6z" />
                <path d="M8.646,10.354l-1.5-1.5C7.052,8.756,7.026,8.632,7.026,8.5s0.026-0.256,0.121-0.354C7.244,8.052,7.368,8.026,7.5,8.026s0.256,0.026,0.354,0.121l1.5,1.5c0.094,0.098,0.121,0.222,0.121,0.354s-0.026,0.256-0.121,0.354C9.244,10.948,9.12,10.974,8.988,10.974S8.732,10.948,8.646,10.354z" />
                <path d="M14.646,12.354l-5-5C9.552,7.256,9.526,7.132,9.526,7s0.026-0.256,0.121-0.354c0.098-0.094,0.222-0.121,0.354-0.121s0.256,0.026,0.354,0.121l5,5c0.094,0.098,0.121,0.222,0.121,0.354s-0.026,0.256-0.121,0.354C14.902,12.552,14.778,12.578,14.646,12.354z" />
                <path d="M9.646,12.354l-2-2C7.552,10.256,7.526,10.132,7.526,10s0.026-0.256,0.121-0.354c0.098-0.094,0.222-0.121,0.354-0.121s0.256,0.026,0.354,0.121l2,2c0.094,0.098,0.121,0.222,0.121,0.354s-0.026,0.256-0.121,0.354C10.158,12.448,10.034,12.474,9.902,12.474S9.646,12.448,9.646,12.354z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Ready to Find Your Perfect Hotel?
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Enter your destination, travel dates, and guests to discover
              amazing hotel deals.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelHome;