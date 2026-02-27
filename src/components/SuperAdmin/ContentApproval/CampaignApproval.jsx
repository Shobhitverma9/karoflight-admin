// CampaignApproval.jsx - Updated with Status-based Deletion Rules
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaSpinner,
  FaClock,
  FaUser,
  FaEnvelope,
  FaCalendar,
  FaEdit,
  FaTrash,
  FaPlus,
  FaPaperPlane,
} from "react-icons/fa";
import Swal from "sweetalert2";
import {
  getAllCampaigns,
  getPendingCampaigns,
  approveCampaign,
  rejectCampaign,
  deleteCampaign,
  sendCampaign,
  clearError,
  clearSuccess,
} from "../../../features/slices/campaignSlice";
import ViewCampaignModal from "./ViewCampaignModal";

// Utility function to decode JWT token
const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Utility function to get current user info from token
const getCurrentUser = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) return null;

  const decoded = decodeToken(token);
  return decoded || null;
};

export default function CampaignApproval() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get current user from token
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    console.log("Current User from Token:", user);
  }, []);

  const {
    campaigns = [],
    pendingCampaigns = [],
    loading = false,
    approving = false,
    rejecting = false,
    error = null,
    success = false,
    sending = false,
  } = useSelector((state) => {
    return state.campaigns || {};
  });

  const user = useSelector((state) => state.auth?.user || state.auth?.userData);

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [viewMode, setViewMode] = useState("all"); // "pending_approval" or "all"

  // Check if user is Super Admin
  useEffect(() => {
    if (user && user.role?.toLowerCase() !== "superadmin") {
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: "Only Super Admins can access campaign approvals",
        confirmButtonColor: "#3b82f6",
      }).then(() => {
        navigate("/login");
      });
    }
  }, [user, navigate]);

  // Fetch all campaigns and pending campaigns on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(getAllCampaigns()).unwrap();
        await dispatch(getPendingCampaigns()).unwrap();
      } catch (err) {
        console.error("Failed to fetch campaigns:", err);
      }
    };
    fetchData();
  }, [dispatch]);

  // Handle success/error notifications
  useEffect(() => {
    if (success) {
      dispatch(clearSuccess());
    }
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error,
        confirmButtonColor: "#3b82f6",
      });
      dispatch(clearError());
    }
  }, [success, error, dispatch]);

  const handleApprove = async (campaignId, campaignName) => {
    const result = await Swal.fire({
      title: "Approve Campaign?",
      html: `
        <p>Are you sure you want to approve this campaign?</p>
        <p class="font-semibold mt-2">"${campaignName}"</p>
        <p class="text-sm text-gray-600 mt-2">The campaign creator will be notified.</p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Approve",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(approveCampaign(campaignId)).unwrap();

        Swal.fire({
          icon: "success",
          title: "Approved!",
          text: "Campaign has been approved successfully",
          timer: 2000,
          showConfirmButton: false,
        });

        // Refresh the list based on current view mode
        if (viewMode === "pending_approval") {
          dispatch(getPendingCampaigns());
        } else {
          dispatch(getAllCampaigns());
        }
      } catch (err) {
        console.error("Approval error:", err);
      }
    }
  };

  const handleReject = async (campaignId, campaignName, campaignStatus) => {
    // Check if campaign is published or sent
    if (campaignStatus === "sent" || campaignStatus === "published") {
      Swal.fire({
        icon: "warning",
        title: "Cannot Reject",
        text: "Published or sent campaigns cannot be rejected",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    const { value: reason, isConfirmed } = await Swal.fire({
      title: "Reject Campaign",
      html: `
        <p class="mb-4">Why are you rejecting this campaign?</p>
        <p class="font-semibold mb-2">"${campaignName}"</p>
      `,
      input: "textarea",
      inputPlaceholder: "Enter rejection reason (required)...",
      inputAttributes: {
        "aria-label": "Enter rejection reason",
        rows: 4,
      },
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Reject Campaign",
      cancelButtonText: "Cancel",
      inputValidator: (value) => {
        if (!value || value.trim() === "") {
          return "Rejection reason is required!";
        }
        if (value.trim().length < 10) {
          return "Please provide a more detailed reason (at least 10 characters)";
        }
      },
    });

    if (isConfirmed && reason) {
      try {
        await dispatch(
          rejectCampaign({ campaignId, reason: reason.trim() })
        ).unwrap();

        Swal.fire({
          icon: "success",
          title: "Rejected",
          text: "Campaign has been rejected. Creator will be notified.",
          timer: 2000,
          showConfirmButton: false,
        });

        // Refresh the list based on current view mode
        if (viewMode === "pending_approval") {
          dispatch(getPendingCampaigns());
        } else {
          dispatch(getAllCampaigns());
        }
      } catch (err) {
        console.error("Rejection error:", err);
      }
    }
  };

  const handleEdit = (campaignId) => {
    navigate(`/campaign/${campaignId}/edit`);
  };

  const handleDelete = async (campaignId, campaignName, campaignStatus) => {
    // Check if user is SuperAdmin or SEO
    const userRole = user?.role?.toLowerCase();

    if (userRole !== "superadmin" && userRole !== "seo") {
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: "Only Super Admins and SEO can delete campaigns",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    // Check if campaign is sent or published - these CANNOT be deleted
    if (campaignStatus === "sent" || campaignStatus === "published") {
      Swal.fire({
        icon: "error",
        title: "Cannot Delete",
        text: "Campaigns with 'sent' or 'published' status cannot be deleted.",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    // Allow deletion for all other statuses (draft, pending_approval, approved, rejected, scheduled)
    // Customize message based on status
    const isDraft = campaignStatus === "draft";
    
    const result = await Swal.fire({
      title: "Delete Campaign?",
      html: `
        <p>Are you sure you want to delete this campaign?</p>
        <p class="font-semibold mt-2 text-red-600">"${campaignName}"</p>
        ${!isDraft ? '<p class="text-sm text-gray-600 mt-2">This action cannot be undone!</p>' : ''}
      `,
      icon: isDraft ? "question" : "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setDeleting(true);

      try {
        await dispatch(deleteCampaign(campaignId)).unwrap();

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Campaign has been deleted successfully",
          timer: 2000,
          showConfirmButton: false,
        });

        // Refresh the list based on current view mode
        if (viewMode === "pending_approval") {
          await dispatch(getPendingCampaigns()).unwrap();
        } else {
          await dispatch(getAllCampaigns()).unwrap();
        }
      } catch (err) {
        console.error("Deletion error:", err);
        Swal.fire({
          icon: "error",
          title: "Delete Failed",
          text: err.message || "Failed to delete campaign. Please try again.",
          confirmButtonColor: "#3b82f6",
        });
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleSend = async (campaignId, campaignName) => {
    const result = await Swal.fire({
      title: "Send Campaign?",
      html: `
        <p>Are you sure you want to send this campaign now?</p>
        <p class="font-semibold mt-2">"${campaignName}"</p>
        <p class="text-sm text-gray-600 mt-2">The campaign will be sent immediately to all recipients.</p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Send Now",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        // Show loading state
        Swal.fire({
          title: "Sending Campaign...",
          text: "Please wait while the campaign is being sent.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        // Dispatch sendCampaign action
        await dispatch(sendCampaign(campaignId)).unwrap();

        Swal.fire({
          icon: "success",
          title: "Campaign Sent!",
          text: "Campaign has been sent successfully",
          timer: 2000,
          showConfirmButton: false,
        });

        // Refresh the list based on current view mode
        if (viewMode === "pending_approval") {
          dispatch(getPendingCampaigns());
        } else {
          dispatch(getAllCampaigns());
        }
      } catch (err) {
        console.error("Send error:", err);

        let errorMessage = "Failed to send campaign. Please try again.";
        if (err.message) {
          errorMessage = err.message;
        } else if (typeof err === "string") {
          errorMessage = err;
        }

        Swal.fire({
          icon: "error",
          title: "Send Failed",
          text: errorMessage,
          confirmButtonColor: "#3b82f6",
        });
      }
    }
  };

  const handleCreateNew = () => {
    navigate("/campaign/add");
  };

  const handlePreview = (campaign) => {
    setSelectedCampaign(campaign);
    setShowPreviewModal(true);
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setSelectedCampaign(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending_approval: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      draft: "bg-gray-100 text-gray-800",
      scheduled: "bg-blue-100 text-blue-800",
      sent: "bg-purple-100 text-purple-800",
      published: "bg-indigo-100 text-indigo-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if campaign is sent or published
  const isSentCampaign = (status) => {
    return status === "sent" || status === "published";
  };

  // Super admin can send any campaign that's not already sent
  const canSend = (status) => {
    return status !== "sent" && status !== "published";
  };

  const canReject = (status) => {
    return status !== "sent" && status !== "published";
  };

  // Check if campaign can be deleted (NOT sent or published)
  const canDelete = (status) => {
    return status !== "sent" && status !== "published";
  };

  // Helper function to get creator info - prioritize campaign data, fallback to token
  const getCreatorInfo = (campaign) => {
    // First, try to get from campaign.createdBy
    if (campaign.createdBy) {
      return {
        username:
          campaign.createdBy.username || campaign.createdBy.name || "Unknown",
        email: campaign.createdBy.email || "N/A",
        id: campaign.createdBy._id || campaign.createdBy.id,
      };
    }

    // If no createdBy in campaign, check if current user created it
    if (currentUser && campaign.createdBy === currentUser.id) {
      return {
        username: currentUser.username || currentUser.name || "You",
        email: currentUser.email || "N/A",
        id: currentUser.id,
      };
    }

    // Fallback
    return {
      username: "Unknown",
      email: "N/A",
      id: null,
    };
  };

  // Get the display list based on view mode
  const displayCampaigns =
    viewMode === "pending_approval" ? pendingCampaigns : campaigns;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin w-8 h-8 text-blue-600 mr-3" />
        <span className="text-xl text-gray-600">Loading campaigns...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Campaign Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Review and manage all campaigns
            </p>
          </div>
          <div className="flex flex-col xs:flex-row items-center gap-3">
            {/* View Mode Toggle */}
            <div className="bg-gray-100 p-1 rounded-lg flex w-full xs:w-auto">
              <button
                onClick={() => setViewMode("pending_approval")}
                className={`px-3 sm:px-4 py-2 rounded-md transition-colors text-xs sm:text-sm ${
                  viewMode === "pending_approval"
                    ? "bg-white text-blue-600 shadow-sm font-semibold"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Pending ({pendingCampaigns.length})
              </button>
              <button
                onClick={() => setViewMode("all")}
                className={`px-3 sm:px-4 py-2 rounded-md transition-colors text-xs sm:text-sm ${
                  viewMode === "all"
                    ? "bg-white text-blue-600 shadow-sm font-semibold"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All ({campaigns.length})
              </button>
            </div>
            <button
              onClick={handleCreateNew}
              className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full xs:w-auto text-sm sm:text-base"
            >
              <FaPlus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Create Campaign</span>
            </button>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      {displayCampaigns.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 md:p-12 text-center">
          <FaCheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
            {viewMode === "pending_approval"
              ? "No Pending Campaigns"
              : "No Campaigns Found"}
          </h3>
          <p className="text-gray-500 mb-4 text-sm sm:text-base">
            {viewMode === "pending_approval"
              ? "All campaigns have been reviewed. Check back later!"
              : "No campaigns have been created yet."}
          </p>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            <FaPlus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Create New Campaign</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {displayCampaigns.map((campaign) => {
            const isSent = isSentCampaign(campaign.status);
            const creatorInfo = getCreatorInfo(campaign);

            return (
              <div
                key={campaign._id}
                className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 break-words">
                          {campaign.name}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                              campaign.status
                            )}`}
                          >
                            {campaign.status.replace("_", " ").toUpperCase()}
                          </span>
                          <span className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                            {campaign.type.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                        <strong>Subject:</strong> {campaign.subject}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div className="flex items-center text-gray-600">
                          <FaUser className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-500 flex-shrink-0" />
                          <span className="truncate">
                            <strong className="hidden xs:inline">Created by: </strong>
                            {creatorInfo.username}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FaEnvelope className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-green-500 flex-shrink-0" />
                          <span className="truncate">
                            <strong className="hidden xs:inline">Email: </strong>
                            {creatorInfo.email}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FaCalendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-orange-500 flex-shrink-0" />
                          <span className="truncate">
                            <strong className="hidden xs:inline">Submitted: </strong>
                            {formatDate(campaign.createdAt)}
                          </span>
                        </div>
                      </div>

                      {campaign.target?.region && (
                        <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600">
                          <strong>Target Region:</strong>{" "}
                          {campaign.target.region}
                        </div>
                      )}

                      {campaign.rejectionReason && (
                        <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs sm:text-sm font-semibold text-red-800 mb-1">
                            Rejection Reason:
                          </p>
                          <p className="text-xs sm:text-sm text-red-700">
                            {campaign.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Conditional Action Buttons based on campaign status */}
                    <div className="flex flex-col space-y-2 w-full lg:w-auto lg:min-w-[200px]">
                      {isSent ? (
                        // If campaign is sent/published - only show View (NO delete button)
                        <>
                          <button
                            onClick={() => handlePreview(campaign)}
                            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                          >
                            <FaEye className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>View</span>
                          </button>
                          <div className="px-3 sm:px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xs text-red-600 flex items-center justify-center gap-1">
                              <FaTrash className="w-3 h-3" />
                              <span className="hidden xs:inline">Cannot delete sent campaigns</span>
                              <span className="xs:hidden">No Delete</span>
                            </p>
                          </div>
                        </>
                      ) : (
                        // If campaign is NOT sent - show all action buttons
                        <>
                          <button
                            onClick={() => handlePreview(campaign)}
                            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                          >
                            <FaEye className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Preview</span>
                          </button>
                          <button
                            onClick={() => handleEdit(campaign._id)}
                            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs sm:text-sm"
                          >
                            <FaEdit className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Edit</span>
                          </button>

                          {/* Super Admin can send any campaign directly without approval */}
                          {canSend(campaign.status) && (
                            <button
                              onClick={() =>
                                handleSend(campaign._id, campaign.name)
                              }
                              disabled={sending}
                              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium"
                            >
                              <FaPaperPlane className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{sending ? "Sending..." : "Send Now"}</span>
                            </button>
                          )}

                          <button
                            onClick={() =>
                              handleReject(
                                campaign._id,
                                campaign.name,
                                campaign.status
                              )
                            }
                            disabled={rejecting || !canReject(campaign.status)}
                            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                            title={
                              !canReject(campaign.status)
                                ? "Published campaigns cannot be rejected"
                                : ""
                            }
                          >
                            <FaTimesCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{rejecting ? "Rejecting..." : "Reject"}</span>
                          </button>
                          
                          {/* Delete button - only enabled if campaign can be deleted */}
                          <button
                            onClick={() =>
                              handleDelete(
                                campaign._id,
                                campaign.name,
                                campaign.status
                              )
                            }
                            disabled={deleting || !canDelete(campaign.status)}
                            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                            title={
                              !canDelete(campaign.status)
                                ? "Sent or published campaigns cannot be deleted"
                                : ""
                            }
                          >
                            <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{deleting ? "Deleting..." : "Delete"}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedCampaign && (
        <ViewCampaignModal
          campaign={selectedCampaign}
          onClose={closePreviewModal}
          onEdit={
            !isSentCampaign(selectedCampaign.status)
              ? () => {
                  closePreviewModal();
                  handleEdit(selectedCampaign._id);
                }
              : null
          }
          onSend={
            canSend(selectedCampaign.status)
              ? () => {
                  closePreviewModal();
                  handleSend(selectedCampaign._id, selectedCampaign.name);
                }
              : null
          }
          onReject={
            canReject(selectedCampaign.status)
              ? () => {
                  closePreviewModal();
                  handleReject(
                    selectedCampaign._id,
                    selectedCampaign.name,
                    selectedCampaign.status
                  );
                }
              : null
          }
          sending={sending}
          rejecting={rejecting}
        />
      )}
    </div>
  );
}