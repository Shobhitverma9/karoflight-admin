// components/Campaigns/EditCampaignPage.jsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  updateCampaign,
  getCampaignById,
  clearError,
  clearSuccess,
} from "../../../features/slices/campaignSlice";
import TipTapEditor from "../../TextEditor/TipTapEditor";
import {
  FaArrowLeft,
  FaRocket,
  FaCalendarAlt,
  FaGlobeAmericas,
  FaTag,
  FaEdit,
  FaEnvelope,
  FaCheckCircle,
  FaClock,
  FaSave,
  FaHome,
  FaPaperPlane,
} from "react-icons/fa";
import {
  HiTemplate,
  HiMail,
  HiCalendar,
  HiLocationMarker,
} from "react-icons/hi";
import Swal from "sweetalert2";

// Utility function to decode JWT token
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Utility function to get user role from token
const getUserRole = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) return null;
  
  const decoded = decodeToken(token);
  return decoded?.role || null;
};

const EditCampaignPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  // Get user role
  const [userRole, setUserRole] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
  }, []);

  // Determine the back route based on role
  const getBackRoute = () => {
    if (userRole === 'seo') {
      return '/campaign';
    } else if (userRole === 'superadmin') {
      return '/campaign-content-management';
    }
    // Default fallback
    return '/campaign';
  };

  const backRoute = getBackRoute();

  const campaignsState = useSelector(
    (state) =>
      state.campaigns ||
      state.campaign ||
      state.newsletter || {
        currentCampaign: null,
        updating: false,
        error: null,
        success: false,
      }
  );

  const updating = campaignsState?.updating || false;
  const error = campaignsState?.error;
  const success = campaignsState?.success;
  const currentCampaign = campaignsState?.currentCampaign;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm();

  const [attachments, setAttachments] = useState([]);
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  const watchType = watch("type");
  const watchStatus = watch("status");

  // Fetch campaign data when component mounts
  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;

      try {
        console.log(`🔄 Fetching campaign:`, id);
        setLoading(true);
        setDataLoaded(false);

        const result = await dispatch(getCampaignById(id)).unwrap();

        console.log("✅ Campaign data received:", result);
        setDataLoaded(true);
      } catch (error) {
        console.error(`❌ Fetch failed:`, error);
        setLoading(false);
        setDataLoaded(false);

        let errorMessage = "Failed to load campaign data";

        if (error?.status === 404 || error?.includes("not found")) {
          errorMessage = "Campaign not found.";
        } else if (error?.status === 401 || error?.includes("Authorization")) {
          errorMessage = "Authentication required. Please log in again.";
        } else if (
          error?.code === "ERR_NETWORK" ||
          error?.includes("Network")
        ) {
          errorMessage =
            "Network error. Please check your internet connection.";
        }

        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
          confirmButtonColor: "#3b82f6",
        }).then(() => {
          navigate(backRoute);
        });
      }
    };

    fetchCampaign();
  }, [id, dispatch, navigate, backRoute]);

  // Initialize form when campaign data is loaded
  useEffect(() => {
    if (currentCampaign && currentCampaign._id === id && dataLoaded) {
      console.log("🎯 Initializing form with campaign data:", currentCampaign);

      reset({
        name: currentCampaign.name || "",
        type: currentCampaign.type || "custom",
        subject: currentCampaign.subject || "",
        status: currentCampaign.status || "draft",
        "target.region": currentCampaign.target?.region || "",
        scheduleDate: currentCampaign.scheduleDate?.date
          ? new Date(currentCampaign.scheduleDate.date)
              .toISOString()
              .slice(0, 16)
          : "",
      });

      setAttachments(currentCampaign.attachments || []);

      const campaignMessage = currentCampaign.message || "";
      console.log("📝 Setting editor content length:", campaignMessage.length);

      setTimeout(() => {
        setHtmlContent(campaignMessage);
        setEditorKey((prev) => prev + 1);
        console.log("✅ Editor content and key updated");
      }, 0);

      console.log("✅ Form initialized, setting loading to false");
      setLoading(false);
    }
  }, [currentCampaign, id, reset, dataLoaded]);

  // Handle success states
  useEffect(() => {
    if (success) {
      Swal.fire({
        icon: "success",
        title: "Campaign Updated!",
        text: "Your campaign has been updated successfully.",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      }).then(() => {
        navigate(backRoute);
      });
    }
  }, [success, navigate, backRoute]);

  // Handle error states
  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error,
        confirmButtonColor: "#3b82f6",
      });
    }
  }, [error]);

  // Clear messages when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  // Handle editor content change
  const handleEditorChange = (content) => {
    setHtmlContent(content);
  };

  // Form submission
  const onSubmitForm = async (data) => {
    try {
      // Validate HTML content
      if (
        !htmlContent ||
        htmlContent.trim() === "<p></p>" ||
        htmlContent.trim() === ""
      ) {
        Swal.fire({
          icon: "warning",
          title: "Missing Content",
          text: "Please add message content before submitting.",
          confirmButtonColor: "#3b82f6",
        });
        return;
      }

      // Build form data matching backend structure
      const formData = {
        name: data.name,
        type: data.type,
        subject: data.subject,
        message: htmlContent,
        status: data.status,
        attachments,
      };

      // Add target region if provided
      if (data["target.region"]) {
        formData.target = {
          region: data["target.region"],
        };
      }

      // Add schedule date if status is scheduled
      if (data.status === "scheduled" && data.scheduleDate) {
        formData.scheduleDate = {
          date: new Date(data.scheduleDate).toISOString(),
          isSent: false,
        };
      }

      console.log("Updating campaign with data:", formData);

      // Show loading state
      Swal.fire({
        title: "Updating Campaign...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await dispatch(updateCampaign({ id: id, updateData: formData })).unwrap();

      Swal.close();
    } catch (error) {
      console.error("Form submission error:", error);

      let errorMessage = "An unexpected error occurred. Please try again.";

      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: errorMessage,
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  // Get minimum datetime for scheduling
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case "deal":
        return <FaTag className="text-green-500 text-sm sm:text-base" />;
      case "announcement":
        return <HiMail className="text-blue-500 text-sm sm:text-base" />;
      case "offer":
        return <FaRocket className="text-purple-500 text-sm sm:text-base" />;
      case "newsletter":
        return <HiTemplate className="text-orange-500 text-sm sm:text-base" />;
      default:
        return <FaEdit className="text-gray-500 text-sm sm:text-base" />;
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "draft":
        return <FaEdit className="text-gray-500 text-sm sm:text-base" />;
      case "scheduled":
        return <FaClock className="text-yellow-500 text-sm sm:text-base" />;
      case "sent":
        return <FaCheckCircle className="text-green-500 text-sm sm:text-base" />;
      default:
        return <FaEdit className="text-gray-500 text-sm sm:text-base" />;
    }
  };

  // Responsive Action Buttons Component
  const ActionButtons = () => (
    <div className="flex flex-col xs:flex-row gap-3 pt-6 border-t border-gray-200">
      <Link
        to={backRoute}
        className="px-4 sm:px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base order-2 xs:order-1"
      >
        <FaArrowLeft className="text-sm sm:text-base" />
        <span>Cancel</span>
      </Link>
      
      <div className="flex flex-col sm:flex-row gap-3 flex-1 order-1 xs:order-2">
        {/* Save as Draft button - shown for both roles */}
        <button
          type="button"
          onClick={() => {
            setValue("status", "draft");
            handleSubmit(onSubmitForm)();
          }}
          disabled={updating || currentCampaign.status === "sent"}
          className="px-4 sm:px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex-1"
        >
          <FaSave className="text-sm sm:text-base" />
          <span>Save as Draft</span>
        </button>

        {/* Conditional main action button based on role */}
        {userRole === 'seo' ? (
          // SEO: Send for Approval button
          <button
            type="submit"
            disabled={updating || currentCampaign.status === "sent"}
            className="px-4 sm:px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex-1"
          >
            {updating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span className="text-sm sm:text-base">Sending...</span>
              </>
            ) : (
              <>
                <FaPaperPlane className="text-sm sm:text-base" />
                <span>Send for Approval</span>
              </>
            )}
          </button>
        ) : userRole === 'superadmin' ? (
          // Super Admin: Send Campaign button
          <button
            type="submit"
            disabled={updating || currentCampaign.status === "sent"}
            className="px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex-1"
          >
            {updating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span className="text-sm sm:text-base">Sending...</span>
              </>
            ) : (
              <>
                <FaRocket className="text-sm sm:text-base" />
                <span>Send Campaign</span>
              </>
            )}
          </button>
        ) : (
          // Default: Update Campaign button
          <button
            type="submit"
            disabled={updating || currentCampaign.status === "sent"}
            className="px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex-1"
          >
            {updating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span className="text-sm sm:text-base">Updating...</span>
              </>
            ) : (
              <>
                <FaRocket className="text-sm sm:text-base" />
                <span>Update Campaign</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading campaign data...</p>
        </div>
      </div>
    );
  }

  // Show not found only if we're not loading AND no current campaign
  if (!loading && !currentCampaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-sm p-6 sm:p-8 max-w-md w-full">
          <HiTemplate className="text-4xl sm:text-6xl text-gray-300 mx-auto mb-3 sm:mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Campaign Not Found
          </h2>
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
            The campaign you're looking for doesn't exist.
          </p>
          <Link
            to={backRoute}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base justify-center"
          >
            <FaHome className="text-sm sm:text-base" />
            <span>Back to Campaigns</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                to={backRoute}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <FaArrowLeft className="text-lg sm:text-xl text-gray-600" />
              </Link>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
                  Edit Campaign
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base break-words">
                  Update campaign details and content
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg self-start sm:self-auto">
              <span>Editing:</span>
              <span className="font-medium text-gray-700 truncate max-w-[150px] sm:max-w-none">
                {currentCampaign.name}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit(onSubmitForm)} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Campaign Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <HiTemplate className="text-blue-500 text-sm sm:text-base" />
                <span>Campaign Name *</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register("name", {
                    required: "Campaign name is required",
                  })}
                  className="w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter campaign name"
                />
                <FaEdit className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Campaign Type */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FaTag className="text-green-500 text-sm sm:text-base" />
                <span>Campaign Type *</span>
              </label>
              <div className="relative">
                <select
                  {...register("type", { required: "Type is required" })}
                  className="w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-sm sm:text-base bg-white"
                >
                  <option value="deal">Deal</option>
                  <option value="announcement">Announcement</option>
                  <option value="offer">Offer</option>
                  <option value="newsletter">Newsletter</option>
                  <option value="custom">Custom</option>
                </select>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  {getTypeIcon(watchType)}
                </div>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <HiMail className="text-purple-500 text-sm sm:text-base" />
                <span>Subject *</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register("subject", { required: "Subject is required" })}
                  className="w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Email subject line"
                />
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
              </div>
              {errors.subject && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">
                  {errors.subject.message}
                </p>
              )}
            </div>

            {/* Message Content */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FaEdit className="text-orange-500 text-sm sm:text-base" />
                <span>Message Content *</span>
              </label>
              {htmlContent && (
                <div className="mb-2 text-xs text-gray-500">
                  Content loaded: {htmlContent.length} characters
                </div>
              )}
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <TipTapEditor
                  key={`editor-${editorKey}`}
                  content={htmlContent}
                  onChange={handleEditorChange}
                  placeholder="Write your main content here..."
                />
              </div>
            </div>

            {/* Target Region */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FaGlobeAmericas className="text-teal-500 text-sm sm:text-base" />
                <span>Target Region</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register("target.region")}
                  className="w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="e.g., North America, Europe, Global"
                />
                <HiLocationMarker className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FaCheckCircle className="text-indigo-500 text-sm sm:text-base" />
                <span>Status *</span>
              </label>
              <div className="relative">
                <select
                  {...register("status", { required: "Status is required" })}
                  className="w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-sm sm:text-base bg-white"
                  disabled={currentCampaign.status === "sent"}
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  {currentCampaign.status === "sent" && (
                    <option value="sent">Sent</option>
                  )}
                </select>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  {getStatusIcon(watchStatus)}
                </div>
              </div>
              {currentCampaign.status === "sent" && (
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  Cannot change status of sent campaigns
                </p>
              )}
            </div>

            {/* Schedule Date */}
            {watchStatus === "scheduled" &&
              currentCampaign.status !== "sent" && (
                <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <label className="flex items-center gap-2 text-sm font-medium text-blue-700 mb-2">
                    <FaCalendarAlt className="text-blue-600 text-sm sm:text-base" />
                    <span>Schedule Date & Time *</span>
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      min={getMinDateTime()}
                      {...register("scheduleDate", {
                        required:
                          watchStatus === "scheduled"
                            ? "Schedule date is required for scheduled campaigns"
                            : false,
                      })}
                      className="w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm sm:text-base"
                    />
                    <HiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 text-sm sm:text-base" />
                  </div>
                  {errors.scheduleDate && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600">
                      {errors.scheduleDate.message}
                    </p>
                  )}
                  <p className="mt-2 text-xs sm:text-sm text-blue-600 flex items-center gap-1">
                    <FaClock className="text-blue-500 text-sm" />
                    <span>Campaign will be sent automatically at the scheduled date and time.</span>
                  </p>
                </div>
              )}

            {/* Footer - Conditional buttons based on role */}
            <ActionButtons />
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCampaignPage;