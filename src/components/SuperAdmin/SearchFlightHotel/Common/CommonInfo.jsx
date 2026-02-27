// Admin/src/components/SearchFlightHotel/common/CommonInfo.jsx
import React, { useState, useMemo } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import {
  FaPlane,
  FaUser,
  FaPlaneDeparture,
  FaPlaneArrival,
} from "react-icons/fa";

import {
  MdEventSeat,
  MdCancel,
  MdAutorenew,
  MdInfo,
  MdWork,
} from "react-icons/md";

import {
  AiOutlineCheck,
  AiOutlineMinus,
  AiOutlinePlus,
} from "react-icons/ai";

import {
  BsCashStack,
  BsTag,
  BsInfoCircleFill,
  BsLuggage,
} from "react-icons/bs";

import {
  IoPersonAdd,
  IoPersonRemove,
} from "react-icons/io5";

/* ---------- colors ---------- */
export const orangeText = "text-[#F97415]";
export const orangeBg = "bg-[#F97415]";
export const blueBg = "bg-[#1a2957]";
export const blueText = "text-[#1a2957]";
export const grayText = "text-[#808080]";
export const greenText = "text-[#16A34A]";
export const lightGreenBg = "bg-[#16A34A]/10";


/* ---------- COMPONENTS ---------- */
const isInternationalCombo = (rawFlightData, searchParams) => {
  return (
    rawFlightData?.tripInfos?.COMBO &&
    Array.isArray(searchParams?.searchQuery?.routeInfos) &&
    searchParams.searchQuery.routeInfos.length > 1
  );
};

// Helper functions
export const formatTime = (dateTimeString) => {
  if (!dateTimeString) return "N/A";
  try {
    const d = new Date(dateTimeString);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "N/A";
  }
};

export const formatDate = (dateTimeString) => {
  if (!dateTimeString) return "N/A";
  try {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (e) {
    return "N/A";
  }
};

export const formatDurationCompact = (totalMinutes) => {
  if (typeof totalMinutes !== "number" || Number.isNaN(totalMinutes))
    return "0h:00m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h:${minutes.toString().padStart(2, "0")}m`;
};

export const getAirlineLogo = (code) => {
  if (!code) return "https://via.placeholder.com/64";
  return `https://images.kiwi.com/airlines/64x64/${code}.png`;
};

export const formatDuration = (totalMinutes) => {
  if (!totalMinutes) return "0h 00m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
};

// ✅ TripJack International Multi-City / Return (COMBO)
export const parseInternationalCombo = (rawFlightData, searchParams) => {
  console.error("🔥 PARSE INTL COMBO EXECUTED");

  const combo = rawFlightData?.tripInfos?.COMBO?.[0];
  if (!combo) return null;

  const allSegments = combo.sI || [];
  const legs = [];
  let currentLeg = [];

  allSegments.forEach((seg, idx) => {
    // sN === 0 means NEW ROUTE starts (except first segment)
    if (seg.sN === 0 && currentLeg.length > 0) {
      legs.push(currentLeg);
      currentLeg = [];
    }
    currentLeg.push(seg);
  });

  if (currentLeg.length) {
    legs.push(currentLeg);
  }

  const parsedLegs = legs.map((legSegments, index) => {
    const parsed = parseOneWayData(
      {
        sI: legSegments,
        totalPriceList: combo.totalPriceList,
      },
      searchParams
    );

    parsed.segmentsCorrected = legSegments;
    parsed.segmentIndex = index;

    return parsed;
  });

  return {
    type: "multi-way",
    isInternational: true,
    allSegmentsData: parsedLegs,
    totalPrice: combo?.totalPriceList?.[0]?.fd?.ADULT?.fC?.TF || 0,
    baggageInfo: combo?.totalPriceList?.[0]?.fd?.ADULT?.bI || {},
    isRefundable: combo?.totalPriceList?.[0]?.fd?.ADULT?.rT === 1,
    fareClass: combo?.totalPriceList?.[0]?.fd?.ADULT?.cc || "ECONOMY",
  };
};

// Flight Data Parsing gFunctions
export const parseFlightData = (rawFlightData, tripType, searchParams = {}) => {
  if (!rawFlightData) return null;

  // 🔥 INTERNATIONAL COMBO OVERRIDE (TripJack rule)
  if (isInternationalCombo(rawFlightData, searchParams)) {
    return parseInternationalCombo(rawFlightData, searchParams);
  }

  switch (tripType) {
    case "round-trip":
      return parseRoundTripData(rawFlightData, searchParams);
    case "multi-way":
      return parseMultiWayData(rawFlightData, searchParams);
    case "one-way":
    default:
      return parseOneWayData(rawFlightData, searchParams);
  }
};

const _norm = (v = "") => (v || "").toString().trim().toUpperCase();

const formatPassengers = (passengers = {}) => {
  const adults = passengers.adults || 1;
  const children = passengers.children || 0;
  const infants = passengers.infants || 0;
  let result = `${adults} Adult${adults > 1 ? "s" : ""}`;
  if (children > 0) result += `, ${children} Child${children > 1 ? "ren" : ""}`;
  if (infants > 0) result += `, ${infants} Infant${infants > 1 ? "s" : ""}`;
  return result;
};

export const parseOneWayData = (rawFlightData, searchParams = {}) => {
  const segments = rawFlightData?.sI || [];
  const totalPriceList = rawFlightData?.totalPriceList || [];

  if (segments.length === 0) return null;

  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];

  // Fare details
  const adultFare = totalPriceList[0]?.fd?.ADULT?.fC || {};
  const baggageInfo = totalPriceList[0]?.fd?.ADULT?.bI || {};
  const isRefundable = totalPriceList[0]?.fd?.ADULT?.rT === 1;
  const fareClass = totalPriceList[0]?.fd?.ADULT?.cc || "ECONOMY";

  // Duration
  const totalDuration = segments.reduce(
    (sum, segment) => sum + (segment.duration || 0),
    0
  );

  // FINAL FIX ❗
  // → Ensure DATE ALWAYS comes from actual flight segment, never from searchParams
  const flightDate = firstSegment?.depTime ? formatDate(firstSegment.dt) : "N/A";

  return {
    type: "one-way",
    segments,
    totalPriceList,
    adultFare,
    baggageInfo,
    isRefundable,
    fareClass,
    totalDuration,

    flightData: {
      airline:
        firstSegment?.fD?.aI?.name ||
        firstSegment?.oB?.name ||
        "Unknown Airline",

      airlineCode: firstSegment?.fD?.aI?.code || firstSegment?.oB?.code || "",
      flightNumber: firstSegment?.fD?.fN || "N/A",

      logo: getAirlineLogo(
        firstSegment?.fD?.aI?.code || firstSegment?.oB?.code || ""
      ),

      departure: formatTime(firstSegment?.depTime),
      arrival: formatTime(lastSegment?.at),

      from: firstSegment?.da?.city || "N/A",
      fromCode: firstSegment?.da?.code || "N/A",
      fromAirport: firstSegment?.da?.name || "N/A",
      fromTerminal: firstSegment?.da?.terminal || "N/A",

      to: lastSegment?.aa?.city || "N/A",
      toCode: lastSegment?.aa?.code || "N/A",
      toAirport: lastSegment?.aa?.name || "N/A",
      toTerminal: lastSegment?.aa?.terminal || "N/A",

      duration: formatDurationCompact(totalDuration),

      stops:
        segments.length - 1 === 0
          ? "Nonstop"
          : `${segments.length - 1} stop${segments.length - 1 > 1 ? "s" : ""}`,

      stopsCount: segments.length - 1,
      aircraft: firstSegment?.fD?.eT || "N/A",

      // FINAL FIX — The REAL date
      date: flightDate,

      passengers: formatPassengers(searchParams.passengers),
    },

    // ALWAYS use Adult Total Fare
    basePrice: Math.round(adultFare.TF || 0),
  };
};

