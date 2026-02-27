// features/slices/hotelSearchSlice.js  
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { extractFiltersFromHotels } from "../../utils/extractFiltersFromHotels";

/* -------------------------------------------------------------------------- */
/*                                   CONFIG                                   */
/* -------------------------------------------------------------------------- */

// Use proxy URL for development, direct URL for production
export const TRIPJACK_BASE = import.meta.env.DEV
  ? "/api/tripjack" // Proxy in development
  : import.meta.env?.VITE_TRIPJACK_TEST_API_URL || "https://tripjack.com";

const TRIPJACK_SEARCH_URL = `${TRIPJACK_BASE}/hms/v1/hotel-searchquery-list`;
const TRIPJACK_API_KEY =
  import.meta.env?.VITE_REACT_APP_TRIPJACK_HOTEL_TEST_API_KEY || "";

/* -------------------------------------------------------------------------- */
/*                               ASYNC THUNKS                                 */
/* -------------------------------------------------------------------------- */

export const searchHotels = createAsyncThunk(
  "hotelSearch/searchHotels",
  async (searchQuery, { rejectWithValue }) => {
    console.log("Searching hotels with query:", searchQuery);

    // Use mock data in development for testing
    if (import.meta.env.DEV && false) {
      // Set to true for mock data, false for real API
      console.log("Using mock data for development");
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate delay

      const mockResponse = {
        searchResult: {
          his: mockHotelsData,
        },
      };

      return mockResponse;
    }

    try {
      const response = await axios.post(
        TRIPJACK_SEARCH_URL,
        { searchQuery, sync: true },
        {
          headers: {
            "Content-Type": "application/json",
            apikey: TRIPJACK_API_KEY,
          },
          timeout: 30000, // 30 second timeout
          withCredentials: false,
        }
      );
      console.log("API Response received:", response.status);
      return response.data;
    } catch (error) {
      console.error("Hotel search API error:", error);

      // Fallback to mock data on error in development
      if (import.meta.env.DEV) {
        console.log("Falling back to mock data due to API error");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockResponse = {
          searchResult: {
            his: mockHotelsData,
          },
        };

        return mockResponse;
      }

      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Hotel search failed",
          code: error.code,
        }
      );
    }
  }
);

