//admin/src/components/SearchFlightHotel/FlightSearchCard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { BsCalendar4 } from "react-icons/bs";
import { BiTrendingDown } from "react-icons/bi";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { MdOutlineFlight } from "react-icons/md";

import {
  selectFlightSearchResults,
  selectFlightSearchStatus,
  selectFlightSearchError,
} from "../../../../features/slices/FlightSearch";

import OneWayFlightCard from "./OneWayFlightCard";
import RoundFlightCard from "./RoundFlightCard";
import MultiCityFlightCard from "./MultiFlightCard";
import FlightFilter from "./FlightFilters";

// Blue theme colors
const bluePrimary = "text-blue-800";
const blueSecondary = "text-blue-600";
const blueLight = "text-blue-500";
const blueBgLight = "bg-blue-50";
const blueBgMedium = "bg-blue-100";
const blueBorder = "border-blue-200";
const grayText = "text-gray-600";
const blueHover = "hover:bg-blue-50";

// Helper function to format date as YYYY/MM/DD
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
};

// Main Flight Search Results Component
export default function FlightSearchResults() {
  const location = useLocation();
  const searchParams = location.state?.searchParams || {};
  const navigate = useNavigate();


  const handleBookFlight = ({
  flight,
  outboundFlight,
  returnFlight,
  multiCityFlights,
}) => {
  if (tripType === "oneway") {
    navigate("/booking/flight/oneway", {
      state: {
        selectedFlight: flight,
        rawFlightData: flight,
        searchParams,
        tripType: "oneway",
      },
    });
  }

  if (tripType === "roundtrip") {
    navigate("/booking/flight/roundtrip", {
      state: {
        outboundFlight,
        returnFlight,
        rawFlightData: {
          outbound: outboundFlight,
          return: returnFlight,
        },
        searchParams,
        tripType: "roundtrip",
      },
    });
  }

  if (tripType === "multi-city" || tripType === "multicity") {
    navigate("/booking/flight/multicity", {
      state: {
        rawFlightData: multiCityFlights,
        searchParams,
        tripType: "multicity",
      },
    });
  }
};


  // Redux selectors
  const flights = useSelector(selectFlightSearchResults);
  const searchStatus = useSelector(selectFlightSearchStatus);
  const searchError = useSelector(selectFlightSearchError);

  // Filter states
  const [activeFilter, setActiveFilter] = useState("Best");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedArrivalTime, setSelectedArrivalTime] = useState("");
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [selectedFlightNumbers, setSelectedFlightNumbers] = useState([]);
  const [selectedFareTypes, setSelectedFareTypes] = useState([]);
  const [selectedTerminals, setSelectedTerminals] = useState([]);
  const [selectedAirports, setSelectedAirports] = useState([]);
  const [selectedLayoverAirports, setSelectedLayoverAirports] = useState([]);
  const [lowCO2, setLowCO2] = useState(false);
  const [selectedStops, setSelectedStops] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [popularFilters, setPopularFilters] = useState({
    earlyMorning: false,
    refundable: false,
    directOnly: false,
    shortDuration: false,
  });

  // Price and duration states
  const [priceValues, setPriceValues] = useState([1000, 15000]);
  const [durationValues, setDurationValues] = useState([0, 1440]);

  const filters = ["Best", "Cheapest", "Early Departure", "Late Departure"];

  // Determine trip type
const tripType = useMemo(() => {
  return searchParams?.tripType || "oneway";
}, [searchParams?.tripType]);


  // Helper function to get string value from searchParams
  const getStringValue = (value) => {
    if (!value) return "N/A";
    if (typeof value === "object") {
      return value.city || value.code || "N/A";
    }
    return value;
  };



const getSegments = (flight) => flight?.segments || [];

const getPrice = (flight) => flight?.pricing?.totalFare || 0;

