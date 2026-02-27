// RoundFlightCard.jsx
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

// Helper: split a COMBO object's sI into outbound + return segments
const splitCombo = (combo) => {
  const segments = combo?.sI || [];
  const splitIndex = segments.findIndex((seg) => seg.isRs === true);

  if (splitIndex === -1) {
    return {
      outbound: { sI: segments, totalPriceList: combo.totalPriceList || [] },
      return: null,
    };
  }

  const outboundSegments = segments.slice(0, splitIndex);
  const returnSegments = segments.slice(splitIndex);

  const outbound = {
    sI: outboundSegments,
    totalPriceList: combo.totalPriceList || [],
  };
  const ret = {
    sI: returnSegments,
    totalPriceList: combo.totalPriceList || [],
  };

  return { outbound, return: ret };
};

// Flight Segment component
const FlightSegment = ({ flightData, label, isCompact = false, isReturn = false }) => {
  const getStopsColor = (stopsCount) => {
    if (stopsCount === 0) return "text-green-600 bg-green-50";
    if (stopsCount === 1) return "text-blue-600 bg-blue-50";
    return "text-orange-600 bg-orange-50";
  };

  const stopsColorClass = getStopsColor(flightData.stopsCount);

  return (
    <div className={`${isCompact ? "py-2" : "py-3"} ${isReturn ? blueBgLight : ""} rounded-lg`}>
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

export default function ReturnFlightCard({
  outboundFlight,
  returnFlight,
  searchParams,
}) {
  const [showReturnDetails, setShowReturnDetails] = useState(false);
  const navigate = useNavigate();

  // Core parser: converts a Tripjack TripInfo-like object into UI-friendly fields
  const parseFlightData = (flight, isReturn = false) => {
    if (!flight) {
      const from = isReturn
        ? typeof searchParams?.to === "object"
          ? searchParams.to.city
          : searchParams?.to
        : typeof searchParams?.from === "object"
        ? searchParams.from.city
        : searchParams?.from;

      const to = isReturn
        ? typeof searchParams?.from === "object"
          ? searchParams.from.city
          : searchParams?.from
        : typeof searchParams?.to === "object"
        ? searchParams.to.city
        : searchParams?.to;

      const fromCode = isReturn
        ? searchParams?.to?.code
        : searchParams?.from?.code;
      const toCode = isReturn
        ? searchParams?.from?.code
        : searchParams?.to?.code;

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
        price: 0,
        from: from || "N/A",
        to: to || "N/A",
        aircraft: "N/A",
        fromCode: fromCode || "N/A",
        toCode: toCode || "N/A",
        date: isReturn ? searchParams?.returnDate : searchParams?.departureDate,
        passengers: `${searchParams?.passengers?.adults || 1} Adult${
          (searchParams?.passengers?.adults || 1) > 1 ? "s" : ""
        }`,
        rawFlightData: flight,
        priceId: flight?.totalPriceList?.[0]?.id || null,
        cabinClass: flight?.totalPriceList?.[0]?.cc || "Economy",
      };
    }

    const segments = flight?.sI || [];

    if (segments.length === 0) {
      return parseFlightData(null, isReturn);
    }

    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];

    const airline = firstSegment?.fD?.aI?.name || "Unknown Airline";
    const airlineCode = firstSegment?.fD?.aI?.code || "";
    const flightNumber = firstSegment?.fD?.fN || "N/A";
    const logo = `https://images.kiwi.com/airlines/64x64/${airlineCode}.png`;

    const formatTime = (dateTimeString) => {
      if (!dateTimeString) return "N/A";
      try {
        const date = new Date(dateTimeString);
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      } catch (e) {
        return "N/A";
      }
    };

    const departureTime = formatTime(firstSegment?.depTime);
    const arrivalTime = formatTime(lastSegment?.arrTime);

    const totalMinutes =
      segments.reduce((sum, s) => sum + (s.duration || 0), 0) ||
      firstSegment?.duration ||
      0;
    const duration =
      totalMinutes === 0
        ? "N/A"
        : `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;

    const stopsCount = Math.max(0, segments.length - 1);
    const stopsText = stopsCount === 0 ? "Direct" : `${stopsCount} stop${stopsCount > 1 ? 's' : ''}`;

    const adultFare = flight?.pricing?.totalFare || 0;
    const price = Math.round(adultFare);

    const baggageInfo = flight?.totalPriceList?.[0]?.fd?.ADULT?.bI;
    const baggage = baggageInfo?.iB || "Baggage info not available";

    const fareType = flight?.totalPriceList?.[0]?.fareIdentifier || "";
    const refundable =
      fareType.includes("REFUNDABLE") ||
      flight?.totalPriceList?.[0]?.fd?.ADULT?.rT === 1;

    const aircraft = firstSegment?.fD?.ac || "N/A";

    const segmentFromCity = firstSegment?.da?.city || firstSegment?.da?.name;
    const segmentFromCode = firstSegment?.da?.code;
    const segmentToCity = lastSegment?.aa?.city || lastSegment?.aa?.name;
    const segmentToCode = lastSegment?.aa?.code;

    let fromLocation, toLocation, fromCode, toCode;

    if (isReturn) {
      fromLocation =
        typeof searchParams?.to === "object"
          ? searchParams.to.city
          : searchParams?.to || segmentFromCity || "N/A";
      toLocation =
        typeof searchParams?.from === "object"
          ? searchParams.from.city
          : searchParams?.from || segmentToCity || "N/A";
      fromCode = searchParams?.to?.code || segmentFromCode || "N/A";
      toCode = searchParams?.from?.code || segmentToCode || "N/A";
    } else {
      fromLocation =
        typeof searchParams?.from === "object"
          ? searchParams.from.city
          : searchParams?.from || segmentFromCity || "N/A";
      toLocation =
        typeof searchParams?.to === "object"
          ? searchParams.to.city
          : searchParams?.to || segmentToCity || "N/A";
      fromCode = searchParams?.from?.code || segmentFromCode || "N/A";
      toCode = searchParams?.to?.code || segmentToCode || "N/A";
    }

    return {
      airline,
      flightNumber,
      logo,
      departure: departureTime,
      arrival: arrivalTime,
      duration,
      stops: stopsText,
      stopsCount,
      baggage,
      refundable,
      price,
      from: fromLocation,
      to: toLocation,
      aircraft,
      fromCode,
      toCode,
      date: isReturn ? searchParams?.returnDate : searchParams?.departureDate,
      passengers: `${searchParams?.passengers?.adults || 1} Adult${
        (searchParams?.passengers?.adults || 1) > 1 ? "s" : ""
      }`,
      rawFlightData: flight,
      priceId: flight?.totalPriceList?.[0]?.id || null,
      cabinClass: flight?.totalPriceList?.[0]?.cc || "Economy",
    };
  };

  const normalized = useMemo(() => {
    if (returnFlight) {
      return {
        outbound: outboundFlight,
        returnFlight: returnFlight
      };
    }

    if (outboundFlight?.type === "S1") {
      const s1 = outboundFlight;
      const s2 = outboundFlight?.pairedReturn || null;
      return {
        outbound: s1,
        returnFlight: s2
      };
    }

    if (outboundFlight && Array.isArray(outboundFlight.sI)) {
      const hasIsRs = outboundFlight.sI.some(seg => seg.isRs === true);

      if (hasIsRs) {
        const { outbound, return: ret } = splitCombo(outboundFlight);
        return { outbound, returnFlight: ret };
      }

      return { outbound: outboundFlight, returnFlight: null };
    }

    return { outbound: outboundFlight || null, returnFlight: null };
  }, [outboundFlight, returnFlight]);

  const outboundData = parseFlightData(normalized.outbound, false);
  const returnData = parseFlightData(normalized.returnFlight, true);
  const totalPrice = (outboundData.price || 0) + (returnData.price || 0);

  const outboundPriceId = normalized.outbound?.totalPriceList?.[0]?.id || null;
  const returnPriceId = normalized.returnFlight?.totalPriceList?.[0]?.id || null;

  const handleSelectFlight = () => {
    const tripInfos = {};
    if (normalized.outbound?.sI && normalized.returnFlight?.sI) {
      tripInfos.COMBO = [
        {
          ...normalized.outbound,
          sI: [
            ...(normalized.outbound.sI || []),
            ...(normalized.returnFlight.sI || []),
          ],
          totalPriceList:
            normalized.outbound.totalPriceList ||
            normalized.returnFlight?.totalPriceList ||
            [],
        },
      ];
      tripInfos.ONWARD = [normalized.outbound];
      tripInfos.RETURN = [normalized.returnFlight];
    } else if (normalized.outbound?.sI) {
      tripInfos.ONWARD = [normalized.outbound];
    } else {
      tripInfos.ONWARD = [normalized.outbound];
      if (normalized.returnFlight) tripInfos.RETURN = [normalized.returnFlight];
    }

    navigate("/round-trip-booking", {
      state: {
        selectedFlight: {
          onward: normalized.outbound,
          return: normalized.returnFlight,
          priceIds: [outboundPriceId, returnPriceId].filter(Boolean),
        },
        searchParams,
        rawFlightData: {
          tripInfos,
          onwardFlight: normalized.outbound,
          returnFlight: normalized.returnFlight,
          searchParams,
          priceIds: [outboundPriceId, returnPriceId].filter(Boolean),
        },
        tripType: normalized.returnFlight ? "round-trip" : "one-way",
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

  const formattedOutboundDate = formatDate(outboundData.date);
  const formattedReturnDate = formatDate(returnData.date);

  return (
    <div className={`w-full relative bg-white border ${blueBorder} rounded-lg p-4 hover:shadow-lg transition-all ${blueHover}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 ${blueBgLight} ${bluePrimary} text-sm font-semibold rounded-full`}>
            {normalized.returnFlight ? "Round Trip" : "Itinerary"}
          </span>
          <span className={`text-xs ${grayText}`}>
            {outboundData.passengers}
          </span>
        </div>
      </div>

      {/* Outbound Flight */}
      <FlightSegment 
        flightData={outboundData} 
        label={`Outbound • ${formattedOutboundDate}`} 
      />

      {/* Divider */}
      <div className={`border-t ${blueBorder} my-3`}></div>

      {/* Return Flight */}
      <div>
        <button
          onClick={() => setShowReturnDetails(!showReturnDetails)}
          className={`flex items-center justify-between w-full py-2 px-2 rounded transition-colors ${blueHover}`}
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${normalized.returnFlight ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
            <span className={`text-sm font-semibold ${bluePrimary}`}>
              Return {normalized.returnFlight ? `• ${formattedReturnDate}` : '(Not selected)'}
            </span>
            <span className="text-xs text-gray-600">
              {returnData.from} → {returnData.to}
            </span>
          </div>
          {normalized.returnFlight && (
            showReturnDetails ? (
              <FaChevronUp className="text-blue-500 text-sm" />
            ) : (
              <FaChevronDown className="text-blue-500 text-sm" />
            )
          )}
        </button>

        {showReturnDetails && normalized.returnFlight && (
          <div className="mt-2 ml-3 pl-3 border-l-2 border-blue-200">
            <FlightSegment 
              flightData={returnData} 
              label="" 
              isCompact 
              isReturn={true}
            />
          </div>
        )}
      </div>

      {/* Price and Select Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-blue-100 mt-3 pt-3 gap-3">
        <div className="flex flex-col">
          <div className="text-2xl font-bold text-gray-900">
            ₹{totalPrice > 0 ? totalPrice.toLocaleString('en-IN') : "N/A"}
          </div>
          <div className={`text-xs ${grayText}`}>
            Total for {outboundData.passengers}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleSelectFlight}
            className="px-6 py-2 bg-blue-800 text-white rounded-lg font-semibold hover:bg-blue-900 transition-all cursor-pointer w-full sm:w-auto shadow-sm hover:shadow-md"
          >
            Select Flights
          </button>
        </div>
      </div>

      {/* Additional Info */}
      {normalized.returnFlight && (
        <div className={`text-xs ${grayText} mt-2 pt-2 border-t border-blue-50`}>
          <div className="flex items-center gap-4">
            <span>Outbound: {outboundData.airline} • {outboundData.duration}</span>
            <span>Return: {returnData.airline} • {returnData.duration}</span>
          </div>
        </div>
      )}
    </div>
  );
}