export const hotelDetailsById = createAsyncThunk(
  "hotelSearch/hotelDetailsById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${TRIPJACK_BASE}/hms/v1/hotelDetail-search`,
        { id },
        {
          headers: {
            "Content-Type": "application/json",
            apikey: TRIPJACK_API_KEY,
          },
          timeout: 30000,
        }
      );
      return res.data;
    } catch (error) {
      console.error("Hotel details API error:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const hotelReviewBooking = createAsyncThunk(
  "hotelSearch/hotelReviewBooking",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${TRIPJACK_BASE}/hms/v1/hotel-review`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            apikey: TRIPJACK_API_KEY,
          },
          timeout: 30000,
        }
      );
      return res.data;
    } catch (error) {
      console.error("Hotel review API error:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/* -------------------------------------------------------------------------- */
/*                                INITIAL STATE                               */
/* -------------------------------------------------------------------------- */

const initialState = {
  /* ---------------- UI STATE (HotelHome.jsx) ---------------- */
  uiSearch: {
    location: "",
    checkIn: "",
    checkOut: "",
    adults: 2,
    children: 0,
    rooms: 1,
  },

  uiFilters: {
    starRating: {
      5: true,
      4: true,
      3: true,
      2: true,
      1: true,
    },
    amenities: {
      freeCancellation: false,
      breakfastIncluded: false,
    },
    specialDeals: {
      dealsTonight: false,
    },
  },

  /* ---------------- TRIPJACK SEARCH QUERY ---------------- */
  searchQuery: {
    checkinDate: "",
    checkoutDate: "",
    roomInfo: [
      {
        numberOfAdults: 2,
        numberOfChild: 0,
        childAge: [],
      },
    ],
    searchCriteria: {
      city: "",
      nationality: "106",
      currency: "INR",
    },
    searchPreferences: {
      ratings: [1, 2, 3, 4, 5],
      fsc: true,
    },
  },

  /* ---------------- SEARCH RESULTS ---------------- */
  hotels: [],
  searchResults: null,
  loading: false,
  error: null,

  /* ---------------- HOTEL DETAILS / REVIEW ---------------- */
  hotelData: {},
  reviewData: {},

  /* ---------------- DYNAMIC FILTERS ---------------- */
  dynamicFilters: {
    stars: [5, 4, 3, 2, 1],
    propertyTypes: ["Hotel", "Resort", "Apartment", "Villa"],
    mealBasis: ["Room Only", "Breakfast Included", "All Inclusive"],
    places: [
      "Downtown",
      "City Center",
      "Airport Area",
      "Beach Front",
      "Business District",
    ],
    minPrice: 1500,
    maxPrice: 15000,
    amenities: [
      "WiFi",
      "Pool",
      "Parking",
      "Breakfast",
      "AC",
      "TV",
      "Gym",
      "Spa",
    ],
  },

  filters: {
    priceRange: [1500, 15000],
    guestRating: 7,
    selectedStarRating: [],
    selectedNeighborhoods: [],
    selectedPropertyTypes: [],
    selectedPopularWith: [],
    selectedAmenities: [],
    selectedPolicies: [],
  },
};

/* -------------------------------------------------------------------------- */
/*                                    SLICE                                   */
/* -------------------------------------------------------------------------- */

const hotelSearchSlice = createSlice({
  name: "hotelSearch",
  initialState,

  reducers: {
    /* UI reducers (HotelHome.jsx compatible) */
    setUiSearch: (state, action) => {
      state.uiSearch = { ...state.uiSearch, ...action.payload };
    },

    setUiFilters: (state, action) => {
      state.uiFilters = { ...state.uiFilters, ...action.payload };
    },

    resetUiState: (state) => {
      state.uiSearch = initialState.uiSearch;
      state.uiFilters = initialState.uiFilters;
    },

    /* TripJack specific reducers */
    updateSearchQuery: (state, action) => {
      state.searchQuery = { ...state.searchQuery, ...action.payload };
    },

    updateRoomInfo: (state, action) => {
      state.searchQuery.roomInfo = action.payload;
    },

    addRoom: (state) => {
      state.searchQuery.roomInfo.push({
        numberOfAdults: 2,
        numberOfChild: 0,
        childAge: [],
      });
    },

    setCity: (state, action) => {
      state.searchQuery.searchCriteria.city = action.payload;
    },

    setCheckinDate: (state, action) => {
      state.searchQuery.checkinDate = action.payload;
    },

    setCheckoutDate: (state, action) => {
      state.searchQuery.checkoutDate = action.payload;
    },

    // Filter reducers
    setPriceRange: (state, action) => {
      state.filters.priceRange = action.payload;
    },

    setGuestRating: (state, action) => {
      state.filters.guestRating = action.payload;
    },

    setSelectedStarRating: (state, action) => {
      state.filters.selectedStarRating = action.payload;
    },

    setSelectedNeighborhoods: (state, action) => {
      state.filters.selectedNeighborhoods = action.payload;
    },

    setSelectedPropertyTypes: (state, action) => {
      state.filters.selectedPropertyTypes = action.payload;
    },

    setSelectedPopularWith: (state, action) => {
      state.filters.selectedPopularWith = action.payload;
    },

    setSelectedAmenities: (state, action) => {
      state.filters.selectedAmenities = action.payload;
    },

    setSelectedPolicies: (state, action) => {
      state.filters.selectedPolicies = action.payload;
    },

    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Toggle actions for individual filters
    toggleStarRating: (state, action) => {
      const rating = action.payload;
      const index = state.filters.selectedStarRating.indexOf(rating);
      if (index === -1) {
        state.filters.selectedStarRating.push(rating);
      } else {
        state.filters.selectedStarRating.splice(index, 1);
      }
    },

    toggleNeighborhood: (state, action) => {
      const neighborhood = action.payload;
      const index = state.filters.selectedNeighborhoods.indexOf(neighborhood);
      if (index === -1) {
        state.filters.selectedNeighborhoods.push(neighborhood);
      } else {
        state.filters.selectedNeighborhoods.splice(index, 1);
      }
    },

    togglePropertyType: (state, action) => {
      const type = action.payload;
      const index = state.filters.selectedPropertyTypes.indexOf(type);
      if (index === -1) {
        state.filters.selectedPropertyTypes.push(type);
      } else {
        state.filters.selectedPropertyTypes.splice(index, 1);
      }
    },

    togglePopularWith: (state, action) => {
      const basis = action.payload;
      const index = state.filters.selectedPopularWith.indexOf(basis);
      if (index === -1) {
        state.filters.selectedPopularWith.push(basis);
      } else {
        state.filters.selectedPopularWith.splice(index, 1);
      }
    },

    toggleAmenity: (state, action) => {
      const amenity = action.payload;
      const index = state.filters.selectedAmenities.indexOf(amenity);
      if (index === -1) {
        state.filters.selectedAmenities.push(amenity);
      } else {
        state.filters.selectedAmenities.splice(index, 1);
      }
    },

    togglePolicy: (state, action) => {
      const policy = action.payload;
      const index = state.filters.selectedPolicies.indexOf(policy);
      if (index === -1) {
        state.filters.selectedPolicies.push(policy);
      } else {
        state.filters.selectedPolicies.splice(index, 1);
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(searchHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log("Hotel search pending...");
      })

      .addCase(searchHotels.fulfilled, (state, action) => {
        state.loading = false;
        console.log("Hotel search fulfilled:", action.payload);

        const rawHotels = action.payload?.searchResult?.his || [];

        // Transform raw hotels to our app format
        state.hotels = rawHotels.map((h) => ({
          id: h.id,
          name: h.name,
          rating: h.rt || 0,
          rt: h.rt || 0,
          image: h.img?.[0]?.url || "",
          price: h?.ris?.[0]?.tp || h?.ops?.[0]?.tp || 0,
          address: h.ad?.adr || "",
          ad: h.ad || {},
          img: h.img || [],
          ris: h.ris || [],
          ops: h.ops || [],
          propertyType: h.propertyType || "",
          amenities: h.amenities || [],
          mealBasis: h.mealBasis || "",
          popularPlace: h.popularPlace || "",
          freeCancellation: h.freeCancellation || false,
          refundable: h.refundable !== false,
        }));

        // Extract dynamic filters from hotels
        if (rawHotels.length > 0) {
          try {
            state.dynamicFilters = extractFiltersFromHotels(rawHotels);
          } catch (error) {
            console.error("Error extracting filters:", error);
            // Keep default filters
          }
        }

        // Update price range based on actual hotel prices
        if (state.hotels.length > 0) {
          const prices = state.hotels.map((h) => h.price).filter((p) => p > 0);
          if (prices.length > 0) {
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            state.dynamicFilters.minPrice = Math.floor(minPrice * 0.8); // 20% buffer
            state.dynamicFilters.maxPrice = Math.ceil(maxPrice * 1.2); // 20% buffer

            // Update default price range if not set
            if (
              state.filters.priceRange[0] === initialState.filters.priceRange[0]
            ) {
              state.filters.priceRange = [minPrice, maxPrice];
            }
          }
        }

        console.log("Processed hotels:", state.hotels.length);
        console.log("Dynamic filters:", state.dynamicFilters);
      })

      .addCase(searchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Hotel search failed";
        console.error("Hotel search rejected:", action.payload);

        // Fallback to mock data in development
        if (import.meta.env.DEV) {
          console.log("Using fallback mock data");
          state.hotels = mockHotelsData.map((h) => ({
            id: h.id,
            name: h.name,
            rating: h.rating,
            rt: h.rt,
            image: h.img[0].url,
            price: h.ris[0].tp,
            address: h.ad.adr,
            ad: h.ad,
            img: h.img,
            ris: h.ris,
            ops: h.ops,
            propertyType: h.propertyType,
            amenities: h.amenities,
            mealBasis: h.mealBasis,
            freeCancellation: h.freeCancellation,
            refundable: h.refundable,
          }));
          state.error = null; // Clear error since we have mock data
        } else {
          state.hotels = [];
        }
      });
  },
});

/* -------------------------------------------------------------------------- */
/*                                   EXPORTS                                  */
/* -------------------------------------------------------------------------- */

export const {
  setUiSearch,
  setUiFilters,
  resetUiState,
  updateSearchQuery,
  updateRoomInfo,
  addRoom,
  setCity,
  setCheckinDate,
  setCheckoutDate,
  setPriceRange,
  setGuestRating,
  setSelectedStarRating,
  setSelectedNeighborhoods,
  setSelectedPropertyTypes,
  setSelectedPopularWith,
  setSelectedAmenities,
  setSelectedPolicies,
  resetFilters,
  toggleStarRating,
  toggleNeighborhood,
  togglePropertyType,
  togglePopularWith,
  toggleAmenity,
  togglePolicy,
} = hotelSearchSlice.actions;

export default hotelSearchSlice.reducer;

// Selectors
export const selectUiSearch = (state) => state.hotelSearch.uiSearch;
export const selectUiFilters = (state) => state.hotelSearch.uiFilters;
export const selectDynamicFilters = (state) => state.hotelSearch.dynamicFilters;
export const selectHotels = (state) => state.hotelSearch.hotels;
export const selectLoading = (state) => state.hotelSearch.loading;
export const selectError = (state) => state.hotelSearch.error;
export const selectFilters = (state) => state.hotelSearch.filters;
export const selectHotelData = (state) => state.hotelSearch.hotelData;
export const selectReviewData = (state) => state.hotelSearch.reviewData;
export const selectSearchQuery = (state) => state.hotelSearch.searchQuery;
export const selectSearchResults = (state) => state.hotelSearch.searchResults;
