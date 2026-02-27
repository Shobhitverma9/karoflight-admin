// components/Campaigns/CampaignsListPage.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  getAllCampaigns,
  deleteCampaign,
  sendCampaign,
  clearError,
  clearSuccess,
} from "../../../features/slices/campaignSlice";
import {
  FaRocket,
  FaPlus,
  FaEdit,
  FaTrash,
  FaPaperPlane,
  FaEye,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaTag,
  FaFilter,
  FaSearch,
  FaSync,
  FaList,
  FaTh,
  FaChartLine,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { HiTemplate, HiMail, HiSparkles } from "react-icons/hi";
import Swal from "sweetalert2";
import ViewCampaignModal from "../../Modal/ViewCampaignModal";
import { MdPending } from "react-icons/md";

const CampaignsListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [localLoading, setLocalLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const campaignsState = useSelector(
    (state) =>
      state.campaigns ||
      state.campaign ||
      state.newsletter || { campaigns: [], loading: false, error: null }
  );

  const campaigns =
    campaignsState.campaigns ||
    campaignsState.data ||
    campaignsState.items ||
    [];
  const loading = campaignsState.loading || campaignsState.isLoading || false;
  const error = campaignsState.error || campaignsState.errorMessage || null;
  const success = campaignsState.success || false;
  const deleting = campaignsState.deleting || false;
  const sending = campaignsState.sending || false;

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-set view mode based on screen size
      if (mobile && viewMode === "grid") {
        setViewMode("list");
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [viewMode]);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLocalLoading(true);
      await dispatch(getAllCampaigns());
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    if (success) {
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Operation completed successfully",
        timer: 2000,
        showConfirmButton: false,
      });
      dispatch(clearSuccess());
      fetchCampaigns();
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error,
        confirmButtonColor: "#3b82f6",
      });
      dispatch(clearError());
    }
  }, [error]);

  const displayCampaigns = campaigns && campaigns.length > 0 ? campaigns : [];

  const filteredCampaigns = displayCampaigns
    .filter((campaign) => {
      const matchesSearch =
        campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.subject?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || campaign.status === statusFilter;
      const matchesType = typeFilter === "all" || campaign.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "oldest":
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "status":
          return (a.status || "").localeCompare(b.status || "");
        default:
          return 0;
      }
    });

  const handleDeleteCampaign = async (campaignId, campaignName) => {
    const result = await Swal.fire({
      title: "Delete Campaign?",
      html: `Are you sure you want to delete <strong>"${campaignName}"</strong>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      await dispatch(deleteCampaign(campaignId));
    }
  };

  const handleSendCampaign = async (campaignId, campaignName) => {
    const result = await Swal.fire({
      title: "Send Campaign?",
      html: `Send <strong>"${campaignName}"</strong> to all subscribers?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, send it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      await dispatch(sendCampaign(campaignId));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: "bg-gray-100 text-gray-700 border-gray-200",
      scheduled: "bg-yellow-50 text-yellow-700 border-yellow-200",
      sent: "bg-green-50 text-green-700 border-green-200",
      sending: "bg-blue-50 text-blue-700 border-blue-200",
      pending_approval:"bg-orange-50 text-orange-700 border-orange-200"
    };
    return badges[status] || badges.draft;
  };

  const getTypeBadge = (type) => {
    const badges = {
      deal: "bg-green-50 text-green-700 border-green-200",
      announcement: "bg-blue-50 text-blue-700 border-blue-200",
      offer: "bg-purple-50 text-purple-700 border-purple-200",
      newsletter: "bg-orange-50 text-orange-700 border-orange-200",
      custom: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return badges[type] || badges.custom;
  };

  const getStatusIcon = (status) => {
    const icons = {
      draft: <FaEdit className="w-3.5 h-3.5" />,
      scheduled: <FaClock className="w-3.5 h-3.5 animate-spin" />,
      sent: <FaCheckCircle className="w-3.5 h-3.5 animate-pulse" />,
      sending: <FaSync className="w-3.5 h-3.5 animate-spin" />,
      pending_approval: <MdPending className="w-3.5 h-3.5 animate-spin" />
    };
    return icons[status] || icons.draft;
  };

  const getTypeIcon = (type) => {
    const icons = {
      deal: <FaTag className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />,
      announcement: <HiMail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />,
      offer: <FaRocket className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />,
      newsletter: <HiTemplate className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />,
      custom: <FaEdit className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />,
    };
    return icons[type] || icons.custom;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const getStatsPercentage = (campaign) => {
    if (
      !campaign.stats?.totalSubscribers ||
      campaign.stats.totalSubscribers === 0
    ) {
      return 0;
    }
    return Math.round(
      (campaign.stats.successCount / campaign.stats.totalSubscribers) * 100
    );
  };

  const handleViewCampaign = (campaignId) => {
    const campaign = campaigns.find((c) => c._id === campaignId);
    if (campaign) {
      setSelectedCampaign(campaign);
      setViewModalOpen(true);
    }
  };

  const handleCloseModals = () => {
    setViewModalOpen(false);
    setSelectedCampaign(null);
  };

  const handleEditFromView = (campaignId) => {
    setViewModalOpen(false);
    navigate(`/campaign/${campaignId}/edit`);
  };

  const handleEditCampaign = (campaignId) => {
    navigate(`/campaign/${campaignId}/edit`);
  };

  const isLoading = loading || localLoading;

  // Mobile Action Buttons Component
  const MobileActionButtons = ({ campaign }) => (
    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-200">
      <button
        onClick={() => handleViewCampaign(campaign._id)}
        className="flex-1 px-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-1 text-xs"
        title="View Campaign"
      >
        <FaEye className="w-3 h-3" />
        View
      </button>

      {(campaign.status === "draft" || campaign.status === "scheduled") && (
        <>
          <button
            onClick={() => handleEditCampaign(campaign._id)}
            className="px-2 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center text-xs"
            title="Edit Campaign"
          >
            <FaEdit className="w-3 h-3" />
          </button>
          <button
            onClick={() => handleSendCampaign(campaign._id, campaign.name)}
            disabled={sending}
            className="px-2 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            title="Send Campaign"
          >
            <FaPaperPlane className="w-3 h-3" />
          </button>
        </>
      )}

      <button
        onClick={() => handleDeleteCampaign(campaign._id, campaign.name)}
        disabled={deleting}
        className="px-2 py-2 bg-white hover:bg-red-50 border border-gray-300 hover:border-red-300 text-red-600 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-xs"
        title="Delete Campaign"
      >
        <FaTrash className="w-3 h-3" />
      </button>
    </div>
  );

  // Modern Grid Card Component
  const CampaignCard = ({ campaign }) => (
    <div className="group bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Simple colored top border */}
      <div className="h-1 bg-blue-500"></div>

      <div className="p-4 sm:p-6">
        {/* Top Section */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
            {getTypeIcon(campaign.type)}
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2">
            <span
              className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs flex items-center font-medium border ${getStatusBadge(
                campaign.status
              )}`}
            >
              {getStatusIcon(campaign.status)}
              <span className="capitalize ml-1 sm:ml-1.5 hidden xs:inline">
                {campaign.status || "draft"}
              </span>
            </span>
            <span
              className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium border ${getTypeBadge(
                campaign.type
              )}`}
            >
              <span className="capitalize hidden xs:inline">{campaign.type || "custom"}</span>
              <span className="capitalize xs:hidden text-xs">{campaign.type?.substring(0, 3) || "cus"}</span>
            </span>
          </div>
        </div>

        {/* Campaign Info */}
        <div className="mb-3 sm:mb-4">
          <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1 sm:mb-2 line-clamp-2 break-words">
            {campaign.name || "Unnamed Campaign"}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 flex items-start gap-1 sm:gap-2">
            <FaEnvelope className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0 text-gray-400" />
            <span className="break-words">{campaign.subject || "No subject"}</span>
          </p>
        </div>

        {/* Schedule Info */}
        {campaign.status === "scheduled" && campaign.schedule?.date && (
          <div className="mb-3 sm:mb-4 px-3 py-2 sm:px-4 sm:py-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-yellow-800">
              <FaCalendarAlt className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="font-medium">Scheduled:</span>
              <span className="text-xs">{formatDate(campaign.schedule.date)}</span>
            </div>
          </div>
        )}

        {/* Stats for Sent Campaigns */}
        {campaign.status === "sent" && campaign.stats && (
          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="text-xs sm:text-sm font-medium text-green-900 flex items-center gap-1 sm:gap-2">
                <FaChartLine className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Delivery Rate</span>
                <span className="xs:hidden">Rate</span>
              </span>
              <span className="text-lg sm:text-xl font-bold text-green-700">
                {getStatsPercentage(campaign)}%
              </span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-1.5 sm:h-2 mb-1 sm:mb-2">
              <div
                className="bg-green-600 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                style={{ width: `${getStatsPercentage(campaign)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-green-700">
              <span className="font-medium text-xs">
                {campaign.stats.successCount || 0} sent
              </span>
              <span className="text-xs">{campaign.stats.totalSubscribers || 0} total</span>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="mb-3 sm:mb-4 px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span className="flex items-center gap-1 sm:gap-1.5">
              <FaClock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">Created</span>
              <span className="xs:hidden">Created</span>
            </span>
            <span className="font-medium text-gray-900 text-xs">
              {formatDate(campaign.createdAt)}
            </span>
          </div>
          {campaign.updatedAt !== campaign.createdAt && (
            <div className="flex items-center justify-between text-xs text-gray-600 mt-1 sm:mt-2 pt-1 sm:pt-2 border-t border-gray-200">
              <span className="flex items-center gap-1 sm:gap-1.5">
                <HiSparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">Updated</span>
                <span className="xs:hidden">Updated</span>
              </span>
              <span className="font-medium text-gray-900 text-xs">
                {formatDate(campaign.updatedAt)}
              </span>
            </div>
          )}
        </div>

        {/* Actions - Different layout for mobile */}
        {isMobile ? (
          <MobileActionButtons campaign={campaign} />
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewCampaign(campaign._id)}
              className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2 text-sm"
              title="View Campaign"
            >
              <FaEye className="w-3 h-3 sm:w-4 sm:h-4" />
              View
            </button>

            {(campaign.status === "draft" || campaign.status === "scheduled") && (
              <>
                <button
                  onClick={() => handleEditCampaign(campaign._id)}
                  className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center text-sm"
                  title="Edit Campaign"
                >
                  <FaEdit className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => handleSendCampaign(campaign._id, campaign.name)}
                  disabled={sending}
                  className="px-3 py-2 sm:px-4 sm:py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  title="Send Campaign"
                >
                  <FaPaperPlane className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </>
            )}

            <button
              onClick={() => handleDeleteCampaign(campaign._id, campaign.name)}
              disabled={deleting}
              className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white hover:bg-red-50 border border-gray-300 hover:border-red-300 text-red-600 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              title="Delete Campaign"
            >
              <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Mobile Filter Menu
  const MobileFilterMenu = () => (
    <div className={`bg-white p-4 rounded-xl shadow-lg border border-gray-200 mb-4 transition-all duration-300 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
      <div className="space-y-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-medium text-sm"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="sent">Sent</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-medium text-sm"
        >
          <option value="all">All Types</option>
          <option value="deal">Deal</option>
          <option value="announcement">Announcement</option>
          <option value="offer">Offer</option>
          <option value="newsletter">Newsletter</option>
          <option value="custom">Custom</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-medium text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Name A-Z</option>
          <option value="status">Status</option>
        </select>

        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex-1 p-2 rounded-md transition-all text-sm ${
              viewMode === "grid"
                ? "bg-white shadow-sm text-blue-600"
                : "text-gray-600"
            }`}
          >
            <FaTh className="inline mr-1" />
            Grid
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex-1 p-2 rounded-md transition-all text-sm ${
              viewMode === "list"
                ? "bg-white shadow-sm text-blue-600"
                : "text-gray-600"
            }`}
          >
            <FaList className="inline mr-1" />
            List
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 lg:p-4 bg-blue-600 rounded-lg sm:rounded-xl shadow-sm">
                <FaRocket className="text-xl sm:text-2xl lg:text-3xl text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 break-words">
                  Campaigns & Newsletters
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base break-words">
                  Manage your email campaigns and newsletters
                </p>
              </div>
            </div>

            <Link
              to="/campaign/add"
              className="inline-flex items-center gap-2 sm:gap-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl transition-colors duration-200 shadow-sm font-semibold text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <FaPlus className="text-sm sm:text-lg" />
              <span>New Campaign</span>
            </Link>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {[
            {
              icon: HiTemplate,
              label: "Total",
              count: campaigns.length,
              color: "blue",
            },
            {
              icon: FaCheckCircle,
              label: "Sent",
              count: campaigns.filter((c) => c.status === "sent").length,
              color: "green",
            },
            {
              icon: FaClock,
              label: "Scheduled",
              count: campaigns.filter((c) => c.status === "scheduled").length,
              color: "yellow",
            },
            {
              icon: FaEdit,
              label: "Drafts",
              count: campaigns.filter((c) => c.status === "draft").length,
              color: "gray",
            },
            {
              icon: MdPending,
              label: "Pending",
              count: campaigns.filter((c) => c.status === "pending_approval").length,
              color: "orange",
            },
          ].map((stat, index) => {
            const colorClasses = {
              blue: "bg-blue-50 border-blue-100",
              green: "bg-green-50 border-green-100",
              yellow: "bg-yellow-50 border-yellow-100",
              gray: "bg-gray-50 border-gray-100",
              orange: "bg-amber-50 border-orange-100"
            };
            const iconColors = {
              blue: "text-blue-600",
              green: "text-green-600",
              yellow: "text-yellow-600",
              gray: "text-gray-600",
              orange: "text-orange-600"
            };

            return (
              <div
                key={index}
                className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                  <div
                    className={`p-2 sm:p-3 rounded-lg border ${
                      colorClasses[stat.color]
                    }`}
                  >
                    <stat.icon
                      className={`text-lg sm:text-xl lg:text-2xl ${iconColors[stat.color]}`}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">
                      {stat.label}
                    </p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                      {stat.count}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 mb-6 sm:mb-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filters & Search</h3>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {isMobileMenuOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-medium text-sm"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="sent">Sent</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-medium text-sm"
              >
                <option value="all">All Types</option>
                <option value="deal">Deal</option>
                <option value="announcement">Announcement</option>
                <option value="offer">Offer</option>
                <option value="newsletter">Newsletter</option>
                <option value="custom">Custom</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-medium text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
                <option value="status">Status</option>
              </select>

              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all text-sm ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  <FaTh size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all text-sm ${
                    viewMode === "list"
                      ? "bg-white shadow-sm text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  <FaList size={16} />
                </button>
              </div>

              <button
                onClick={() => fetchCampaigns()}
                disabled={isLoading}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                <FaSync className={isLoading ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => fetchCampaigns()}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                <FaSync className={isLoading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>

          {/* Mobile Filter Menu */}
          <MobileFilterMenu />
        </div>

        {/* Campaigns Grid */}
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 sm:p-16 lg:p-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-base sm:text-lg font-medium">
              Loading campaigns...
            </p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 lg:p-16 xl:p-20 text-center">
            <HiTemplate className="text-6xl sm:text-7xl lg:text-8xl text-gray-300 mx-auto mb-4 sm:mb-6" />
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
              {campaigns.length === 0
                ? "No campaigns yet"
                : "No campaigns found"}
            </h3>
            <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
              {campaigns.length === 0
                ? "Get started by creating your first campaign to engage with your audience."
                : "Try adjusting your search or filters."}
            </p>
            {campaigns.length === 0 && (
              <Link
                to="/campaign/add"
                className="inline-flex items-center gap-2 sm:gap-3 bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm font-semibold text-sm sm:text-base"
              >
                <FaPlus />
                Create Your First Campaign
              </Link>
            )}
          </div>
        ) : (
          <div className={`gap-4 sm:gap-6 ${
            viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" 
              : "space-y-4 sm:space-y-6"
          }`}>
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign._id} campaign={campaign} />
            ))}
          </div>
        )}

        {/* Results Count */}
        {filteredCampaigns.length > 0 && (
          <div className="mt-6 sm:mt-8 bg-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm">
              <span className="text-gray-600 mb-2 sm:mb-0 text-center sm:text-left">
                Showing{" "}
                <strong className="text-gray-900">
                  {filteredCampaigns.length}
                </strong>{" "}
                of <strong className="text-gray-900">{campaigns.length}</strong>{" "}
                campaigns
                {searchTerm && (
                  <span>
                    {" "}
                    matching "
                    <strong className="text-blue-600">{searchTerm}</strong>"
                  </span>
                )}
              </span>
              <span className="text-gray-500 text-center sm:text-right">
                View:{" "}
                <strong className="capitalize text-gray-700">{viewMode}</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      <ViewCampaignModal
        campaign={selectedCampaign}
        isOpen={viewModalOpen}
        onClose={handleCloseModals}
        onEdit={handleEditFromView}
      />
    </div>
  );
};

export default CampaignsListPage;