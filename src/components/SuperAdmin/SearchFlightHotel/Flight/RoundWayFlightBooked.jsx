// Admin/src/components/SearchFlightHotel/RoundWayFlightBooked.jsx
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
import { FaPlane, FaWifi } from "react-icons/fa";
import {
  BsTag,
  BsInfoCircleFill,
  BsCashStack,
  BsCalendar4,
} from "react-icons/bs";
import { AiOutlineCheck, AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { BiTime } from "react-icons/bi";
import { GoPeople } from "react-icons/go";
import { PiForkKnifeBold } from "react-icons/pi";

import {
  reviewPrices,
  fetchFareRules,
} from "../../../../features/slices/FlightSearch";

export default function RoundTripFlightBooking() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    selectedFlight,
    searchParams,
    rawFlightData,
    outboundFlight,
    returnFlight,
    tripType = "roundtrip",
  } = location.state || {};

  // Redux selectors
  const reviewStatus = useSelector((state) => state.flightSearch.reviewStatus);
  const reduxBookingId = useSelector((state) => state.flightSearch.bookingId);
  const reviewResponse = useSelector((state) => state.flightSearch.review);
  const fareRules = useSelector((state) => state.flightSearch.fareRules);
  const fareRulesStatus = useSelector((state) => state.flightSearch.fareRulesStatus);

  // Local state
  const [bookingId, setBookingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [parsedFlightData, setParsedFlightData] = useState(null);
  
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
    onwardFlightDetails: true,
    returnFlightDetails: true,
    travelerDetails: false,
    fareRules: false,
  });

  const [selectedFare, setSelectedFare] = useState("Standard");
  const [expandedFare, setExpandedFare] = useState(null);

  // Parse flight data
  const parseRoundTripFlightData = useMemo(() => {
    if (!outboundFlight || !returnFlight) return null;

    try {
      // Parse Outbound Flight
      const outboundSegments = outboundFlight?.sI || [];
      const outboundFirst = outboundSegments[0];
      const outboundLast = outboundSegments[outboundSegments.length - 1];

      const outboundData = {
        airline: outboundFirst?.fD?.aI?.name || "Unknown",
        airlineCode: outboundFirst?.fD?.aI?.code || "",
        flightNumber: outboundFirst?.fD?.fN || "N/A",
        from: outboundFirst?.da?.city || searchParams?.from || "N/A",
        to: outboundLast?.aa?.city || searchParams?.to || "N/A",
        fromCode: outboundFirst?.da?.code || "N/A",
        toCode: outboundLast?.aa?.code || "N/A",
        departureTime: new Date(outboundFirst?.dt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        arrivalTime: new Date(outboundLast?.at).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        departureDate: new Date(outboundFirst?.dt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        duration: `${Math.floor((outboundFirst?.duration || 0) / 60)}h ${(outboundFirst?.duration || 0) % 60}m`,
        stops: outboundSegments.length - 1,
        basePrice: outboundflight?.totalPriceList?.[0]?.fd?.ADULT?.fC?.TF || 0,
        segments: outboundSegments,
      };

      // Parse Return Flight
      const returnSegments = returnFlight?.sI || [];
      const returnFirst = returnSegments[0];
      const returnLast = returnSegments[returnSegments.length - 1];

      const returnData = {
        airline: returnFirst?.fD?.aI?.name || "Unknown",
        airlineCode: returnFirst?.fD?.aI?.code || "",
        flightNumber: returnFirst?.fD?.fN || "N/A",
        from: returnFirst?.da?.city || searchParams?.to || "N/A",
        to: returnLast?.aa?.city || searchParams?.from || "N/A",
        fromCode: returnFirst?.da?.code || "N/A",
        toCode: returnLast?.aa?.code || "N/A",
        departureTime: new Date(returnFirst?.dt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        arrivalTime: new Date(returnLast?.at).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        departureDate: new Date(returnFirst?.dt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        duration: `${Math.floor((returnFirst?.duration || 0) / 60)}h ${(returnFirst?.duration || 0) % 60}m`,
        stops: returnSegments.length - 1,
        basePrice: returnflight?.totalPriceList?.[0]?.fd?.ADULT?.fC?.TF || 0,
        segments: returnSegments,
      };

      return {
        type: "roundtrip",
        outbound: outboundData,
        return: returnData,
        totalPrice: outboundData.basePrice + returnData.basePrice,
        baggage: outboundFlight?.totalPriceList?.[0]?.fd?.ADULT?.bI?.iB || "15 Kg",
        cabinBaggage: outboundFlight?.totalPriceList?.[0]?.fd?.ADULT?.bI?.cB || "7 Kg",
      };
    } catch (err) {
      console.error("Error parsing round trip data:", err);
      return null;
    }
  }, [outboundFlight, returnFlight, searchParams]);

  // Set parsed data
  useEffect(() => {
    if (parseRoundTripFlightData) {
      setParsedFlightData(parseRoundTripFlightData);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [parseRoundTripFlightData]);

  // Review prices on mount
  useEffect(() => {
    if (!parsedFlightData) return;

    const outboundPriceId = outboundFlight?.totalPriceList?.[0]?.id;
    const returnPriceId = returnFlight?.totalPriceList?.[0]?.id;

    if (!outboundPriceId || !returnPriceId) {
      console.warn("Missing price IDs");
      return;
    }

    if (reduxBookingId) {
      setBookingId(reduxBookingId);
      return;
    }

    // Call review API
    dispatch(
      reviewPrices({
        priceIds: [outboundPriceId, returnPriceId],
        searchParams,
        tripType: "RT",
      })
    )
      .unwrap()
      .then((res) => {
        setBookingId(res.bookingId);
        sessionStorage.setItem("bookingId", res.bookingId);

        // Fetch fare rules
        dispatch(
          fetchFareRules({
            priceIds: [outboundPriceId, returnPriceId],
            tripType: "RT",
          })
        );
      })
      .catch((err) => console.error("Review error:", err));
  }, [parsedFlightData, outboundFlight, returnFlight, reduxBookingId, dispatch]);

  // Update local bookingId
  useEffect(() => {
    if (reduxBookingId) {
      setBookingId(reduxBookingId);
    }
  }, [reduxBookingId]);

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
          { text: parsedFlightData.cabinBaggage || "7kg hand baggage", included: true },
          { text: "No check-in baggage", included: false },
          { text: "No meal included", included: false },
          { text: "Standard seat", included: true },
        ],
      },
      {
        type: "Standard",
        price: totalBasePrice,
        popular: true,
        features: [
          { text: parsedFlightData.cabinBaggage || "7kg hand baggage", included: true },
          { text: parsedFlightData.baggage || "15kg check-in baggage", included: true },
          { text: "Complimentary meal", included: true },
          { text: "Seat selection", included: true },
        ],
      },
      {
        type: "Flexi",
        price: Math.round(totalBasePrice * 1.15),
        popular: false,
        features: [
          { text: "10kg hand baggage", included: true },
          { text: "25kg check-in baggage", included: true },
          { text: "Premium meal", included: true },
          { text: "Priority seat", included: true },
        ],
      },
    ];
  }, [parsedFlightData]);

  const selectedFareData = useMemo(() => {
    return fareOptions.find((f) => f.type === selectedFare) || fareOptions[1] || { price: 0 };
  }, [fareOptions, selectedFare]);

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
    return selectedFareData.price * travelers.length;
  };

  const handleProceedToPayment = () => {
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
                ROUND-TRIP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Overview Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center">
                    <FaPlane className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Round Trip Flight Details</h2>
                    <p className="text-xs text-blue-100">Complete journey information</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Outbound */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <MdFlightTakeoff className="text-orange-400 text-xl" />
                      <span className="text-sm font-semibold">Onward Journey</span>
                    </div>
                    <p className="font-bold text-lg">
                      {parsedFlightData.outbound.from} → {parsedFlightData.outbound.to}
                    </p>
                    <p className="text-sm text-blue-100">{parsedFlightData.outbound.departureDate}</p>
                  </div>

                  {/* Return */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <MdFlightLand className="text-purple-400 text-xl" />
                      <span className="text-sm font-semibold">Return Journey</span>
                    </div>
                    <p className="font-bold text-lg">
                      {parsedFlightData.return.from} → {parsedFlightData.return.to}
                    </p>
                    <p className="text-sm text-blue-100">{parsedFlightData.return.departureDate}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
                    <BiTime className="text-orange-400 text-xl mx-auto mb-1" />
                    <p className="text-xs font-bold">Duration</p>
                    <p className="font-bold text-sm">
                      {parsedFlightData.outbound.duration} + {parsedFlightData.return.duration}
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
                    <GoPeople className="text-orange-400 text-xl mx-auto mb-1" />
                    <p className="text-xs font-bold">Travelers</p>
                    <p className="font-bold text-sm">{travelers.length}</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
                    <BsCashStack className="text-orange-400 text-xl mx-auto mb-1" />
                    <p className="text-xs font-bold">Total</p>
                    <p className="font-bold text-sm">₹{parsedFlightData.totalPrice.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Outbound Flight Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection("onwardFlightDetails")}
                className="w-full bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-5 flex items-center justify-between hover:from-green-100 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <AiOutlineCheck className="text-white text-2xl" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg text-green-800">
                      Onward: {parsedFlightData.outbound.from} → {parsedFlightData.outbound.to}
                    </p>
                    <p className="text-sm text-gray-700">
                      {parsedFlightData.outbound.departureDate} • {parsedFlightData.outbound.segments.length} Segment(s)
                    </p>
                  </div>
                </div>
                {expandedSections.onwardFlightDetails ? <AiOutlineMinus /> : <AiOutlinePlus />}
              </button>

              {expandedSections.onwardFlightDetails && (
                <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{parsedFlightData.outbound.airline}</p>
                        <p className="text-sm text-gray-600">{parsedFlightData.outbound.flightNumber}</p>
                      </div>
                      <img
                        src={`https://images.kiwi.com/airlines/64x64/${parsedFlightData.outbound.airlineCode}.png`}
                        alt={parsedFlightData.outbound.airline}
                        className="w-12 h-12"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/48"; }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold">{parsedFlightData.outbound.departureTime}</p>
                        <p className="text-sm text-gray-600">{parsedFlightData.outbound.fromCode}</p>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-sm text-gray-600">{parsedFlightData.outbound.duration}</p>
                        <div className="w-full h-px bg-gray-300 my-2"></div>
                        <p className="text-xs text-gray-500">
                          {parsedFlightData.outbound.stops === 0 ? "Direct" : `${parsedFlightData.outbound.stops} stop(s)`}
                        </p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{parsedFlightData.outbound.arrivalTime}</p>
                        <p className="text-sm text-gray-600">{parsedFlightData.outbound.toCode}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Return Flight Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection("returnFlightDetails")}
                className="w-full bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500 p-5 flex items-center justify-between hover:from-purple-100 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <AiOutlineCheck className="text-white text-2xl" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg text-purple-800">
                      Return: {parsedFlightData.return.from} → {parsedFlightData.return.to}
                    </p>
                    <p className="text-sm text-gray-700">
                      {parsedFlightData.return.departureDate} • {parsedFlightData.return.segments.length} Segment(s)
                    </p>
                  </div>
                </div>
                {expandedSections.returnFlightDetails ? <AiOutlineMinus /> : <AiOutlinePlus />}
              </button>

              {expandedSections.returnFlightDetails && (
                <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{parsedFlightData.return.airline}</p>
                        <p className="text-sm text-gray-600">{parsedFlightData.return.flightNumber}</p>
                      </div>
                      <img
                        src={`https://images.kiwi.com/airlines/64x64/${parsedFlightData.return.airlineCode}.png`}
                        alt={parsedFlightData.return.airline}
                        className="w-12 h-12"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/48"; }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold">{parsedFlightData.return.departureTime}</p>
                        <p className="text-sm text-gray-600">{parsedFlightData.return.fromCode}</p>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-sm text-gray-600">{parsedFlightData.return.duration}</p>
                        <div className="w-full h-px bg-gray-300 my-2"></div>
                        <p className="text-xs text-gray-500">
                          {parsedFlightData.return.stops === 0 ? "Direct" : `${parsedFlightData.return.stops} stop(s)`}
                        </p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{parsedFlightData.return.arrivalTime}</p>
                        <p className="text-sm text-gray-600">{parsedFlightData.return.toCode}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fare Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-bold text-lg mb-4">Select Your Fare</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {fareOptions.map((fare) => (
                  <div
                    key={fare.type}
                    onClick={() => setSelectedFare(fare.type)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                      selectedFare === fare.type
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold">{fare.type}</h4>
                      {fare.popular && (
                        <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-3">
                      ₹{fare.price.toLocaleString()}
                    </p>
                    <ul className="space-y-2 text-sm">
                      {fare.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className={feature.included ? "text-green-600" : "text-gray-400"}>
                            {feature.included ? "✓" : "✗"}
                          </span>
                          <span className={feature.included ? "text-gray-700" : "text-gray-400"}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Traveler Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Traveler Details</h3>
                <button
                  onClick={addTraveler}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <AiOutlinePlus /> Add Traveler
                </button>
              </div>

              <div className="space-y-4">
                {travelers.map((traveler, index) => (
                  <div key={traveler.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Traveler {index + 1}</h4>
                      {travelers.length > 1 && (
                        <button
                          onClick={() => removeTraveler(traveler.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <select
                          value={traveler.title}
                          onChange={(e) => updateTraveler(traveler.id, "title", e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="Mr.">Mr.</option>
                          <option value="Mrs.">Mrs.</option>
                          <option value="Ms.">Ms.</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">First Name *</label>
                        <input
                          type="text"
                          value={traveler.firstName}
                          onChange={(e) => updateTraveler(traveler.id, "firstName", e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Last Name *</label>
                        <input
                          type="text"
                          value={traveler.lastName}
                          onChange={(e) => updateTraveler(traveler.id, "lastName", e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Date of Birth *</label>
                        <input
                          type="date"
                          value={traveler.dob}
                          onChange={(e) => updateTraveler(traveler.id, "dob", e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Email *</label>
                        <input
                          type="email"
                          value={traveler.email}
                          onChange={(e) => updateTraveler(traveler.id, "email", e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Mobile *</label>
                        <PhoneInput
                          country={"in"}
                          value={traveler.mobile}
                          onChange={(phone) => updateTraveler(traveler.id, "mobile", phone)}
                          inputClass="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fare Rules Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection("fareRules")}
                className="w-full bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 p-5 flex items-center justify-between hover:from-orange-100 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <BsInfoCircleFill className="text-white text-2xl" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg text-orange-800">Fare Rules & Policies</p>
                    <p className="text-sm text-gray-700">Cancellation, date change & baggage policies</p>
                  </div>
                </div>
                {expandedSections.fareRules ? <AiOutlineMinus /> : <AiOutlinePlus />}
              </button>

              {expandedSections.fareRules && (
                <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
                  {fareRulesStatus === "loading" && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-600 text-sm">Loading fare rules...</p>
                    </div>
                  )}

                  {fareRulesStatus === "succeeded" && fareRules && (
                    <div className="space-y-4">
                      {/* Onward Flight Fare Rules */}
                      <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                        <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                          <MdFlightTakeoff />
                          Onward Flight - Fare Rules
                        </h4>
                        <div className="space-y-2 text-sm text-gray-700">
                          {fareRules.fareRule?.[0]?.fr ? (
                            <div dangerouslySetInnerHTML={{ __html: fareRules.fareRule[0].fr }} />
                          ) : (
                            <p>Standard fare rules apply. Contact airline for details.</p>
                          )}
                        </div>
                      </div>

                      {/* Return Flight Fare Rules */}
                      <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                        <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                          <MdFlightLand />
                          Return Flight - Fare Rules
                        </h4>
                        <div className="space-y-2 text-sm text-gray-700">
                          {fareRules.fareRule?.[1]?.fr ? (
                            <div dangerouslySetInnerHTML={{ __html: fareRules.fareRule[1].fr }} />
                          ) : (
                            <p>Standard fare rules apply. Contact airline for details.</p>
                          )}
                        </div>
                      </div>

                      {/* Important Notes */}
                      <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                        <h4 className="font-bold text-blue-800 mb-2">Important Notes:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          <li>Fare rules are subject to change by the airline</li>
                          <li>Cancellation charges may apply as per airline policy</li>
                          <li>Date change fees may vary based on fare type</li>
                          <li>Baggage allowance is per person</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {fareRulesStatus === "failed" && (
                    <div className="text-center py-4">
                      <p className="text-red-600 text-sm">Unable to load fare rules</p>
                    </div>
                  )}

                  {fareRulesStatus === "idle" && (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm">Fare rules will be loaded shortly...</p>
                    </div>
                  )}
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
                {/* Onward Flight */}
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MdFlightTakeoff className="text-green-600" />
                      <span className="text-sm font-semibold text-green-800">Onward Flight</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {parsedFlightData.outbound.fromCode} → {parsedFlightData.outbound.toCode}
                    </span>
                    <span className="font-semibold">₹{parsedFlightData.outbound.basePrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Return Flight */}
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MdFlightLand className="text-purple-600" />
                      <span className="text-sm font-semibold text-purple-800">Return Flight</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {parsedFlightData.return.fromCode} → {parsedFlightData.return.toCode}
                    </span>
                    <span className="font-semibold">₹{parsedFlightData.return.basePrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Travelers */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Travelers ({travelers.length} × ₹{parsedFlightData.totalPrice.toLocaleString()})
                  </span>
                  <span className="font-semibold">
                    ₹{(parsedFlightData.totalPrice * travelers.length).toLocaleString()}
                  </span>
                </div>

                {/* Selected Fare */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Fare Type</span>
                  <span className="font-semibold text-blue-600">{selectedFare}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span className="font-semibold">Included</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-lg font-bold mb-4">
                <span>Total Amount</span>
                <span className="text-blue-600">₹{getTotalPrice().toLocaleString()}</span>
              </div>

              {/* Review Status */}
              {reviewStatus === "loading" && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-blue-700">Reviewing prices...</p>
                  </div>
                </div>
              )}

              {reviewStatus === "succeeded" && bookingId && (
                <div className="bg-green-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-green-700 flex items-center gap-2">
                    <AiOutlineCheck className="text-green-600" />
                    Price locked - Booking ID: {bookingId}
                  </p>
                </div>
              )}

              {reviewStatus === "failed" && (
                <div className="bg-red-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-red-700">
                    {reviewError?.message || "Price review failed"}
                  </p>
                </div>
              )}

              <button
                // onClick={handleProceedToPayment}
                disabled={!bookingId || reviewStatus === "loading"}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                Add Markup
              </button>
              {/* Baggage Info */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-900 mb-2">Baggage Allowance</p>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Check-in:</span>
                    <span className="font-semibold">{parsedFlightData.baggage}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cabin:</span>
                    <span className="font-semibold">{parsedFlightData.cabinBaggage}</span>
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