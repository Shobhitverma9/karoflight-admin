import { configureStore } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import { encryptTransform } from "redux-persist-transform-encrypt";

import booking from "./slices/booking";
import tour from "./slices/tour";
import auth from "./slices/auth";
import contactUs from "./slices/contactUs";
import order from "./slices/order";
import offers from "./slices/offerSlice";
import pricingConfig from "./slices/pricingConfig";
import blogs from "./slices/blogSlice";
import faq from "./slices/faqSlice";
import campaigns from "./slices/campaignSlice";
import seo from "./slices/seoSlice";
import flightSearch from "./slices/FlightSearch";
import hotelSearch from "./slices/HotelSearch";
import notifications from "./slices/notification.slice";
import adminAnalytics from "./slices/adminAnalyticsSlice";
import adminTransactions from "./slices/adminTransactionSlice";
import dashboardReducer from "./slices/dashboard.slice";

// Offer analytics (Commented out until files exist)
// import offerAnalyticsReducer from "./slices/offerAnalyticsSlice";
// import offerUsageReducer from "./slices/offerUsageSlice";

/* ======================
   ROOT REDUCER
====================== */
const rootReducer = combineReducers({
  auth,
  pricingConfig,
  booking,
  tour,
  contactUs,
  order,
  offers,
  blogs,
  faq,
  campaigns,
  seo,
  flightSearch,
  hotelSearch,
  notifications,
  adminAnalytics,
  dashboard: dashboardReducer,
  adminTransactions,
  // offerAnalytics: offerAnalyticsReducer,
  // offerUsage: offerUsageReducer,
});

/* ======================
   RESET STORE HANDLER
====================== */
const rootReducerWithClear = (state, action) => {
  if (action.type === "karoFlight/clearReduxStoreData") {
    state = undefined;
    localStorage.clear();
    sessionStorage.clear();
  }
  return rootReducer(state, action);
};

/* ======================
   REDUX PERSIST CONFIG
====================== */
const reduxPersistSecret = import.meta.env.VITE_REDUX_PERSIST_SECRET;

const transforms = reduxPersistSecret
  ? [
    encryptTransform({
      secretKey: reduxPersistSecret,
    }),
  ]
  : []; // ✅ fail-safe: no crash if secret missing

const persistConfig = {
  key: "KaroFlightAdminPanel",
  version: 1,
  storage,
  transforms,
};

const persistedReducer = persistReducer(
  persistConfig,
  rootReducerWithClear
);

/* ======================
   STORE
====================== */
const store = configureStore({
  reducer: persistedReducer,
  devTools: import.meta.env.VITE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;

