import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/axiosInterceptor";

const API_KEY =
  import.meta.env?.VITE_REACT_APP_TRIPJACK_FLIGHT_TEST_API_KEY || "";

/* -------------------------------------------------------------------------- */
/*                               ASYNC THUNKS                                  */
/* -------------------------------------------------------------------------- */

const extractCode = (val = "") => {
  const match = val.match(/\(([^)]+)\)/);
  return match ? match[1] : val;
};

export const searchFlights = createAsyncThunk(
  "flightSearch/search",
  async ({ searchParams, token }, { rejectWithValue, signal }) => {
    try {
      if (!searchParams) {
        throw new Error("searchParams is required");
      }

      const {
        tripType,
        oneWay,
        roundTrip,
        multiCity,
        travelers,
        cabinClass,
        directFlightsOnly,
      } = searchParams;

      let routeInfos = [];

      if (tripType === "oneway") {
        routeInfos = [
          {
            fromCityOrAirport: { code: extractCode(oneWay.from) },
            toCityOrAirport: { code: extractCode(oneWay.to) },

            travelDate: oneWay.date,
          },
        ];
      }

      if (tripType === "roundtrip") {
        routeInfos = [
          {
            fromCityOrAirport: { code: extractCode(roundTrip.from) },
            toCityOrAirport: { code: extractCode(roundTrip.to) },

            travelDate: roundTrip.departure,
          },
          {
            fromCityOrAirport: { code: extractCode(roundTrip.from) },
            toCityOrAirport: { code: extractCode(roundTrip.to) },

            travelDate: roundTrip.return,
          },
        ];
      }

      if (tripType === "multicity") {
        routeInfos = multiCity.map((seg) => ({
          fromCityOrAirport: { code: extractCode(seg.from) },
          toCityOrAirport: { code: extractCode(seg.to) },

          travelDate: seg.date,
        }));
      }

      const searchQuery = {
        cabinClass: cabinClass?.toUpperCase() || "ECONOMY",
        paxInfo: {
          ADULT: travelers?.adults || 1,
          CHILD: travelers?.children || 0,
          INFANT: 0,
        },
        routeInfos,
        searchModifiers: {
          isDirectFlight: !!directFlightsOnly,
          isConnectingFlight: !directFlightsOnly,
        },
      };

      const res = await api.post("/admin-search-flights/search", { searchParams }, { signal });
      const json = res.data;

      return json.data;
    } catch (err) {
      return rejectWithValue(err.message || err);
    }
  },
);

