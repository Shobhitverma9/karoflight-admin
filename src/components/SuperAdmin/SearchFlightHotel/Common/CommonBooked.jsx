//admin/src/components/SearchFlightHotel/CommonBooked.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  MdArrowBack,
  MdFlightTakeoff,
  MdFlightLand,
  MdEventSeat,
  MdInfo,
  MdCancel,
  MdAutorenew,
} from "react-icons/md";
import {
  FaPlane,
  FaUser,
  FaWifi,
  FaPlaneDeparture,
  FaPlaneArrival,
} from "react-icons/fa";
import {
  BsTag,
  BsInfoCircleFill,
  BsCashStack,
  BsCalendar4,
  BsLuggage,
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
  TravelerForm,
  FareRulesAccordion,
  orangeText,
  orangeBg,
  blueBg,
  blueText,
  grayText,
  greenText,
  lightGreenBg,
  FlightTimeline,
  RoundTripFlightTimeline,
  MultiCityFlightTimeline,
} from "./CommonInfo";

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
  const fareRulesStatus = useSelector(
    (state) => state.flightSearch.fareRulesStatus
  );

  // Local state
  const [bookingId, setBookingId] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    travelerDetails: false,
    fareRules: false,
    checkIn: false,
    travelDocs: false,
    terms: false,
  });
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
    segmentIndex: null,
    show: false,
  });
  const [selectedFare, setSelectedFare] = useState("Standard");
  const [parsedFlightData, setParsedFlightData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Parse flight data on mount
  useEffect(() => {
    if (rawFlightData) {
      try {
        console.log("Parsing flight data for multi-city:", rawFlightData);

        const parsedData = parseFlightData(
          rawFlightData,
          "multi-way", // Force multi-way parsing
          searchParams
        );
        console.log("Parsed flight data:", parsedData);

        setParsedFlightData(parsedData);

        // Initialize expanded sections for all segments
        if (parsedData?.allSegmentsData) {
          const initialSections = {};
          parsedData.allSegmentsData.forEach((_, index) => {
            initialSections[`segment-${index}`] = true;
          });
          setExpandedSections((prev) => ({
            ...initialSections,
            ...prev,
          }));
        }

        setLoading(false);
      } catch (error) {
        console.error("Error parsing flight data:", error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [rawFlightData, searchParams]);

  // Review prices on mount
  useEffect(() => {
    if (!parsedFlightData) return;

    // Extract all price IDs from multi-city flights
    const priceIds = [];

    // Handle different data structures
    if (Array.isArray(rawFlightData)) {
      // If rawFlightData is an array of flights
      rawFlightData.forEach((flight) => {
        const priceId =
          flight?.totalPriceList?.[0]?.id ||
          flight?.totalPriceList?.[0]?.fareId;
        if (priceId) priceIds.push(priceId);
      });
    } else if (rawFlightData?.searchResult?.tripInfos) {
      // If we have searchResult.tripInfos structure
      const tripInfos = rawFlightData.searchResult.tripInfos;
      Object.keys(tripInfos).forEach((key) => {
        const flights = tripInfos[key];
        if (Array.isArray(flights) && flights.length > 0) {
          const priceId = flights[0]?.totalPriceList?.[0]?.id;
          if (priceId) priceIds.push(priceId);
        }
      });
    } else if (rawFlightData?.tripInfos) {
      // If we have tripInfos structure
      const tripInfos = rawFlightData.tripInfos;
      Object.keys(tripInfos).forEach((key) => {
        const flights = tripInfos[key];
        if (Array.isArray(flights) && flights.length > 0) {
          const priceId = flights[0]?.totalPriceList?.[0]?.id;
          if (priceId) priceIds.push(priceId);
        }
      });
    }

    if (priceIds.length === 0) {
      console.warn("No price IDs found for multi-city flights");
      return;
    }

    console.log("Price IDs for review:", priceIds);

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
        console.log("Review API response:", res);
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

  // Fare options - dynamically calculated
  const fareOptions = useMemo(() => {
    if (!parsedFlightData) return [];

    const totalBasePrice = parsedFlightData.totalPrice || 0;
    const baggageInfo = parsedFlightData.baggageInfo || {};
    const isRefundable = parsedFlightData.isRefundable || false;

    return [
      {
        type: "Saver",
        price: Math.round(totalBasePrice * 0.85),
        popular: false,
        features: [
          {
            text: baggageInfo?.cB || "7kg hand baggage",
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
            text: baggageInfo?.cB || "7kg hand baggage",
            included: true,
          },
          {
            text: baggageInfo?.iB || "15kg check-in baggage",
            included: true,
          },
          { text: "Complimentary meal", included: true },
          { text: "Standard seat selection", included: true },
          { text: "Free web check-in", included: true },
          { text: "Priority boarding", included: true },
        ],
        conditions: [
          isRefundable
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
      email: travelers.length > 0 ? travelers[0].email : "",
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

  const openSeatModal = (flight, flightIndex, segmentIndex) => {
    setShowSeatModal({
      flight,
      flightIndex,
      segmentIndex,
      show: true,
    });
  };

  const closeSeatModal = () => {
    setShowSeatModal({
      flight: null,
      flightIndex: null,
      segmentIndex: null,
      show: false,
    });
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Calculate total seat price dynamically
  const totalSeatPrice = useMemo(() => {
    let total = 0;
    Object.values(selectedSeats).forEach((seatArray) => {
      if (Array.isArray(seatArray)) {
        seatArray.forEach((seatNum) => {
          const row = parseInt(seatNum.match(/\d+/)?.[0] || 0);
          if (row <= 5 || (row >= 12 && row <= 14)) {
            total += 500;
          } else if (row === 25) {
            total += 300;
          } else {
            total += 200; // Standard seat price
          }
        });
      }
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
    return farePrice + totalSeatPrice - discountAmount;
  };

  const handleApplyCoupon = () => {
    if (!couponCode) {
      alert("Please enter a coupon code");
      return;
    }

    // Simulate coupon validation
    if (couponCode === "SAVE10") {
      const discount = Math.round(parsedFlightData.totalPrice * 0.1);
      setDiscountAmount(discount);
      alert(`Coupon applied! You saved ₹${discount}`);
    } else if (couponCode === "SAVE20") {
      const discount = Math.round(parsedFlightData.totalPrice * 0.2);
      setDiscountAmount(discount);
      alert(`Coupon applied! You saved ₹${discount}`);
    } else {
      alert("Invalid coupon code");
    }
  };

  const handleProceedToPayment = () => {
    // Validate travelers
    const isValid = travelers.every(
      (t) => t.firstName && t.lastName && t.dob && t.passportNumber
    );

    if (!isValid) {
      alert(
        "Please fill all required traveler details (First Name, Last Name, Date of Birth, Passport Number)"
      );
      return;
    }

    // Validate primary traveler's email and mobile
    const primaryTraveler = travelers[0];
    if (!primaryTraveler.email || !primaryTraveler.phoneWithCode) {
      alert("Primary traveler must have email and mobile number");
      return;
    }

    if (!bookingId) {
      alert("Please wait for price review to complete");
      return;
    }

    // Prepare data for payment page
    const paymentData = {
      bookingId,
      travelers,
      flightData: parsedFlightData,
      totalPrice: getTotalPrice(),
      searchParams,
      rawFlightData,
      selectedSeats,
      selectedFare,
      selectedFareData,
      couponCode: discountAmount > 0 ? couponCode : "",
      discountAmount,
    };

    console.log("Proceeding to payment with data:", paymentData);

    // Navigate to payment page
    navigate("/flight-payment", {
      state: paymentData,
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
  const isInternational = parsedFlightData.isInternational || false;

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
        segmentIndex={showSeatModal.segmentIndex}
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
                {isInternational ? "INTERNATIONAL MULTI-CITY" : "MULTI-CITY"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Overview Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-[#1a2957] to-[#2d4a7c] text-white p-6">
                  {/* Title */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <FaPlane className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        Multi-City Flight Details
                      </h2>
                      <p className="text-sm text-blue-100 font-medium">
                        {allSegments.length} connected journeys •{" "}
                        {travelers.length} Traveler
                        {travelers.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Journey Cards */}
                  <div className="space-y-4">
                    {splitSegmentsIntoRows(allSegments).map((row, rowIndex) => (
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
                            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <IoAirplaneOutline className="text-orange-400 text-lg" />
                              <span className="text-sm font-semibold">
                                Flight {rowIndex * 3 + index + 1}
                              </span>
                            </div>

                            <p className="font-bold text-lg">
                              {segment.flightData?.from || "N/A"} →{" "}
                              {segment.flightData?.to || "N/A"}
                            </p>

                            <p className="text-sm text-blue-100">
                              {formatDate(segment.segments?.[0]?.dt) || "N/A"}
                            </p>
                            <p className="text-xs text-gray-300 mt-1">
                              {segment.flightData?.airline ||
                                "Multiple Airlines"}
                            </p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
                      <BiTime className="text-orange-400 text-xl mx-auto mb-1.5" />
                      <p className="text-xs font-bold uppercase tracking-wide mb-1">
                        Total Duration
                      </p>
                      <p className="font-bold text-sm">
                        {totalDurationDisplay}
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
                      <GoPeople className="text-orange-400 text-xl mx-auto mb-1.5" />
                      <p className="text-xs font-bold uppercase tracking-wide mb-1">
                        Travelers
                      </p>
                      <p className="font-bold text-sm">
                        {travelers.length}{" "}
                        {travelers.length === 1 ? "Adult" : "Adults"}
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
                      <BsCashStack className="text-orange-400 text-xl mx-auto mb-1.5" />
                      <p className="text-xs font-bold uppercase tracking-wide mb-1">
                        Base Fare
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
                const segments =
                  segment.segmentsCorrected || segment.segments || [];

                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleSection(sectionKey)}
                      className={`w-full bg-gradient-to-r ${colors.from} ${colors.to} border-l-4 ${colors.border} p-6 flex items-center justify-between hover:opacity-90 transition`}
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
                            {formatDate(segments[0]?.dt) || "N/A"} •{" "}
                            {segments.length || 0} Segment
                            {(segments.length || 0) > 1 ? "s" : ""} • ₹
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
                        <CommonMultiCityFlightTimeline
                          segments={segments}
                          openSeatModal={(flight, flightIndex) =>
                            openSeatModal(flight, flightIndex, index)
                          }
                          segmentIndex={index}
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Fare Options */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
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
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <TravelerForm
                  travelers={travelers}
                  addTraveler={addTraveler}
                  removeTraveler={removeTraveler}
                  updateTraveler={updateTraveler}
                />
              </div>

              {/* Baggage & Inclusions */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold mb-4">Baggage & Inclusions</h3>
                <BaggageTable
                  baggageInfo={parsedFlightData.baggageInfo || {}}
                  fareClass={parsedFlightData.fareClass || ""}
                />

                {/* Additional Baggage Notes */}
                <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r">
                  <div className="flex items-start gap-3">
                    <BsInfoCircleFill className="text-blue-500 text-xl mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-800 mb-1">
                        Baggage Information
                      </p>
                      <p className="text-sm text-gray-700">
                        • Baggage allowance is per passenger, per flight segment
                        <br />
                        • Additional baggage can be purchased at the airport
                        (subject to availability)
                        <br />• Sports equipment and special items may incur
                        extra charges
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fare Rules Section */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleSection("fareRules")}
                  className="w-full bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 p-6 flex items-center justify-between hover:from-orange-100 transition"
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
                        Cancellation, date change & baggage policies for all
                        flights
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
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                        <p className="text-gray-600 text-sm">
                          Loading fare rules...
                        </p>
                      </div>
                    )}

                    {fareRulesStatus === "succeeded" && fareRules && (
                      <div className="space-y-6">
                        {fareRules.fareRule?.map((rule, index) => (
                          <div
                            key={index}
                            className={`border rounded-lg p-5 ${
                              index % 2 === 0
                                ? "border-green-200 bg-green-50"
                                : "border-blue-200 bg-blue-50"
                            }`}
                          >
                            <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                              {index % 2 === 0 ? (
                                <MdFlightTakeoff className="text-green-600" />
                              ) : (
                                <MdFlightLand className="text-blue-600" />
                              )}
                              Flight {index + 1} - Fare Rules
                            </h4>
                            <div className="space-y-3 text-sm text-gray-700">
                              {rule?.fr ? (
                                <div
                                  dangerouslySetInnerHTML={{ __html: rule.fr }}
                                  className="prose prose-sm max-w-none"
                                />
                              ) : (
                                <div className="space-y-2">
                                  <p className="font-semibold">
                                    Standard Fare Rules Apply:
                                  </p>
                                  <ul className="list-disc list-inside space-y-1">
                                    <li>
                                      Cancellation charges apply as per airline
                                      policy
                                    </li>
                                    <li>Date change fees may vary</li>
                                    <li>No-show charges applicable</li>
                                    <li>Baggage rules as per fare class</li>
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Important Notes */}
                        <div className="border border-orange-200 rounded-lg p-5 bg-orange-50">
                          <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                            <MdInfo className="text-orange-600" />
                            Important Notes:
                          </h4>
                          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                            <li>
                              Fare rules are subject to change by the airline
                              without prior notice
                            </li>
                            <li>
                              Cancellation charges may apply as per airline
                              policy and fare type
                            </li>
                            <li>
                              Date change fees may vary based on fare type and
                              availability
                            </li>
                            <li>
                              Baggage allowance is per person per flight segment
                            </li>
                            <li>
                              Different flights may have different fare rules
                              and policies
                            </li>
                            <li>
                              International flights may have additional
                              restrictions
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {fareRulesStatus === "failed" && (
                      <div className="text-center py-8">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
                          <p className="text-red-600 text-sm font-semibold">
                            Unable to load fare rules. Please contact customer
                            support for details.
                          </p>
                        </div>
                      </div>
                    )}

                    {fareRulesStatus === "idle" && (
                      <div className="text-center py-8">
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
              <div className="sticky top-6 space-y-6">
                {/* Price Summary */}
                <PriceSummary
                  selectedFareData={selectedFareData}
                  travelers={travelers}
                  totalSeatPrice={totalSeatPrice}
                  couponCode={couponCode}
                  onCouponChange={(e) =>
                    setCouponCode(e.target.value.toUpperCase())
                  }
                  onApplyCoupon={handleApplyCoupon}
                  parsedFlightData={parsedFlightData}
                  discountAmount={discountAmount}
                  selectedSeats={selectedSeats}
                  reviewStatus={reviewStatus}
                  bookingId={bookingId}
                  onProceedToPayment={handleProceedToPayment}
                />

                {/* Amenities */}
                <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                  <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaWifi className="text-orange-500" />
                    In-Flight Amenities
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-2 border border-gray-300 text-gray-900 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-gray-50 transition">
                      <FaWifi className="text-blue-600" />
                      Wi-Fi
                    </span>
                    <span className="px-3 py-2 border border-gray-300 text-gray-900 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-gray-50 transition">
                      <PiForkKnifeBold className="text-red-600" />
                      Meal
                    </span>
                    <span className="px-3 py-2 border border-gray-300 text-gray-900 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-gray-50 transition">
                      <RiHotelLine className="text-purple-600" />
                      Lounge Access
                    </span>
                    <span className="px-3 py-2 border border-gray-300 text-gray-900 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-gray-50 transition">
                      <MdEventSeat className="text-green-600" />
                      Extra Legroom
                    </span>
                    <span className="px-3 py-2 border border-gray-300 text-gray-900 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-gray-50 transition">
                      <BsLuggage className="text-orange-600" />
                      Priority Baggage
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    *Available on select flights and fare types. Additional
                    charges may apply.
                  </p>
                </div>

                {/* Need Help Section */}
                <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <BsInfoCircleFill className="text-blue-600 text-xl mt-1" />
                    <div>
                      <h4 className="text-base font-bold text-gray-900 mb-1">
                        Need Help?
                      </h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Our customer support team is available 24/7
                      </p>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600">
                          📞 Call: +91 9717440062
                        </p>
                        <p className="text-xs text-gray-600">
                          ✉️ Email: support@flightbook.com
                        </p>
                        <p className="text-xs text-gray-600">
                          💬 Chat: Available on website
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold text-orange-600">
                        Note:
                      </span>{" "}
                      For multi-city bookings, changes to one flight segment may
                      affect other segments. Please review all details
                      carefully.
                    </p>
                  </div>
                </div>

                {/* Booking Status */}
                <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                  <h4 className="text-base font-bold text-gray-900 mb-3">
                    Booking Status
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Price Review:
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          reviewStatus === "loading"
                            ? "text-yellow-600"
                            : reviewStatus === "succeeded"
                            ? "text-green-600"
                            : reviewStatus === "failed"
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {reviewStatus === "loading"
                          ? "Processing..."
                          : reviewStatus === "succeeded"
                          ? "✓ Complete"
                          : reviewStatus === "failed"
                          ? "Failed"
                          : "Pending"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Booking ID:</span>
                      <span className="text-sm font-bold text-blue-600">
                        {bookingId || "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Fare Lock:</span>
                      <span
                        className={`text-sm font-semibold ${
                          bookingId ? "text-green-600" : "text-gray-600"
                        }`}
                      >
                        {bookingId ? "Active (30 mins)" : "Not Active"}
                      </span>
                    </div>
                  </div>

                  {reviewStatus === "succeeded" && bookingId && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-green-700 font-medium">
                        ✓ Your fare is locked! Complete booking within 30
                        minutes to secure this price.
                      </p>
                    </div>
                  )}

                  {reviewStatus === "failed" && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs text-red-700 font-medium">
                        ✗ Price review failed. Please try again or contact
                        support.
                      </p>
                    </div>
                  )}
                </div>

                {/* Important Reminders */}
                <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
                  <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <MdInfo className="text-orange-500" />
                    Important Reminders
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 text-xs font-bold">
                          1
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Ensure all traveler details match government-issued IDs
                      </p>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 text-xs font-bold">
                          2
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        International flights require valid passport and visa
                      </p>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 text-xs font-bold">
                          3
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Check baggage allowances for each flight segment
                      </p>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 text-xs font-bold">
                          4
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Review fare rules before proceeding to payment
                      </p>
                    </li>
                  </ul>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-5 border border-blue-200">
                  <h4 className="text-base font-bold text-gray-900 mb-4">
                    Quick Actions
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => window.print()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-semibold"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                        />
                      </svg>
                      Print Booking Details
                    </button>

                    <button
                      onClick={() => {
                        const bookingData = {
                          bookingId,
                          travelers,
                          flightData: parsedFlightData,
                          totalPrice: getTotalPrice(),
                        };
                        navigator.clipboard.writeText(
                          JSON.stringify(bookingData, null, 2)
                        );
                        alert("Booking details copied to clipboard!");
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-semibold"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Copy Booking Details
                    </button>

                    <button
                      onClick={() =>
                        navigate("/contact-support", {
                          state: { bookingId, flightData: parsedFlightData },
                        })
                      }
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      Contact Support
                    </button>
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
