// components/CampaignForm.js
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  createCampaign,
  updateCampaign,
  sendCampaign,
  clearError,
  clearSuccess,
} from "../../../features/slices/campaignSlice";
import TipTapEditor from "../../TextEditor/TipTapEditor";
import {
  FaRocket,
  FaSave,
  FaCalendarAlt,
  FaPaperclip,
  FaGlobeAmericas,
  FaTag,
  FaEdit,
  FaEnvelope,
  FaTrash,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaArrowLeft,
  FaPaperPlane
} from "react-icons/fa";
import {
  HiTemplate,
  HiMail,
  HiCalendar,
  HiLocationMarker,
  HiCloudUpload,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { decodeTokenPayload } from "../../../utils/authHelper";

const API_BASE_URL = import.meta.env.VITE_RENDER_API_BASE_URL;

// Get auth token from localStorage or sessionStorage
const getAuthToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || sessionStorage.getItem("authToken");
};

// Get current user info from token
const getCurrentUser = () => {
  const token = getAuthToken();
  if (!token) return null;
  
  const decoded = decodeTokenPayload(token);
  return decoded || null;
};

// Create axios instance with auth
const createAxiosInstance = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
};

const CampaignForm = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const campaignsState = useSelector((state) => state.campaigns);
  const creating = campaignsState?.creating || false;
  const sending = campaignsState?.sending || false;
  const error = campaignsState?.error;
  const success = campaignsState?.success;

  // Get current user from token
  const [currentUser, setCurrentUser] = useState(null);
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
    const user = getCurrentUser();
    setCurrentUser(user);
    setUserRole(user?.role?.toLowerCase());
    console.log("Current User from Token:", user);
    console.log("User Role:", user?.role);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      type: "custom",
      subject: "",
      status: "draft",
      target: { region: "" },
      scheduleDate: "",
    },
  });

  const [attachments, setAttachments] = useState([]);
  const [htmlContent, setHtmlContent] = useState("");

  const watchType = watch("type");
  const watchStatus = watch("status");

  // Handle success states with SweetAlert and role-based navigation
  useEffect(() => {
    if (success) {
      const isSentStatus = watchStatus === 'sent';
      
      let title, text;
      
      if (userRole === 'seo') {
        title = 'Campaign Sent for Approval!';
        text = 'Your campaign has been sent for approval to the admin.';
      } else if (userRole === 'superadmin') {
        if (isSentStatus) {
          title = 'Campaign Sent Successfully!';
          text = 'Your campaign has been sent to all subscribers.';
        } else {
          title = 'Campaign Created!';
          text = 'Your campaign has been created successfully.';
        }
      } else {
        title = 'Campaign Created!';
        text = 'Your campaign has been created successfully.';
      }
      
      Swal.fire({
        icon: "success",
        title: title,
        text: text,
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      }).then(() => {
        // Role-based navigation
        if (userRole === 'seo') {
          navigate("/campaign");
        } else if (userRole === 'superadmin') {
          navigate("/campaign-content-management");
        } else {
          navigate("/campaign");
        }
        
        if (onSuccess) onSuccess();
        
        // Reset form after success
        reset();
        setAttachments([]);
        setHtmlContent("");
        
        // Clear success state
        dispatch(clearSuccess());
      });
    }
  }, [success, onSuccess, reset, userRole, navigate, watchStatus, dispatch]);

  // Handle error states with SweetAlert
  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Operation Failed",
        text: error,
        confirmButtonColor: "#3b82f6",
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Clear messages when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  // Handle return back based on role
  const handleReturnBack = () => {
    if (userRole === 'seo') {
      navigate("/campaign");
    } else if (userRole === 'superadmin') {
      navigate("/campaign-content-management");
    } else {
      navigate("/campaign");
    }
  };

  // Handle editor content change
  const handleEditorChange = (content) => {
    setHtmlContent(content);
  };

  // Form submission with proper error handling
  const onSubmitForm = async (data, isSendForApproval = false) => {
    try {
      // Check if token exists
      const token = getAuthToken();
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Authentication Required",
          text: "Please log in to create campaigns.",
          confirmButtonColor: "#3b82f6",
        });
        return;
      }

      // Check if user info is available
      if (!currentUser) {
        Swal.fire({
          icon: "error",
          title: "User Information Missing",
          text: "Unable to retrieve user information. Please log in again.",
          confirmButtonColor: "#3b82f6",
        });
        return;
      }

      // Validate HTML content
      if (!htmlContent || htmlContent.trim() === "<p></p>" || htmlContent.trim() === "") {
        Swal.fire({
          icon: "warning",
          title: "Missing Content",
          text: "Please add message content before submitting.",
          confirmButtonColor: "#3b82f6",
        });
        return;
      }

      // Determine the actual status to save
      let actualStatus = data.status;
      
      // CRITICAL FIX: For SEO role sending for approval, ALWAYS set to pending_approval
      if (userRole === 'seo' && isSendForApproval) {
        actualStatus = 'pending_approval';
        console.log("SEO sending for approval - status set to:", actualStatus);
      }

      // For Super Admin: If status is 'sent', confirm before sending
      if (userRole === 'superadmin' && data.status === 'sent') {
        const result = await Swal.fire({
          title: "Send Campaign Now?",
          html: `
            <p>Are you sure you want to send this campaign immediately?</p>
            <p class="font-semibold mt-2">"${data.name}"</p>
            <p class="text-sm text-gray-600 mt-2">The campaign will be sent to all subscribers right away.</p>
          `,
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#10b981",
          cancelButtonColor: "#6b7280",
          confirmButtonText: "Yes, Send Now",
          cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) {
          return; // User cancelled
        }
      }

      // Build form data with proper structure including creator information
      const formData = {
        name: data.name,
        type: data.type,
        subject: data.subject,
        message: htmlContent,
        status: actualStatus, // Use actualStatus, not data.status
        // Include creator information from token
        createdBy: currentUser.id || currentUser.userId || currentUser._id,
        // Optional: Include additional creator details if needed by backend
        creatorDetails: {
          username: currentUser.username || currentUser.name,
          email: currentUser.email,
          role: currentUser.role
        }
      };

      // Add target region if provided
      if (data.target?.region) {
        formData.target = {
          region: data.target.region,
        };
      }

      // Add schedule date if status is scheduled
      // Only superadmin can schedule campaigns
      if (userRole === 'superadmin' && actualStatus === "scheduled" && data.scheduleDate) {
        formData.schedule = {
          date: new Date(data.scheduleDate).toISOString(),
          isSent: false,
        };
      }

      console.log("=== CAMPAIGN SUBMISSION DEBUG ===");
      console.log("Creating campaign with data:", formData);
      console.log("Creator ID:", formData.createdBy);
      console.log("Creator Details:", formData.creatorDetails);
      console.log("User Role:", userRole);
      console.log("Is Send For Approval:", isSendForApproval);
      console.log("Final Status:", actualStatus);
      console.log("Form Data Status:", formData.status);

      // Show loading state with role-specific message
      let loadingTitle;
      if (userRole === 'seo' && isSendForApproval) {
        loadingTitle = 'Sending for Approval...';
      } else if (userRole === 'superadmin' && actualStatus === 'sent') {
        loadingTitle = 'Sending Campaign...';
      } else {
        loadingTitle = 'Creating Campaign...';
      }
      
      Swal.fire({
        title: loadingTitle,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Create the campaign first
      const createdCampaign = await dispatch(createCampaign(formData)).unwrap();
      console.log("Campaign created:", createdCampaign);
      
      // If super admin selected 'sent' status, send the campaign immediately
      if (userRole === 'superadmin' && actualStatus === 'sent' && createdCampaign._id) {
        console.log("Sending campaign immediately:", createdCampaign._id);
        await dispatch(sendCampaign(createdCampaign._id)).unwrap();
      }

      // Success is handled by the useEffect above
      Swal.close();
    } catch (error) {
      console.error("Form submission error:", error);
      
      // Extract meaningful error message
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      Swal.fire({
        icon: "error",
        title: "Operation Failed",
        text: errorMessage,
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  // Set minimum datetime for scheduling (current time)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  // Get icon based on campaign type
  const getTypeIcon = (type) => {
    switch (type) {
      case "deal":
        return <FaTag className="text-green-500" />;
      case "announcement":
        return <HiMail className="text-blue-500" />;
      case "offer":
        return <FaRocket className="text-purple-500" />;
      case "newsletter":
        return <HiTemplate className="text-orange-500" />;
      default:
        return <FaEdit className="text-gray-500" />;
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "draft":
        return <FaEdit className="text-gray-500" />;
      case "scheduled":
        return <FaClock className="text-yellow-500" />;
      case "sent":
        return <FaPaperPlane className="text-green-500" />;
      default:
        return <FaEdit className="text-gray-500" />;
    }
  };

  // Responsive Button Group Component
  const ActionButtons = () => (
    <div className={`flex flex-col xs:flex-row gap-3 sm:gap-4 pt-6 border-t`}>
      <button
        type="button"
        onClick={handleReturnBack}
        className="px-4 sm:px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base order-2 xs:order-1"
      >
        <FaArrowLeft className="text-sm sm:text-base" />
        <span>Cancel</span>
      </button>
      
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1 order-1 xs:order-2">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handleSubmit((data) => {
              // Force status to draft
              const modifiedData = { ...data, status: 'draft' };
              onSubmitForm(modifiedData, false);
            })();
          }}
          disabled={creating || sending}
          className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
        >
          <FaSave className="text-sm sm:text-base" />
          <span>Save as Draft</span>
        </button>

        {/* Conditional main action button based on role */}
        {userRole === 'seo' ? (
          // SEO Role: Send for Approval
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              // Don't use setValue here - pass the flag directly
              handleSubmit((data) => {
                // Override the status in the submission
                const modifiedData = { ...data, status: 'pending_approval' };
                onSubmitForm(modifiedData, true);
              })();
            }}
            disabled={creating || sending}
            className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
          >
            {creating ? (
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
          // Super Admin Role: Launch Campaign
          <button
            type="submit"
            disabled={creating || sending}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
          >
            {(creating || sending) ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span className="text-sm sm:text-base">
                  {watchStatus === 'sent' ? 'Sending...' : 'Creating...'}
                </span>
              </>
            ) : (
              <>
                <FaRocket className="text-sm sm:text-base" />
                <span>{watchStatus === 'sent' ? 'Send Campaign' : 'Launch Campaign'}</span>
              </>
            )}
          </button>
        ) : (
          // Default: Create Campaign
          <button
            type="submit"
            disabled={creating || sending}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
          >
            {creating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span className="text-sm sm:text-base">Creating...</span>
              </>
            ) : (
              <>
                <FaRocket className="text-sm sm:text-base" />
                <span>Create Campaign</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">  
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Header with Back Button */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <button
              onClick={handleReturnBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-lg text-sm sm:text-base"
            >
              <FaArrowLeft className="text-base sm:text-lg" />
              <span className="font-medium">Back to Campaigns</span>
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl">
                <FaRocket className="text-xl sm:text-2xl text-blue-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 break-words">
                  Create New Campaign
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base break-words">
                  Launch a new email campaign to engage with your audience
                </p>
                {currentUser && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2">
                    <span>Creating as: {currentUser.username || currentUser.name || currentUser.email}</span>
                    {userRole && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium self-start xs:self-center">
                        {userRole.toUpperCase()}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Form */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
          <form onSubmit={handleSubmit((data) => onSubmitForm(data, false))} className="space-y-4 sm:space-y-6">
            {/* Campaign Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <HiTemplate className="text-blue-500 text-sm sm:text-base" />
                <span>Campaign Name *</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register("name", { required: "Campaign name is required" })}
                  className="w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter campaign name"
                />
                <FaEdit className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">
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
                <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">
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
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <TipTapEditor
                  value={htmlContent}
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

            {/* Status - Conditional based on role */}
            {userRole === 'superadmin' && (
              <>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <FaCheckCircle className="text-indigo-500 text-sm sm:text-base" />
                    <span>Status *</span>
                  </label>
                  <div className="relative">
                    <select
                      {...register("status", { required: "Status is required" })}
                      className="w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-sm sm:text-base bg-white"
                    >
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="sent">Send Immediately</option>
                    </select>
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      {getStatusIcon(watchStatus)}
                    </div>
                  </div>
                  {watchStatus === 'sent' && (
                    <p className="mt-2 text-xs sm:text-sm text-green-600 flex items-center gap-1">
                      <FaPaperPlane className="text-green-500 text-sm" />
                      <span>Campaign will be sent immediately to all subscribers.</span>
                    </p>
                  )}
                </div>

                {/* Schedule Date - Only show for superadmin when status is 'scheduled' */}
                {watchStatus === "scheduled" && (
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
                      <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                        {errors.scheduleDate.message}
                      </p>
                    )}
                    <p className="mt-2 text-xs sm:text-sm text-blue-600 flex items-center gap-1">
                      <FaClock className="text-blue-500 text-sm" />
                      <span>Campaign will be sent automatically at the scheduled date and time.</span>
                    </p>
                  </div>
                )}
              </>
            )}

            {/* SEO users don't see status selector - it's automatically set */}
            {userRole === 'seo' && (
              <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs sm:text-sm text-yellow-800 flex items-start gap-2">
                  <FaExclamationCircle className="text-yellow-600 mt-0.5 flex-shrink-0 text-sm" />
                  <span className="break-words">
                    <strong>Note:</strong> Your campaigns will be saved as drafts or sent for approval. 
                    Only administrators can schedule or send campaigns directly.
                  </span>
                </p>
              </div>
            )}

            {/* Submit Buttons - Role-based */}
            <ActionButtons />
          </form>
        </div>
      </div>
    </div>
  );
};


const AddNewsletterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    setUserRole(user?.role?.toLowerCase());
  }, []);

  const { success, error } = useSelector((state) => state.campaigns || {});

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
        
        // Role-based navigation
        if (userRole === 'seo') {
          navigate("/campaign");
        } else if (userRole === 'superadmin') {
          navigate("/campaign-content-management");
        } else {
          navigate("/campaign");
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [success, dispatch, navigate, userRole]);

  const handleSuccess = () => {
    console.log("Campaign created/updated successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <CampaignForm onSuccess={handleSuccess} />
    </div>
  );
};

export default AddNewsletterPage;