const getDuration = (flight) =>
  getSegments(flight).reduce((sum, s) => sum + (s.duration || 0), 0);


  const calculateAverageFlightTime = (flights) => {
    if (!flights || flights.length === 0) return "N/A";
    const totalMinutes = flights.reduce((sum, flight) => {
      const segments = getSegments(flight);
      const duration = segments.reduce((segSum, seg) => segSum + (seg.duration || 0), 0);
      return sum + duration;
    }, 0);
    const avgMinutes = Math.floor(totalMinutes / flights.length);
    const hours = Math.floor(avgMinutes / 60);
    const minutes = avgMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const getCheapestPrice = (flights) => {
    if (!flights || flights.length === 0) return 0;
    const prices = flights.map(
      (f) => f?.totalPriceList?.[0]?.fd?.ADULT?.fC?.TF || 0
    );
    return Math.min(...prices);
  };

  const getCheapestDate = (flights) => {
    if (!flights || flights.length === 0) return null;
    let cheapestFlight = flights[0];
    let cheapestPrice =
      flights[0]?.totalPriceList?.[0]?.fd?.ADULT?.fC?.TF || Infinity;
    flights.forEach((flight) => {
      const price = flight?.pricing?.totalFare || Infinity;
      if (price < cheapestPrice) {
        cheapestPrice = price;
        cheapestFlight = flight;
      }
    });
    const dateStr = cheapestFlight?.sI?.[0]?.dt;
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getPriceRange = (flights) => {
    if (!flights || flights.length === 0) return { min: 0, max: 0 };
    const prices = flights
      .map((f) => f?.totalPriceList?.[0]?.fd?.ADULT?.fC?.TF || 0)
      .filter((p) => p > 0);
    if (prices.length === 0) return { min: 0, max: 0 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  };

  // Filter flights based on all selected criteria
  useEffect(() => {
    let filtered = [...flights];

    // Filter by price range
    filtered = filtered.filter((flight) => {
const flightPrice = getPrice(flight);
      return flightPrice >= priceValues[0] && flightPrice <= priceValues[1];
    });

    // Filter by duration
    filtered = filtered.filter((flight) => {
      const segments = getSegments(flight);
const duration = getDuration(flight);
      return duration >= durationValues[0] && duration <= durationValues[1];
    });

    // Filter by stops
    if (selectedStops.length > 0) {
      filtered = filtered.filter((flight) => {
        const segments = getSegments(flight)?.length || 0;
        const stopsCount = segments - 1;
        if (selectedStops.includes("Direct") && stopsCount === 0) return true;
        if (selectedStops.includes("1 stop") && stopsCount === 1) return true;
        if (selectedStops.includes("2+ stops") && stopsCount >= 2) return true;
        return false;
      });
    }

    // Filter by airlines
    if (selectedAirlines.length > 0) {
      filtered = filtered.filter((flight) => {
        const segments = getSegments(flight);
const airlineName = flight.airline || "Unknown Airline";
        return selectedAirlines.includes(airlineName);
      });
    }

    // Filter by departure time
    if (selectedTime) {
      filtered = filtered.filter((flight) => {
        const segments = getSegments(flight);
const departureTime = getSegments(flight)[0]?.depTime;
        if (!departureTime) return false;
        const hour = new Date(departureTime).getHours();
        switch (selectedTime) {
          case "Morning":
            return hour >= 6 && hour < 12;
          case "Afternoon":
            return hour >= 12 && hour < 18;
          case "Evening":
            return hour >= 18 && hour < 24;
          case "Night":
            return hour >= 0 && hour < 6;
          default:
            return true;
        }
      });
    }

    // Filter by arrival time
    if (selectedArrivalTime) {
      filtered = filtered.filter((flight) => {
        const segments = getSegments(flight);
const arrivalTime =
  getSegments(flight)[getSegments(flight).length - 1]?.arrTime;
        if (!arrivalTime) return false;
        const hour = new Date(arrivalTime).getHours();
        switch (selectedArrivalTime) {
          case "Morning":
            return hour >= 6 && hour < 12;
          case "Afternoon":
            return hour >= 12 && hour < 18;
          case "Evening":
            return hour >= 18 && hour < 24;
          case "Night":
            return hour >= 0 && hour < 6;
          default:
            return true;
        }
      });
    }

    // Apply popular filters
    if (popularFilters.earlyMorning) {
      filtered = filtered.filter((flight) => {
        const hour = new Date(getSegments(flight)?.[0]?.dt).getHours();
        return hour >= 0 && hour < 8;
      });
    }
    if (popularFilters.refundable) {
      filtered = filtered.filter((flight) => {
return flight.fareIdentifier !== "NON_REFUNDABLE";
      });
    }
    if (popularFilters.directOnly) {
      filtered = filtered.filter((flight) => getSegments(flight).length === 1
);
    }
    if (popularFilters.shortDuration) {
      filtered = filtered.filter((flight) => {
        const duration = getSegments(flight)?.[0]?.duration || 0;
        return duration < 180; // Less than 3 hours
      });
    }

    // Sort by active filter
    if (activeFilter === "Cheapest") {
      filtered.sort((a, b) => {
        const priceA = getPrice(a);
const priceB = getPrice(b);
        return priceA - priceB;
      });
    } else if (activeFilter === "Early Departure") {
      filtered.sort((a, b) => {
        const timeA = new Date(getSegments(a)?.[0]?.dt || 0);
        const timeB = new Date(getSegments(flight)[0]?.depTime);
        return timeA - timeB;
      });
    } else if (activeFilter === "Late Departure") {
      filtered.sort((a, b) => {
        const timeA = new Date(getSegments(a)?.[0]?.dt || 0);
        const timeB = new Date(getSegments(flight)[0]?.depTime);
        return timeB - timeA;
      });
    } else {
      // Best - combination of price, duration, and stops
      filtered.sort((a, b) => {
        const priceA = getPrice(a);
const priceB = getPrice(b);
        const durationA = getSegments(a)?.[0]?.duration || 0;
        const durationB = b.sI?.[0]?.duration || 0;
        const stopsA = getSegments(a)?.length - 1 || 0;
        const stopsB = b.sI?.length - 1 || 0;
        const scoreA = priceA * 0.5 + durationA * 0.3 + stopsA * 200 * 0.2;
        const scoreB = priceB * 0.5 + durationB * 0.3 + stopsB * 200 * 0.2;
        return scoreA - scoreB;
      });
    }

    setFilteredFlights(filtered);
  }, [
    flights,
    selectedStops,
    activeFilter,
    priceValues,
    durationValues,
    selectedTime,
    selectedArrivalTime,
    selectedAirlines,
    selectedFlightNumbers,
    selectedFareTypes,
    selectedTerminals,
    selectedAirports,
    selectedLayoverAirports,
    lowCO2,
    popularFilters,
  ]);
useEffect(() => {
  console.log("Flights:", flights.length);
  console.log("Filtered:", filteredFlights.length);
}, [flights, filteredFlights]);

  const resetAllFilters = () => {
    setPriceValues([1000, 15000]);
    setDurationValues([0, 1440]);
    setSelectedStops([]);
    setSelectedTime("");
    setSelectedArrivalTime("");
    setSelectedAirlines([]);
    setSelectedFlightNumbers([]);
    setSelectedFareTypes([]);
    setSelectedTerminals([]);
    setSelectedAirports([]);
    setSelectedLayoverAirports([]);
    setLowCO2(false);
    setPopularFilters({
      earlyMorning: false,
      refundable: false,
      directOnly: false,
      shortDuration: false,
    });
  };

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (priceValues[0] > 1000 || priceValues[1] < 15000) count++;
    if (durationValues[0] > 0 || durationValues[1] < 1440) count++;
    count += selectedStops.length;
    count += selectedAirlines.length;
    count += selectedFlightNumbers.length;
    count += selectedFareTypes.length;
    count += selectedTerminals.length;
    count += selectedAirports.length;
    count += selectedLayoverAirports.length;
    if (selectedTime) count++;
    if (selectedArrivalTime) count++;
    if (lowCO2) count++;
    count += Object.values(popularFilters).filter(Boolean).length;
    return count;
  }, [
    priceValues,
    durationValues,
    selectedStops,
    selectedAirlines,
    selectedFlightNumbers,
    selectedFareTypes,
    selectedTerminals,
    selectedAirports,
    selectedLayoverAirports,
    selectedTime,
    selectedArrivalTime,
    lowCO2,
    popularFilters,
  ]);

  // Render appropriate flight cards based on trip type
  const renderFlightCards = () => {
    if (tripType === "multi-city" || tripType === "Multi-city") {
      // For multi-city trips
      const routeInfos = searchParams.searchQuery?.routeInfos || searchParams.multiCityFlights || [];
      
      if (filteredFlights.length === 1 && Array.isArray(filteredFlights[0]?.sI)) {
        // COMBO flight for international multi-city
        return (
          <MultiCityFlightCard
            flights={filteredFlights}
            searchParams={searchParams}
          />
        );
      } else {
        // Multiple individual flights for multi-city
        return filteredFlights.slice(0, visibleCount).map((flight, index) => (
          <MultiCityFlightCard
            key={`multi-${index}`}
            flights={[flight]}
            searchParams={searchParams}
          />
        ));
      }
    } else if (tripType === "round-trip" || searchParams.returnDate) {
      // For round-trip flights
      const onwardFlights = filteredFlights.filter(f => f.type === "ONWARD" || f.type === "S1");
      const returnFlights = filteredFlights.filter(f => f.type === "RETURN" || f.type === "S2");
      
      if (onwardFlights.length > 0 && returnFlights.length > 0) {
        return onwardFlights.slice(0, visibleCount).map((onwardFlight, index) => {
          const returnFlight = returnFlights[index] || returnFlights[0];
          return (
            <RoundFlightCard
              key={`rt-${index}`}
              outboundFlight={onwardFlight}
              returnFlight={returnFlight}
              searchParams={searchParams}
            />
          );
        });
      } else {
        // If no return flights found, show one-way cards
        return filteredFlights.slice(0, visibleCount).map((flight, index) => (
          <OneWayFlightCard
            key={`ow-${index}`}
            flight={flight}
            searchParams={searchParams}
          />
        ));
      }
    } else {
      // For one-way trips (default)
      return filteredFlights.slice(0, visibleCount).map((flight, index) => (
        <OneWayFlightCard
          key={`ow-${index}`}
          flight={flight}
          searchParams={searchParams}
        />
      ));
    }
  };

  // Show loading state
  if (searchStatus === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            Searching for the best flights...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (searchStatus === "failed") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Search Failed
          </h2>
          <p className="text-gray-600 mb-4">
            {searchError?.message ||
              "Unable to fetch flights. Please try again."}
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show no results state
  if (searchStatus === "succeeded" && flights.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-gray-400 text-5xl mb-4">✈️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Flights Found
          </h2>
          <p className="text-gray-600 mb-4">
            We couldn't find any flights matching your search criteria.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition"
          >
            Modify Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Destination Details Section */}
      <div className="py-8 bg-white border-b border-gray-200">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1264px] mx-auto space-y-4">
            {/* Main Route Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {getStringValue(searchParams.from)} to{" "}
                  {getStringValue(searchParams.to)}
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span>{calculateAverageFlightTime(flights)} flight time</span>
                  <span>•</span>
                  <span>{tripType} Trip</span>
                </div>
              </div>

              {flights.length > 0 && getCheapestPrice(flights) > 0 && (
                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2 w-full lg:w-auto">
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <BiTrendingDown className="text-green-600" size={20} />
                    <span className="text-gray-600">Cheapest this month:</span>
                    <span className="font-bold text-gray-900">
                      ₹{getCheapestPrice(flights).toLocaleString()}
                    </span>
                  </div>
                  <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm whitespace-nowrap">
                    <BsCalendar4 />
                    <span>View month</span>
                  </button>
                </div>
              )}
            </div>

            {flights.length > 0 && getPriceRange(flights).min > 0 && (
              <div className={`${blueBgLight} border ${blueBorder} rounded-lg px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
                <div className="flex items-start gap-3">
                  <BsCalendar4 className={`${bluePrimary} mt-0.5`} size={20} />
                  <div>
                    <p className="font-semibold text-gray-900">
                      Price graph: {formatDate(searchParams.departureDate)}
                      {searchParams.returnDate &&
                        ` - ${formatDate(searchParams.returnDate)}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      ₹{getPriceRange(flights).min.toLocaleString()} – ₹
                      {getPriceRange(flights).max.toLocaleString()}
                      {getCheapestDate(flights) &&
                        ` | Cheapest: ${getCheapestDate(
                          flights
                        )} (₹${getCheapestPrice(flights).toLocaleString()})`}
                    </p>
                  </div>
                </div>
                <button className={`flex items-center gap-2 px-4 py-2 bg-white border ${blueBorder} rounded-lg hover:${blueBgLight} transition text-sm font-medium ${bluePrimary} whitespace-nowrap`}>
                  <BsCalendar4 />
                  <span>±3 days</span>
                </button>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-4">
              <div className="block sm:hidden w-full">
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {filters.map((filter) => (
                    <option key={filter} value={filter}>
                      {filter}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                {filters.map((filter) => {
                  const isActive = activeFilter === filter;
                  return (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-4 cursor-pointer py-2 rounded-lg font-medium text-sm transition whitespace-nowrap ${
                        isActive
                          ? "bg-blue-800 text-white shadow-sm"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
                <p className="text-sm text-gray-600 whitespace-nowrap">
                  {filteredFlights.length} flights found • {tripType}
                </p>
                <div className={`px-3 py-1.5 ${blueBgLight} ${bluePrimary} border ${blueBorder} rounded-lg text-sm font-medium whitespace-nowrap`}>
                  Best time to book
                </div>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-sm text-gray-600">
                Best is ranked by price + duration + stops + airline + times
              </p>
            </div>

            {/* Active Filters Summary */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 items-center pt-2">
                <span className="text-sm font-medium text-gray-700">
                  {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""}{" "}
                  active
                </span>
                <button
                  onClick={resetAllFilters}
                  className="text-sm text-blue-600 cursor-pointer hover:text-blue-700 underline font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters + Results Section */}
      <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6 max-w-[1440px] mx-auto">
        {/* Left - Enhanced Filters */}
        <div className="w-full lg:w-[300px]">
          <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
            <FlightFilter
              flights={flights}
              selectedStops={selectedStops}
              setSelectedStops={setSelectedStops}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              selectedAirlines={selectedAirlines}
              setSelectedAirlines={setSelectedAirlines}
              lowCO2={lowCO2}
              setLowCO2={setLowCO2}
              selectedArrivalTime={selectedArrivalTime}
              setSelectedArrivalTime={setSelectedArrivalTime}
              selectedFlightNumbers={selectedFlightNumbers}
              setSelectedFlightNumbers={setSelectedFlightNumbers}
              selectedFareTypes={selectedFareTypes}
              setSelectedFareTypes={setSelectedFareTypes}
              selectedTerminals={selectedTerminals}
              setSelectedTerminals={setSelectedTerminals}
              selectedAirports={selectedAirports}
              setSelectedAirports={setSelectedAirports}
              selectedLayoverAirports={selectedLayoverAirports}
              setSelectedLayoverAirports={setSelectedLayoverAirports}
              popularFilters={popularFilters}
              setPopularFilters={setPopularFilters}
              priceValues={priceValues}
              setPriceValues={setPriceValues}
              durationValues={durationValues}
              setDurationValues={setDurationValues}
            />
          </div>
        </div>

        {/* Right - Flight List */}
        <div className="flex-1">
          <div className="space-y-5">
            {renderFlightCards()}
          </div>

          {/* Load More */}
          {visibleCount < filteredFlights.length && (
            <div className="text-[14px] font-medium flex items-center justify-center py-16">
              <button
                onClick={() => setVisibleCount((prev) => prev + 5)}
                className="w-[149px] h-[40px] bg-[#FFFFFF] hover:bg-blue-50 cursor-pointer border border-blue-300 flex items-center justify-center py-3 rounded-xl text-blue-700"
              >
                Load more flights
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}