export const reviewPrices = createAsyncThunk(
  "flightSearch/reviewPrices",
  async ({ priceIds, searchParams, tripType }, { rejectWithValue }) => {
    try {
      const pax = searchParams?.travelers || {};

      const body = {
        priceIds,
        tripType:
          tripType === "round" ? "RT" : tripType === "multi" ? "MC" : "OW",
        adt: pax.adults || 1,
        chd: pax.children || 0,
        inf: 0,
        source: "B2C",
        sync: true,
      };

      const res = await api.post("/fms/v1/review", body, {
        headers: { apikey: API_KEY }
      });

      const data = res.data;
      return data;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const fetchSeatMap = createAsyncThunk(
  "flightSearch/seatMap",
  async ({ bookingId }, { rejectWithValue }) => {
    try {
      const res = await api.post("/fms/v1/seat", { bookingId }, {
        headers: { apikey: API_KEY }
      });

      const data = res.data;
      return data;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const fetchFareRules = createAsyncThunk(
  "flightSearch/fareRules",
  async ({ priceIds, tripType }, { rejectWithValue }) => {
    try {
      const body = {
        priceIds,
        flowType: "SEARCH",
        tripType:
          tripType === "round" ? "RT" : tripType === "multi" ? "MC" : "OW",
        source: "B2C",
      };

      const res = await api.post("/fms/v2/farerule", body, {
        headers: { apikey: API_KEY }
      });

      const data = res.data;
      return data;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

/* -------------------------------------------------------------------------- */
/*                                   SLICE                                    */
/* -------------------------------------------------------------------------- */

const flightSearchSlice = createSlice({
  name: "flightSearch",

  initialState: {
    /* ---------------- UI SEARCH STATE (FROM FlightHome.jsx) ---------------- */
    tripType: "oneway",

    oneWay: {
      from: "",
      to: "",
      date: "",
      nearbyFrom: false,
      nearbyTo: false,
    },

    roundTrip: {
      from: "",
      to: "",
      departure: "",
      return: "",
      nearbyFrom: false,
      nearbyTo: false,
      flexibleDates: false,
    },

    multiCity: [
      { id: 1, from: "", to: "", date: "", nearbyFrom: false, nearbyTo: false },
      { id: 2, from: "", to: "", date: "", nearbyFrom: false, nearbyTo: false },
    ],

    travelers: {
      adults: 1,
      children: 0,
    },

    cabinClass: "Economy",
    directFlightsOnly: false,

    /* ---------------- API SEARCH RESULTS ---------------- */
    data: null,
    results: [],
    status: "idle",
    error: null,

    /* ---------------- REVIEW / BOOKING ---------------- */
    review: null,
    bookingId: null,
    reviewStatus: "idle",
    reviewError: null,

    /* ---------------- SEAT MAP ---------------- */
    seatMap: null,
    seatMapStatus: "idle",
    seatMapError: null,

    /* ---------------- FARE RULES ---------------- */
    fareRules: null,
    fareRulesStatus: "idle",
    fareRulesError: null,
  },

  reducers: {
    /* UI STATE UPDATERS */
    setTripType: (state, action) => {
      state.tripType = action.payload;
    },

    setOneWayData: (state, action) => {
      state.oneWay = { ...state.oneWay, ...action.payload };
    },

    setRoundTripData: (state, action) => {
      state.roundTrip = { ...state.roundTrip, ...action.payload };
    },

    setMultiCityData: (state, action) => {
      state.multiCity = action.payload;
    },

    setTravelers: (state, action) => {
      state.travelers = action.payload;
    },

    setCabinClass: (state, action) => {
      state.cabinClass = action.payload;
    },

    setDirectFlightsOnly: (state, action) => {
      state.directFlightsOnly = action.payload;
    },

    clearFlightState: () => {
      return flightSearchSlice.getInitialState();
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(searchFlights.pending, (state) => {
        state.status = "loading";
        state.results = [];
        state.error = null;
      })
      .addCase(searchFlights.fulfilled, (state, action) => {
        state.status = "succeeded";


        // ✅ FLATTEN HERE
state.results = action.payload?.flights || [];
      })

      .addCase(searchFlights.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(reviewPrices.pending, (state) => {
        state.reviewStatus = "loading";
      })
      .addCase(reviewPrices.fulfilled, (state, action) => {
        state.reviewStatus = "succeeded";
        state.review = action.payload;
        state.bookingId = action.payload?.bookingId;
      })
      .addCase(reviewPrices.rejected, (state, action) => {
        state.reviewStatus = "failed";
        state.reviewError = action.payload;
      })

      .addCase(fetchSeatMap.fulfilled, (state, action) => {
        state.seatMap = action.payload;
        state.seatMapStatus = "succeeded";
      })

      .addCase(fetchFareRules.fulfilled, (state, action) => {
        state.fareRules = action.payload;
        state.fareRulesStatus = "succeeded";
      });
  },
});
/* -------------------------------------------------------------------------- */
/*                                   SELECTORS                                */
/* -------------------------------------------------------------------------- */

export const selectFlightSearchResults = (state) => state.flightSearch.results;

export const selectFlightSearchStatus = (state) => state.flightSearch.status;

export const selectFlightSearchError = (state) => state.flightSearch.error;

export const selectFlightSearchParams = (state) => ({
  tripType: state.flightSearch.tripType,
  oneWay: state.flightSearch.oneWay,
  roundTrip: state.flightSearch.roundTrip,
  multiCity: state.flightSearch.multiCity,
  travelers: state.flightSearch.travelers,
  cabinClass: state.flightSearch.cabinClass,
  directFlightsOnly: state.flightSearch.directFlightsOnly,
});
/* ---------------- SEAT MAP SELECTORS ---------------- */

export const selectSeatMap = (state) => state.flightSearch.seatMap;

export const selectSeatMapStatus = (state) => state.flightSearch.seatMapStatus;

export const selectSeatMapError = (state) => state.flightSearch.seatMapError;

/* -------------------------------------------------------------------------- */
/*                                   EXPORTS                                  */
/* -------------------------------------------------------------------------- */

export const {
  setTripType,
  setOneWayData,
  setRoundTripData,
  setMultiCityData,
  setTravelers,
  setCabinClass,
  setDirectFlightsOnly,
  clearFlightState,
} = flightSearchSlice.actions;

export default flightSearchSlice.reducer;
