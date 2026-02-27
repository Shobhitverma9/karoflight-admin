import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaTag,
  FaFolder,
  FaEye,
  FaSave,
  FaSyncAlt,
  FaExclamationTriangle,
  FaArrowLeft,
} from "react-icons/fa";
import TipTapEditor from "../../TextEditor/TipTapEditor";
import Swal from "sweetalert2";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchBlogById,
  updateBlog,
  clearSelectedBlog,
} from "../../../features/slices/blogSlice";

// Get auth token from sessionStorage
const getAuthToken = () => {
  return (
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("authToken") ||
    localStorage.getItem("token")
  );
};

export default function BlogEditPage() {
  const { id: blogId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    selectedBlog,
    fetchBlogLoading: loading,
    updateLoading: saving,
    error: fetchError,
  } = useSelector((state) => state.blogs);

  // Get user from auth state
  const user = useSelector((state) => state.auth?.user || state.auth?.userData);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    featured_image: { url: "", alt: "", file: null },
    categories: [],
    meta_title: "",
    meta_description: "",
    blog_url: "",
    slug: "",
    meta_keywords: [],
    image_alt_text: "",
    status: "draft",
    published_at: "",
  });

  const [newCategory, setNewCategory] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [activeTab, setActiveTab] = useState("content");
  const [originalStatus, setOriginalStatus] = useState(""); // Track original status
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

  // Check authentication on component mount
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Authentication Required",
        text: "Please log in to edit blogs",
        confirmButtonColor: "#3b82f6",
      }).then(() => {
        navigate("/login");
      });
      return;
    }
  }, [navigate]);

  useEffect(() => {
    if (blogId) {
      const token = getAuthToken();
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Authentication Required",
          text: "Please log in to view blog details",
          confirmButtonColor: "#3b82f6",
        });
        return;
      }
      dispatch(fetchBlogById(blogId));
    }

    return () => {
      dispatch(clearSelectedBlog());
    };
  }, [dispatch, blogId]);

  useEffect(() => {
    if (selectedBlog) {
      const initialData = {
        title: selectedBlog.title || selectedBlog.meta_title || "",
        content: selectedBlog.content || "",
        featured_image: selectedBlog.featured_image || {
          url: "",
          alt: "",
          file: null,
        },
        categories: selectedBlog.categories || [],
        meta_title: selectedBlog.meta_title || selectedBlog.title || "",
        meta_description: selectedBlog.meta_description || "",
        blog_url: selectedBlog.blog_url || "",
        slug: selectedBlog.slug || "",
        meta_keywords: selectedBlog.meta_keywords || [],
        image_alt_text: selectedBlog.image_alt_text || "",
        status: selectedBlog.status || "draft",
        published_at: selectedBlog.published_at || "",
      };

      setFormData(initialData);
      setOriginalStatus(selectedBlog.status || "draft"); // Store original status

      if (initialData.featured_image?.url) {
        setImagePreview(initialData.featured_image.url);
      }
    }
  }, [selectedBlog]);

  // Handle fetch error redirect
  useEffect(() => {
    if (fetchError) {
      // Check if error is due to authentication
      if (
        fetchError.includes("401") ||
        fetchError.includes("Unauthorized") ||
        fetchError.includes("authentication") ||
        fetchError.includes("token")
      ) {
        Swal.fire({
          icon: "error",
          title: "Authentication Failed",
          text: "Your session has expired. Please log in again.",
          confirmButtonColor: "#3b82f6",
        }).then(() => {
          navigate("/login");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: fetchError || "Failed to load blog",
        });
        navigate(-1);
      }
    }
  }, [fetchError, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        Swal.fire({
          icon: "error",
          title: "Invalid File Type",
          text: "Please upload JPEG or PNG image",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          text: "Image must be less than 5MB",
        });
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setFormData((prev) => ({
        ...prev,
        featured_image: { ...prev.featured_image, file, url: imageUrl },
      }));
    }
  };

  const removeImage = () => {
    if (imagePreview && imagePreview.startsWith("blob:"))
      URL.revokeObjectURL(imagePreview);
    setImagePreview("");
    setFormData((prev) => ({
      ...prev,
      featured_image: { url: "", alt: "", file: null },
    }));
  };

  const generateSlug = (title) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

  const handleMetaTitleChange = (e) => {
    const title = e.target.value;
    const slug = generateSlug(title);
    const blogUrl = `${window.location.origin}/blog-and-articles/${blogId}/${slug}`;
    setFormData((prev) => ({
      ...prev,
      meta_title: title,
      title,
      slug,
      blog_url: blogUrl,
    }));
  };

  const addCategory = () => {
    if (
      newCategory.trim() &&
      !formData.categories.includes(newCategory.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()],
      }));
      setNewCategory("");
    }
  };

  const removeCategory = (category) =>
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== category),
    }));

  const addKeyword = () => {
    if (
      newKeyword.trim() &&
      !formData.meta_keywords.includes(newKeyword.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        meta_keywords: [...prev.meta_keywords, newKeyword.trim()],
      }));
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword) =>
    setFormData((prev) => ({
      ...prev,
      meta_keywords: prev.meta_keywords.filter((k) => k !== keyword),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check authentication before submission
    const token = getAuthToken();
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Authentication Required",
        text: "Please log in to save changes",
        confirmButtonColor: "#3b82f6",
      }).then(() => {
        navigate("/login");
      });
      return;
    }

    if (!blogId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Blog ID is missing. Cannot save.",
      });
      return;
    }

    if (
      !formData.title ||
      !formData.content ||
      formData.categories.length === 0
    ) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Title, Content, and at least 1 Category are required!",
      });
      return;
    }

    // Check if user is SEO and original status was rejected
    const userRole = user?.role?.toLowerCase();
    let finalStatus = formData.status;
    
    if (userRole === "seo" && originalStatus.toLowerCase() === "reject") {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: "Resubmit for Approval?",
        html: `
          <p>This blog was previously <strong>rejected</strong>.</p>
          <p>By saving, it will be sent back to the <strong>Super Admin</strong> for approval.</p>
          <p>The status will change from "Reject" to "Pending Approval".</p>
        `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3b82f6",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, Resubmit",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) {
        return; // User cancelled
      }

      // Change status to pending approval
      finalStatus = "pending_approval";
    }

    try {
      Swal.fire({
        title: "Saving...",
        text: "Please wait while updating the blog.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      let submitData;

      if (formData.featured_image.file) {
        // If a new file is selected, use FormData
        submitData = new FormData();
        
        // Add all form fields except featured_image object
        submitData.append("title", formData.title);
        submitData.append("content", formData.content);
        submitData.append("meta_title", formData.meta_title);
        submitData.append("meta_description", formData.meta_description);
        submitData.append("blog_url", formData.blog_url);
        submitData.append("slug", formData.slug);
        submitData.append("image_alt_text", formData.image_alt_text);
        submitData.append("status", finalStatus); // Use finalStatus instead
        
        if (formData.published_at) {
          submitData.append("published_at", formData.published_at);
        }
        
        submitData.append("categories", JSON.stringify(formData.categories));
        submitData.append("meta_keywords", JSON.stringify(formData.meta_keywords));
        
        // Add the new image file
        submitData.append("featured_image", formData.featured_image.file);
        submitData.append(
          "featured_image_alt",
          formData.featured_image.alt || formData.image_alt_text
        );
      } else {
        // If no new file, send JSON (keeping existing image URL)
        submitData = {
          title: formData.title,
          content: formData.content,
          meta_title: formData.meta_title,
          meta_description: formData.meta_description,
          blog_url: formData.blog_url,
          slug: formData.slug,
          image_alt_text: formData.image_alt_text,
          status: finalStatus, // Use finalStatus instead
          categories: formData.categories,
          meta_keywords: formData.meta_keywords,
          featured_image: {
            url: formData.featured_image.url,
            alt: formData.featured_image.alt || formData.image_alt_text,
          },
        };

        if (formData.published_at) {
          submitData.published_at = formData.published_at;
        }
      }

      // Dispatch the updateBlog thunk - token is handled in the slice
      await dispatch(
        updateBlog({
          id: blogId,
          formData: submitData,
        })
      ).unwrap();

      Swal.close();

      // Show different success message based on status change
      const successMessage = 
        userRole === "seo" && originalStatus.toLowerCase() === "reject"
          ? "Blog updated and sent for approval!"
          : "Blog updated successfully";

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: successMessage,
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/blog-and-articles");
    } catch (err) {
      Swal.close();
      console.error("Update error:", err);

      // Handle authentication errors
      if (
        err.message?.includes("401") ||
        err.message?.includes("Unauthorized") ||
        err.message?.includes("authentication") ||
        err.message?.includes("token") ||
        err.message?.includes("Authorization")
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
          title: "Error",
          text: err.message || "Failed to save blog",
          confirmButtonColor: "#3b82f6",
        });
      }
    }
  };

  const tabs = [
    { id: "content", label: "Content", icon: FaEye },
    { id: "seo", label: "SEO & Meta", icon: FaTag },
    { id: "settings", label: "Settings", icon: FaFolder },
  ];

  // Responsive Tab Component
  const TabButtons = () => (
    <div className="flex space-x-1 sm:space-x-2 border-b border-gray-200 mb-4 overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-1 px-3 sm:px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );

  // Responsive Action Buttons
  const ActionButtons = () => (
    <div className="flex flex-col xs:flex-row gap-3 pt-6 border-t border-gray-200">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="px-4 sm:px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base order-2 xs:order-1"
      >
        <FaArrowLeft className="text-sm sm:text-base" />
        <span>Cancel</span>
      </button>
      <button
        type="submit"
        disabled={saving}
        className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 text-sm sm:text-base flex-1 order-1 xs:order-2"
      >
        <FaSave className="w-3 h-3 sm:w-4 sm:h-4" />
        <span>
          {saving 
            ? "Saving..." 
            : showResubmissionAlert 
            ? "Save & Resubmit for Approval" 
            : "Save Changes"}
        </span>
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen p-4">
        <FaSyncAlt className="animate-spin w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mr-3" />
        <span className="text-lg sm:text-xl text-gray-600">Loading blog details...</span>
      </div>
    );
  }

  if (!selectedBlog && !loading) {
    return (
      <div className="p-4 sm:p-6 text-center text-red-600 text-sm sm:text-base">
        Blog data could not be found or loaded.
      </div>
    );
  }

  // Check if SEO is editing a rejected blog
  const userRole = user?.role?.toLowerCase();
  const isRejectedBlog = originalStatus.toLowerCase() === "reject";
  const showResubmissionAlert = userRole === "seo" && isRejectedBlog;

  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
            Edit Blog Post
          </h1>
          <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 mt-1">
            <p className="text-gray-500 text-sm sm:text-base break-words">
              Update your blog content and settings
            </p>
            {user && (
              <span className="text-xs sm:text-sm text-gray-600">
                • Editing as: <span className="font-medium uppercase">{user.role || user.username || "User"}</span>
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => navigate("/blog-and-articles")}
          className="text-gray-700 hover:text-gray-900 px-3 sm:px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base self-start sm:self-auto"
        >
          Back to Blogs
        </button>
      </div>

      {/* Resubmission Alert for SEO editing rejected blogs */}
      {showResubmissionAlert && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-4 rounded-lg">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-yellow-400 w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                Rejected Blog - Resubmission Required
              </h3>
              <p className="text-xs sm:text-sm text-yellow-700 break-words">
                This blog was previously rejected. When you save your changes, it will be automatically sent back to the Super Admin for approval with status "Pending Approval".
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <TabButtons />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Content Tab */}
        {activeTab === "content" && (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blog Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter your blog title"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-base sm:text-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blog Content <span className="text-red-500">*</span>
              </label>
              <TipTapEditor
                content={formData.content}
                onChange={handleContentChange}
                placeholder="Write your blog content..."
              />
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 sm:h-64 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 sm:p-2 hover:bg-red-700 shadow-lg"
                    >
                      <FaTimes className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                )}
                {imagePreview && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image Alt Text
                    </label>
                    <input
                      type="text"
                      placeholder="Describe the image"
                      value={
                        formData.featured_image.alt || formData.image_alt_text
                      }
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          featured_image: {
                            ...prev.featured_image,
                            alt: e.target.value,
                          },
                          image_alt_text: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col xs:flex-row gap-2 mb-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addCategory())
                  }
                  placeholder="Add category"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="button"
                  onClick={addCategory}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm whitespace-nowrap"
                >
                  Add Category
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.categories.map((category, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm"
                  >
                    {category}
                    <button
                      type="button"
                      onClick={() => removeCategory(category)}
                      className="ml-1.5 hover:text-green-900"
                    >
                      <FaTimes className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === "seo" && (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title <span className="text-red-500">*</span> (max 60)
              </label>
              <input
                type="text"
                name="meta_title"
                value={formData.meta_title}
                onChange={handleMetaTitleChange}
                maxLength={60}
                placeholder="SEO-friendly title"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base"
              />
              <p
                className={`text-xs mt-1 ${
                  formData.meta_title.length > 60
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {formData.meta_title.length}/60
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description <span className="text-red-500">*</span> (max 160)
              </label>
              <textarea
                name="meta_description"
                value={formData.meta_description}
                onChange={handleChange}
                maxLength={160}
                rows={3}
                placeholder="Brief description"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base"
              />
              <p
                className={`text-xs mt-1 ${
                  formData.meta_description.length > 160
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {formData.meta_description.length}/160
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="url-friendly-slug"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blog URL
              </label>
              <input
                type="text"
                name="blog_url"
                value={formData.blog_url}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-xs sm:text-sm"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Keywords
              </label>
              <div className="flex flex-col xs:flex-row gap-2 mb-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addKeyword())
                  }
                  placeholder="Add keyword"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm whitespace-nowrap"
                >
                  Add Keyword
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.meta_keywords.map((k, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs sm:text-sm"
                  >
                    {k}
                    <button
                      type="button"
                      onClick={() => removeKeyword(k)}
                      className="ml-1.5 hover:text-purple-900"
                    >
                      <FaTimes className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Alt Text <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="image_alt_text"
                value={formData.image_alt_text}
                onChange={handleChange}
                placeholder="Alt text for blog images"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base"
              />
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-blue-800 break-words">
                <strong>Note:</strong> Author information is automatically set from your logged-in account and cannot be modified here.
              </p>
            </div>

            {showResubmissionAlert && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm text-orange-800 break-words">
                  <strong>Status Update:</strong> When you save this rejected blog, the status will automatically change to "Pending Approval" and be sent to the Super Admin for review.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base"
                disabled={showResubmissionAlert}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="reject">Reject</option>
              </select>
              {showResubmissionAlert && (
                <p className="text-xs text-gray-600 mt-1">
                  Status field is disabled. Will automatically change to "Pending Approval" on save.
                </p>
              )}
            </div>

            {formData.status === "published" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Published Date
                </label>
                <input
                  type="datetime-local"
                  name="published_at"
                  value={
                    formData.published_at
                      ? new Date(formData.published_at)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base"
                />
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <ActionButtons />
      </form>
    </div>
  );
}