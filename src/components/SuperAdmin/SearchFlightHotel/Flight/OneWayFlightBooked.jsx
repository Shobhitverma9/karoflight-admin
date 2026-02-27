// Admin/src/components/Booking/OneWayFlightBooked.jsx

import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import {
  MdArrowBack,
  MdFlightTakeoff,
  MdFlightLand,
} from "react-icons/md";
import { FaPlane } from "react-icons/fa";
import { BsCalendar4, BsInfoCircleFill } from "react-icons/bs";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";

import {
  reviewPrices,
  fetchSeatMap,
} from "../../../../features/slices/FlightSearch";

export default function OneWayFlightBooking() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    selectedFlight,
    searchParams,
    rawFlightData,
    tripType = "oneway",
  } = location.state || {};

  // Redux selectors
  const reviewStatus = useSelector((state) => state.flightSearch.reviewStatus);
  const reduxBookingId = useSelector((state) => state.flightSearch.bookingId);
  const reviewResponse = useSelector((state) => state.flightSearch.review);
  const reviewError = useSelector((state) => state.flightSearch.reviewError);

  // Local state
  const [bookingId, setBookingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [travelers, setTravelers] = useState([
    {
      id: 1,
      title: "Mr.",
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      dob: "",
    },
  ]);

  const [expandedSections, setExpandedSections] = useState({
    flightDetails: true,
    travelerDetails: false,
    fareRules: false,
  });

  // Parse flight data
  const parsedFlightData = useMemo(() => {
    if (!rawFlightData) return null;

    try {
      const segments = rawFlightData?.sI || [];
      const firstSegment = segments[0];
      const lastSegment = segments[segments.length - 1];

      return {
        airline: firstSegment?.fD?.aI?.name || "Unknown Airline",
        airlineCode: firstSegment?.fD?.aI?.code || "",
        flightNumber: firstSegment?.fD?.fN || "N/A",
        from: firstSegment?.da?.city || selectedFlight?.from || "N/A",
        to: lastSegment?.aa?.city || selectedFlight?.to || "N/A",
        fromCode: firstSegment?.da?.code || "N/A",
        toCode: lastSegment?.aa?.code || "N/A",
        departureTime: new Date(firstSegment?.depTime).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        arrivalTime: new Date(lastSegment?.arrTime).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        departureDate: new Date(firstSegment?.depTime).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        duration: `${Math.floor((firstSegment?.duration || 0) / 60)}h ${(firstSegment?.duration || 0) % 60}m`,
        stops: segments.length - 1,
        basePrice: rawFlightData?.totalPriceList?.[0]?.fd?.ADULT?.fC?.TF || 0,
        baggage: rawFlightData?.totalPriceList?.[0]?.fd?.ADULT?.bI?.iB || "15 Kg",
        cabinBaggage: rawFlightData?.totalPriceList?.[0]?.fd?.ADULT?.bI?.cB || "7 Kg",
        segments: segments,
        rawData: rawFlightData,
      };
    } catch (err) {
      console.error("Error parsing flight data:", err);
      return null;
    }
  }, [rawFlightData, selectedFlight]);

  // Review prices on mount
  useEffect(() => {
    if (!parsedFlightData) {
      setLoading(false);
      return;
    }

    // Extract priceId
    const priceId = rawFlightData?.totalPriceList?.[0]?.id || rawFlightData?.totalPriceList?.[0]?.fareId;
    
    if (!priceId) {
      console.warn("No priceId found");
      setLoading(false);
      return;
    }

    // Check if already have bookingId
    if (reduxBookingId) {
      setBookingId(reduxBookingId);
      setLoading(false);
      return;
    }

    // Call review API
    dispatch(reviewPrices({ 
      priceIds: [priceId],
      searchParams,
      tripType: "OW"
    }));

    setLoading(false);
  }, [parsedFlightData, rawFlightData, reduxBookingId, dispatch]);

  // Update local bookingId when redux updates
  useEffect(() => {
    if (reduxBookingId) {
      setBookingId(reduxBookingId);
    }
  }, [reduxBookingId]);

  // Helper functions
  const toggleSection = (name) =>
    setExpandedSections((s) => ({ ...s, [name]: !s[name] }));

  const addTraveler = () =>
    setTravelers((t) => [
      ...t,
      {
        id: t.length + 1,
        title: "Mr.",
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        dob: "",
      },
    ]);

  const removeTraveler = (id) =>
    setTravelers((t) => (t.length > 1 ? t.filter((x) => x.id !== id) : t));

  const updateTraveler = (id, field, value) =>
    setTravelers((t) =>
      t.map((tr) => (tr.id === id ? { ...tr, [field]: value } : tr))
    );

  const getTotalPrice = () => {
    if (!parsedFlightData) return 0;
    return parsedFlightData.basePrice * travelers.length;
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
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading flight details...</p>
        </div>
      </div>
    );
  }

  if (!parsedFlightData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <p className="text-gray-600 mb-4">No flight data available.</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 hover:text-blue-300 transition"
            >
              <MdArrowBack size={20} />
              <span className="font-medium">Back to Search Results</span>
            </button>

            <div className="flex items-center gap-4">
              <span className="text-sm">
                Booking ID: <span className="font-bold">{bookingId || "—"}</span>
              </span>
              <span className="text-xs bg-orange-500 px-2 py-1 rounded">
                ONE-WAY
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Flight Details & Travelers */}
          <div className="lg:col-span-2 space-y-4">
            {/* Flight Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-900 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center">
                    <FaPlane className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Your ONE-WAY Flight Details</h2>
                    <p className="text-xs text-blue-100 mt-1">
                      Review your journey information
                    </p>
                  </div>
                </div>

                <div className="mt-4 bg-white/10 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <MdFlightTakeoff className="text-orange-400" size={28} />
                    <div>
                      <p className="text-xs text-blue-100">Departing from</p>
                      <p className="font-bold text-sm">{parsedFlightData.from} ({parsedFlightData.fromCode})</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MdFlightLand className="text-orange-400" size={28} />
                    <div>
                      <p className="text-xs text-blue-100">Arriving at</p>
                      <p className="font-bold text-sm">{parsedFlightData.to} ({parsedFlightData.toCode})</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <BsCalendar4 className="text-orange-400" />
                    <div>
                      <p className="text-xs text-blue-100">Date</p>
                      <p className="font-bold text-sm">{parsedFlightData.departureDate}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleSection("flightDetails")}
                  className="w-full mt-3 pt-3 border-t border-white/20 flex items-center justify-center gap-2"
                >
                  <span>
                    {expandedSections.flightDetails ? "Hide Details" : "View Flight Details"}
                  </span>
                  {expandedSections.flightDetails ? <AiOutlineMinus /> : <AiOutlinePlus />}
                </button>
              </div>

              {expandedSections.flightDetails && (
                <div className="p-4 bg-gradient-to-b from-gray-50 to-white">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{parsedFlightData.airline}</p>
                        <p className="text-sm text-gray-600">{parsedFlightData.flightNumber}</p>
                      </div>
                      <img
                        src={`https://images.kiwi.com/airlines/64x64/${parsedFlightData.airlineCode}.png`}
                        alt={parsedFlightData.airline}
                        className="w-12 h-12"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/48"; }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{parsedFlightData.departureTime}</p>
                        <p className="text-sm text-gray-600">{parsedFlightData.fromCode}</p>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-sm text-gray-600">{parsedFlightData.duration}</p>
                        <div className="w-full h-px bg-gray-300 my-2"></div>
                        <p className="text-xs text-gray-500">
                          {parsedFlightData.stops === 0 ? "Direct" : `${parsedFlightData.stops} stop(s)`}
                        </p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{parsedFlightData.arrivalTime}</p>
                        <p className="text-sm text-gray-600">{parsedFlightData.toCode}</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Baggage Allowance</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Check-in:</span>
                        <span className="font-semibold">{parsedFlightData.baggage}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-600">Cabin:</span>
                        <span className="font-semibold">{parsedFlightData.cabinBaggage}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Price Summary */}
          <div className="space-y-4">
            {/* Price Summary Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Price Summary</h3>

              <div className="space-y-3 border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Base Fare ({travelers.length} traveler{travelers.length > 1 ? 's' : ''})</span>
                  <span className="font-semibold">₹{(parsedFlightData.basePrice * travelers.length).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-lg font-bold mb-4">
                <span>Total Amount</span>
                <span className="text-blue-600">₹{getTotalPrice().toLocaleString()}</span>
              </div>

              {/* Review Status */}
              {reviewStatus === "loading" && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-blue-700">Reviewing price...</p>
                </div>
              )}

              {reviewStatus === "succeeded" && bookingId && (
                <div className="bg-green-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-green-700">
                    ✓ Price locked - Booking ID: {bookingId}
                  </p>
                </div>
              )}

              {reviewStatus === "failed" && (
                <div className="bg-red-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-red-700">{reviewError || "Price review failed"}</p>
                </div>
              )}

              <button
                // onClick={handleProceedToPayment}
                disabled={!bookingId || reviewStatus === "loading"}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                Add Markup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}