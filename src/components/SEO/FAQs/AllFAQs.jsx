import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFAQs,
  deleteFAQ,
  updateFAQStatus,
  toggleFAQItemVisibility,
  clearSuccess,
  clearError,
} from "../../../features/slices/faqSlice";
import {
  FiTrash2,
  FiEdit,
  FiEye,
  FiEyeOff,
  FiPlus,
  FiAlertCircle,
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { FaSort, FaThLarge, FaList as FaListAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import EditFAQModal from "../../Modal/EditFAQModal";

const api = import.meta.env.VITE_RENDER_API_BASE_URL;

export default function AllFAQ() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { faqs, loading, error, success } = useSelector((state) => state.faq);

  const [selectedFAQ, setSelectedFAQ] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [faqToEdit, setFaqToEdit] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filter, search, sort, pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState(() => {
    // Initialize view mode based on screen size
    if (typeof window !== "undefined") {
      return window.innerWidth < 768 ? "list" : "grid";
    }
    return "grid";
  });
  const [currentPage, setCurrentPage] = useState(1);
  const faqsPerPage = 9;

  useEffect(() => {
    dispatch(fetchAllFAQs());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Operation completed successfully!",
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
      dispatch(clearSuccess());
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error,
        timer: 4000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === "grid") {
        setViewMode("list");
      }
      if (window.innerWidth >= 768 && viewMode === "list") {
        setViewMode("grid");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [viewMode]);

  // Safe data access helper functions
  const getPageSlugs = (faq) => {
    if (!faq || typeof faq !== "object") return "Untitled FAQ";
    return Array.isArray(faq.pageSlugs) && faq.pageSlugs.length > 0
      ? faq.pageSlugs.join(", ")
      : "Untitled FAQ";
  };

  const getFAQItems = (faq) => {
    if (!faq || typeof faq !== "object") return [];
    return Array.isArray(faq.faqs) ? faq.faqs : [];
  };

  const getFAQStatus = (faq) => {
    if (!faq || typeof faq !== "object") return "draft";
    return faq.status || "draft";
  };

  // Filter and sort FAQs with safe data access
  const filteredAndSortedFAQs = (Array.isArray(faqs) ? faqs : [])
    .filter((faq) => {
      if (!faq || typeof faq !== "object") return false;

      const pageSlugsText = getPageSlugs(faq);
      const createdByText = faq.createdBy || "";
      const faqItems = getFAQItems(faq);
      
      const matchesSearch =
        pageSlugsText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        createdByText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faqItems.some(
          (item) =>
            item?.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item?.answer?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus =
        statusFilter === "all" || getFAQStatus(faq) === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "createdAt":
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        case "updatedAt":
          aValue = new Date(a.updatedAt || 0);
          bValue = new Date(b.updatedAt || 0);
          break;
        case "pageSlugs":
          aValue = getPageSlugs(a);
          bValue = getPageSlugs(b);
          break;
        case "questionsCount":
          aValue = getFAQItems(a).length;
          bValue = getFAQItems(b).length;
          break;
        default:
          aValue = a[sortBy] || "";
          bValue = b[sortBy] || "";
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination
  const indexOfLastFAQ = currentPage * faqsPerPage;
  const indexOfFirstFAQ = indexOfLastFAQ - faqsPerPage;
  const currentFAQs = filteredAndSortedFAQs.slice(
    indexOfFirstFAQ,
    indexOfLastFAQ
  );
  const totalPages = Math.ceil(filteredAndSortedFAQs.length / faqsPerPage);

  const handleDelete = async (faq) => {
    if (!faq?._id) {
      Swal.fire("Error!", "Invalid FAQ data", "error");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      html: `You want to delete <strong>"${getPageSlugs(faq)}"</strong>?<br/><small>This action cannot be undone.</small>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteFAQ(faq._id)).unwrap();
      } catch (err) {
        Swal.fire("Error!", err?.message || "Failed to delete FAQ", "error");
      }
    }
  };

  const handleStatusToggle = async (faq) => {
    if (!faq?._id) {
      Swal.fire("Error!", "Invalid FAQ data", "error");
      return;
    }

    const currentStatus = getFAQStatus(faq);
    const newStatus = currentStatus === "published" ? "draft" : "published";

    const result = await Swal.fire({
      title: `${newStatus === "published" ? "Publish" : "Unpublish"} FAQ?`,
      html: `Are you sure you want to ${
        newStatus === "published" ? "publish" : "unpublish"
      } <strong>"${getPageSlugs(faq)}"</strong>?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: newStatus === "published" ? "#10B981" : "#F59E0B",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `Yes, ${
        newStatus === "published" ? "publish" : "unpublish"
      } it!`,
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await dispatch(updateFAQStatus({ id: faq._id, status: newStatus })).unwrap();
      } catch (err) {
        Swal.fire("Error!", err?.message || "Failed to update FAQ status", "error");
      }
    }
  };

  const handleToggleItemVisibility = async (faqId, itemId, currentHiddenStatus) => {
    if (!faqId || !itemId) {
      Swal.fire("Error!", "Invalid FAQ item data", "error");
      return;
    }

    const newStatus = !currentHiddenStatus;
    
    const result = await Swal.fire({
      title: `${newStatus ? "Hide" : "Show"} Question?`,
      html: `This question will be ${
        newStatus ? "hidden from" : "visible on"
      } the frontend user panel.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: newStatus ? "#DC2626" : "#10B981",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `Yes, ${newStatus ? "hide" : "show"} it!`,
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await dispatch(
          toggleFAQItemVisibility({
            faqId,
            itemId,
            is_hidden: newStatus,
          })
        ).unwrap();
      } catch (err) {
        Swal.fire("Error!", err?.message || "Failed to toggle visibility", "error");
      }
    }
  };

  const handleEdit = (faq) => {
    if (!faq?._id) {
      Swal.fire("Error!", "Invalid FAQ data", "error");
      return;
    }
    setFaqToEdit(faq);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setFaqToEdit(null);
  };

  const handleUpdateFAQ = async (id, updatedData) => {
    if (!id) {
      Swal.fire("Error!", "Invalid FAQ ID", "error");
      return;
    }

    try {
      const response = await fetch(
        `${api}/faqs/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      const json = await response.json();

      if (json.success) {
        dispatch(fetchAllFAQs());
        setIsEditModalOpen(false);
        setFaqToEdit(null);

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "FAQ has been updated successfully.",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: json.message || "Failed to update FAQ",
          confirmButtonColor: "#DC2626",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.message || "Failed to update FAQ",
        confirmButtonColor: "#DC2626",
      });
    }
  };

  const handleRefresh = async () => {
    const loadingSwal = Swal.fire({
      title: "Refreshing FAQs...",
      text: "Please wait",
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
    });
    try {
      await dispatch(fetchAllFAQs()).unwrap();
      loadingSwal.close();
      Swal.fire({
        title: "Success!",
        text: "FAQs refreshed successfully",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      loadingSwal.close();
      Swal.fire("Error!", err?.message || "Failed to refresh FAQs", "error");
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  // Mobile-friendly action buttons component
  const ActionButtons = ({ faq, isCompact = false }) => (
    <div className={`flex ${isCompact ? "flex-wrap gap-1" : "flex-wrap gap-2"} items-center`}>
      <button
        onClick={() => setSelectedFAQ(selectedFAQ?._id === faq._id ? null : faq)}
        className={`flex items-center gap-1 text-blue-600 hover:text-blue-800 px-2 py-1.5 rounded hover:bg-blue-50 transition-colors text-xs font-medium ${
          isCompact ? "flex-1 justify-center" : ""
        }`}
      >
        <FiEye size={14} />
        {!isCompact && (selectedFAQ?._id === faq._id ? "Hide" : "View")}
      </button>
      <button
        onClick={() => handleEdit(faq)}
        className={`flex items-center gap-1 text-green-600 hover:text-green-800 px-2 py-1.5 rounded hover:bg-green-50 transition-colors text-xs font-medium ${
          isCompact ? "flex-1 justify-center" : ""
        }`}
      >
        <FiEdit size={14} />
        {!isCompact && "Edit"}
      </button>
      <button
        onClick={() => handleStatusToggle(faq)}
        className={`flex items-center gap-1 text-orange-600 hover:text-orange-800 px-2 py-1.5 rounded hover:bg-orange-50 transition-colors text-xs font-medium ${
          isCompact ? "flex-1 justify-center" : ""
        }`}
      >
        {!isCompact && (getFAQStatus(faq) === "published" ? "Unpublish" : "Publish")}
      </button>
      <button
        onClick={() => handleDelete(faq)}
        className={`flex items-center gap-1 text-red-600 hover:text-red-800 px-2 py-1.5 rounded hover:bg-red-50 transition-colors text-xs font-medium ${
          isCompact ? "flex-1 justify-center" : ""
        }`}
      >
        <FiTrash2 size={14} />
        {!isCompact && "Delete"}
      </button>
    </div>
  );

  // Grid Card Component
  const FAQCard = ({ faq }) => {
    const faqItems = getFAQItems(faq);
    const pageSlugs = getPageSlugs(faq);
    const status = getFAQStatus(faq);

    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 line-clamp-2 break-words">
                {pageSlugs}
              </h2>
              {faq.createdBy && (
                <p className="text-sm text-gray-500 truncate">
                  Created by: <span className="font-medium">{faq.createdBy}</span>
                </p>
              )}
              {faq.createdAt && (
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(faq.createdAt)}
                </p>
              )}
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium self-start sm:self-auto ${
                status === "published"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {status}
            </span>
          </div>

          {/* FAQ Count */}
          {faqItems.length > 0 && (
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-200 flex-wrap">
              <span className="font-medium">
                {faqItems.length} {faqItems.length === 1 ? "question" : "questions"}
              </span>
              <span className="text-gray-300 hidden sm:inline">•</span>
              <span>
                {faqItems.filter((item) => item.is_hidden).length} hidden
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4">
            <ActionButtons faq={faq} isCompact={false} />
          </div>
        </div>

        {/* Expanded Details */}
        {selectedFAQ?._id === faq._id && faqItems.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">
              Questions & Answers
            </h3>
            <div className="space-y-3">
              {faqItems.map((item, idx) => (
                <div
                  key={item._id || idx}
                  className={`p-3 sm:p-4 rounded-lg shadow-sm border ${
                    item.is_hidden
                      ? "bg-gray-100 border-gray-300"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-500 mt-0.5 flex-shrink-0">
                          {idx + 1}.
                        </span>
                        <h4 className="font-medium text-gray-900 flex-1 break-words">
                          {item.question || "Untitled Question"}
                        </h4>
                      </div>
                      <p className="text-gray-600 text-sm ml-6 break-words">
                        {item.answer || "No answer provided."}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        handleToggleItemVisibility(
                          faq._id,
                          item._id,
                          item.is_hidden
                        )
                      }
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                        item.is_hidden
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                      title={
                        item.is_hidden ? "Show on frontend" : "Hide from frontend"
                      }
                    >
                      {item.is_hidden ? (
                        <>
                          <FiEyeOff size={14} />
                          <span>Hidden</span>
                        </>
                      ) : (
                        <>
                          <FiEye size={14} />
                          <span>Visible</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // List Item Component
  const FAQListItem = ({ faq }) => {
    const faqItems = getFAQItems(faq);
    const pageSlugs = getPageSlugs(faq);
    const status = getFAQStatus(faq);

    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 break-words">
                  {pageSlugs}
                </h2>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium self-start sm:self-center ${
                    status === "published"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {status}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-1 sm:gap-3 text-sm text-gray-500">
                {faq.createdBy && (
                  <span className="break-words">
                    Created by: <span className="font-medium">{faq.createdBy}</span>
                  </span>
                )}
                {faq.createdBy && faq.createdAt && (
                  <span className="text-gray-300 hidden sm:inline">•</span>
                )}
                {faq.createdAt && (
                  <span>{formatDate(faq.createdAt)}</span>
                )}
                {faqItems.length > 0 && (
                  <>
                    <span className="text-gray-300 hidden sm:inline">•</span>
                    <span className="font-medium">
                      {faqItems.length} {faqItems.length === 1 ? "question" : "questions"}
                    </span>
                    <span className="text-gray-300 hidden sm:inline">•</span>
                    <span>
                      {faqItems.filter((item) => item.is_hidden).length} hidden
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:flex lg:items-center lg:gap-2">
              <ActionButtons faq={faq} isCompact={false} />
            </div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
            <ActionButtons faq={faq} isCompact={true} />
          </div>
        </div>

        {/* Expanded Details */}
        {selectedFAQ?._id === faq._id && faqItems.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">
              Questions & Answers
            </h3>
            <div className="space-y-3">
              {faqItems.map((item, idx) => (
                <div
                  key={item._id || idx}
                  className={`p-3 sm:p-4 rounded-lg shadow-sm border ${
                    item.is_hidden
                      ? "bg-gray-100 border-gray-300"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-500 mt-0.5 flex-shrink-0">
                          {idx + 1}.
                        </span>
                        <h4 className="font-medium text-gray-900 flex-1 break-words">
                          {item.question || "Untitled Question"}
                        </h4>
                      </div>
                      <p className="text-gray-600 text-sm ml-6 break-words">
                        {item.answer || "No answer provided."}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        handleToggleItemVisibility(
                          faq._id,
                          item._id,
                          item.is_hidden
                        )
                      }
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                        item.is_hidden
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                      title={
                        item.is_hidden ? "Show on frontend" : "Hide from frontend"
                      }
                    >
                      {item.is_hidden ? (
                        <>
                          <FiEyeOff size={14} />
                          <span>Hidden</span>
                        </>
                      ) : (
                        <>
                          <FiEye size={14} />
                          <span>Visible</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Pagination Component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
      const visiblePages = [];
      const maxVisiblePages = window.innerWidth < 640 ? 3 : 5;
      
      if (totalPages <= maxVisiblePages) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let end = Math.min(totalPages, start + maxVisiblePages - 1);

      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) {
        visiblePages.push(i);
      }

      return visiblePages;
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600 text-center sm:text-left">
            Showing {indexOfFirstFAQ + 1} to{" "}
            {Math.min(indexOfLastFAQ, filteredAndSortedFAQs.length)} of{" "}
            {filteredAndSortedFAQs.length} results
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronLeft size={16} />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="flex items-center space-x-1">
              {getVisiblePages().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 text-sm rounded-lg min-w-[40px] ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">Next</span>
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  FAQ Management
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  Manage all your frequently asked questions ({filteredAndSortedFAQs.length}{" "}
                  {filteredAndSortedFAQs.length === 1 ? "FAQ" : "FAQs"})
                </p>
              </div>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            </div>

            <div className={`flex flex-col sm:flex-row gap-3 ${isMobileMenuOpen ? 'block' : 'hidden lg:flex'}`}>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>

              <button
                onClick={() => navigate("/faq/add")}
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                <FiPlus className="w-4 h-4" />
                <span>Add New FAQ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 sm:mb-6">
          <div className="flex flex-col space-y-4">
            {/* Search */}
            <div className="w-full">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center space-x-2">
                  <FiFilter className="text-gray-500 w-4 h-4 flex-shrink-0" />
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <FaSort className="text-gray-500 w-4 h-4 flex-shrink-0" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                  >
                    <option value="createdAt">Created Date</option>
                    <option value="updatedAt">Updated Date</option>
                    <option value="pageSlugs">Page Name</option>
                    <option value="questionsCount">Questions Count</option>
                  </select>
                </div>

                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2">
                {/* View Mode Toggle */}
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "grid"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    title="Grid View"
                  >
                    <FaThLarge className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "list"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    title="List View"
                  >
                    <FaListAlt className="w-4 h-4" />
                  </button>
                </div>

                {(searchTerm ||
                  statusFilter !== "all" ||
                  sortBy !== "createdAt" ||
                  sortOrder !== "desc") && (
                  <button
                    onClick={resetFilters}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="flex items-center justify-center">
              <FiRefreshCw className="animate-spin w-6 h-6 text-blue-600 mr-3" />
              <span className="text-gray-600">Loading FAQs...</span>
            </div>
          </div>
        )}

        {/* FAQ Content */}
        {!loading && (
          <>
            {/* Grid/List View */}
            {viewMode === "grid" ? (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {currentFAQs.map((faq) => (
                  <FAQCard key={faq._id || Math.random()} faq={faq} />
                ))}
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {currentFAQs.map((faq) => (
                  <FAQListItem key={faq._id || Math.random()} faq={faq} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {filteredAndSortedFAQs.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <FiAlertCircle size={40} className="mx-auto sm:w-12 sm:h-12" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  No FAQs Found
                </h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Get started by creating your first FAQ"}
                </p>
                <button
                  onClick={() => navigate("/faq/add")}
                  className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Create Your First FAQ</span>
                </button>
              </div>
            )}

            {/* Pagination */}
            <Pagination />
          </>
        )}
      </div>

      {/* Edit Modal */}
      <EditFAQModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        faqData={faqToEdit}
        onUpdate={handleUpdateFAQ}
      />
    </div>
  );
}