// Improved parseRoundTripData
export const parseRoundTripData = (rawFlightData = {}, searchParams = {}) => {
  const tripInfos = rawFlightData?.tripInfos || {};

  // Use direct flight objects if available, otherwise fall back to tripInfos
  let onwardFlights = rawFlightData.onwardFlight
    ? [rawFlightData.onwardFlight]
    : tripInfos.ONWARD || [];
  let returnFlights = rawFlightData.returnFlight
    ? [rawFlightData.returnFlight]
    : tripInfos.RETURN || [];

  // Ensure we have arrays
  onwardFlights = Array.isArray(onwardFlights) ? onwardFlights : [];
  returnFlights = Array.isArray(returnFlights) ? returnFlights : [];

  if (onwardFlights.length === 0 || returnFlights.length === 0) {
    console.warn("parseRoundTripData: missing onward or return flights");
    return null;
  }

  const onwardFlight = onwardFlights[0];
  const returnFlight = returnFlights[0];

  // Parse segments with better error handling
  const onwardSegments = (onwardFlight?.sI || []).map((segment) => ({
    ...segment,
    da: segment.da || {},
    aa: segment.aa || {},
    fD: segment.fD || {},
  }));

  const returnSegments = (returnFlight?.sI || []).map((segment) => ({
    ...segment,
    da: segment.da || {},
    aa: segment.aa || {},
    fD: segment.fD || {},
  }));

  // Parse each leg
  const onwardData = parseOneWayData(
    {
      sI: onwardSegments,
      totalPriceList: onwardFlight?.totalPriceList || [],
    },
    searchParams
  );

  const returnData = parseOneWayData(
    {
      sI: returnSegments,
      totalPriceList: returnFlight?.totalPriceList || [],
    },
    searchParams
  );

  if (!onwardData || !returnData) {
    console.error("Failed to parse flight data");
    return null;
  }

  const totalPrice =
    (onwardData?.basePrice || 0) + (returnData?.basePrice || 0);

  return {
    type: "round-trip",
    onwardSegments,
    returnSegments,
    onwardData,
    returnData,
    basePrice: onwardData?.basePrice || 0,
    returnBasePrice: returnData?.basePrice || 0,
    totalPrice,
    totalDuration: onwardData?.totalDuration || 0,
    returnTotalDuration: returnData?.totalDuration || 0,
    baggageInfo: onwardData?.baggageInfo || {},
    returnBaggageInfo: returnData?.baggageInfo || {},
    isRefundable: onwardData?.isRefundable || false,
    fareClass: onwardData?.fareClass || "ECONOMY",
    flightData: onwardData?.flightData || {},
    returnFlightData: returnData?.flightData || {},
  };
};

export const parseMultiWayData = (rawFlightData, searchParams) => {
  const tripInfos =
    rawFlightData?.searchResult?.tripInfos || rawFlightData?.tripInfos || {};

  const legsFromSearch = searchParams?.multiCityFlights || [];
  const allSegmentsData = [];

  // Normalize keys like: ["1","2","3"] or ["S1","S2","S3"]
  const orderedKeys = Object.keys(tripInfos).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, "")) || 0;
    const numB = parseInt(b.replace(/\D/g, "")) || 0;
    return numA - numB;
  });

  // For each leg
  orderedKeys.forEach((key, index) => {
    const flights = tripInfos[key];
    if (!Array.isArray(flights) || flights.length === 0) return;

    // const flight = flights[0];

    const searchLeg = legsFromSearch[index];
    const fromCity = searchLeg?.from?.city || searchLeg?.from;
    const toCity = searchLeg?.to?.city || searchLeg?.to;
    const fromCode = searchLeg?.from?.code;
    const toCode = searchLeg?.to?.code;

    const flight =
      flights.find((f) => {
        const segs = f.sI || [];
        const first = segs[0];
        const last = segs[segs.length - 1];

        return (
          _norm(first?.da?.code) === _norm(fromCode) &&
          _norm(last?.aa?.code) === _norm(toCode)
        );
      }) || flights[0];
    const segments = Array.isArray(flight.sI) ? flight.sI : [];

    // Parse segments using your one-way parser
    const segmentData = parseOneWayData(
      {
        sI: segments,
        totalPriceList: flight.totalPriceList || [],
      },
      searchParams
    );
    segmentData.segmentsCorrected = segments.map((seg) => ({
      ...seg,
      da: { ...seg.da },
      aa: { ...seg.aa },
      fD: { ...seg.fD },
    }));

    if (segmentData.segmentsCorrected.length > 0) {
      // Fix real departure
      segmentData.segmentsCorrected[0].da.city = fromCity;
      segmentData.segmentsCorrected[0].da.code = fromCode;

      // Fix real arrival
      const last = segmentData.segmentsCorrected.length - 1;
      segmentData.segmentsCorrected[last].aa.city = toCity;
      segmentData.segmentsCorrected[last].aa.code = toCode;
    }

    if (!segmentData) return;

    // Override with guaranteed correct data from searchParams
    segmentData.flightData = {
      from: fromCity,
      fromCode,
      to: toCity,
      toCode,
      date: searchLeg?.date,
    };

    segmentData.segmentIndex = index;
    segmentData.segmentKey = key;

    allSegmentsData.push(segmentData);
  });

  if (allSegmentsData.length === 0) return null;

  const totalPrice = allSegmentsData.reduce(
    (sum, seg) => sum + (seg.basePrice || 0),
    0
  );

  const totalDuration = allSegmentsData.reduce(
    (sum, seg) => sum + (seg.totalDuration || 0),
    0
  );

  const first = allSegmentsData[0];

  return {
    type: "multi-way",
    allSegmentsData,
    totalPrice,
    basePrice: first.basePrice,
    totalDuration,
    baggageInfo: first.baggageInfo,
    isRefundable: first.isRefundable,
    fareClass: first.fareClass,
    flightData: first.flightData,
  };
};

