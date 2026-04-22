import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Plus,
  Edit2,
  Eye,
  CheckCircle,
  Globe,
  Trash2,
  X,
  Calendar,
  User,
  Hash,
  ExternalLink,
} from "lucide-react";
import {
  getAllSeoPages,
  createSeoPage,
  updateSeoPage,
  publishSeoPage,
  deleteSeoPage,
  clearError,
  clearSuccess,
} from "../../../features/slices/seoSlice";

const API_BASE_URL =
  import.meta.env.VITE_RENDER_API_BASE_URL || "http://localhost:5000/api";

// Function to decode JWT token and extract role
const decodeToken = (token) => {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Function to get user role from token
const getUserRoleFromToken = () => {
  const token =
    sessionStorage.getItem("token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("authToken") ||
    localStorage.getItem("authToken");

  if (!token) return null;

  const decodedToken = decodeToken(token);
  return decodedToken?.role || decodedToken?.userRole || null;
};

const SEOAdminPanel = () => {
  const dispatch = useDispatch();

  // Redux state - with better selector
  const seoState = useSelector((state) => state.seo);
  const seoPages = seoState?.seoPages || [];
  const loading = seoState?.loading || false;
  const error = seoState?.error || null;
  const success = seoState?.success || false;

  // Debug logs
  useEffect(() => {
    console.log("=== SEO Component State ===");
    console.log("Full seoState:", seoState);
    console.log("seoPages:", seoPages);
    console.log("seoPages length:", seoPages.length);
    console.log("seoPages is array:", Array.isArray(seoPages));
  }, [seoState, seoPages]);

  // Get user role from token in session storage
  const [userRole, setUserRole] = useState(null);

  // Local state
  const [showForm, setShowForm] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [viewingPage, setViewingPage] = useState(null); // New state for viewing page details
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPageType, setFilterPageType] = useState("all");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    pageType: "Page",
    pageId: "",
    createdBy: sessionStorage.getItem("userId"),
  });

  // Get user role from token on component mount
  useEffect(() => {
    const role = getUserRoleFromToken();
    setUserRole(role);
    console.log("User role:", role);
  }, []);

  // Check if user has SEO role
  const hasSeoRole = userRole?.toLowerCase() === "seo";

  // Fetch all SEO pages on component mount
  useEffect(() => {
    console.log("Dispatching getAllSeoPages...");
    dispatch(getAllSeoPages());
  }, [dispatch]);

  // FIXED: Use useMemo to compute filteredPages with proper array check
  const filteredPages = useMemo(() => {
    console.log("Computing filteredPages...");
    console.log("Input seoPages:", seoPages);
    console.log("Is array:", Array.isArray(seoPages));

    if (!Array.isArray(seoPages)) {
      console.warn("seoPages is not an array!");
      return [];
    }

    let filtered = [...seoPages];
    console.log("After spread:", filtered.length);

    if (searchTerm) {
      filtered = filtered.filter(
        (page) =>
          page.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          page.slug?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log("After search filter:", filtered.length);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((page) => page.status === filterStatus);
      console.log("After status filter:", filtered.length);
    }

    if (filterPageType !== "all") {
      filtered = filtered.filter((page) => page.pageType === filterPageType);
      console.log("After type filter:", filtered.length);
    }

    console.log("Final filtered pages:", filtered.length);
    return filtered;
  }, [seoPages, searchTerm, filterStatus, filterPageType]);

  // Debug filtered pages
  useEffect(() => {
    console.log("=== Filtered Pages ===");
    console.log("filteredPages:", filteredPages);
    console.log("filteredPages length:", filteredPages.length);
  }, [filteredPages]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: editingPage ? prev.slug : generateSlug(title),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasSeoRole) {
      alert("Access denied. Only SEO role can create/update pages.");
      return;
    }

    const payload = {
      ...formData,
      metaKeywords: formData.metaKeywords
        ? formData.metaKeywords.split(",").map((k) => k.trim())
        : [],
    };

    try {
      if (editingPage) {
        await dispatch(
          updateSeoPage({ id: editingPage._id, data: payload })
        ).unwrap();
      } else {
        await dispatch(createSeoPage(payload)).unwrap();
      }

      resetForm();
    } catch (err) {
      console.error("Failed to save SEO page:", err);
    }
  };

  const handlePublish = async (id) => {
    if (!hasSeoRole) {
      alert("Access denied. Only SEO role can publish pages.");
      return;
    }

    try {
      await dispatch(publishSeoPage(id)).unwrap();
    } catch (err) {
      console.error("Failed to publish page:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!hasSeoRole) {
      alert("Access denied. Only SEO role can delete pages.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this SEO page?")) {
      try {
        await dispatch(deleteSeoPage(id)).unwrap();
      } catch (err) {
        console.error("Failed to delete page:", err);
      }
    }
  };

  const handleEdit = (page) => {
    if (!hasSeoRole) {
      alert("Access denied. Only SEO role can edit pages.");
      return;
    }

    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      metaTitle: page.metaTitle || "",
      metaDescription: page.metaDescription || "",
      metaKeywords: page.metaKeywords ? page.metaKeywords.join(", ") : "",
      canonicalUrl: page.canonicalUrl || "",
      ogTitle: page.ogTitle || "",
      ogDescription: page.ogDescription || "",
      ogImage: page.ogImage || "",
      pageType: page.pageType,
      pageId: page.pageId || "",
      createdBy: page.createdBy,
    });
    setShowForm(true);
  };

  // NEW: Handle view page details
  const handleView = (page) => {
    setViewingPage(page);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      canonicalUrl: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      pageType: "Page",
      pageId: "",
      createdBy: sessionStorage.getItem("userId"),
    });
    setEditingPage(null);
    setShowForm(false);
  };

  // NEW: Close view modal
  const closeViewModal = () => {
    setViewingPage(null);
  };

  const openSitemap = () => {
    window.open(`${API_BASE_URL}/seo/sitemap.xml`, "_blank");
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Show loading while checking role
  if (userRole === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-600 mt-4">Checking permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                SEO Management Panel
              </h1>
              <p className="text-gray-600 mt-1">
                Manage meta tags, descriptions, and search optimization
              </p>
              {!hasSeoRole && (
                <p className="text-red-600 text-sm mt-2 font-medium">
                  ⚠️ You don't have SEO role. View-only access.
                </p>
              )}
              {hasSeoRole && (
                <p className="text-green-600 text-sm mt-2 font-medium">
                  ✅ You have SEO role. Full access granted.
                </p>
              )}
              {/* Debug info */}
              <p className="text-xs text-gray-500 mt-2">
                Debug: {seoPages.length} pages in Redux | {filteredPages.length}{" "}
                after filters
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={openSitemap}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Globe size={18} />
                View Sitemap
              </button>
              {hasSeoRole && (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={18} />
                  New SEO Page
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => dispatch(clearError())}>
              <X size={18} />
            </button>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
            <span>Operation completed successfully!</span>
            <button onClick={() => dispatch(clearSuccess())}>
              <X size={18} />
            </button>
          </div>
        )}

        {/* View Details Modal */}
        {viewingPage && (
          <div className="fixed inset-0 backdrop-blur-xs bg-black/70 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Page Details: {viewingPage.title}
                </h2>
                <button
                  onClick={closeViewModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <Hash size={20} />
                    Basic Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        Page Title
                      </label>
                      <p className="text-gray-900 font-medium">
                        {viewingPage.title}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        Slug
                      </label>
                      <code className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        /{viewingPage.slug}
                      </code>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        Page Type
                      </label>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        {viewingPage.pageType}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        Status
                      </label>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          viewingPage.status === "published"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {viewingPage.status}
                      </span>
                    </div>
                    {viewingPage.pageId && (
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">
                          Page ID
                        </label>
                        <p className="text-gray-900 font-mono text-sm">
                          {viewingPage.pageId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Meta Tags */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                    <Hash size={20} />
                    Meta Tags
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">
                        Meta Title
                      </label>
                      <p className="text-gray-900">
                        {viewingPage.metaTitle || "Not set"}
                      </p>
                      {viewingPage.metaTitle && (
                        <p className="text-xs text-gray-500 mt-1">
                          {viewingPage.metaTitle.length}/60 characters
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">
                        Meta Description
                      </label>
                      <p className="text-gray-900">
                        {viewingPage.metaDescription || "Not set"}
                      </p>
                      {viewingPage.metaDescription && (
                        <p className="text-xs text-gray-500 mt-1">
                          {viewingPage.metaDescription.length}/160 characters
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">
                        Meta Keywords
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {viewingPage.metaKeywords &&
                        viewingPage.metaKeywords.length > 0 ? (
                          viewingPage.metaKeywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
                            >
                              {keyword}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-900">Not set</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">
                        Canonical URL
                      </label>
                      <p className="text-gray-900 break-all">
                        {viewingPage.canonicalUrl || "Not set"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Open Graph */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                    <Hash size={20} />
                    Open Graph (Social Media)
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-1">
                        OG Title
                      </label>
                      <p className="text-gray-900">
                        {viewingPage.ogTitle || "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-1">
                        OG Description
                      </label>
                      <p className="text-gray-900">
                        {viewingPage.ogDescription || "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-1">
                        OG Image URL
                      </label>
                      <p className="text-gray-900 break-all">
                        {viewingPage.ogImage || "Not set"}
                      </p>
                      {viewingPage.ogImage && (
                        <div className="mt-2">
                          <img
                            src={viewingPage.ogImage}
                            alt="OG Preview"
                            className="max-w-xs max-h-32 object-cover rounded border"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar size={20} />
                    Timestamps
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Created At
                      </label>
                      <p className="text-gray-900">
                        {formatDate(viewingPage.createdAt)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Updated At
                      </label>
                      <p className="text-gray-900">
                        {formatDate(viewingPage.updatedAt)}
                      </p>
                    </div>
                    {viewingPage.createdBy && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1  items-center gap-1">
                          <User size={16} />
                          Created By
                        </label>
                        <p className="text-gray-900">{viewingPage.createdBy}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <a
                    href={
                      viewingPage.canonicalUrl ||
                      `https://airmbm.com/${viewingPage.slug}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink size={16} />
                    Visit Live Page
                  </a>
                  <div className="flex gap-2">
                    <button
                      onClick={closeViewModal}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                    {hasSeoRole && (
                      <button
                        onClick={() => {
                          closeViewModal();
                          handleEdit(viewingPage);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit2 size={16} />
                        Edit Page
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 backdrop-blur-xs bg-black/70 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingPage ? "Edit SEO Page" : "Create New SEO Page"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleTitleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter page title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug *
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="page-url-slug"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Type *
                    </label>
                    <select
                      name="pageType"
                      value={formData.pageType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Page">Page</option>
                      <option value="Hotel">Hotel</option>
                      <option value="Post">Post</option>
                      <option value="Offer">Offer</option>
                      <option value="Flight">Flight</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page ID (Optional)
                    </label>
                    <input
                      type="text"
                      name="pageId"
                      value={formData.pageId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="MongoDB ObjectId"
                    />
                  </div>
                </div>

                {/* Meta Tags */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Meta Tags
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        name="metaTitle"
                        value={formData.metaTitle}
                        onChange={handleInputChange}
                        maxLength={60}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="SEO optimized title (50-60 characters)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.metaTitle.length}/60 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Description
                      </label>
                      <textarea
                        name="metaDescription"
                        value={formData.metaDescription}
                        onChange={handleInputChange}
                        maxLength={160}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief description for search results (150-160 characters)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.metaDescription.length}/160 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Keywords (comma separated)
                      </label>
                      <input
                        type="text"
                        name="metaKeywords"
                        value={formData.metaKeywords}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="keyword1, keyword2, keyword3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Canonical URL
                      </label>
                      <input
                        type="url"
                        name="canonicalUrl"
                        value={formData.canonicalUrl}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://airmbm.com/page-url"
                      />
                    </div>
                  </div>
                </div>

                {/* Open Graph */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Open Graph (Social Media)
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        OG Title
                      </label>
                      <input
                        type="text"
                        name="ogTitle"
                        value={formData.ogTitle}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Title for social media sharing"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        OG Description
                      </label>
                      <textarea
                        name="ogDescription"
                        value={formData.ogDescription}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Description for social media sharing"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        OG Image URL
                      </label>
                      <input
                        type="url"
                        name="ogImage"
                        value={formData.ogImage}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 border-t pt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? "Saving..."
                      : editingPage
                      ? "Update Page"
                      : "Create Page"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title or slug..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div>
              <select
                value={filterPageType}
                onChange={(e) => setFilterPageType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="Page">Page</option>
                <option value="Hotel">Hotel</option>
                <option value="Post">Post</option>
                <option value="Offer">Offer</option>
                <option value="Flight">Flight</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pages Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading pages...</p>
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 text-lg">No SEO pages found</p>
              <p className="text-gray-500 mt-2">
                {searchTerm ||
                filterStatus !== "all" ||
                filterPageType !== "all"
                  ? "Try adjusting your filters"
                  : hasSeoRole
                  ? "Create your first SEO page to get started"
                  : "No pages available"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPages.map((page) => (
                    <tr
                      key={page._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {page.title}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {page.metaDescription}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          /{page.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          {page.pageType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            page.status === "published"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {page.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(page.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {/* NEW: View Details Button */}
                          <button
                            onClick={() => handleView(page)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>

                          {hasSeoRole && (
                            <>
                              <button
                                onClick={() => handleEdit(page)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={18} />
                              </button>
                              {page.status === "draft" && (
                                <button
                                  onClick={() => handlePublish(page._id)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Publish"
                                >
                                  <CheckCircle size={18} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(page._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                          <a
                            href={
                              page.canonicalUrl ||
                              `https://airmbm.com/${page.slug}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="View Live Page"
                          >
                            <ExternalLink size={18} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900">
                {seoPages.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Pages</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">
                {seoPages.filter((p) => p.status === "published").length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Published</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600">
                {seoPages.filter((p) => p.status === "draft").length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Drafts</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">
                {new Set(seoPages.map((p) => p.pageType)).size}
              </div>
              <div className="text-sm text-gray-600 mt-1">Page Types</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOAdminPanel;
