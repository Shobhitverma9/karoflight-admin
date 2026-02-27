//admin/src/components/SearchFlightHotel/OneWayFlightCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { MdOutlineFlight } from "react-icons/md";
import { FaSuitcase } from "react-icons/fa";

// Blue theme colors
const bluePrimary = "text-blue-800";
const blueSecondary = "text-blue-600";
const blueLight = "text-blue-500";
const blueBgLight = "bg-blue-50";
const blueBgMedium = "bg-blue-100";
const blueBorder = "border-blue-200";
const grayText = "text-gray-600";
const blueHover = "hover:bg-blue-50";

// Fix incorrect direction for return flights & multi-city
const getCorrectDirection = (segments, searchParams, isReturn) => {
  const first = segments[0];
  const last = segments[segments.length - 1];

  if (!first || !last)
    return {
      from: "N/A",
      to: "N/A",
      fromCode: "N/A",
      toCode: "N/A",
    };

  if (isReturn) {
    return {
      from: searchParams.to?.city || searchParams.to,
      to: searchParams.from?.city || searchParams.from,
      fromCode: searchParams.to?.code || first.da.code,
      toCode: searchParams.from?.code || last.aa.code,
    };
  }

  return {
    from: searchParams.from?.city || searchParams.from,
    to: searchParams.to?.city || searchParams.to,
    fromCode: searchParams.from?.code || first.da.code,
    toCode: searchParams.to?.code || last.aa.code,
  };
};

// Shared header component
const FlightHeader = ({ airline, flightNumber, logo }) => (
  <div className="flex items-center gap-2 mb-2">
    <img 
      src={logo} 
      alt={airline} 
      className="w-7 h-7 object-contain"
      onError={(e) => {
        e.target.src = "https://via.placeholder.com/28x28?text=✈️";
      }}
    />
    <div className="flex items-center gap-2">
      <span className="font-semibold text-gray-800">{airline}</span>
      <span className={`text-xs ${blueSecondary} bg-blue-50 px-1.5 py-0.5 rounded`}>
        {flightNumber}
      </span>
    </div>
  </div>
);

// Duration display component
const DurationDisplay = ({ duration, stopsCount }) => {
  let stopsColor = "text-green-600"; // Direct
  let stopsBg = "bg-green-50";
  
  if (stopsCount === 1) {
    stopsColor = "text-blue-600";
    stopsBg = "bg-blue-50";
  } else if (stopsCount > 1) {
    stopsColor = "text-orange-600";
    stopsBg = "bg-orange-50";
  }

  return (
    <div className="flex flex-col items-center">
      <MdOutlineFlight className={`text-lg rotate-90 ${bluePrimary}`} />
      <div className={`text-xs mt-1 ${grayText}`}>{duration}</div>
      <div className={`text-xs font-medium mt-0.5 px-2 py-0.5 rounded-full ${stopsBg} ${stopsColor}`}>
        {stopsCount === 0 ? "Direct" : `${stopsCount} stop${stopsCount > 1 ? 's' : ''}`}
      </div>
    </div>
  );
};

// Baggage display component
const BaggageDisplay = ({ baggage }) => (
  <div className="flex items-center gap-1 text-xs text-gray-600">
    <FaSuitcase className="w-3 h-3" />
    <span>{baggage}</span>
  </div>
);

