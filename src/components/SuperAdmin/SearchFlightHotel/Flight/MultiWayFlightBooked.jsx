//frontend/src/components/FlightBookingFlow/MultiCityFlightBooked.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import {
  MdArrowBack,
  MdFlightTakeoff,
  MdFlightLand,
  MdEventSeat,
} from "react-icons/md";
import { FaPlane, FaUser, FaWifi } from "react-icons/fa";
import {
  BsTag,
  BsInfoCircleFill,
  BsCashStack,
  BsCalendar4,
} from "react-icons/bs";
import { AiOutlineCheck, AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { BiTime } from "react-icons/bi";
import {
  IoPersonAdd,
  IoPersonRemove,
  IoAirplaneOutline,
} from "react-icons/io5";
import { GoPeople } from "react-icons/go";
import { PiForkKnifeBold } from "react-icons/pi";
import { RiHotelLine } from "react-icons/ri";

import {
  reviewPrices,
  fetchFareRules,
} from "../../../../features/slices/FlightSearch";

import SeatSelectionModal from "../../../Modal/SeatSelectionModal";

import {
  formatTime,
  formatDate,
  getAirlineLogo,
  formatDuration,
  formatDurationCompact,
  parseFlightData,
  FareOptions,
  PriceSummary,
  ImportantInformation,
  BaggageTable,
  orangeText,
  orangeBg,
  blueBg,
  MultiCityFlightTimeline,
  TravelerForm,
} from "../Common/CommonInfo";

export default function MultiCityFlightBooking() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    selectedFlight,
    searchParams,
    rawFlightData,
    tripType = "multicity",
  } = location.state || {};

  // Redux selectors
  const reviewStatus = useSelector((state) => state.flightSearch.reviewStatus);
  const reduxBookingId = useSelector((state) => state.flightSearch.bookingId);
  const reviewResponse = useSelector((state) => state.flightSearch.review);
  const fareRules = useSelector((state) => state.flightSearch.fareRules);
  const fareRulesStatus = useSelector((state) => state.flightSearch.fareRulesStatus);

  // Local state
  const [bookingId, setBookingId] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [couponCode, setCouponCode] = useState("");
  const [travelers, setTravelers] = useState([
    {
      id: 1,
      title: "Mr.",
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      mobile: "",
      phoneWithCode: "",
      passportNumber: "",
      dob: "",
      age: "",
    },
  ]);
  const [selectedSeats, setSelectedSeats] = useState({});
  const [expandedFare, setExpandedFare] = useState(null);
  const [showSeatModal, setShowSeatModal] = useState({
    flight: null,
    flightIndex: null,
    show: false,
  });
  const [selectedFare, setSelectedFare] = useState("Standard");
  const [parsedFlightData, setParsedFlightData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Parse flight data on mount
  useEffect(() => {
    if (rawFlightData) {
      try {
        const parsedData = parseFlightData(
          rawFlightData,
          tripType,
          searchParams
        );
        setParsedFlightData(parsedData);

        // Initialize expanded sections for all segments
        if (parsedData?.allSegmentsData) {
          const initialSections = {};
          parsedData.allSegmentsData.forEach((_, index) => {
            initialSections[`segment-${index}`] = true;
          });
          setExpandedSections({
            ...initialSections,
            travelerDetails: false,
            fareRules: false,
            checkIn: false,
            travelDocs: false,
            terms: false,
          });
        }

        setLoading(false);
      } catch (error) {
        console.error("Error parsing flight data:", error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [rawFlightData, tripType, searchParams]);

  // Review prices on mount
  useEffect(() => {
    if (!parsedFlightData) return;

    // Extract all price IDs from multi-city flights
    const priceIds = [];
    if (Array.isArray(rawFlightData)) {
      rawFlightData.forEach(flight => {
        const priceId = flight?.totalPriceList?.[0]?.id;
        if (priceId) priceIds.push(priceId);
      });
    } else if (rawFlightData?.totalPriceList) {
      const priceId = rawFlightData.totalPriceList[0]?.id;
      if (priceId) priceIds.push(priceId);
    }

    if (priceIds.length === 0) {
      console.warn("No price IDs found for multi-city flights");
      return;
    }

    // Check if already have bookingId
    if (reduxBookingId) {
      setBookingId(reduxBookingId);
      return;
    }

    // Call review API
    dispatch(
      reviewPrices({
        priceIds,
        searchParams,
        tripType: "MC",
      })
    )
      .unwrap()
      .then((res) => {
        setBookingId(res.bookingId);
        sessionStorage.setItem("bookingId", res.bookingId);

        // Fetch fare rules
        dispatch(
          fetchFareRules({
            priceIds,
            tripType: "MC",
          })
        );
      })
      .catch((err) => console.error("Review error:", err));
  }, [parsedFlightData, rawFlightData, reduxBookingId, dispatch, searchParams]);

  // Update local bookingId
  useEffect(() => {
    if (reduxBookingId) {
      setBookingId(reduxBookingId);
    }
  }, [reduxBookingId]);

  // Redirect if no data
  useEffect(() => {
    if (!loading && (!selectedFlight || !rawFlightData)) {
      navigate("/");
    }
  }, [selectedFlight, rawFlightData, navigate, loading]);

  // Fare options
  const fareOptions = useMemo(() => {
    if (!parsedFlightData) return [];
    const totalBasePrice = parsedFlightData.totalPrice || 0;

    return [
      {
        type: "Saver",
        price: Math.round(totalBasePrice * 0.85),
        popular: false,
        features: [
          {
            text: parsedFlightData.baggageInfo?.cB || "7kg hand baggage",
            included: true,
          },
          { text: "No check-in baggage", included: false },
          { text: "No meal included", included: false },
          { text: "Standard seat", included: true },
          { text: "Free web check-in", included: true },
          { text: "Boarding pass access", included: true },
        ],
        conditions: [
          "No refund on cancellation",
          "₹3,000 fee for date changes",
          "Name change not allowed",
        ],
      },
      {
        type: "Standard",
        price: totalBasePrice,
        popular: true,
        features: [
          {
            text: parsedFlightData.baggageInfo?.cB || "7kg hand baggage",
            included: true,
          },
          {
            text: parsedFlightData.baggageInfo?.iB || "15kg check-in baggage",
            included: true,
          },
          { text: "Complimentary meal", included: true },
          { text: "Standard seat selection", included: true },
          { text: "Free web check-in", included: true },
          { text: "Priority boarding", included: true },
        ],
        conditions: [
          parsedFlightData.isRefundable
            ? "50% refund if cancelled 24hrs+ before departure"
            : "No refund on cancellation",
          "₹2,000 fee for date changes",
          "Name change allowed with fee",
        ],
      },
      {
        type: "Flexi",
        price: Math.round(totalBasePrice * 1.15),
        popular: false,
        features: [
          { text: "10kg hand baggage", included: true },
          { text: "25kg check-in baggage", included: true },
          { text: "Premium meal & beverage", included: true },
          { text: "Priority seat selection", included: true },
          { text: "Free date changes unlimited", included: true },
          { text: "Fast track security", included: true },
        ],
        conditions: [
          "90% refund if cancelled anytime",
          "Free date changes unlimited",
          "Name change allowed once free",
        ],
      },
    ];
  }, [parsedFlightData]);

  const selectedFareData = useMemo(() => {
    return (
      fareOptions.find((f) => f.type === selectedFare) ||
      fareOptions[1] || { price: 0 }
    );
  }, [fareOptions, selectedFare]);

  // Traveler functions
  const addTraveler = () => {
    const newTraveler = {
      id: travelers.length + 1,
      title: "Mr.",
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      mobile: "",
      phoneWithCode: "",
      passportNumber: "",
      dob: "",
      age: "",
    };
    setTravelers([...travelers, newTraveler]);
  };

  const removeTraveler = (id) => {
    if (travelers.length > 1) {
      setTravelers(travelers.filter((t) => t.id !== id));
    }
  };

  const updateTraveler = (id, field, value) => {
    setTravelers(
      travelers.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  // Seat selection functions
  const toggleSeatSelection = (flightIdx, seatNum) => {
    setSelectedSeats((prev) => {
      const key = `flight-${flightIdx}`;
      const currentSeats = prev[key] || [];

      if (currentSeats.includes(seatNum)) {
        return { ...prev, [key]: currentSeats.filter((s) => s !== seatNum) };
      } else {
        if (currentSeats.length >= travelers.length) {
          alert(
            `You can only select ${travelers.length} seat(s) for ${travelers.length} traveler(s)`
          );
          return prev;
        }
        return { ...prev, [key]: [...currentSeats, seatNum] };
      }
    });
  };

  const openSeatModal = (flight, flightIndex) => {
    setShowSeatModal({ flight, flightIndex, show: true });
  };

  const closeSeatModal = () => {
    setShowSeatModal({ flight: null, flightIndex: null, show: false });
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Calculate total seat price
 const totalSeatPrice = useMemo(() => {
  let total = 0;

  Object.values(selectedSeats).forEach(seatObj => {
    Object.values(seatObj.priceMap || {}).forEach(p => {
      total += p;
    });
  });

  return total;
}, [selectedSeats]);


  const getTotalDurationDisplay = () => {
    if (!parsedFlightData?.allSegmentsData) return "0h:00m";
    return parsedFlightData.allSegmentsData
      .map((segment) => formatDurationCompact(segment.totalDuration || 0))
      .join(" + ");
  };

  const getSegmentColor = (index) => {
    const colors = [
      {
        from: "from-blue-50",
        to: "to-indigo-50",
        border: "border-blue-500",
        bg: "bg-blue-500",
        text: "text-blue-800",
        bgLight: "bg-blue-100",
        textLight: "text-blue-700",
      },
      {
        from: "from-green-50",
        to: "to-emerald-50",
        border: "border-green-500",
        bg: "bg-green-500",
        text: "text-green-800",
        bgLight: "bg-green-100",
        textLight: "text-green-700",
      },
      {
        from: "from-purple-50",
        to: "to-indigo-50",
        border: "border-purple-500",
        bg: "bg-purple-500",
        text: "text-purple-800",
        bgLight: "bg-purple-100",
        textLight: "text-purple-700",
      },
      {
        from: "from-orange-50",
        to: "to-red-50",
        border: "border-orange-500",
        bg: "bg-orange-500",
        text: "text-orange-800",
        bgLight: "bg-orange-100",
        textLight: "text-orange-700",
      },
      {
        from: "from-pink-50",
        to: "to-rose-50",
        border: "border-pink-500",
        bg: "bg-pink-500",
        text: "text-pink-800",
        bgLight: "bg-pink-100",
        textLight: "text-pink-700",
      },
    ];
    return colors[index % colors.length];
  };

  const splitSegmentsIntoRows = (segments) => {
    const rows = [];
    let i = 0;

    while (i < segments.length) {
      const remaining = segments.length - i;

      if (remaining === 1) {
        rows.push(segments.slice(i, i + 1));
        i += 1;
      } else if (remaining === 2) {
        rows.push(segments.slice(i, i + 2));
        i += 2;
      } else if (remaining === 4) {
        rows.push(segments.slice(i, i + 2));
        rows.push(segments.slice(i + 2, i + 4));
        i += 4;
      } else {
        rows.push(segments.slice(i, i + 3));
        i += 3;
      }
    }

    return rows;
  };

  const getTotalPrice = () => {
    if (!parsedFlightData) return 0;
    const farePrice = selectedFareData.price * travelers.length;
    return farePrice + totalSeatPrice;
  };

  const handleProceedToPayment = () => {
    // Validate travelers
    const isValid = travelers.every(
      (t) => t.firstName && t.lastName && t.email && t.mobile && t.dob
    );

    if (!isValid) {
      alert("Please fill all traveler details");
      return;
    }

    if (!bookingId) {
      alert("Please wait for price review to complete");
      return;
    }

    // Navigate to payment page
    navigate("/flight-payment", {
      state: {
        bookingId,
        travelers,
        flightData: parsedFlightData,
        totalPrice: getTotalPrice(),
        searchParams,
        rawFlightData,
        selectedSeats,
        selectedFare,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">
            Loading flight details...
          </p>
        </div>
      </div>
    );
  }

  if (!parsedFlightData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <p className="text-gray-600 font-semibold mb-4">
            No flight data available. Please search again.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const allSegments = parsedFlightData.allSegmentsData || [];
  const totalDurationDisplay = getTotalDurationDisplay();

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "DM Sans, sans-serif" }}
    >
      <SeatSelectionModal
        isOpen={showSeatModal.show}
        onClose={closeSeatModal}
        flight={showSeatModal.flight}
        flightIndex={showSeatModal.flightIndex}
        travelers={travelers}
        selectedSeats={selectedSeats}
        onSeatSelect={toggleSeatSelection}
      />

      {/* Header */}
      <div className={`${blueBg} text-white shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 hover:text-orange-400 transition"
            >
              <MdArrowBack size={20} />
              <span className="text-sm font-medium">
                Back to Search Results
              </span>
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm">
                Booking ID:{" "}
                <span className="font-bold">{bookingId || "—"}</span>
              </span>
              <span className="text-xs bg-orange-500 px-2 py-1 rounded">
                {parsedFlightData?.isInternational
                  ? "INTERNATIONAL MULTI-CITY"
                  : "MULTI-CITY"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {/* Overview Card */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-[#1a2957] to-[#2d4a7c] text-white p-6">
                  {/* Title */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <FaPlane className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        Multi-City Flight Details
                      </h2>
                      <p className="text-sm text-blue-100 font-medium">
                        {allSegments.length} connected journeys
                      </p>
                    </div>
                  </div>

                  {/* Journey Cards */}
                  <div className="space-y-4">
                    {splitSegmentsIntoRows(allSegments).map(
                      (row, rowIndex) => (
                        <div
                          key={rowIndex}
                          className={`grid gap-4 ${
                            row.length === 1
                              ? "grid-cols-1"
                              : row.length === 2
                              ? "grid-cols-1 sm:grid-cols-2"
                              : "grid-cols-1 sm:grid-cols-3"
                          }`}
                        >
                          {row.map((segment, index) => (
                            <div
                              key={index}
                              className="bg-white text-gray-900 bg-opacity-15 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <IoAirplaneOutline className="text-orange-400 text-lg" />
                                <span className="text-sm font-semibold">
                                  Flight {rowIndex * 3 + index + 1}
                                </span>
                              </div>

                              <p className="font-bold text-lg">
                                {segment.flightData?.from} →{" "}
                                {segment.flightData?.to}
                              </p>

                              <p className="text-sm font-medium text-blue-100">
                                {segment.flightData?.date || "N/A"}
                              </p>
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="bg-white text-gray-900 bg-opacity-15 backdrop-blur-sm rounded-lg p-3 text-center border border-white border-opacity-20">
                      <BiTime className="text-orange-400 text-xl mx-auto mb-1.5" />
                      <p className="text-xs font-bold uppercase tracking-wide mb-1">
                        Duration
                      </p>
                      <p className="font-bold text-sm">
                        {totalDurationDisplay}
                      </p>
                    </div>

                    <div className="bg-white text-gray-900 bg-opacity-15 backdrop-blur-sm rounded-lg p-3 text-center border border-white border-opacity-20">
                      <GoPeople className="text-orange-400 text-xl mx-auto mb-1.5" />
                      <p className="text-xs font-bold uppercase tracking-wide mb-1">
                        Travelers
                      </p>
                      <p className="font-bold text-sm">
                        {travelers.length} Adult
                        {travelers.length > 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="bg-white text-gray-900 bg-opacity-15 backdrop-blur-sm rounded-lg p-3 text-center border border-white border-opacity-20">
                      <BsCashStack className="text-orange-400 text-xl mx-auto mb-1.5" />
                      <p className="text-xs font-bold uppercase tracking-wide mb-1">
                        Total
                      </p>
                      <p className="font-bold text-sm">
                        ₹{(parsedFlightData.totalPrice || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Flight Segments */}
              {allSegments.map((segment, index) => {
                const colors = getSegmentColor(index);
                const sectionKey = `segment-${index}`;

                return (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleSection(sectionKey)}
                      className={`w-full bg-gradient-to-r ${colors.from} ${colors.to} border-l-4 ${colors.border} p-5 flex items-center justify-between hover:opacity-90 transition`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center`}
                        >
                          <span className="text-white font-bold text-lg">
                            {index + 1}
                          </span>
                        </div>
                        <div className="text-left">
                          <p className={`font-bold text-lg ${colors.text}`}>
                            Flight {index + 1}:{" "}
                            <span className="text-gray-900">
                              {segment.flightData?.from || "N/A"}
                            </span>
                            <span className="text-orange-600 mx-2 font-extrabold">
                              →
                            </span>
                            <span className="text-gray-900">
                              {segment.flightData?.to || "N/A"}
                            </span>
                          </p>
                          <p className="text-sm text-gray-700 font-medium">
                            {segment.flightData?.date || "N/A"} •{" "}
                            {segment.segments?.length || 0} Segment
                            {(segment.segments?.length || 0) > 1 ? "s" : ""} • ₹
                            {(segment.basePrice || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-8 h-8 rounded-full ${colors.bgLight} flex items-center justify-center`}
                      >
                        {expandedSections[sectionKey] ? (
                          <AiOutlineMinus className={colors.textLight} />
                        ) : (
                          <AiOutlinePlus className={colors.textLight} />
                        )}
                      </div>
                    </button>

                    {expandedSections[sectionKey] && (
                      <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
                        <h3 className="text-lg font-bold mb-4">
                          Flight {index + 1} Timeline
                        </h3>
                        <MultiCityFlightTimeline
                          segments={
                            segment.segmentsCorrected || segment.segments
                          }
                          openSeatModal={openSeatModal}
                          segmentIndex={index}
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Fare Options */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-xl font-bold mb-4">Select Your Fare</h3>
                <FareOptions
                  fareOptions={fareOptions}
                  selectedFare={selectedFare}
                  onFareSelect={setSelectedFare}
                  expandedFare={expandedFare}
                  onExpandFare={setExpandedFare}
                />
              </div>

              {/* Traveler Details */}
              <TravelerForm
                travelers={travelers}
                addTraveler={addTraveler}
                removeTraveler={removeTraveler}
                updateTraveler={updateTraveler}
              />

              {/* Important Information */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-xl font-bold mb-4">
                  Important Information
                </h3>
                <ImportantInformation
                  expandedSections={expandedSections}
                  onToggleSection={toggleSection}
                />
              </div>

              {/* Baggage & Inclusions */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-xl font-bold mb-4">Baggage & Inclusions</h3>
                <BaggageTable
                  baggageInfo={parsedFlightData.baggageInfo || {}}
                  fareClass={parsedFlightData.fareClass || ""}
                />
              </div>

              {/* Fare Rules Section */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleSection("fareRules")}
                  className="w-full bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 p-5 flex items-center justify-between hover:from-orange-100 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                      <BsInfoCircleFill className="text-white text-2xl" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg text-orange-800">
                        Fare Rules & Policies
                      </p>
                      <p className="text-sm text-gray-700">
                        Cancellation, date change & baggage policies for all flights
                      </p>
                    </div>
                  </div>
                  {expandedSections.fareRules ? (
                    <AiOutlineMinus />
                  ) : (
                    <AiOutlinePlus />
                  )}
                </button>

                {expandedSections.fareRules && (
                  <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
                    {fareRulesStatus === "loading" && (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-600 text-sm">
                          Loading fare rules...
                        </p>
                      </div>
                    )}

                    {fareRulesStatus === "succeeded" && fareRules && (
                      <div className="space-y-4">
                        {fareRules.fareRule?.map((rule, index) => (
                          <div
                            key={index}
                            className={`border rounded-lg p-4 ${
                              index % 2 === 0
                                ? "border-green-200 bg-green-50"
                                : "border-blue-200 bg-blue-50"
                            }`}
                          >
                            <h4 className="font-bold mb-3 flex items-center gap-2">
                              {index % 2 === 0 ? (
                                <MdFlightTakeoff className="text-green-600" />
                              ) : (
                                <MdFlightLand className="text-blue-600" />
                              )}
                              Flight {index + 1} - Fare Rules
                            </h4>
                            <div className="space-y-2 text-sm text-gray-700">
                              {rule?.fr ? (
                                <div
                                  dangerouslySetInnerHTML={{ __html: rule.fr }}
                                />
                              ) : (
                                <p>
                                  Standard fare rules apply. Contact airline for
                                  details.
                                </p>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Important Notes */}
                        <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                          <h4 className="font-bold text-orange-800 mb-2">
                            Important Notes:
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                            <li>
                              Fare rules are subject to change by the airline
                            </li>
                            <li>
                              Cancellation charges may apply as per airline
                              policy
                            </li>
                            <li>
                              Date change fees may vary based on fare type
                            </li>
                            <li>Baggage allowance is per person per flight</li>
                            <li>
                              Different flights may have different fare rules
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {fareRulesStatus === "failed" && (
                      <div className="text-center py-4">
                        <p className="text-red-600 text-sm">
                          Unable to load fare rules
                        </p>
                      </div>
                    )}

                    {fareRulesStatus === "idle" && (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">
                          Fare rules will be loaded shortly...
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-4">
                {/* Price Summary */}
                <PriceSummary
                  selectedFareData={selectedFareData}
                  travelers={travelers}
                  totalSeatPrice={totalSeatPrice}
                  couponCode={couponCode}
                  onCouponChange={(e) =>
                    setCouponCode(e.target.value.toUpperCase())
                  }
                  onApplyCoupon={() =>
                    console.log("Applying coupon:", couponCode)
                  }
                  parsedFlightData={parsedFlightData}
                  discountAmount={0}
                  reviewStatus={reviewStatus}
                  bookingId={bookingId}
                  onProceedToPayment={handleProceedToPayment}
                />

                {/* Amenities */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Amenities
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 border border-gray-300 text-gray-900 rounded-full text-xs font-medium flex items-center gap-1.5">
                      <FaWifi />
                      Wi-Fi
                    </span>
                    <span className="px-3 py-1.5 border border-gray-300 text-gray-900 rounded-full text-xs font-medium flex items-center gap-1.5">
                      <PiForkKnifeBold />
                      Meal
                    </span>
                    <span className="px-3 py-1.5 border border-gray-300 text-gray-900 rounded-full text-xs font-medium flex items-center gap-1.5">
                      <RiHotelLine />
                      Lounge Access*
                    </span>
                    <span className="px-3 py-1.5 border border-gray-300 text-gray-900 rounded-full text-xs font-medium flex items-center gap-1.5">
                      <MdEventSeat />
                      Extra Legroom*
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    *Available on select flights and fare types
                  </p>
                </div>

                {/* Need Help Section */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <BsInfoCircleFill className="text-blue-600" size={20} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Need Help?
                      </p>
                      <p className="text-xs text-gray-600">
                        Call 1800-123-4567 (24/7)
                      </p>
                      <p className="text-xs text-gray-600">
                        Email: support@flightbook.com
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      For multi-city bookings, changes to one flight may affect
                      other segments. Please review all details carefully.
                    </p>
                  </div>
                </div>

                {/* Baggage Info */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Baggage Summary
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Check-in:</span>
                      <span className="font-semibold">
                        {parsedFlightData.baggageInfo?.iB || "15kg"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Cabin:</span>
                      <span className="font-semibold">
                        {parsedFlightData.baggageInfo?.cB || "7kg"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Seats Selected:</span>
                      <span className="font-semibold">
                        {Object.values(selectedSeats).flat().length || 0}/
                        {travelers.length * allSegments.length}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Baggage allowance may vary by airline and flight segment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}