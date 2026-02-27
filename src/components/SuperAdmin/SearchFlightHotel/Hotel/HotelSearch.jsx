// Admin/src/components/SearchFlightHotel/HotelSearch.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  searchHotels,
  selectSearchQuery,
  selectHotels,
  selectLoading,
  selectError,
  selectFilters,
} from "../../../../features/slices/HotelSearch.js";

import { FaTh, FaBars } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";

import HotelFilterSidebar from "./HotelFilterSidebar.jsx";
import HotelCard from "./HotelCards.jsx";
import { getCityName, formatDisplayDate } from "../../../../utils/displayHelpers.js";

const HotelSearchResult = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchQuery = useSelector(selectSearchQuery);
  const hotels = useSelector(selectHotels) || [];
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const filters = useSelector(selectFilters);
  const [visibleCount, setVisibleCount] = useState(10);

  const [view, setView] = useState("grid");
  const [sortBy, setSortBy] = useState("popular");

  // re-fetch if page loaded/refresh
  useEffect(() => {
    if (
      hotels.length === 0 &&
      searchQuery?.searchCriteria?.city &&
      searchQuery?.checkinDate &&
      searchQuery?.checkoutDate
    ) {
      const payload = {
        checkinDate: searchQuery.checkinDate,
        checkoutDate: searchQuery.checkoutDate,
        roomInfo: searchQuery.roomInfo,
        searchCriteria: searchQuery.searchCriteria,
        searchPreferences: searchQuery.searchPreferences,
      };
      dispatch(searchHotels(payload));
    }
  }, [dispatch, hotels.length, searchQuery]);

  // nights calculation
  const nights = useMemo(() => {
    if (!searchQuery?.checkinDate || !searchQuery?.checkoutDate) return 1;
    const [d1, m1, y1] = searchQuery.checkinDate.split("-");
    const [d2, m2, y2] = searchQuery.checkoutDate.split("-");
    const start = new Date(y1, m1 - 1, d1);
    const end = new Date(y2, m2 - 1, d2);
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [searchQuery]);

  // client-side filtering
  const filteredHotels = useMemo(() => {
    if (!hotels) return [];

    const result = hotels.filter((h) => {
      const price = Number(h.price || 0);

      // price range
      if (price < filters.priceRange[0] || price > filters.priceRange[1])
        return false;

      // star rating
      if (
        filters.selectedStarRating?.length > 0 &&
        !filters.selectedStarRating.includes(Math.round(h.rating || 0))
      )
        return false;

      // property type
      if (
        filters.selectedPropertyTypes?.length > 0 &&
        h.propertyType &&
        !filters.selectedPropertyTypes.includes(h.propertyType)
      )
        return false;

      return true;
    });

    // sorting
    const sorted = result.slice();
    if (sortBy === "price_low") {
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price_high") {
      sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "rating") {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return sorted;
  }, [hotels, filters, sortBy]);
  
  const cheapestPrice = useMemo(() => {
    if (!filteredHotels || filteredHotels.length === 0) return 0;
    return Math.min(...filteredHotels.map((h) => Number(h?.price || 1e9)));
  }, [filteredHotels]);

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      {/* HEADER */}
      <div className="bg-white py-4 shadow-sm border-b border-gray-200 sticky top-0 z-5">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap gap-4 justify-between items-center">
          <div className="flex items-center gap-3">
            <IoLocationOutline size={20} className="text-orange-500" />
            <div>
              <div className="text-sm text-gray-700 font-semibold">
                {getCityName(searchQuery?.searchCriteria?.city)}
              </div>
              <div className="text-xs text-gray-500">
                {formatDisplayDate(searchQuery?.checkinDate)} →{" "}
                {formatDisplayDate(searchQuery?.checkoutDate)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">
                {filteredHotels.length}
              </span>{" "}
              hotels found
            </div>

            <div className="text-sm text-gray-600">
              Cheapest from{" "}
              <span className="font-semibold text-green-600">
                ₹{cheapestPrice ? cheapestPrice.toLocaleString() : "—"}
              </span>
            </div>

            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2">
              <label className="text-xs text-gray-600 mr-2">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm outline-none px-2 py-1 bg-transparent"
              >
                <option value="popular">Most Popular</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2">
              <button
                onClick={() => setView("grid")}
                className={`p-2 rounded ${
                  view === "grid" ? "bg-gray-100" : ""
                }`}
                title="Grid"
              >
                <FaTh />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-2 rounded ${
                  view === "list" ? "bg-gray-100" : ""
                }`}
                title="List"
              >
                <FaBars />
              </button>
            </div>

            <button
              onClick={() => navigate("/hotel-home")}
              className="bg-[#F97415] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#e86b11]"
            >
              Modify Search
            </button>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="flex overflow-hidden max-w-7xl mx-auto mt-10">
        {/* Sidebar */}
        <div
          className="hidden lg:block w-auto overflow-y-auto bg-white"
          style={{ height: "calc(100vh - 80px)" }}
        >
          <HotelFilterSidebar />
        </div>

        {/* Results */}
        <div
          className="flex-1 overflow-y-auto p-6"
          style={{ height: "calc(100vh - 80px)" }}
        >
          {/* top controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold">
              {filteredHotels.length} results
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div>
                Showing {filteredHotels.length} hotels for{" "}
                {getCityName(searchQuery?.searchCriteria?.city)}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin h-10 w-10 border-b-2 border-orange-500 rounded-full mx-auto"></div>
            </div>
          )}

          {!loading && filteredHotels.length === 0 && (
            <p className="text-gray-500 text-lg">No hotels found.</p>
          )}

          {!loading && filteredHotels.length > 0 && (
            <>
              <div
                className={`${
                  view === "grid" ? "grid grid-cols-1 gap-6" : "space-y-4"
                }`}
              >
                {filteredHotels.slice(0, visibleCount).map((hotel, i) => (
                  <div key={hotel?.id || i}>
                    <HotelCard hotel={hotel} nights={nights} view={view} />
                  </div>
                ))}
              </div>

              {/* LOAD MORE BUTTON */}
              {visibleCount < filteredHotels.length && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 5)}
                    className="px-6 py-2 bg-[#F97415] text-white rounded-lg hover:bg-[#e86b11] text-sm"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelSearchResult;