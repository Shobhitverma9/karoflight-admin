import React, { useEffect, useState } from "react";
import {
  fetchOffers,
  editOffer,
  toggleOfferStatus,
  deleteOffer,
} from "../../features/slices/offerSlice";
import { useDispatch, useSelector } from "react-redux";
import OfferEditModal from "../Modal/OfferEditModal";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  FaSync,
  FaSearch,
  FaFilter,
  FaTimes,
  FaPlus,
  FaChartBar,
} from "react-icons/fa";

const OffersListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { offers, loading, error } = useSelector((state) => state.offers);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expiryFilter, setExpiryFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchOffers());
  }, [dispatch]);

  // Live timer effect - updates every minute normally, every second for urgent offers
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      setCurrentTime(now);

      // Check if any offers are expiring within 1 hour
      const hasUrgentOffers = offers.some((offer) => {
        if (!offer.endAt) return false;
        const diff = new Date(offer.endAt) - now;
        return diff > 0 && diff < 60 * 60 * 1000; // Less than 1 hour
      });

      // Return appropriate interval
      return hasUrgentOffers ? 1000 : 60000; // 1 second if urgent, 1 minute otherwise
    };

    let interval = updateTimer();
    const timer = setInterval(() => {
      interval = updateTimer();
    }, interval);

    return () => clearInterval(timer);
  }, [offers]);

  // Initial timer setup
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000); // Update every 10 seconds as fallback

    return () => clearInterval(timer);
  }, []);

  // Filter and search logic
  const getFilteredOffers = () => {
    if (!Array.isArray(offers)) return [];

    return offers.filter((offer) => {
      // Search term filter
      const matchesSearch =
        !searchTerm ||
        offer.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.couponCode?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && offer.active) ||
        (statusFilter === "inactive" && !offer.active);

      // Type filter
      const matchesType = typeFilter === "all" || offer.type === typeFilter;

      // Expiry filter
      let matchesExpiry = true;
      if (expiryFilter !== "all" && offer.endAt) {
        const now = currentTime;
        const end = new Date(offer.endAt);
        const diff = end - now;

        if (expiryFilter === "expired") {
          matchesExpiry = diff <= 0;
        } else if (expiryFilter === "expiring") {
          matchesExpiry = diff > 0 && diff < 24 * 60 * 60 * 1000; // Less than 24 hours
        } else if (expiryFilter === "active") {
          matchesExpiry = diff > 24 * 60 * 60 * 1000; // More than 24 hours
        }
      } else if (expiryFilter !== "all" && !offer.endAt) {
        matchesExpiry = expiryFilter === "active"; // No expiry = active
      }

      return matchesSearch && matchesStatus && matchesType && matchesExpiry;
    });
  };

  const filteredOffers = getFilteredOffers();

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setExpiryFilter("all");
  };

  const handleRefresh = async () => {
    try {
      Swal.fire({
        title: "Refreshing...",
        text: "Loading latest offers",
        icon: "info",
        allowOutsideClick: false,
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await dispatch(fetchOffers()).unwrap();

      Swal.fire({
        title: "Success!",
        text: "Offers refreshed successfully",
        icon: "success",
        timer: 1000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to refresh offers. Please try again.",
        icon: "error",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  const handleEditClick = (offer) => {
    setSelectedOffer({ ...offer });
    setIsEditOpen(true);
  };

  const handleSave = async (updatedData) => {
    if (!selectedOffer) return;
    const offerId = selectedOffer._id || selectedOffer.id;

    try {
      // Show loading state
      Swal.fire({
        title: "Updating Offer...",
        text: "Please wait while we save your changes",
        icon: "info",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await dispatch(
        editOffer({
          id: offerId,
          data: updatedData,
        })
      ).unwrap();

      // Force refresh the offers list to get updated data
      await dispatch(fetchOffers()).unwrap();

      setIsEditOpen(false);
      setSelectedOffer(null);

      Swal.fire({
        title: "Success!",
        text: "Offer updated successfully",
        icon: "success",
        timer: 1000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Update failed:", err);
      Swal.fire({
        title: "Error!",
        text: "Failed to update offer. Please try again.",
        icon: "error",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  const handleToggleActive = async (offerId, currentStatus) => {
    const action = currentStatus ? "deactivate" : "activate";
    const actionCapitalized = currentStatus ? "Deactivate" : "Activate";

    try {
      const result = await Swal.fire({
        title: `${actionCapitalized} Offer?`,
        text: `Are you sure you want to ${action} this offer?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: currentStatus ? "#EF4444" : "#10B981",
        cancelButtonColor: "#6B7280",
        confirmButtonText: `Yes, ${action} it!`,
        cancelButtonText: "Cancel",
        reverseButtons: true,
      });

      if (!result.isConfirmed) return;

      Swal.fire({
        title: `${actionCapitalized.slice(0, -1)}ing...`,
        text: "Please wait",
        icon: "info",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await dispatch(
        toggleOfferStatus({
          id: offerId,
          active: !currentStatus,
        })
      ).unwrap();

      await Swal.fire({
        title: "Success!",
        text: `Offer has been ${action}d successfully`,
        icon: "success",
        confirmButtonColor: "#10B981",
        timer: 1000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Error updating offer status:", error);

      Swal.fire({
        title: "Error!",
        text: `Failed to ${action} offer. Please try again.`,
        icon: "error",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  const handleRemoveOffer = async (offerId, offerTitle) => {
    try {
      const result = await Swal.fire({
        title: "Delete Offer?",
        html: `
          <p>Are you sure you want to permanently delete this offer?</p>
          <p class="text-sm text-gray-600 mt-2"><strong>"${offerTitle}"</strong></p>
          <p class="text-xs text-red-600 mt-2">This action cannot be undone!</p>
        `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#EF4444",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
        reverseButtons: true,
        focusCancel: true,
      });

      if (!result.isConfirmed) return;

      Swal.fire({
        title: "Deleting...",
        text: "Removing offer from database",
        icon: "info",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await dispatch(deleteOffer(offerId)).unwrap();

      await Swal.fire({
        title: "Deleted!",
        text: "Offer has been permanently removed",
        icon: "success",
        confirmButtonColor: "#10B981",
        timer: 1000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Error removing offer:", error);

      Swal.fire({
        title: "Error!",
        text: "Failed to remove offer. Please try again.",
        icon: "error",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  // Enhanced function to display remaining time with live updates
  const getRemainingTime = (endAt) => {
    if (!endAt) return "No expiry";

    const now = currentTime; // Use the live currentTime state
    const end = new Date(endAt);
    const diff = end - now;

    if (diff <= 0)
      return <span className="text-red-400 font-semibold">Expired</span>;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    // Color coding based on time remaining
    let colorClass = "text-gray-200";
    if (diff < 24 * 60 * 60 * 1000) {
      // Less than 1 day
      colorClass = "text-red-400 font-semibold";
    } else if (diff < 3 * 24 * 60 * 60 * 1000) {
      // Less than 3 days
      colorClass = "text-yellow-400 font-semibold";
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      // Less than 7 days
      colorClass = "text-orange-400";
    } else {
      colorClass = "text-green-400";
    }

    if (days > 0) {
      return (
        <span className={colorClass}>
          {days}d {hours}h left
        </span>
      );
    } else if (hours > 0) {
      return (
        <span className={colorClass}>
          {hours}h {minutes}m left
        </span>
      );
    } else if (minutes > 0) {
      return (
        <span className={colorClass}>
          {minutes}m {seconds}s left
        </span>
      );
    } else {
      return (
        <span className="text-red-400 font-semibold animate-pulse">
          {seconds}s left
        </span>
      );
    }
  };

  // Fixed function to display discount value properly
  const getDiscountDisplay = (offer) => {
    if (offer.type === "percentage") {
      return `${offer.value}% off`;
    } else if (offer.type === "coupon") {
      // Check for different possible coupon code properties
      const couponCode = offer.code || offer.couponCode || offer.value;
      return couponCode ? `#${couponCode}` : "Coupon";
    } else {
      // For fixed amount or other types
      return `₹${offer.value} off`;
    }
  };

  useEffect(() => {
    if (error) {
      Swal.fire({
        title: "Error Loading Offers",
        text: error,
        icon: "error",
        confirmButtonColor: "#EF4444",
        confirmButtonText: "Retry",
        showCancelButton: true,
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          dispatch(fetchOffers());
        }
      });
    }
  }, [error, dispatch]);

  if (loading && offers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section - Enhanced Design */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold  bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Offers Management
            </h1>
            <p className="text-gray-600 text-sm mt-2 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                {filteredOffers.length} of {offers.length} offer
                {offers.length !== 1 ? "s" : ""}
              </span>
              {searchTerm ||
              statusFilter !== "all" ||
              typeFilter !== "all" ||
              expiryFilter !== "all" ? (
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                  Filtered
                </span>
              ) : (
                ""
              )}
            </p>
          </div>

          {/* Action Buttons - Enhanced Design */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/offers/analytics")}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <FaChartBar />
              Analytics
            </button>
            <button
              onClick={() => navigate("/offers/add")}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <FaPlus />
              Add New Offer
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <FaSync className={loading ? "animate-spin" : ""} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Search and Filter Section - Enhanced Design */}
        <div className="bg-white rounded-lg shadow-sm  p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-md relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border px-3 py-2 rounded-lg text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border px-3 py-2 rounded-lg text-sm"
              >
                <option value="all">All Types</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
                <option value="coupon">Coupon</option>
              </select>

              <select
                value={expiryFilter}
                onChange={(e) => setExpiryFilter(e.target.value)}
                className="border px-3 py-2 rounded-lg text-sm"
              >
                <option value="all">All Offers</option>
                <option value="active">Active (24h+)</option>
                <option value="expiring">Expiring Soon (24h)</option>
                <option value="expired">Expired</option>
              </select>

              {(searchTerm ||
                statusFilter !== "all" ||
                typeFilter !== "all" ||
                expiryFilter !== "all") && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                >
                  <FaTimes className="inline mr-1" /> Reset Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {Array.isArray(offers) && offers.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-xl border border-gray-200">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No offers found
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first offer
            </p>
            <button
              onClick={() => navigate("/offers/add")}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Create Your First Offer
            </button>
          </div>
        )}

        {/* Filtered Empty State */}
        {Array.isArray(offers) &&
          offers.length > 0 &&
          filteredOffers.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl shadow-xl border border-gray-200">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center">
                <FaSearch className="w-12 h-12 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No matching offers
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={clearFilters}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Clear All Filters
              </button>
            </div>
          )}

        {/* Offers Grid - Enhanced Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredOffers.map((offer) => (
            <div
              key={offer._id || offer.id}
              className="relative bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200"
            >
              {/* Background Image with better error handling */}
              {offer.imageUrl && (
                <div className="absolute inset-0">
                  <img
                    src={offer.imageUrl}
                    alt={offer.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    style={{ display: "block" }}
                    onLoad={(e) => {
                      e.target.style.display = "block";
                      e.target.parentElement.nextElementSibling.style.display =
                        "none";
                    }}
                    onError={(e) => {
                      console.log("Image failed to load:", offer.imageUrl);
                      e.target.style.display = "none";
                      e.target.parentElement.nextElementSibling.style.display =
                        "flex";
                    }}
                  />
                </div>
              )}

              {/* Fallback gradient background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center ${
                  offer.imageUrl ? "hidden" : "flex"
                }`}
                style={{ display: offer.imageUrl ? "none" : "flex" }}
              >
                <span className="text-white text-2xl font-bold opacity-80">
                  {offer.title?.charAt(0)?.toUpperCase() || "O"}
                </span>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

              {/* Card Content - Enhanced Layout */}
              <div className="relative p-5 h-80 flex flex-col justify-between">
                {/* Top Section - Status and Coupon Code */}
                <div className="flex justify-between items-start">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 shadow-lg ${
                      offer.active
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                        : "bg-gradient-to-r from-red-500 to-red-600 text-white"
                    }`}
                  >
                    {offer.active ? "Active" : "Inactive"}
                  </span>

                  {/* Coupon Code Badge */}
                  <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-sm font-bold rounded-lg shadow-lg">
                    {offer.code ||
                      offer.couponCode ||
                      (offer.type === "fixed"
                        ? `₹${offer.value}`
                        : `${offer.value}%`)}
                  </span>
                </div>

                {/* Middle Section - Title and Description */}
                <div className="flex-1 flex flex-col justify-center py-3">
                  <h2 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-yellow-200 transition-colors duration-200">
                    {offer.title}
                  </h2>
                  <p className="text-sm text-gray-200 line-clamp-3 leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-200">
                    {offer.description}
                  </p>
                </div>

                {/* Bottom Section - Details and Actions */}
                <div className="space-y-4">
                  {/* Offer Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Discount:</span>
                      <span className="font-bold text-yellow-300 text-lg">
                        {getDiscountDisplay(offer)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Time left:</span>
                      <span className="text-right font-medium">
                        {getRemainingTime(offer.endAt)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons - Enhanced Design */}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleToggleActive(offer._id || offer.id, offer.active)
                      }
                      disabled={loading}
                      className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg ${
                        offer.active
                          ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                          : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                      }`}
                    >
                      {offer.active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleEditClick(offer)}
                      disabled={loading}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        handleRemoveOffer(offer._id || offer.id, offer.title)
                      }
                      disabled={loading}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <OfferEditModal
        offer={selectedOffer}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedOffer(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
};

export default OffersListPage;
