import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import store from "./features/store.js";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import persistStore from "redux-persist/es/persistStore";
import { injectStore } from "./services/axiosInterceptor.jsx";
import { setUserFromStorage } from "./features/slices/auth.js";

// allow axios interceptor to access the store
injectStore(store);
let persistor = persistStore(store);

// Initialize auth from localStorage/token on app start
try {
  const rawUser = localStorage.getItem("userData");
  if (rawUser) {
    const parsed = JSON.parse(rawUser);
    store.dispatch(setUserFromStorage(parsed));
  } else {
    const token = localStorage.getItem("token");
    if (token) {
      // attempt to decode JWT payload (best-effort, no signature verification)
      try {
        const b64 = token.split(".")[1] || "";
        const json = decodeURIComponent(
          atob(b64.replace(/-/g, "+").replace(/_/g, "/"))
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );
        const payload = JSON.parse(json);
        // payload may contain user info in some setups; use it if present
        if (payload && typeof payload === "object") {
          store.dispatch(setUserFromStorage(payload));
        }
      } catch (e) {
        // ignore decode errors; fallback to reading userRole from localStorage elsewhere
      }
    }
  }
} catch (e) {
  // ignore errors during startup auth hydration
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);