export default function OneWayFlightCard({ flight, searchParams }) {
  const navigate = useNavigate();

  // Parse flight data from TripJack API response
const parseFlightData = () => {
  const segments = flight?.segments || [];
  if (!segments.length) return null;

  const first = segments[0];
  const last = segments[segments.length - 1];

  const durationMinutes = segments.reduce(
    (sum, s) => sum + (s.duration || 0),
    0
  );

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  return {
    airline: flight.airline || "Unknown Airline",
    flightNumber: first.flightNumber,
    logo: "https://via.placeholder.com/28x28?text=✈️",

    departure: new Date(first.depTime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    arrival: new Date(last.arrTime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),

    duration: `${hours}h ${minutes}m`,
    stopsCount: segments.length - 1,
    stops: segments.length === 1 ? "Direct" : `${segments.length - 1} Stops`,

    price: flight.pricing?.totalFare || 0,
    refundable: flight.fareIdentifier !== "NON_REFUNDABLE",

    from: first.from,
    to: last.to,
    fromCode: first.from,
    toCode: last.to,

    baggage: "As per airline",
    cabinClass: "Economy",
    aircraft: "N/A",

    passengers: `${searchParams?.travelers?.adults || 1} Adult`,
    date: searchParams?.oneWay?.date,
    rawFlightData: flight,
  };
};


  const flightData = parseFlightData();

  const handleSelectFlight = () => {
    navigate("/single-flight-search", {
      state: {
        selectedFlight: flightData,
        searchParams: searchParams,
        rawFlightData: flight,
        tripType: "one-way",
      },
    });
  };

  // Format price with commas
  const formattedPrice = flightData.price > 0 
    ? flightData.price.toLocaleString('en-IN') 
    : "N/A";

  return (
    <div className={`w-full relative bg-white border ${blueBorder} rounded-lg p-4 hover:shadow-lg transition-all ${blueHover}`}>
      {/* Main Flight Card */}
      <div className="flex flex-col">
        {/* Header */}
        <FlightHeader 
          airline={flightData.airline} 
          flightNumber={flightData.flightNumber} 
          logo={flightData.logo} 
        />

        {/* Flight Info */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-3">
          {/* Departure */}
          <div className="text-center flex-1">
            <div className="text-xl font-bold text-gray-900">
              {flightData.departure}
            </div>
            <div className={`text-sm font-medium ${bluePrimary}`}>
              {flightData.from}
            </div>
            <div className={`text-xs ${grayText} mt-0.5`}>
              ({flightData.fromCode})
            </div>
          </div>

          {/* Duration and Stops */}
          <div className="flex items-center justify-center px-2 sm:px-4 flex-2">
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 h-px bg-blue-200 hidden sm:block"></div>
              <DurationDisplay 
                duration={flightData.duration} 
                stopsCount={flightData.stopsCount} 
              />
              <div className="flex-1 h-px bg-blue-200 hidden sm:block"></div>
            </div>
          </div>

          {/* Arrival */}
          <div className="text-center flex-1">
            <div className="text-xl font-bold text-gray-900">
              {flightData.arrival}
            </div>
            <div className={`text-sm font-medium ${bluePrimary}`}>
              {flightData.to}
            </div>
            <div className={`text-xs ${grayText} mt-0.5`}>
              ({flightData.toCode})
            </div>
          </div>
        </div>

        {/* Tags Section */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`px-2 py-1 text-xs ${blueBgLight} ${bluePrimary} rounded-full font-medium`}>
            {flightData.cabinClass}
          </span>
          <BaggageDisplay baggage={flightData.baggage} />
          {flightData.refundable && (
            <span className={`px-2 py-1 text-xs bg-green-50 text-green-700 rounded-full font-medium`}>
              ✓ Refundable
            </span>
          )}
          <span className={`px-2 py-1 text-xs ${blueBgMedium} text-gray-700 rounded-full`}>
            {flightData.aircraft}
          </span>
        </div>

        {/* Price and Select Button  the main function{?>    }*/}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-blue-100 pt-3 gap-3">
          {/* Price Section */}
          <div className="flex flex-col">
            <div className="text-2xl font-bold text-gray-900">
              ₹{formattedPrice}
            </div>
            <div className={`text-xs ${grayText}`}>
              {flightData.passengers}
            </div>
          </div>

          {/* Select Button */}
          <button
            onClick={handleSelectFlight}
            className="px-6 py-2 bg-blue-800 text-white rounded-lg font-semibold hover:bg-blue-900 transition-all cursor-pointer shadow-sm hover:shadow-md min-w-[120px]"
          >
            Select Flight
          </button>
        </div>

        {/* Additional Info */}
        {flightData.date && (
          <div className={`text-xs ${grayText} mt-2 pt-2 border-t border-blue-50`}>
            Departure: {new Date(flightData.date).toLocaleDateString('en-US', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
        )}
      </div>
    </div>
  );
}