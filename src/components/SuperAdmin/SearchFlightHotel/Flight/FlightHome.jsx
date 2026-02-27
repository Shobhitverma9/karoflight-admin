// Admin/src/components/SearchFlightHotel/FlightHome.jsx

import React, { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { HiOutlineUsers } from "react-icons/hi";
import { BsCalendar3 } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import {
  setTripType,
  setOneWayData,
  setRoundTripData,
  setMultiCityData,
  setTravelers,
  setCabinClass,
  setDirectFlightsOnly,
  searchFlights,
} from "../../../../features/slices/FlightSearch";
import { airportDatabase } from "../../../../Data/airportDatabase";

// Airport Search Component
const AirportSearch = ({
  value,
  onChange,
  placeholder,
  label,
  id,
  nearbyChecked,
  onNearbyChange,
}) => {
  const [searchTerm, setSearchTerm] = React.useState(value);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [filteredAirports, setFilteredAirports] = React.useState([]);
  const airportDropdownRef = useRef(null);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        airportDropdownRef.current &&
        !airportDropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter airports based on search term
  const handleAirportSearch = (term) => {
    setSearchTerm(term);

    if (term.length < 2) {
      setShowDropdown(false);
      return;
    }

    const filtered = airportDatabase
      .filter(
        (airport) =>
          airport.city.toLowerCase().includes(term.toLowerCase()) ||
          airport.iata_code.toLowerCase().includes(term.toLowerCase()),
      )
      .slice(0, 10);

    setFilteredAirports(filtered);
    setShowDropdown(true);
  };

  // Select an airport
  const handleSelect = (airport) => {
    const formattedValue = `${airport.city} (${airport.iata_code})`;
    setSearchTerm(formattedValue);
    onChange(formattedValue);
    setShowDropdown(false);
  };

  return (
    <div ref={airportDropdownRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleAirportSearch(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
      />

      {/* Dropdown */}
      {showDropdown && filteredAirports.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
          {filteredAirports.map((airport, index) => (
            <div
              key={index}
              onClick={() => handleSelect(airport)}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">
                    {airport.city}, {airport.country}
                  </div>
                  <div className="text-sm text-gray-600">{airport.name}</div>
                </div>
                <div className="text-blue-600 font-bold text-sm">
                  {airport.iata_code}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {showDropdown &&
        searchTerm.length >= 2 &&
        filteredAirports.length === 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4">
            <p className="text-gray-500 text-sm text-center">
              No airports found
            </p>
          </div>
        )}

      {/* Nearby airports checkbox */}
      <div className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          id={id}
          checked={nearbyChecked}
          onChange={(e) => onNearbyChange(e.target.checked)}
          className="rounded text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor={id} className="text-sm text-gray-600 cursor-pointer">
          Nearby airports
        </label>
      </div>
    </div>
  );
};

const FlightHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state selectors
  const {
    tripType,
    oneWay,
    roundTrip,
    multiCity,
    travelers,
    cabinClass,
    directFlightsOnly,
    status,
    error,
  } = useSelector((state) => state.flightSearch);

  // const token = useSelector((state) => state.auth.token);
  const token = sessionStorage.getItem("token");

  if (!token) {
    alert("Session expired. Please login again.");
    return;
  }

  const [showTravelersDropdown, setShowTravelersDropdown] =
    React.useState(false);
  const dropdownRef = useRef(null);

  // Travelers & Class Dropdown Component
  const TravelersDropdown = () => (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Travelers & Class
      </label>
      <div
        className="relative cursor-pointer"
        onClick={() => setShowTravelersDropdown(!showTravelersDropdown)}
      >
        <input
          type="text"
          value={getTravelersSummary()}
          readOnly
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 bg-white cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
        <HiOutlineUsers className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>

      {/* Dropdown Content */}
      {showTravelersDropdown && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-6 min-w-[320px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Travelers & Class</h3>
            <button
              onClick={() => setShowTravelersDropdown(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <IoMdClose size={20} />
            </button>
          </div>

          {/* Adults */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
            <div>
              <div className="font-medium text-gray-900">Adults</div>
              <div className="text-sm text-gray-500">Ages 18+</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateTravelers("adults", "decrement")}
                disabled={travelers.adults <= 1}
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-colors ${
                  travelers.adults <= 1
                    ? "border-gray-200 text-gray-300 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600"
                }`}
              >
                <AiOutlineMinus size={14} />
              </button>
              <span className="text-base font-semibold text-gray-900 w-8 text-center">
                {travelers.adults}
              </span>
              <button
                onClick={() => updateTravelers("adults", "increment")}
                className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                <AiOutlinePlus size={14} />
              </button>
            </div>
          </div>

          {/* Children */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
            <div>
              <div className="font-medium text-gray-900">Children</div>
              <div className="text-sm text-gray-500">Ages 0-17</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateTravelers("children", "decrement")}
                disabled={travelers.children <= 0}
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-colors ${
                  travelers.children <= 0
                    ? "border-gray-200 text-gray-300 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600"
                }`}
              >
                <AiOutlineMinus size={14} />
              </button>
              <span className="text-base font-semibold text-gray-900 w-8 text-center">
                {travelers.children}
              </span>
              <button
                onClick={() => updateTravelers("children", "increment")}
                className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                <AiOutlinePlus size={14} />
              </button>
            </div>
          </div>

          {/* Cabin Class */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-3">Cabin class</h4>
            <div className="space-y-2">
              {["Economy", "Premium Economy", "Business", "First Class"].map(
                (className) => (
                  <label
                    key={className}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="cabinClass"
                      value={className}
                      checked={cabinClass === className}
                      onChange={(e) => dispatch(setCabinClass(e.target.value))}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                      {className}
                    </span>
                  </label>
                ),
              )}
            </div>
          </div>

          {/* Direct Flights Only */}
          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={directFlightsOnly}
                onChange={(e) =>
                  dispatch(setDirectFlightsOnly(e.target.checked))
                }
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="text-sm text-gray-900">Direct flights only</span>
            </label>
          </div>

          {/* Done Button */}
          <button
            onClick={() => setShowTravelersDropdown(false)}
            className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Done
          </button>
        </div>
      )}
    </div>
  );
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowTravelersDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Increment/Decrement travelers
  const updateTravelers = (type, operation) => {
    const newTravelers = { ...travelers };
    const newValue =
      operation === "increment"
        ? newTravelers[type] + 1
        : Math.max(0, newTravelers[type] - 1);

    // Ensure at least 1 adult
    if (type === "adults" && newValue < 1) return;

    newTravelers[type] = newValue;
    dispatch(setTravelers(newTravelers));
  };

  // Get travelers summary text
  const getTravelersSummary = () => {
    const totalGuests = travelers.adults + travelers.children;
    return `${totalGuests} Guest${totalGuests > 1 ? "s" : ""} - ${cabinClass}`;
  };

  // Add new multi-city flight
  const addMultiCityFlight = () => {
    const lastFlight = multiCity[multiCity.length - 1];
    const newFlight = {
      id: multiCity.length + 1,
      from: lastFlight.to,
      to: "",
      date: "",
      nearbyFrom: false,
      nearbyTo: false,
    };
    dispatch(setMultiCityData([...multiCity, newFlight]));
  };

  // Remove multi-city flight
  const removeMultiCityFlight = (id) => {
    if (multiCity.length > 2) {
      dispatch(
        setMultiCityData(multiCity.filter((flight) => flight.id !== id)),
      );
    }
  };

  // Update multi-city flight
  const updateMultiCityFlight = (id, field, value) => {
    const updatedFlights = multiCity.map((flight) =>
      flight.id === id ? { ...flight, [field]: value } : flight,
    );
    dispatch(setMultiCityData(updatedFlights));
  };

  // Update one-way data
  const updateOneWayData = (field, value) => {
    dispatch(setOneWayData({ ...oneWay, [field]: value }));
  };

  // Update round-trip data
  const updateRoundTripData = (field, value) => {
    dispatch(setRoundTripData({ ...roundTrip, [field]: value }));
  };
  // Build search payload based on trip type
  // const buildSearchPayload = () => {
  //   const searchQuery = {
  //     paxInfo: {
  //       ADULT: travelers.adults.toString(),
  //       CHILD: travelers.children.toString(),
  //       INFANT: "0",
  //     },
  //     cabinClass:
  //       cabinClass === "Economy"
  //         ? "ECONOMY"
  //         : cabinClass === "Business"
  //           ? "BUSINESS"
  //           : cabinClass === "Premium Economy"
  //             ? "PREMIUM_ECONOMY"
  //             : "FIRST",
  //     preferredDepartureTime: "",
  //     preferredArrivalTime: "",
  //   };

  //   if (tripType === "oneway") {
  //     searchQuery.routeInfos = [
  //       {
  //         fromCityOrAirport: {
  //           code: oneWay.from.match(/\(([^)]+)\)/)?.[1] || oneWay.from,
  //           city: oneWay.from.split("(")[0]?.trim() || oneWay.from,
  //         },
  //         toCityOrAirport: {
  //           code: oneWay.to.match(/\(([^)]+)\)/)?.[1] || oneWay.to,
  //           city: oneWay.to.split("(")[0]?.trim() || oneWay.to,
  //         },
  //         travelDate: oneWay.date,
  //       },
  //     ];
  //   } else if (tripType === "roundtrip") {
  //     searchQuery.routeInfos = [
  //       {
  //         fromCityOrAirport: {
  //           code: roundTrip.from.match(/\(([^)]+)\)/)?.[1] || roundTrip.from,
  //           city: roundTrip.from.split("(")[0]?.trim() || roundTrip.from,
  //         },
  //         toCityOrAirport: {
  //           code: roundTrip.to.match(/\(([^)]+)\)/)?.[1] || roundTrip.to,
  //           city: roundTrip.to.split("(")[0]?.trim() || roundTrip.to,
  //         },
  //         travelDate: roundTrip.departure,
  //       },
  //       {
  //         fromCityOrAirport: {
  //           code: roundTrip.to.match(/\(([^)]+)\)/)?.[1] || roundTrip.to,
  //           city: roundTrip.to.split("(")[0]?.trim() || roundTrip.to,
  //         },
  //         toCityOrAirport: {
  //           code: roundTrip.from.match(/\(([^)]+)\)/)?.[1] || roundTrip.from,
  //           city: roundTrip.from.split("(")[0]?.trim() || roundTrip.from,
  //         },
  //         travelDate: roundTrip.return,
  //       },
  //     ];
  //   } else if (tripType === "multicity") {
  //     searchQuery.routeInfos = multiCity.map((flight) => ({
  //       fromCityOrAirport: {
  //         code: flight.from.match(/\(([^)]+)\)/)?.[1] || flight.from,
  //         city: flight.from.split("(")[0]?.trim() || flight.from,
  //       },
  //       toCityOrAirport: {
  //         code: flight.to.match(/\(([^)]+)\)/)?.[1] || flight.to,
  //         city: flight.to.split("(")[0]?.trim() || flight.to,
  //       },
  //       travelDate: flight.date,
  //     }));
  //   }

  //   return { searchQuery };
  // };

  // Handle search
  const handleSearch = async () => {
    if (tripType === "oneway") {
      if (!oneWay.from || !oneWay.to || !oneWay.date) {
        alert("Please fill all required fields");
        return;
      }
    }

    if (tripType === "roundtrip") {
      if (
        !roundTrip.from ||
        !roundTrip.to ||
        !roundTrip.departure ||
        !roundTrip.return
      ) {
        alert("Please fill all required fields");
        return;
      }
    }

    if (tripType === "multicity") {
      const hasEmptyFields = multiCity.some(
        (flight) => !flight.from || !flight.to || !flight.date,
      );
      if (hasEmptyFields) {
        alert("Please fill all multi-city flight details");
        return;
      }
    }

    // const searchBody = buildSearchPayload();

    // console.log("Search Payload:", searchBody);

    try {
      const result = await dispatch(
        searchFlights({
          searchParams: {
            tripType,
            oneWay,
            roundTrip,
            multiCity,
            travelers,
            cabinClass,
            directFlightsOnly,
          },
          token,
        }),
      ).unwrap();

      console.log("Search Result:", result);

      // Navigate to results page with search params
      navigate("/flight-search-results", {
        state: {
          searchParams: {
            tripType, // 👈 SAME value as Redux
            from:
              tripType === "oneway"
                ? oneWay.from
                : tripType === "roundtrip"
                  ? roundTrip.from
                  : multiCity[0]?.from,

            to:
              tripType === "oneway"
                ? oneWay.to
                : tripType === "roundtrip"
                  ? roundTrip.to
                  : multiCity[multiCity.length - 1]?.to,

            departureDate:
              tripType === "oneway"
                ? oneWay.date
                : tripType === "roundtrip"
                  ? roundTrip.departure
                  : multiCity[0]?.date,

            returnDate: tripType === "roundtrip" ? roundTrip.return : null,

            multiCityFlights: tripType === "multicity" ? multiCity : null,

            passengers: travelers,
            cabinClass,
            directFlightsOnly,
          },
        },
      });
    } catch (err) {
      console.error("Search error:", err);
      alert("Flight search failed. Please try again.");
    }
  };
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Container */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          {/* Trip Type Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {[
              { key: "oneway", label: "One way" },
              { key: "roundtrip", label: "Round trip" },
              { key: "multicity", label: "Multi city" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => dispatch(setTripType(t.key))}
                className={`flex-1 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                  tripType === t.key
                    ? "bg-blue-900 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {/* One Way */}
          {tripType === "oneway" && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* From - Using AirportSearch */}
                <AirportSearch
                  value={oneWay.from}
                  onChange={(value) => updateOneWayData("from", value)}
                  placeholder="Search city or airport"
                  label="From"
                  id="nearby-from-ow"
                  nearbyChecked={oneWay.nearbyFrom}
                  onNearbyChange={(checked) =>
                    updateOneWayData("nearbyFrom", checked)
                  }
                />

                {/* To - Using AirportSearch */}
                <AirportSearch
                  value={oneWay.to}
                  onChange={(value) => updateOneWayData("to", value)}
                  placeholder="Search city or airport"
                  label="To"
                  id="nearby-to-ow"
                  nearbyChecked={oneWay.nearbyTo}
                  onNearbyChange={(checked) =>
                    updateOneWayData("nearbyTo", checked)
                  }
                />

                {/* Departure */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={oneWay.date}
                      onChange={(e) => updateOneWayData("date", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                    <BsCalendar3 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Travelers & Class Dropdown */}
                <TravelersDropdown />
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={status === "loading"}
                className="w-full bg-blue-800 hover:bg-blue-900 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                {status === "loading" ? "Searching..." : "Search Flights"}
              </button>
            </div>
          )}
          {/* Round Trip */}
          {tripType === "roundtrip" && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {/* From - Using AirportSearch */}
                <AirportSearch
                  value={roundTrip.from}
                  onChange={(value) => updateRoundTripData("from", value)}
                  placeholder="Search city or airport"
                  label="From"
                  id="nearby-from-rt"
                  nearbyChecked={roundTrip.nearbyFrom}
                  onNearbyChange={(checked) =>
                    updateRoundTripData("nearbyFrom", checked)
                  }
                />

                {/* To - Using AirportSearch */}
                <AirportSearch
                  value={roundTrip.to}
                  onChange={(value) => updateRoundTripData("to", value)}
                  placeholder="Search city or airport"
                  label="To"
                  id="nearby-to-rt"
                  nearbyChecked={roundTrip.nearbyTo}
                  onNearbyChange={(checked) =>
                    updateRoundTripData("nearbyTo", checked)
                  }
                />

                {/* Departure */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={roundTrip.departure}
                      onChange={(e) =>
                        updateRoundTripData("departure", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                    <BsCalendar3 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Return */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={roundTrip.return}
                      onChange={(e) =>
                        updateRoundTripData("return", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                    <BsCalendar3 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Travelers & Class Dropdown */}
                <TravelersDropdown />
              </div>

              {/* Flexible Dates Checkbox */}
              <div className="flex items-center gap-2 mb-6">
                <input
                  type="checkbox"
                  id="flexible-dates"
                  checked={roundTrip.flexibleDates}
                  onChange={(e) =>
                    updateRoundTripData("flexibleDates", e.target.checked)
                  }
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="flexible-dates"
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  Flexible dates ±3 days
                </label>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={status === "loading"}
                className="w-full bg-blue-800 hover:bg-blue-900 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                {status === "loading" ? "Searching..." : "Search Flights"}
              </button>
            </div>
          )}
          {/* Multi City */}
          {tripType === "multicity" && (
            <div>
              {/* Multi-City Flights */}
              {multiCity.map((flight, index) => (
                <div key={flight.id} className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-700">
                      Flight {index + 1}
                    </h3>
                    {multiCity.length > 2 && (
                      <button
                        onClick={() => removeMultiCityFlight(flight.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                      >
                        <IoMdClose size={20} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl">
                    {/* From - Using AirportSearch */}
                    <AirportSearch
                      value={flight.from}
                      onChange={(value) =>
                        updateMultiCityFlight(flight.id, "from", value)
                      }
                      placeholder="Search city or airport"
                      label="From"
                      id={`nearby-from-${flight.id}`}
                      nearbyChecked={flight.nearbyFrom}
                      onNearbyChange={(checked) =>
                        updateMultiCityFlight(flight.id, "nearbyFrom", checked)
                      }
                    />

                    {/* To - Using AirportSearch */}
                    <AirportSearch
                      value={flight.to}
                      onChange={(value) =>
                        updateMultiCityFlight(flight.id, "to", value)
                      }
                      placeholder="Search city or airport"
                      label="To"
                      id={`nearby-to-${flight.id}`}
                      nearbyChecked={flight.nearbyTo}
                      onNearbyChange={(checked) =>
                        updateMultiCityFlight(flight.id, "nearbyTo", checked)
                      }
                    />

                    {/* Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={flight.date}
                          onChange={(e) =>
                            updateMultiCityFlight(
                              flight.id,
                              "date",
                              e.target.value,
                            )
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        />
                        <BsCalendar3 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Travelers & Class (only for first flight) */}
                    {index === 0 && <TravelersDropdown />}
                  </div>
                </div>
              ))}

              {/* Add Another Flight Button */}
              <button
                onClick={addMultiCityFlight}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-all duration-200 flex items-center justify-center gap-2 mb-6 font-medium"
              >
                <AiOutlinePlus size={20} />
                Add Another Flight
              </button>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={status === "loading"}
                className="w-full bg-blue-800 hover:bg-blue-900 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                {status === "loading" ? "Searching..." : "Search Flights"}
              </button>
            </div>
          )}
          {/* Error Display */}
          {status === "failed" && error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">
                {error.message || "Search failed. Please try again."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlightHome;
