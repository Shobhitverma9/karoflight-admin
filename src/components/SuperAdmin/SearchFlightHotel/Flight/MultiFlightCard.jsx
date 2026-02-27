// MultiFlightCard.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MdOutlineFlight } from "react-icons/md";
import { FaSuitcase, FaChevronDown, FaChevronUp } from "react-icons/fa";

// Blue theme colors
const bluePrimary = "text-blue-800";
const blueSecondary = "text-blue-600";
const blueLight = "text-blue-500";
const blueBgLight = "bg-blue-50";
const blueBgMedium = "bg-blue-100";
const blueBorder = "border-blue-200";
const grayText = "text-gray-600";
const blueHover = "hover:bg-blue-50";
const indigoBg = "bg-indigo-50";
const indigoText = "text-indigo-700";

// Flight Segment component
const FlightSegment = ({ flightData, label, isCompact = false, isMultiCity = false }) => {
  const getStopsColor = (stopsCount) => {
    if (stopsCount === 0) return "text-green-600 bg-green-50";
    if (stopsCount === 1) return "text-blue-600 bg-blue-50";
    return "text-orange-600 bg-orange-50";
  };

  const stopsColorClass = getStopsColor(flightData.stopsCount);

  return (
    <div className={`${isCompact ? "py-2" : "py-3"} ${isMultiCity ? blueBgLight : ""} rounded-lg`}>
      {label && (
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-sm font-semibold ${bluePrimary}`}>
            {label}
          </span>
          <span className={`text-xs ${grayText}`}>{flightData.date}</span>
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <img
          src={flightData.logo}
          alt={flightData.airline}
          className="w-7 h-7 object-contain"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/28x28?text=✈️";
          }}
        />
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800 text-sm">
            {flightData.airline}
          </span>
          <span className={`text-xs ${blueSecondary} ${blueBgLight} px-1.5 py-0.5 rounded`}>
            {flightData.flightNumber}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <div className="text-center flex-1">
          <div className="text-lg font-bold text-gray-900">
            {flightData.departure}
          </div>
          <div className={`text-sm font-medium ${bluePrimary}`}>
            {flightData.from}
          </div>
          <div className={`text-xs ${grayText} mt-0.5`}>
            ({flightData.fromCode})
          </div>
        </div>

        <div className="flex items-center justify-center px-2 flex-2">
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 h-px bg-blue-200 hidden sm:block"></div>
            <div className="flex flex-col items-center">
              <MdOutlineFlight className={`text-base rotate-90 ${bluePrimary}`} />
              <div className={`text-xs mt-1 ${grayText}`}>
                {flightData.duration}
              </div>
              <div className={`text-xs font-medium mt-0.5 px-2 py-0.5 rounded-full ${stopsColorClass}`}>
                {flightData.stops}
              </div>
            </div>
            <div className="flex-1 h-px bg-blue-200 hidden sm:block"></div>
          </div>
        </div>

        <div className="text-center flex-1">
          <div className="text-lg font-bold text-gray-900">
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

      <div className="flex flex-wrap items-center gap-2 mt-2">
        <span className={`px-2 py-0.5 text-xs ${blueBgLight} ${bluePrimary} rounded-full font-medium`}>
          {flightData.cabinClass}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-600">
          <FaSuitcase className="w-3 h-3" />
          {flightData.baggage}
        </span>
        {flightData.refundable && (
          <span className="px-2 py-0.5 text-xs bg-green-50 text-green-700 rounded-full font-medium">
            ✓ Refundable
          </span>
        )}
        {/* <span className={`px-2 py-0.5 text-xs ${blueBgMedium} text-gray-700 rounded-full`}>
          {flightData.aircraft}
        </span> */}
      </div>
    </div>
  );
};

export default function MultiCityFlightCard({
  flights = [],
  searchParams = {},
}) {
  const [expandedFlights, setExpandedFlights] = useState([0]);
  const navigate = useNavigate();

  const routeInfos =
    searchParams?.searchQuery?.routeInfos ||
    searchParams?.multiCityFlights ||
    searchParams?.routeInfos ||
    [];

  const toggleFlight = (index) => {
    setExpandedFlights((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const isCombo =
    Array.isArray(flights) &&
    flights.length === 1 &&
    Array.isArray(flights[0]?.sI) &&
    routeInfos.length > 1;

  const getRouteFromCode = (ri) =>
    (
      ri?.fromCityOrAirport?.code ||
      ri?.from?.code ||
      (typeof ri?.from === "string" ? ri.from : undefined) ||
      ri?.from?.cityCode ||
      ""
    )
      .toString()
      .toUpperCase();

  const getRouteToCode = (ri) =>
    (
      ri?.toCityOrAirport?.code ||
      ri?.to?.code ||
      (typeof ri?.to === "string" ? ri.to : undefined) ||
      ri?.to?.cityCode ||
      ""
    )
      .toString()
      .toUpperCase();

  const splitComboBySN = (combo) => {
    const segments = combo?.sI || [];
    const legs = [];
    let currentLeg = [];

    segments.forEach((seg) => {
      if (seg.sN === 0 && currentLeg.length > 0) {
        legs.push({
          sI: currentLeg,
          totalPriceList: combo.totalPriceList || [],
        });
        currentLeg = [];
      }
      currentLeg.push(seg);
    });

    if (currentLeg.length > 0) {
      legs.push({
        sI: currentLeg,
        totalPriceList: combo.totalPriceList || [],
      });
    }

    return legs;
  };

  const allocateComboPrices = (comboLegs, comboTotalPrice) => {
    if (!comboLegs || comboLegs.length === 0) return [];

    const legDurations = comboLegs.map((leg) =>
      (leg.sI || []).reduce((sum, s) => sum + (s.duration || 0), 0)
    );
    const totalDuration = legDurations.reduce((s, v) => s + v, 0) || 1;

    return comboLegs.map((leg, i) => {
      const share = Math.round(
        (comboTotalPrice * (legDurations[i] || 0)) / totalDuration
      );
      return { ...leg, _allocatedPrice: share };
    });
  };

  const processedFlights = useMemo(() => {
    if (isCombo) {
      const combo = flights[0];
      const comboLegs = splitComboBySN(combo);
      const comboTotal =
        Math.round(combo?.totalPriceList?.[0]?.fd?.ADULT?.fC?.TF || 0) || 0;

      const legsWithPrice = allocateComboPrices(comboLegs, comboTotal);
      return { isCombo: true, legs: legsWithPrice, comboTotal };
    }

    return { isCombo: false, legs: flights || [], comboTotal: null };
  }, [flights, isCombo, routeInfos]);

  const parseFlightData = (flight, flightIndex) => {
    const routeInfo = routeInfos[flightIndex] || {};
    const routeFromCode = getRouteFromCode(routeInfo);
    const routeToCode = getRouteToCode(routeInfo);
    const routeDate =
      routeInfo?.travelDate ||
      routeInfo?.date ||
      routeInfo?.travel_date ||
      routeInfo?.dateString ||
      "";

    if (!flight || !Array.isArray(flight.sI) || flight.sI.length === 0) {
      const fromName =
        routeInfo?.fromCityOrAirport?.code ||
        routeInfo?.from?.code ||
        routeInfo?.from ||
        "N/A";
      const toName =
        routeInfo?.toCityOrAirport?.code ||
        routeInfo?.to?.code ||
        routeInfo?.to ||
        "N/A";

      return {
        airline: "Unknown Airline",
        flightNumber: "N/A",
        logo: "",
        departure: "N/A",
        arrival: "N/A",
        duration: "N/A",
        stops: "Direct",
        stopsCount: 0,
        baggage: "Baggage info not available",
        refundable: false,
        price: flight?._allocatedPrice || 0,
        from: fromName,
        to: toName,
        aircraft: "N/A",
        fromCode: routeFromCode || "N/A",
        toCode: routeToCode || "N/A",
        date: routeDate || "N/A",
        passengers: `${
          searchParams?.searchQuery?.paxInfo?.ADULT ||
          searchParams?.passengers?.adults ||
          1
        } Adult${
          Number(
            searchParams?.searchQuery?.paxInfo?.ADULT ||
              searchParams?.passengers?.adults ||
              1
          ) > 1
            ? "s"
            : ""
        }`,
        cabinClass: flight?.totalPriceList?.[0]?.cc || "Economy",
        rawFlightData: flight,
      };
    }

    const segments = flight.sI;
    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];

    const airline = firstSegment?.fD?.aI?.name || "Unknown Airline";
    const airlineCode = firstSegment?.fD?.aI?.code || "";
    const flightNumber = firstSegment?.fD?.fN || "N/A";
    const logo = `https://images.kiwi.com/airlines/64x64/${airlineCode}.png`;

    const formatTime = (dstr) => {
      if (!dstr) return "N/A";
      try {
        const d = new Date(dstr);
        return d.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      } catch {
        return "N/A";
      }
    };

    const departure = formatTime(firstSegment?.dt);
    const arrival = formatTime(lastSegment?.arrTime);

    const totalMinutes = segments.reduce(
      (sum, s) => sum + (s.duration || 0),
      0
    );
    const duration =
      totalMinutes === 0
        ? "N/A"
        : `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;

    const stopsCount = Math.max(0, segments.length - 1);
    const stopsText = stopsCount === 0 ? "Direct" : `${stopsCount} stop${stopsCount > 1 ? 's' : ''}`;

    const rawPrice =
      flight._allocatedPrice ??
      Math.round(flight?.pricing?.totalFare || 0);

    const baggageInfo = flight?.totalPriceList?.[0]?.fd?.ADULT?.bI;
    const baggage = baggageInfo?.iB || "Baggage info not available";

    const fareIdentifier = flight?.totalPriceList?.[0]?.fareIdentifier || "";
    const refundable =
      fareIdentifier.includes("REFUNDABLE") ||
      flight?.totalPriceList?.[0]?.fd?.ADULT?.rT === 1;

    const aircraft = firstSegment?.fD?.ac || firstSegment?.fD?.eT || "N/A";

    const segmentFromCity =
      firstSegment?.da?.city ||
      firstSegment?.da?.name ||
      firstSegment?.da?.code;
    const segmentFromCode =
      firstSegment?.da?.code || firstSegment?.da?.cityCode;
    const segmentToCity =
      lastSegment?.aa?.city || lastSegment?.aa?.name || lastSegment?.aa?.code;
    const segmentToCode = lastSegment?.aa?.code || lastSegment?.aa?.cityCode;

    const fromLocation =
      routeInfo?.fromCityOrAirport?.code ||
      routeInfo?.from?.code ||
      routeInfo?.from ||
      segmentFromCity ||
      "N/A";
    const toLocation =
      routeInfo?.toCityOrAirport?.code ||
      routeInfo?.to?.code ||
      routeInfo?.to ||
      segmentToCity ||
      "N/A";

    const fromCode =
      routeInfo?.fromCityOrAirport?.code ||
      routeInfo?.from?.code ||
      segmentFromCode ||
      "N/A";
    const toCode =
      routeInfo?.toCityOrAirport?.code ||
      routeInfo?.to?.code ||
      segmentToCode ||
      "N/A";

    return {
      airline,
      flightNumber,
      logo,
      departure,
      arrival,
      duration,
      stops: stopsText,
      stopsCount,
      baggage,
      refundable,
      price: Math.round(rawPrice),
      from: fromLocation,
      to: toLocation,
      aircraft,
      fromCode,
      toCode,
      date: routeDate || firstSegment?.dt || "N/A",
      passengers: `${
        searchParams?.searchQuery?.paxInfo?.ADULT ||
        searchParams?.passengers?.adults ||
        1
      } Adult${
        Number(
          searchParams?.searchQuery?.paxInfo?.ADULT ||
            searchParams?.passengers?.adults ||
            1
        ) > 1
          ? "s"
          : ""
      }`,
      cabinClass: flight?.totalPriceList?.[0]?.cc || "Economy",
      rawFlightData: flight,
    };
  };

  const parsedFlights = useMemo(() => {
    const legs = processedFlights.isCombo
      ? processedFlights.legs
      : processedFlights.legs;
    return legs.map((leg, idx) => parseFlightData(leg, idx));
  }, [processedFlights, routeInfos]);

  const totalPrice = useMemo(() => {
    if (processedFlights.isCombo) {
      return (
        processedFlights.comboTotal ||
        parsedFlights.reduce((s, f) => s + (f.price || 0), 0)
      );
    }
    return parsedFlights.reduce((s, f) => s + (f.price || 0), 0);
  }, [processedFlights, parsedFlights]);

  const handleSelectFlights = () => {
    let rawFlightDataForSingle;
    let selectedFlightForSingle;

    if (processedFlights.isCombo) {
      const originalCombo = flights[0];
      rawFlightDataForSingle = {
        searchResult: {
          tripInfos: {
            COMBO: [originalCombo],
          },
        },
      };

      selectedFlightForSingle = {
        flights: parsedFlights,
        totalPrice,
      };
    } else {
      const tripInfos = {};
      (flights || []).forEach((f, idx) => {
        tripInfos[String(idx)] = [f];
      });

      rawFlightDataForSingle = { searchResult: { tripInfos } };
      selectedFlightForSingle = { flights: parsedFlights, totalPrice };
    }

    navigate("/multi-city-flight-search", {
      state: {
        selectedFlight: selectedFlightForSingle,
        searchParams,
        rawFlightData: rawFlightDataForSingle,
        tripType: "multi-way",
      },
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

  if (!parsedFlights || parsedFlights.length === 0) {
    return null;
  }

  const formattedPrice = totalPrice > 0 
    ? totalPrice.toLocaleString('en-IN') 
    : "N/A";

  return (
    <div className={`w-full relative bg-white border ${blueBorder} rounded-lg p-4 hover:shadow-lg transition-all ${blueHover}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 ${indigoBg} ${indigoText} text-sm font-semibold rounded-full`}>
            Multi-City ({parsedFlights.length} Flights)
          </span>
          <span className={`text-xs ${grayText}`}>
            {parsedFlights[0]?.passengers}
          </span>
        </div>
      </div>

      {/* Route Summary */}
      <div className={`mb-3 p-3 ${blueBgLight} rounded-lg`}>
        <div className="flex items-center gap-2 flex-wrap">
          {parsedFlights.map((flight, index) => (
            <React.Fragment key={index}>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-gray-700">
                  {flight.fromCode}
                </span>
                <span className={`text-xs ${blueLight}`}>→</span>
                <span className="text-sm font-medium text-gray-700">
                  {flight.toCode}
                </span>
              </div>
              {index < parsedFlights.length - 1 && (
                <div className="flex items-center mx-1">
                  <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-blue-400 rounded-full mx-0.5"></div>
                  <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className={`text-xs ${grayText} mt-1`}>
          {parsedFlights.length} segments • {parsedFlights.reduce((sum, f) => sum + f.duration.replace(/[^0-9]/g, ''), 0) / 100}h total duration
        </div>
      </div>

      {/* First Flight */}
      <FlightSegment 
        flightData={parsedFlights[0]} 
        label={`Flight 1 • ${formatDate(parsedFlights[0].date)}`}
        isMultiCity={true}
      />

      {/* Remaining Flights */}
      {parsedFlights.slice(1).map((flightData, i) => {
        const flightIndex = i + 1;
        const isExpanded = expandedFlights.includes(flightIndex);
        const formattedDate = formatDate(flightData.date);
        
        return (
          <div key={flightIndex}>
            <div className={`border-t ${blueBorder} my-3`}></div>

            <div>
              <button
                onClick={() => toggleFlight(flightIndex)}
                className={`flex items-center justify-between w-full py-2 px-2 rounded transition-colors ${blueHover}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${bluePrimary}`}></div>
                  <span className={`text-sm font-semibold ${bluePrimary}`}>
                    Flight {flightIndex + 1}
                    {formattedDate && ` • ${formattedDate}`}
                  </span>
                  <span className="text-xs text-gray-600">
                    {flightData.from} → {flightData.to}
                  </span>
                </div>
                {isExpanded ? (
                  <FaChevronUp className={`text-blue-500 text-sm`} />
                ) : (
                  <FaChevronDown className={`text-blue-500 text-sm`} />
                )}
              </button>

              {isExpanded && (
                <div className="mt-2 ml-3 pl-3 border-l-2 border-blue-200">
                  <FlightSegment 
                    flightData={flightData} 
                    label="" 
                    isCompact 
                    isMultiCity={true}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Price and Select Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-blue-100 mt-3 pt-3 gap-3">
        <div className="flex flex-col">
          <div className="text-2xl font-bold text-gray-900">
            ₹{formattedPrice}
          </div>
          <div className={`text-xs ${grayText}`}>
            Total for {parsedFlights[0]?.passengers}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleSelectFlights}
            className="px-6 py-2 bg-blue-800 text-white rounded-lg font-semibold hover:bg-blue-900 transition-all cursor-pointer w-full sm:w-auto shadow-sm hover:shadow-md"
          >
            Select All Flights
          </button>
        </div>
      </div>

      {/* Additional Info */}
      <div className={`text-xs ${grayText} mt-2 pt-2 border-t border-blue-50`}>
        <div className="flex flex-wrap items-center gap-3">
          <span>Total flights: {parsedFlights.length}</span>
          <span>Total segments: {parsedFlights.reduce((sum, f) => sum + f.stopsCount + 1, 0)}</span>
          <span>Average duration per flight: {Math.round(parsedFlights.reduce((sum, f) => {
            const match = f.duration.match(/(\d+)h\s*(\d+)?m/);
            const hours = match ? parseInt(match[1]) : 0;
            const minutes = match && match[2] ? parseInt(match[2]) : 0;
            return sum + hours * 60 + minutes;
          }, 0) / parsedFlights.length)} min</span>
        </div>
      </div>
    </div>
  );
}