// Flight Timeline Component
export const FlightTimeline = ({
  segments = [],
  selectedSeats = {},
  openSeatModal,
  isMultiWay = false,
  allSegmentsData = [],
  journeyType = "onward",
  reviewResponse,
}) => {
  const formatDateTime = (dateString) => {
    if (!dateString) return { date: "", time: "" };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  if (!segments || segments.length === 0) {
    return <p className="text-gray-500">No flight segments available.</p>;
  }

  return (
    <div className="space-y-6">
      {segments.map((segment, idx) => {
        const departure = formatDateTime(segment.dt);
        const arrival = formatDateTime(segment.at);

        return (
          <div key={idx}>
            <div className="relative">
              {/* Departure */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-500 mt-1 flex items-center justify-center">
                  <FaPlaneDeparture className="text-white" size={25} />{" "}
                </div>
                <div className="flex-1">
                  <p className="text-xl font-bold">{departure.time}</p>
                  <p className="text-sm text-gray-600">
                    {segment.da?.city || "N/A"} ({segment.da?.code || "N/A"})
                  </p>
                  <p className="text-xs text-blue-600">
                    {segment.da?.name || "N/A"}
                  </p>
                  <p className="text-xs text-gray-600">
                    Terminal:{" "}
                    <span className="text-orange-500">
                      {segment.da?.terminal || "N/A"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Flight info with seat selection */}
              <div className="flex items-start gap-4 mt-4">
                <div className="flex-1 pb-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={getAirlineLogo(
                            segment.fD?.aI?.code || segment.oB?.code
                          )}
                          alt={
                            segment.fD?.aI?.name ||
                            segment.oB?.name ||
                            "Airline"
                          }
                          className="w-6 h-6"
                          onError={(e) =>
                            (e.target.src = "https://via.placeholder.com/24")
                          }
                        />
                        <span className="font-semibold text-sm">
                          {segment.fD?.aI?.name ||
                            segment.oB?.name ||
                            "Unknown Airline"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {segment.fD?.aI?.code || ""}-{segment.fD?.fN || ""}
                        </span>
                      </div>

                      {openSeatModal && (
                        <button
                          onClick={() =>
                            openSeatModal(segment, idx, segment.dt, journeyType)
                          }
                          className={`flex items-center gap-2 px-3 py-1.5 ${orangeBg} text-white rounded-lg text-xs font-semibold hover:bg-orange-600 transition`}
                        >
                          <MdEventSeat />
                          Select Seats
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      Duration: {formatDurationCompact(segment.duration)} •{" "}
                      {segment.fD?.eT || "Aircraft"}
                    </p>

                    {/* === Selected Seats + Aircraft Block === */}
                    {(() => {
                      const seatKey = `${journeyType}-flight-${idx}`;
                      const seatObj = selectedSeats[seatKey];
                      const seats = Array.isArray(seatObj?.list)
                        ? seatObj.list
                        : [];

                      if (seats.length === 0) return null;

                      return (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                          <p className="text-xs font-semibold text-green-800">
                            Selected Seats: {seats.join(", ")}
                          </p>

                          {/* Aircraft */}
                          {segment?.fD?.eT && (
                            <p className="text-[11px] text-green-700 mt-1">
                              Aircraft: {segment.fD.eT}
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Arrival */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-900 mt-2 flex items-center justify-center">
                  <FaPlaneArrival size={25} className="text-white" />{" "}
                </div>
                <div className="flex-1">
                  <p className="text-xl font-bold">{arrival.time}</p>
                  <p className="text-sm text-gray-600">
                    {segment.aa?.city || "N/A"} ({segment.aa?.code || "N/A"})
                  </p>
                  <p className="text-xs text-blue-600">
                    {segment.aa?.name || "N/A"}
                  </p>
                  <p className="text-xs text-gray-600">
                    Terminal:{" "}
                    <span className="text-orange-500">
                      {segment.aa?.terminal || "N/A"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Layover info */}
            {idx < segments.length - 1 && (
              <div className="ml-7 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-medium">
                  Layover at {segment.aa?.city || "N/A"} •{" "}
                  {formatDurationCompact(segment.layoverTime || 60)}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Enhanced RoundTripFlightTimeline with better data handling
export const RoundTripFlightTimeline = ({
  segments = [],
  isReturnJourney = false,
  selectedSeats = {},
  openSeatModal,
  journeyType,
}) => {
  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const calcLayover = (arrival, nextDeparture) => {
    const a = new Date(arrival);
    const b = new Date(nextDeparture);
    const diff = (b - a) / 1000 / 60;
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hrs}h ${mins}m`;
  };

  if (!segments.length) {
    return <div className="text-center text-gray-500">No flight segments</div>;
  }

  return (
    <div className="space-y-10">
      {segments.map((seg, idx) => {
        const depart = seg?.da;
        const arrive = seg?.aa;

        const flight = seg?.fD || {};
        const airline = flight?.aI || {};

        return (
          <div key={idx} className="relative  pl-6">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center  justify-center">
                {" "}
                <FaPlaneDeparture size={25} className="text-white" />{" "}
              </div>
              {/* DEPARTURE */}
              <div className="mb-3">
                <p className="text-xl font-semibold">
                  {formatDateTime(seg.dt)}
                </p>
                <p className="text-sm font-bold">{depart?.city}</p>
                <p className="text-xs text-blue-500">{depart?.name}</p>
                <p className="text-xs text-gray-600">
                  Terminal:{" "}
                  <span className="text-orange-500">
                    {depart?.terminal || "N/A"}
                  </span>
                </p>
              </div>
            </div>

            {/* FLIGHT CARD */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={`https://images.kiwi.com/airlines/64x64/${airline.code}.png`}
                    className="w-10 h-10 rounded"
                    alt=""
                  />
                  <div>
                    <p className="font-bold">{airline.name}</p>
                    <p className="text-xs text-gray-500">
                      {airline.code}-{flight.fN}
                    </p>
                  </div>
                </div>

                <button
                  className="px-3 py-2 bg-orange-500 text-white rounded-lg"
                  onClick={() =>
                    openSeatModal(seg, idx, journeyType, seg.dt, reviewResponse)
                  }
                >
                  <MdEventSeat className="inline mr-1" />
                  Select Seats
                </button>
              </div>

              <div className="mt-2 text-sm text-gray-600">
                <span>Duration: {seg.duration} mins</span>
                <span className="mx-2">•</span>
                <span>Aircraft: {flight.eT || "N/A"}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              {/* ARRIVAL */}
              <div className="flex items-center justify-center w-10 h-10 bg-blue-900 rounded-full">
                {" "}
                <FaPlaneArrival size={25} className="text-white" />{" "}
              </div>

              <div>
                <p className="text-xl font-semibold">
                  {formatDateTime(seg.at)}
                </p>
                <p className="text-sm font-bold">{arrive?.city}</p>
                <p className="text-xs text-blue-500">{arrive?.name}</p>
                <p className="text-xs text-gray-600">
                  Terminal:{" "}
                  <span className="text-orange-500">
                    {arrive?.terminal || "N/A"}
                  </span>
                </p>
              </div>
            </div>

            {/* LAYOVER */}
            {idx < segments.length - 1 && (
              <div className="ml-7 mt-5 p-3 text-center bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-medium">
                  Layover at: {calcLayover(seg.at, segments[idx + 1].dt)} in{" "}
                  {arrive?.city}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const MultiCityFlightTimeline = ({
  segments = [],
  openSeatModal,
  segmentIndex,
}) => {
  if (!segments?.length) {
    return <p className="text-gray-500 text-center py-4">No segments found</p>;
  }

  const formatTime = (dt) =>
    new Date(dt).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  // ----- FIX 1: Remove duplicate segments -----
  const removeDuplicates = (segs) =>
    segs.filter((seg, idx, arr) => {
      if (idx === 0) return true;
      const prev = arr[idx - 1];
      return !(
        prev.da.code === seg.da.code &&
        prev.aa.code === seg.aa.code &&
        prev.dt === seg.dt &&
        prev.at === seg.at
      );
    });

  // ----- FIX 2: Fix reversed segments -----
  // const fixSegment = (seg) => {
  //   if (!seg.dt || !seg.at) return seg;
  //   const dt = new Date(seg.dt);
  //   const at = new Date(seg.at);
  //   if (at < dt) {
  //     return {
  //       ...seg,
  //       da: seg.aa,
  //       aa: seg.da,
  //       dt: seg.at,
  //       at: seg.dt,
  //     };
  //   }
  //   return seg;
  // };

  // Apply all cleanup
  // let cleanSegments = segments.map(fixSegment);
  let cleanSegments = removeDuplicates(segments);
  cleanSegments = removeDuplicates(cleanSegments);

  // ----- FIX 3: Ensure correct chronological order -----
  cleanSegments.sort((a, b) => new Date(a.dt) - new Date(b.dt));

  const calcLayover = (arrival, nextDeparture) => {
    const a = new Date(arrival);
    const b = new Date(nextDeparture);
    const diff = Math.max(0, (b - a) / 1000 / 60);
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="space-y-10">
      {cleanSegments.map((seg, idx) => {
        const depart = seg.da;
        const arrive = seg.aa;
        const flight = seg.fD || {};
        const airline = flight.aI || {};

        return (
          <div key={idx} className="relative pl-6">
            <div className="flex  gap-3">
              {/* Departure Dot */}
              <div className="w-10 h-10 bg-orange-500 rounded-full  flex items-center justify-center">
                {" "}
                <FaPlaneDeparture size={25} className="text-white" />{" "}
              </div>
              {/* Departure */}
              <div className="mb-3">
                <p className="text-xl font-semibold">{formatTime(seg.dt)}</p>
                <p className="text-sm font-bold">
                  {depart.city} ({depart.code})
                </p>
                <p className="text-xs text-gray-500">{depart.name}</p>
              </div>
            </div>
            {/* Flight Card */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={`https://images.kiwi.com/airlines/64x64/${airline.code}.png`}
                    className="w-10 h-10"
                  />
                  <div>
                    <p className="font-bold">{airline.name}</p>
                    <p className="text-xs text-gray-500">
                      {airline.code}-{flight.fN}
                    </p>
                  </div>
                </div>

                <button
                  className="px-3 py-2 bg-orange-500 text-white rounded-lg"
                  onClick={() =>
                    openSeatModal(seg, idx, `CITY-${segmentIndex}`, seg.dt)
                  }
                >
                  Select Seats
                </button>
              </div>

              <div className="mt-2 text-sm text-gray-600">
                Duration: {seg.duration} mins • Aircraft: {flight.eT || "N/A"}
              </div>
            </div>

            <div className=" flex mt-4 gap-3">
              {/* Arrival */}
              <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center">
                <FaPlaneArrival size={25} className="text-white" />{" "}
              </div>
              <div>
                <p className="text-xl font-semibold">{formatTime(seg.at)}</p>
                <p className="text-sm font-bold">
                  {arrive.city} ({arrive.code})
                </p>
                <p className="text-xs text-gray-500">{arrive.name}</p>
              </div>
            </div>

            {/* Layover */}
            {idx < cleanSegments.length - 1 && (
              <div className="ml-7 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-medium">
                  Layover: {calcLayover(seg.at, cleanSegments[idx + 1].dt)} in{" "}
                  <strong>{cleanSegments[idx + 1].da.city}</strong>
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Fare Options Component
export const FareOptions = ({
  fareOptions = [],
  selectedFare,
  onFareSelect,
  expandedFare,
  onExpandFare,
}) => {
  if (!fareOptions || fareOptions.length === 0) {
    return <p className="text-gray-500">No fare options available.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {fareOptions.map((fare) => (
        <div
          key={fare.type}
          onClick={() => onFareSelect(fare.type)}
          className={`border-2 rounded-lg p-4 cursor-pointer transition ${
            selectedFare === fare.type
              ? "border-orange-500 bg-orange-50"
              : "border-gray-200 hover:border-orange-300"
          } ${fare.popular ? "ring-2 ring-orange-200" : ""}`}
        >
          {fare.popular && (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
              Most Popular
            </span>
          )}
          <h4 className="font-bold text-lg mt-2">{fare.type}</h4>
          <p className="text-2xl font-bold text-orange-600 mt-2">
            ₹{(fare.price || 0).toLocaleString()}
          </p>
          <button
            className={`w-full mt-3 py-2 rounded-lg font-semibold transition ${
              selectedFare === fare.type
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {selectedFare === fare.type ? "Selected" : "Select"}
          </button>

          <div className="mt-4 space-y-2">
            {(fare.features || []).slice(0, 3).map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                {feature.included ? (
                  <AiOutlineCheck className="text-green-600" />
                ) : (
                  <span className="text-red-500">✕</span>
                )}
                <span
                  className={
                    feature.included
                      ? "text-gray-700"
                      : "text-gray-400 line-through"
                  }
                >
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpandFare(expandedFare === fare.type ? null : fare.type);
            }}
            className="text-sm text-orange-600 hover:text-orange-700 mt-2 underline"
          >
            {expandedFare === fare.type ? "Show less" : "Show more"}
          </button>

          {expandedFare === fare.type && (
            <div className="mt-3 pt-3 border-t space-y-2">
              {(fare.features || []).slice(3).map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  {feature.included ? (
                    <AiOutlineCheck className="text-green-600" />
                  ) : (
                    <span className="text-red-500">✕</span>
                  )}
                  <span
                    className={
                      feature.included
                        ? "text-gray-700"
                        : "text-gray-400 line-through"
                    }
                  >
                    {feature.text}
                  </span>
                </div>
              ))}
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Conditions:
                </p>
                {(fare.conditions || []).map((condition, idx) => (
                  <p key={idx} className="text-xs text-gray-600">
                    • {condition}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Price Summary Component
export const PriceSummary = ({
  selectedFareData,
  travelers = [],
  totalSeatPrice = 0,
  couponCode = "",
  onCouponChange,
  onApplyCoupon,
  parsedFlightData = null,
  discountAmount = 0,
  selectedSeats = {},
}) => {
  // Determine per-passenger base fare depending on trip type
  const getPerPassengerBaseFare = () => {
    // If parsedFlightData is not available, fallback to selected fare price
    if (!parsedFlightData) return selectedFareData?.price || 0;

    // Round-trip: prefer parsedFlightData.basePrice + parsedFlightData.returnBasePrice
    if (parsedFlightData.type === "round-trip") {
      const onward = parsedFlightData.basePrice || 0;
      const ret =
        parsedFlightData.returnBasePrice ||
        parsedFlightData.returnData?.basePrice ||
        0;
      const sumLegs = onward + ret;
      if (sumLegs > 0) return sumLegs;
      // fallback to selected fare price if legs missing
      return selectedFareData?.price || 0;
    }

    // Multi-way: sum all segment base prices
    if (parsedFlightData.type === "multi-way") {
      const perPassenger = (parsedFlightData.allSegmentsData || []).reduce(
        (s, seg) => s + (seg.basePrice || 0),
        0
      );
      if (perPassenger > 0) return perPassenger;
      return selectedFareData?.price || 0;
    }

    // One-way / fallback
    return selectedFareData?.price || parsedFlightData.basePrice || 0;
  };

  const perPassengerBaseFare = getPerPassengerBaseFare();
  const travelerCount = travelers.length || 1;
  const totalBaseFare = Math.round(perPassengerBaseFare * travelerCount);

  // Calculate taxes (typically 5-12% of total base fare)
  const taxRate = 0.08; // 8% tax
  const taxAmount = Math.round(totalBaseFare * taxRate);

  // Convenience fee (per booking). If you want per-passenger, multiply by travelerCount.
  const convenienceFee = 99;

  // Calculate subtotal and total
  const subtotal = totalBaseFare + taxAmount + convenienceFee + totalSeatPrice;
  const totalAmount = Math.max(0, subtotal - (discountAmount || 0));

  // Get individual flight prices for multi-leg journeys
  const getFlightBreakdown = () => {
    if (!parsedFlightData) return [];

    if (parsedFlightData.type === "round-trip") {
      const onwardPrice = parsedFlightData.basePrice || 0;
      const returnPrice =
        parsedFlightData.returnBasePrice ||
        parsedFlightData.returnData?.basePrice ||
        0;

      // Use segment data directly for reliable city names
      const onwardSeg = parsedFlightData.onwardSegments;
      const returnSeg = parsedFlightData.returnSegments;

      const onwardFrom = onwardSeg[0]?.da?.city;
      const onwardTo = onwardSeg[onwardSeg.length - 1]?.aa?.city;
      const onwardDate = formatDate(onwardSeg[0]?.dt);

      const returnFrom = returnSeg[0]?.da?.city;
      const returnTo = returnSeg[returnSeg.length - 1]?.aa?.city;
      const returnDate = formatDate(returnSeg[0]?.dt);

      return [
        {
          label: "Onward Flight",
          from: onwardFrom,
          to: onwardTo,
          price: onwardPrice,
        },
        {
          label: "Return Flight",
          from: returnFrom,
          to: returnTo,
          price: returnPrice,
        },
      ];
    }

    if (parsedFlightData.type === "multi-way") {
      return (parsedFlightData.allSegmentsData || []).map((segment, index) => {
        const segs = segment.segments || [];
        return {
          label: `Flight ${index + 1}`,
          from: segment.flightData?.from || segs[0]?.da?.city || "N/A",
          to:
            segment.flightData?.to || segs[segs.length - 1]?.aa?.city || "N/A",
          price: segment.basePrice || 0,
        };
      });
    }

    // One-way
    const segments = parsedFlightData.segments || [];
    return [
      {
        label: "Flight",
        from:
          parsedFlightData.flightData?.from || segments[0]?.da?.city || "N/A",
        to:
          parsedFlightData.flightData?.to ||
          segments[segments.length - 1]?.aa?.city ||
          "N/A",
        price: parsedFlightData.basePrice || 0,
      },
    ];
  };

  const flightBreakdown = getFlightBreakdown();
  const hasMultipleFlights = flightBreakdown.length > 1;

  // 🔥 Generate seat breakdown from selectedSeats
  const seatBreakdown = useMemo(() => {
    if (!selectedSeats) return [];

    const list = [];

    Object.entries(selectedSeats).forEach(([key, value]) => {
      if (!value || !Array.isArray(value.list)) return;

      const [journeyType, , flightIndex] = key.split("-");

      list.push({
        journeyType,
        flightIndex,
        seats: value.list.map((seatNo) => ({
          seatNo,
          price: value.priceMap?.[seatNo] || 0,
        })),
      });
    });

    return list;
  }, [selectedSeats]);

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
      <div className={`${blueBg} text-white p-6`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <BsCashStack className="text-white text-2xl" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">Fare Summary</h3>
            <p className="text-sm text-blue-100 font-medium">
              Your booking breakdown
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Individual Flight Prices - Always show for round-trip/multi-way */}
        {flightBreakdown.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Flight Breakdown
            </p>
            {flightBreakdown.map((flight, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  index === 0
                    ? "bg-blue-50 border-blue-200"
                    : "bg-purple-50 border-purple-200"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FaPlane
                      className={`text-xs ${
                        index === 0 ? "text-blue-600" : "text-purple-600"
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold ${
                        index === 0 ? "text-blue-900" : "text-purple-900"
                      }`}
                    >
                      {flight.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {flight.from} → {flight.to}
                  </p>
                </div>
                <span
                  className={`font-bold ${
                    index === 0 ? "text-blue-900" : "text-purple-900"
                  }`}
                >
                  ₹{(flight.price || 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Fare Details */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            Fare Details
          </p>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <FaUser className="text-blue-900 text-sm" />
              <div>
                <span className="text-sm font-semibold text-gray-700">
                  Base Fare
                </span>
                <p className="text-xs text-gray-500">
                  {travelerCount} Adult{travelerCount > 1 ? "s" : ""} × ₹
                  {perPassengerBaseFare.toLocaleString()}
                </p>
              </div>
            </div>
            <span className="font-bold text-gray-900">
              ₹{totalBaseFare.toLocaleString()}
            </span>
          </div>

          {/* Taxes */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <BsTag className="text-gray-600 text-sm" />
              <div>
                <span className="text-sm font-semibold text-gray-700">
                  Taxes & Fees
                </span>
                <p className="text-xs text-gray-500">GST & Airport charges</p>
              </div>
            </div>
            <span className="font-bold text-gray-900">
              ₹{taxAmount.toLocaleString()}
            </span>
          </div>

          {/* Convenience Fee */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <BsInfoCircleFill className="text-gray-600 text-sm" />
              <span className="text-sm font-semibold text-gray-700">
                Convenience Fee
              </span>
            </div>
            <span className="font-bold text-gray-900">
              ₹{convenienceFee.toLocaleString()}
            </span>
          </div>

          {/* Seat Selection */}
          {/* Seat Price Breakdown */}
          {seatBreakdown.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-2">
                Seat Breakdown
              </p>

              {seatBreakdown.map((block, i) => (
                <div
                  key={i}
                  className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                >
                  <p className="font-semibold text-gray-700 mb-2 capitalize">
                    {block.journeyType === "onward"
                      ? "Onward Flight"
                      : block.journeyType === "return"
                      ? "Return Flight"
                      : `Flight ${block.flightIndex}`}
                  </p>

                  <ul className="space-y-1 text-sm">
                    {block.seats.map((seat, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between px-1"
                      >
                        <span className="text-gray-700">{seat.seatNo}</span>
                        <span className="font-semibold text-gray-900">
                          ₹{seat.price}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Discount */}
          {discountAmount > 0 && (
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-2 border-red-300">
              <div className="flex items-center gap-2">
                <AiOutlineCheck className="text-red-600 text-lg" />
                <span className="text-sm font-bold text-red-700">
                  Discount Applied
                </span>
              </div>
              <span className="font-bold text-red-700">
                -₹{discountAmount.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className="border-t-2 border-dashed border-gray-300"></div>

        {/* Total Amount */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Total Amount
            </span>
            <span className="text-xs text-gray-500 font-semibold">
              (All inclusive)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-orange-600 font-semibold text-sm">
              You Pay:
            </span>
            <span className="text-4xl font-bold text-orange-600">
              ₹{totalAmount.toLocaleString()}
            </span>
          </div>
          {discountAmount > 0 && (
            <p className="text-xs text-green-600 font-semibold mt-1 text-right">
              You saved ₹{discountAmount.toLocaleString()}!
            </p>
          )}
        </div>

        {/* Coupon Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <BsTag className="text-orange-500 text-xl" />
            <label className="text-base font-bold text-gray-900">
              Apply Coupon
            </label>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={onCouponChange}
              placeholder="Enter coupon code"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-medium uppercase"
            />
            <button
              onClick={onApplyCoupon}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold transition shadow-md flex items-center gap-2"
            >
              <AiOutlineCheck />
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Important Information Component
export const ImportantInformation = ({
  expandedSections = {},
  onToggleSection,
  fareRules = null,
  fareRulesStatus = "idle",
}) => {
  const sections = [
    {
      key: "fareRules",
      title: "Fare Rules",
      content: fareRules
        ? [
            "Cancellation Policy:",
            ...fareRules.cancellation.map((x) => "• " + x),
            "",
            "Date Change Policy:",
            ...fareRules.dateChange.map((x) => "• " + x),
            "",
            "Baggage Rules:",
            ...fareRules.baggage.map((x) => "• " + x),
            "",
            "Important Information:",
            ...fareRules.important.map((x) => "• " + x),
          ]
        : [
            fareRulesStatus === "loading"
              ? "Fetching fare rules..."
              : "No fare rules available for this fare.",
          ],
    },
    {
      key: "checkIn",
      title: "Check-in Policy",
      content: [
        "• Web check-in opens 48 hours before departure",
        "• Airport check-in: 2 hours before domestic, 3 hours before international",
        "• Boarding gate closes 25 minutes before departure",
      ],
    },
    {
      key: "travelDocs",
      title: "Travel Documents",
      content: [
        "• Valid government-issued photo ID required",
        "• Passport mandatory for international flights",
        "• Visa requirements vary by destination",
      ],
    },
  ];

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <div key={section.key} className="border rounded-lg overflow-hidden">
          <button
            onClick={() => onToggleSection(section.key)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
          >
            <span className="font-semibold">{section.title}</span>
            {expandedSections[section.key] ? (
              <AiOutlineMinus />
            ) : (
              <AiOutlinePlus />
            )}
          </button>
          {expandedSections[section.key] && (
            <div className="p-4 space-y-2 text-sm text-gray-600">
              {section.content.map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export const FareRulesAccordion = ({
  fareRules = null,
  fareRulesStatus = "idle",
}) => {
  const [open, setOpen] = useState({
    cancellation: false,
    dateChange: false,
    baggage: false,
    important: false,
  });

  const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  if (fareRulesStatus === "loading") {
    return (
      <div className="text-center py-4 text-gray-600 font-medium">
        Fetching fare rules...
      </div>
    );
  }

  if (!fareRules) {
    return (
      <div className="text-center py-4 text-gray-600 font-medium">
        Fare rules not available for this fare.
      </div>
    );
  }

  const sections = [
    {
      key: "cancellation",
      title: "Cancellation Rules",
      icon: <MdCancel className="text-red-500 text-xl" />,
      data: fareRules.cancellation,
      bg: "from-red-50 to-red-100 border-red-400",
    },
    {
      key: "dateChange",
      title: "Date Change / Reschedule",
      icon: <MdAutorenew className="text-blue-500 text-xl" />,
      data: fareRules.dateChange,
      bg: "from-blue-50 to-blue-100 border-blue-400",
    },
    {
      key: "baggage",
      title: "Baggage Rules",
      icon: <MdWork className="text-yellow-600 text-xl" />,
      data: fareRules.baggage,
      bg: "from-yellow-50 to-yellow-100 border-yellow-400",
    },
    {
      key: "important",
      title: "Important Notes",
      icon: <MdInfo className="text-purple-600 text-xl" />,
      data: fareRules.important,
      bg: "from-purple-50 to-purple-100 border-purple-400",
    },
  ];

  return (
    <div className="space-y-4">
      {sections.map((sec) => (
        <div
          key={sec.key}
          className={`rounded-xl overflow-hidden border shadow-sm bg-gradient-to-r ${sec.bg}`}
        >
          {/* Header */}
          <button
            onClick={() => toggle(sec.key)}
            className="w-full flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              {sec.icon}
              <span className="font-semibold text-gray-900">{sec.title}</span>
            </div>

            <span className="text-gray-700 text-lg">
              {open[sec.key] ? "−" : "+"}
            </span>
          </button>

          {/* Content */}
          {open[sec.key] && (
            <div className="bg-white p-4 border-t border-gray-200 space-y-2 animate-fadeIn">
              {sec.data.length > 0 ? (
                sec.data.map((line, i) => (
                  <p key={i} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    {line}
                  </p>
                ))
              ) : (
                <p className="text-sm text-gray-600">
                  No information available.
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Baggage Table Component
export const BaggageTable = ({ baggageInfo = {}, fareClass = "" }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <BsLuggage className="text-orange-600" />
          <h4 className="font-bold">Cabin Baggage</h4>
        </div>
        <p className="text-sm text-gray-600">
          {baggageInfo?.cB || "7 Kg per passenger"}
        </p>
      </div>

      <div className="border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <BsLuggage className="text-orange-600 text-xl" />
          <h4 className="font-bold">Check-In Baggage</h4>
        </div>
        <p className="text-sm text-gray-600">
          {baggageInfo?.iB || "15 Kg per passenger"}
        </p>
      </div>
    </div>
  );
};

export const TravelerForm = ({
  travelers = [],
  addTraveler,
  removeTraveler,
  updateTraveler,
}) => {
  if (!Array.isArray(travelers)) travelers = [];

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a2957] to-[#24a7c] text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <FaUser className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Traveler Details</h2>
              <p className="text-sm text-blue-100 font-medium">
                Enter passenger information
              </p>
            </div>
          </div>

          <button
            onClick={addTraveler}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition shadow-md"
            type="button"
          >
            <IoPersonAdd size={20} />
            <span>Add Traveler</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6 bg-gradient-to-b from-gray-50 to-white">
        {travelers.map((traveler, index) => (
          <div
            key={traveler.id ?? index}
            className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
          >
            {/* Traveler Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center">
                  <FaUser className="text-white" />
                </div>
                <h3 className="font-bold text-blue-900 text-lg">
                  {index === 0 ? "Primary Traveler" : `Traveler ${index + 1}`}
                </h3>
              </div>

              {travelers.length > 1 && (
                <button
                  onClick={() => removeTraveler(traveler.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-semibold transition border border-red-200"
                  type="button"
                >
                  <IoPersonRemove size={18} />
                  Remove
                </button>
              )}
            </div>

            {/* Common Name Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <select
                  value={traveler.title || "Mr."}
                  onChange={(e) =>
                    updateTraveler(traveler.id, "title", e.target.value)
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-orange-500"
                  required
                >
                  <option>Mr.</option>
                  <option>Ms.</option>
                  <option>Mrs.</option>
                  <option>Infant</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={traveler.firstName || ""}
                  onChange={(e) =>
                    updateTraveler(traveler.id, "firstName", e.target.value)
                  }
                  placeholder="Enter first name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Middle Name
                </label>
                <input
                  type="text"
                  value={traveler.middleName || ""}
                  onChange={(e) =>
                    updateTraveler(traveler.id, "middleName", e.target.value)
                  }
                  placeholder="Enter middle name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={traveler.lastName || ""}
                  onChange={(e) =>
                    updateTraveler(traveler.id, "lastName", e.target.value)
                  }
                  placeholder="Enter last name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                  required
                />
              </div>
            </div>

            {/* PRIMARY TRAVELER EXTRA FIELDS */}
            {index === 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={traveler.email || ""}
                    onChange={(e) =>
                      updateTraveler(traveler.id, "email", e.target.value)
                    }
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                    required
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    country={"in"}
                    value={traveler.phoneWithCode || ""}
                    onChange={(phone) =>
                      updateTraveler(traveler.id, "phoneWithCode", phone)
                    }
                    enableSearch
                    containerStyle={{ width: "100%" }}
                    inputStyle={{
                      width: "100%",
                      height: "48px",
                      border: "2px solid #d1d5db",
                      borderRadius: "0.5rem",
                      paddingLeft: "48px",
                    }}
                    required
                  />
                </div>
              </div>
            )}

            {/* SECONDARY TRAVELERS — MOBILE + AGE IN SAME LINE */}
            {index > 0 && (
              <div className=" gap-4 mb-4">
                {/* Mobile & Age same row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Mobile <span className="text-red-500">*</span>
                    </label>
                    <PhoneInput
                      country={"in"}
                      value={traveler.phoneWithCode || ""}
                      onChange={(phone) =>
                        updateTraveler(traveler.id, "phoneWithCode", phone)
                      }
                      enableSearch
                      containerStyle={{ width: "100%" }}
                      inputStyle={{
                        width: "100%",
                        height: "48px",
                        border: "2px solid #d1d5db",
                        borderRadius: "0.5rem",
                        paddingLeft: "48px",
                      }}
                      required
                    />
                  </div>

                  {/* AGE */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={traveler.age ?? ""}
                      onChange={(e) =>
                        updateTraveler(
                          traveler.id,
                          "age",
                          parseInt(e.target.value || "0")
                        )
                      }
                      placeholder="Age"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                </div>

                {/* Passport separate line */}
                <div className="mt-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Passport Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={traveler.passportNumber || ""}
                    onChange={(e) =>
                      updateTraveler(
                        traveler.id,
                        "passportNumber",
                        e.target.value
                      )
                    }
                    placeholder="Enter passport number"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg uppercase"
                    required
                  />
                </div>
              </div>
            )}

            {/* PRIMARY TRAVELER SPECIFIC PASSPORT + AGE */}
            {index === 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Passport Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={traveler.passportNumber || ""}
                    onChange={(e) =>
                      updateTraveler(
                        traveler.id,
                        "passportNumber",
                        e.target.value
                      )
                    }
                    placeholder="Enter passport number"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg uppercase"
                    required
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={traveler.age ?? ""}
                    onChange={(e) =>
                      updateTraveler(
                        traveler.id,
                        "age",
                        parseInt(e.target.value || "0")
                      )
                    }
                    placeholder="Age"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>
            )}

            {/* Note */}
            <div className="mt-6 bg-blue-50 border-l-4 border-blue-900 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-bold text-blue-900">Note:</span> Ensure
                all details match your government ID or passport.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};