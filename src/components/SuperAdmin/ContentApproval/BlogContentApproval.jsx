import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  LuCheck,
  LuX,
  LuEye,
  LuCalendar,
  LuUser,
  LuTrash2,
  LuSearch,
  LuFilter,
  LuFileText,
  LuRefreshCw,
} from "react-icons/lu";
import { FaEdit } from "react-icons/fa";
import { FiAlertCircle, FiMessageSquare } from "react-icons/fi";

// Import Redux actions
import {
  fetchBlogs,
  fetchBlogById,
  deleteBlog,
  approveOrRejectBlog,
  clearError,
  clearSelectedBlog,
} from "../../../features/slices/blogSlice";
import BlogViewModal from "../../Modal/BlogViewModal";

// Helper functions
const getStatusBadge = (status) => {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-800 border-green-200";
    case "draft":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "pending_approval":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "Unknown date";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Blog Card Component - Made responsive
const BlogCard = ({ blog, onView, onEdit, onApprove, onReject, onDelete }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group w-full">
    <div className="relative overflow-hidden">
      {blog.featured_image?.url || blog.featured_image ? (
        <img
          src={typeof blog.featured_image === 'string' ? blog.featured_image : blog.featured_image.url}
          alt={blog.image_alt_text || blog.title}
          className="h-40 sm:h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="h-40 sm:h-48 w-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
          <LuFileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
        </div>
      )}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
        <span
          className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(
            blog.status
          )}`}
        >
          {blog.status === "pending_approval"
            ? "Pending"
            : blog.status
            ? blog.status.charAt(0).toUpperCase() + blog.status.slice(1)
            : "Draft"}
        </span>
      </div>
    </div>

    <div className="p-4 sm:p-5 flex flex-col flex-grow">
      <div className="flex-grow">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[2.5rem] sm:min-h-[3rem]">
          {blog.meta_title || blog.title || "Untitled"}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-3 min-h-[3.75rem]">
          {blog.meta_description ||
            blog.excerpt ||
            blog.content?.substring(0, 150) ||
            "No description available"}
        </p>
      </div>

      {/* Show rejection reason if blog is rejected */}
      {blog.status === "rejected" && blog.rejection_reason && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start gap-2">
            <FiAlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-red-800 mb-1">Rejection Reason:</p>
              <p className="text-xs text-red-700 line-clamp-2">
                {blog.rejection_reason}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 mb-3 sm:mb-4">
        <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
          <div className="flex items-center">
            <LuUser className="w-3 h-3 mr-1" />
            <span className="truncate max-w-[80px] xs:max-w-[100px]">
              {blog.author?.name ||
                blog.author?.email ||
                blog.author ||
                "Anonymous"}
            </span>
          </div>
          <div className="flex items-center">
            <LuCalendar className="w-3 h-3 mr-1" />
            {formatDate(blog.createdAt || blog.created_at)}
          </div>
        </div>
        {blog.view_count !== undefined && (
          <div className="flex items-center">
            <LuEye className="w-3 h-3 mr-1" />
            <span className="hidden xs:inline">{blog.view_count} views</span>
            <span className="xs:hidden">{blog.view_count}</span>
          </div>
        )}
      </div>

      {blog.categories && Array.isArray(blog.categories) && blog.categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3 sm:mb-4">
          {blog.categories.slice(0, 2).map((cat, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
            >
              {cat}
            </span>
          ))}
          {blog.categories.length > 2 && (
            <span className="inline-flex items-center px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded-md">
              +{blog.categories.length - 2}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-1 sm:gap-2 flex-wrap">
        <button
          onClick={() => onView(blog)}
          className="flex items-center space-x-1 text-green-600 hover:text-green-800 hover:bg-green-50 px-2 py-1 rounded-md transition-colors text-xs sm:text-sm"
          title="View Blog"
        >
          <LuEye className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">View</span>
        </button>

        <button
          onClick={() => onEdit(blog._id)}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-md transition-colors text-xs sm:text-sm"
          title="Edit Blog"
        >
          <FaEdit className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Edit</span>
        </button>

        {/* Show Approve button only if NOT published */}
        {blog.status !== "published" && (
          <button
            onClick={() => onApprove(blog._id)}
            className="flex items-center space-x-1 text-green-600 hover:text-green-800 hover:bg-green-50 px-2 py-1 rounded-md transition-colors text-xs sm:text-sm"
            title="Approve & Publish"
          >
            <LuCheck className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Approve</span>
          </button>
        )}

        {/* Show Reject button only if NOT published and NOT already rejected */}
        {blog.status !== "published" && blog.status !== "rejected" && (
          <button
            onClick={() => onReject(blog._id)}
            className="flex items-center space-x-1 text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded-md transition-colors text-xs sm:text-sm"
            title="Reject Blog"
          >
            <LuX className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Reject</span>
          </button>
        )}

        <button
          onClick={() => onDelete(blog._id)}
          className="flex items-center space-x-1 text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded-md transition-colors text-xs sm:text-sm"
          title="Delete Blog Permanently"
        >
          <LuTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>

        <button className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-2 py-1 rounded-md transition-colors text-xs sm:text-sm">
          <FiMessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm">{blog.comments?.length || 0}</span>
        </button>
      </div>
    </div>
  </div>
);

const BlogContentManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Redux state
  const {
    items: blogs = [],
    loading: blogsLoading = false,
    error: blogError = null,
    updateLoading = false,
    approveLoading = false,
    selectedBlog: reduxSelectedBlog = null,
  } = useSelector((state) => state.blogs || {});

  // Fetch blogs on mount and when status filter changes
  useEffect(() => {
    dispatch(
      fetchBlogs({
        status: statusFilter !== "all" ? statusFilter : undefined,
      })
    );
  }, [dispatch, statusFilter]);

  // Update selected blog when redux state changes
  useEffect(() => {
    if (reduxSelectedBlog) {
      setSelectedBlog(reduxSelectedBlog);
      setIsModalOpen(true);
    }
  }, [reduxSelectedBlog]);

  // Handle errors
  useEffect(() => {
    if (blogError) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: blogError,
        timer: 3000,
        showConfirmButton: false,
      });
      dispatch(clearError());
    }
  }, [blogError, dispatch]);

  // Filter blogs
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.meta_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.author?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.author?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || blog.status === statusFilter;

    const matchesCategory =
      categoryFilter === "all" ||
      (Array.isArray(blog.categories) && blog.categories.includes(categoryFilter));

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get unique categories
  const categories = [
    ...new Set(blogs.flatMap((b) => b.categories || []).filter(Boolean)),
  ];

  // Approve blog handler
  const handleApproveBlog = async (blogId) => {
    const result = await Swal.fire({
      title: "Approve Blog?",
      text: "This will publish the blog and make it visible to all users.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Approve & Publish",
      confirmButtonColor: "#10B981",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: "Processing...",
          text: "Approving and publishing the blog",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await dispatch(
          approveOrRejectBlog({
            id: blogId,
            action: "approve",
          })
        ).unwrap();

        Swal.close();

        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Blog approved and published successfully!",
          timer: 2000,
          showConfirmButton: false,
        });

        // Refresh blogs list
        dispatch(fetchBlogs({ status: statusFilter !== "all" ? statusFilter : undefined }));
      } catch (error) {
        Swal.close();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error || "Failed to approve blog",
          confirmButtonColor: "#3b82f6",
        });
      }
    }
  };

  // Reject blog handler - Updated to save rejection with reason
  const handleRejectBlog = async (blogId) => {
    const result = await Swal.fire({
      title: "Reject Blog?",
      html: `
        <div style="text-align: left;">
          <p style="margin-bottom: 12px;">This will change the blog status to <strong>rejected</strong> and save it in the database with your rejection reason.</p>
          <p style="color: #DC2626; font-weight: 500; margin-bottom: 8px;">Please provide a reason for rejection:</p>
        </div>
      `,
      input: "textarea",
      inputPlaceholder: "Enter rejection reason here...",
      inputAttributes: {
        "aria-label": "Rejection reason",
        rows: 4,
      },
      showCancelButton: true,
      confirmButtonText: "Reject Blog",
      confirmButtonColor: "#DC2626",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      inputValidator: (value) => {
        if (!value || value.trim() === "") {
          return "Rejection reason is required!";
        }
        if (value.trim().length < 10) {
          return "Please provide a more detailed reason (at least 10 characters)";
        }
      },
    });

    if (result.isConfirmed && result.value) {
      try {
        Swal.fire({
          title: "Processing...",
          text: "Rejecting the blog and saving to database",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        console.log("Sending rejection with reason:", result.value.trim());

        // Dispatch action with rejection reason
        const response = await dispatch(
          approveOrRejectBlog({
            id: blogId,
            action: "reject",
            reason: result.value.trim(),
          })
        ).unwrap();

        console.log("Rejection response:", response);

        Swal.close();

        await Swal.fire({
          icon: "success",
          title: "Rejected!",
          html: `
            <p>Blog has been rejected and saved with status: <strong>rejected</strong></p>
            <p style="margin-top: 8px; color: #6B7280; font-size: 14px;">The blog is still in the database and can be viewed in the rejected filter.</p>
          `,
          timer: 3000,
          showConfirmButton: true,
          confirmButtonColor: "#3b82f6",
        });

        // Refresh blogs list
        dispatch(fetchBlogs({ status: statusFilter !== "all" ? statusFilter : undefined }));
      } catch (error) {
        console.error("Rejection error:", error);
        Swal.close();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error || "Failed to reject blog",
          confirmButtonColor: "#3b82f6",
        });
      }
    }
  };

  // Delete blog handler - Now clearly for permanent deletion
  const handleDeleteBlog = async (blogId) => {
    const result = await Swal.fire({
      title: "Permanently Delete Blog?",
      html: `
        <div style="text-align: left;">
          <p style="color: #DC2626; font-weight: 600; margin-bottom: 12px;">⚠️ Warning: This is a permanent action!</p>
          <p style="margin-bottom: 8px;">This will <strong>permanently delete</strong> the blog from the database.</p>
          <p style="color: #6B7280; font-size: 14px;">If you want to reject the blog but keep it in the database, use the <strong>Reject</strong> button instead.</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete Permanently",
      confirmButtonColor: "#DC2626",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: "Deleting...",
          text: "Permanently removing blog from database",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await dispatch(deleteBlog(blogId)).unwrap();

        Swal.close();

        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Blog has been permanently deleted from the database",
          timer: 2000,
          showConfirmButton: false,
        });

        // Refresh blogs list
        dispatch(fetchBlogs({ status: statusFilter !== "all" ? statusFilter : undefined }));
      } catch (error) {
        Swal.close();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error || "Failed to delete blog",
          confirmButtonColor: "#3b82f6",
        });
      }
    }
  };

  // View blog handler - Fetch blog details and open modal
  const handleViewBlog = async (blog) => {
    try {
      // Fetch full blog details if needed
      await dispatch(fetchBlogById(blog._id || blog.slug)).unwrap();
      // Modal will open automatically via useEffect when reduxSelectedBlog updates
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error || "Failed to load blog details",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  // Edit blog handler - Navigate to edit page
  const handleEditBlog = (blogId) => {
    navigate(`/blog-and-articles/${blogId}/edit`);
  };

  // Refresh blogs
  const handleRefreshBlogs = () => {
    dispatch(fetchBlogs({ status: statusFilter !== "all" ? statusFilter : undefined }));
  };

  // Close preview modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBlog(null);
    dispatch(clearSelectedBlog());
  };

  // Handle approve from modal
  const handleApproveFromModal = () => {
    if (selectedBlog) {
      handleCloseModal();
      handleApproveBlog(selectedBlog._id);
    }
  };

  // Handle reject from modal
  const handleRejectFromModal = () => {
    if (selectedBlog) {
      handleCloseModal();
      handleRejectBlog(selectedBlog._id);
    }
  };

  // Handle edit from modal
  const handleEditFromModal = () => {
    if (selectedBlog) {
      handleCloseModal();
      handleEditBlog(selectedBlog._id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 text-center sm:text-left">
              Blog Management Dashboard
            </h1>
            <div className="flex items-center justify-center sm:justify-end gap-3">
              <button
                onClick={handleRefreshBlogs}
                disabled={blogsLoading}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm sm:text-base"
                title="Refresh Blogs"
              >
                <LuRefreshCw className={`w-4 h-4 ${blogsLoading ? "animate-spin" : ""}`} />
                <span className="hidden xs:inline">Refresh</span>
              </button>
              <span className="text-sm text-gray-600 hidden sm:inline">Super Admin</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                SA
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filter Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search blogs by title, author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              <LuFilter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="flex flex-col sm:flex-row gap-4 mt-4 pt-4 border-t">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="pending_approval">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-6">
          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">All Blogs</h2>
            <span className="text-sm text-gray-600">
              {filteredBlogs.length} blog{filteredBlogs.length !== 1 ? "s" : ""} found
            </span>
          </div>

          {blogsLoading ? (
            <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading blogs...</p>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
              <LuSearch className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                No blogs found
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredBlogs.map((blog) => (
                <BlogCard
                  key={blog._id}
                  blog={blog}
                  onView={handleViewBlog}
                  onEdit={handleEditBlog}
                  onApprove={handleApproveBlog}
                  onReject={handleRejectBlog}
                  onDelete={handleDeleteBlog}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Blog View Modal */}
      {isModalOpen && selectedBlog && (
        <BlogViewModal
          blog={selectedBlog}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onEdit={handleEditFromModal}
          onApprove={handleApproveFromModal}
          onReject={handleRejectFromModal}
          approveLoading={approveLoading}
        />
      )}
    </div>
  );
};

export default BlogContentManagement;