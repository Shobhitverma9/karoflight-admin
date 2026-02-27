import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  createNewFAQ,
  clearSuccess,
  clearError,
} from "../../../features/slices/faqSlice";
import {
  FiPlus,
  FiTrash2,
  FiSave,
  FiArrowLeft,
  FiUser,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import Swal from "sweetalert2";

// Get auth token from sessionStorage
const getAuthToken = () => {
  return (
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("authToken") ||
    localStorage.getItem("token")
  );
};

export default function CreateNewFAQ() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, success } = useSelector((state) => state.faq);

  // Get user from auth state
  const user = useSelector((state) => state.auth?.user || state.auth?.userData);

  const [formData, setFormData] = useState({
    pageSlugs: [""],
    status: "draft",
    faqs: [{ question: "", answer: "" }],
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    pageSlugs: true,
    status: true,
    faqs: true,
  });

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-collapse sections on mobile for better UX
      if (window.innerWidth < 768) {
        setExpandedSections({
          pageSlugs: true,
          status: false,
          faqs: true,
        });
      } else {
        setExpandedSections({
          pageSlugs: true,
          status: true,
          faqs: true,
        });
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Check authentication on component mount
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Authentication Required",
        text: "Please log in to create FAQs",
        confirmButtonColor: "#3b82f6",
      }).then(() => {
        navigate("/login");
      });
      return;
    }
  }, [navigate]);

  // Success notification and redirect
  useEffect(() => {
    if (success) {
      Swal.fire({
        icon: "success",
        title: "FAQ Created!",
        text: "Your FAQ has been created successfully.",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        dispatch(clearSuccess());
        navigate("/faqs");
      });
    }
  }, [success, dispatch, navigate]);

  // Error notification
  useEffect(() => {
    if (error) {
      // Check if error is authentication-related
      if (
        error.includes("401") ||
        error.includes("Unauthorized") ||
        error.includes("authentication") ||
        error.includes("token")
      ) {
        Swal.fire({
          icon: "error",
          title: "Session Expired",
          text: "Your session has expired. Please log in again.",
          confirmButtonColor: "#3b82f6",
        }).then(() => {
          navigate("/login");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error,
          confirmButtonColor: "#DC2626",
        });
      }
      dispatch(clearError());
    }
  }, [error, dispatch, navigate]);

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handlers
  const handlePageSlugChange = (index, value) => {
    const newPageSlugs = [...formData.pageSlugs];
    newPageSlugs[index] = value;
    setFormData({ ...formData, pageSlugs: newPageSlugs });

    if (validationErrors[`pageSlug${index}`]) {
      const newErrors = { ...validationErrors };
      delete newErrors[`pageSlug${index}`];
      setValidationErrors(newErrors);
    }
  };

  const addPageSlug = () =>
    setFormData({ ...formData, pageSlugs: [...formData.pageSlugs, ""] });

  const removePageSlug = async (index) => {
    if (formData.pageSlugs.length > 1) {
      const result = await Swal.fire({
        title: "Remove this slug?",
        text: "Are you sure you want to remove this page slug?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DC2626",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Yes, remove it",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        setFormData({
          ...formData,
          pageSlugs: formData.pageSlugs.filter((_, i) => i !== index),
        });
        Swal.fire({
          icon: "success",
          title: "Removed!",
          text: "Page slug has been removed.",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      }
    }
  };

  const handleFAQChange = (index, field, value) => {
    const newFAQs = [...formData.faqs];
    newFAQs[index][field] = value;
    setFormData({ ...formData, faqs: newFAQs });

    if (validationErrors[`faq${index}${field}`]) {
      const newErrors = { ...validationErrors };
      delete newErrors[`faq${index}${field}`];
      setValidationErrors(newErrors);
    }
  };

  const addFAQItem = () =>
    setFormData({
      ...formData,
      faqs: [...formData.faqs, { question: "", answer: "" }],
    });

  const removeFAQItem = async (index) => {
    if (formData.faqs.length > 1) {
      const result = await Swal.fire({
        title: "Remove this question?",
        text: "Are you sure you want to remove this FAQ item?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DC2626",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Yes, remove it",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        setFormData({
          ...formData,
          faqs: formData.faqs.filter((_, i) => i !== index),
        });
        Swal.fire({
          icon: "success",
          title: "Removed!",
          text: "FAQ item has been removed.",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      }
    }
  };

  // Validation
  const validateForm = () => {
    const errors = {};

    formData.pageSlugs.forEach((slug, index) => {
      if (!slug.trim()) errors[`pageSlug${index}`] = "Page slug is required";
    });

    formData.faqs.forEach((faq, index) => {
      if (!faq.question.trim())
        errors[`faq${index}question`] = "Question is required";
      if (!faq.answer.trim())
        errors[`faq${index}answer`] = "Answer is required";
    });

    return { isValid: Object.keys(errors).length === 0, errors };
  };

  // Submit with confirmation
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check authentication before submission
    const token = getAuthToken();
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Authentication Required",
        text: "Please log in to create FAQs",
        confirmButtonColor: "#3b82f6",
      }).then(() => {
        navigate("/login");
      });
      return;
    }

    const { isValid, errors } = validateForm();

    if (!isValid) {
      setValidationErrors(errors);
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fill in all required fields correctly.",
        confirmButtonColor: "#DC2626",
      });
      return;
    }

    setValidationErrors({});

    const result = await Swal.fire({
      title: "Create FAQ?",
      html: `Are you sure you want to create this FAQ with status: <strong>${formData.status}</strong>?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563EB",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, create it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      // No longer sending createdBy - backend will extract from token
      const faqData = {
        pageSlugs: formData.pageSlugs.filter((slug) => slug.trim()),
        faqs: formData.faqs.filter(
          (faq) => faq.question.trim() && faq.answer.trim()
        ),
        status: formData.status,
      };

      dispatch(createNewFAQ(faqData));
    }
  };

  // Cancel with confirmation
  const handleCancel = async () => {
    const hasData =
      formData.pageSlugs.some((s) => s.trim()) ||
      formData.faqs.some((f) => f.question.trim() || f.answer.trim());

    if (hasData) {
      const result = await Swal.fire({
        title: "Discard changes?",
        text: "You have unsaved changes. Are you sure you want to leave?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DC2626",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Yes, discard",
        cancelButtonText: "Keep editing",
      });

      if (result.isConfirmed) {
        navigate("/faqs");
      }
    } else {
      navigate("/faqs");
    }
  };

  // Section Header Component
  const SectionHeader = ({ title, description, section, children }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          {isMobile && (
            <button
              type="button"
              onClick={() => toggleSection(section)}
              className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {expandedSections[section] ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </button>
          )}
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 break-words">
              {title}
            </h2>
            <p className="text-sm text-gray-600 mt-1 break-words">
              {description}
            </p>
          </div>
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors text-sm sm:text-base"
          >
            <FiArrowLeft size={18} className="flex-shrink-0" />
            <span className="truncate">Back to FAQs</span>
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
                Create New FAQ
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base break-words">
                Add a new FAQ section with questions and answers
              </p>
            </div>
            {user && (
              <div className="flex items-center gap-2 bg-blue-50 px-3 sm:px-4 py-2 rounded-lg border border-blue-200 self-start sm:self-auto">
                <FiUser className="text-blue-600 flex-shrink-0" size={16} />
                <div className="text-xs sm:text-sm flex items-center gap-1 min-w-0">
                  <p className="text-gray-600 whitespace-nowrap">Creating as:</p>
                  <p className="font-medium text-red-500 uppercase truncate">
                    {user.role || user.username || "User"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Page Slugs Section */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <SectionHeader
              title="Page Slugs"
              description="Specify which pages this FAQ section will appear on"
              section="pageSlugs"
            >
              <button
                type="button"
                onClick={addPageSlug}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors whitespace-nowrap"
              >
                <FiPlus size={14} className="flex-shrink-0" />
                <span className="hidden xs:inline">Add Slug</span>
              </button>
            </SectionHeader>

            {(isMobile ? expandedSections.pageSlugs : true) && (
              <div className="space-y-3">
                {formData.pageSlugs.map((slug, index) => (
                  <div key={index} className="flex gap-2 sm:gap-3">
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) =>
                          handlePageSlugChange(index, e.target.value)
                        }
                        placeholder="e.g., home, about, contact"
                        className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm sm:text-base ${
                          validationErrors[`pageSlug${index}`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {validationErrors[`pageSlug${index}`] && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1">
                          {validationErrors[`pageSlug${index}`]}
                        </p>
                      )}
                    </div>
                    {formData.pageSlugs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePageSlug(index)}
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        title="Remove slug"
                      >
                        <FiTrash2 size={16} className="sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Section */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <SectionHeader
              title="Publication Status"
              description="Choose whether to publish immediately or save as draft"
              section="status"
            />

            {(isMobile ? expandedSections.status : true) && (
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-4">
                <label className="flex items-center gap-2 cursor-pointer px-3 sm:px-4 py-2 border-2 rounded-lg transition-colors hover:bg-gray-50 flex-1">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={formData.status === "draft"}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-4 h-4 text-blue-600 flex-shrink-0"
                  />
                  <span className="text-gray-700 font-medium text-sm sm:text-base">Draft</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer px-3 sm:px-4 py-2 border-2 rounded-lg transition-colors hover:bg-gray-50 flex-1">
                  <input
                    type="radio"
                    name="status"
                    value="published"
                    checked={formData.status === "published"}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-4 h-4 text-blue-600 flex-shrink-0"
                  />
                  <span className="text-gray-700 font-medium text-sm sm:text-base">Published</span>
                </label>
              </div>
            )}
          </div>

          {/* FAQ Items Section */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <SectionHeader
              title="Questions & Answers"
              description="Add frequently asked questions and their answers"
              section="faqs"
            >
              <button
                type="button"
                onClick={addFAQItem}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors whitespace-nowrap"
              >
                <FiPlus size={14} className="flex-shrink-0" />
                <span className="hidden xs:inline">Add Question</span>
              </button>
            </SectionHeader>

            {(isMobile ? expandedSections.faqs : true) && (
              <div className="space-y-4 sm:space-y-6">
                {formData.faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border-2 border-gray-200 rounded-lg p-3 sm:p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                        Question {index + 1}
                      </h3>
                      {formData.faqs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFAQItem(index)}
                          className="text-red-600 hover:text-red-800 p-1 sm:p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                          title="Remove question"
                        >
                          <FiTrash2 size={16} className="sm:w-5 sm:h-5" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) =>
                            handleFAQChange(index, "question", e.target.value)
                          }
                          placeholder="Enter your question"
                          className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm sm:text-base ${
                            validationErrors[`faq${index}question`]
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {validationErrors[`faq${index}question`] && (
                          <p className="text-red-500 text-xs sm:text-sm mt-1">
                            {validationErrors[`faq${index}question`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Answer <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={faq.answer}
                          onChange={(e) =>
                            handleFAQChange(index, "answer", e.target.value)
                          }
                          placeholder="Enter your answer"
                          rows={isMobile ? 3 : 4}
                          className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm sm:text-base resize-vertical ${
                            validationErrors[`faq${index}answer`]
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {validationErrors[`faq${index}answer`] && (
                          <p className="text-red-500 text-xs sm:text-sm mt-1">
                            {validationErrors[`faq${index}answer`]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col xs:flex-row gap-3 sm:gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base flex-1"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <FiSave size={16} className="sm:w-5 sm:h-5" />
                  <span>Create FAQ</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-4 sm:px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}