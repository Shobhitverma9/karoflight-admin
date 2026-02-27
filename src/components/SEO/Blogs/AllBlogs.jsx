import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogs, deleteBlog } from "../../../features/slices/blogSlice";
import {
  FaTrash,
  FaEdit,
  FaPlus,
  FaEye,
  FaSyncAlt,
  FaComment,
  FaSearch,
  FaFilter,
  FaCalendar,
  FaUser,
  FaTag,
  FaThLarge,
  FaList,
  FaSort,
  FaExclamationCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import BlogViewModal from "../../Modal/BlogViewModal";

const BlogListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: blogs, loading, error } = useSelector((state) => state.blogs);

  // Modal states
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Filter, search, sort, pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 9;

  useEffect(() => {
    // Fetch all blogs including rejected ones with their rejection reasons
    dispatch(fetchBlogs());
  }, [dispatch]);

  // Helper function to parse categories
  const parseCategories = (categories) => {
    if (!categories) return [];
    
    // If it's already an array, return it
    if (Array.isArray(categories)) {
      return categories.map(cat => {
        if (typeof cat === 'string') return cat;
        return cat.name || cat.title || 'Category';
      });
    }
    
    // If it's a string that looks like JSON, parse it
    if (typeof categories === 'string') {
      try {
        const parsed = JSON.parse(categories);
        if (Array.isArray(parsed)) {
          return parsed.map(cat => {
            if (typeof cat === 'string') return cat;
            return cat.name || cat.title || 'Category';
          });
        }
        return [categories];
      } catch (e) {
        // If parsing fails, treat it as a single category
        return [categories];
      }
    }
    
    return [];
  };

  const filteredAndSortedBlogs = blogs
    .filter((blog) => {
      const matchesSearch =
        blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.meta_title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || blog.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      if (sortBy === "created_at" || sortBy === "updated_at") {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }
      return sortOrder === "asc"
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
        ? 1
        : -1;
    })
    .map(blog => ({
      ...blog,
      categories: parseCategories(blog.categories)
    }));

  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredAndSortedBlogs.slice(
    indexOfFirstBlog,
    indexOfLastBlog
  );
  const totalPages = Math.ceil(filteredAndSortedBlogs.length / blogsPerPage);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: "Delete Blog?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed) {
      try {
        await dispatch(deleteBlog(id)).unwrap();
        Swal.fire("Deleted!", "The blog has been deleted.", "success");
      } catch (err) {
        Swal.fire("Error!", err || "Failed to delete blog.", "error");
      }
    }
  };

  const handleEdit = (blog, e) => {
    e.stopPropagation();
    navigate(`/blog-and-articles/${blog._id}/edit`);
  };

  const handleView = (blog, e) => {
    if (e) e.stopPropagation();
    setSelectedBlog(blog);
    setIsViewOpen(true);
  };

  const handleRefresh = async () => {
    const loadingSwal = Swal.fire({
      title: "Refreshing blogs...",
      text: "Please wait",
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
    });
    try {
      await dispatch(fetchBlogs()).unwrap();
      loadingSwal.close();
      Swal.fire({
        title: "Success!",
        text: "Blogs refreshed successfully",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      loadingSwal.close();
      Swal.fire("Error!", err || "Failed to refresh blogs", "error");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      published: "bg-green-100 text-green-800 border-green-200",
      draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
      archived: "bg-gray-100 text-gray-800 border-gray-200",
      pending_approval: "bg-blue-100 text-blue-800 border-blue-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };
    return styles[status] || styles.draft;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortBy("created_at");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const BlogCard = ({ blog, onClick }) => (
    <div
      className="bg-white border rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={() => onClick(blog)}
    >
      <div className="relative overflow-hidden">
        {blog.featured_image?.url ? (
          <img
            src={blog.featured_image.url}
            alt={blog.image_alt_text || blog.title}
            className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-48 w-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <FaEdit className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(
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
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {blog.meta_title || blog.title || "Untitled"}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-3">
            {blog.meta_description ||
              blog.excerpt ||
              "No description available"}
          </p>
        </div>

        {/* Rejection Reason Display - Fetched from database */}
        {blog.status === "rejected" && blog.rejection_reason && (
          <div className="mb-3 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <FaExclamationCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-red-800 mb-1">
                  Rejection Reason:
                </p>
                <p className="text-xs text-red-700 line-clamp-2">
                  {blog.rejection_reason}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between text-xs text-gray-500 mb-3 sm:mb-4 gap-2">
          <div className="flex items-center flex-wrap gap-2 xs:gap-3">
            <div className="flex items-center">
              <FaUser className="w-3 h-3 mr-1" />
              <span className="truncate max-w-[100px]">{blog.author || blog.author_name || "Anonymous"}</span>
            </div>
            <div className="flex items-center">
              <FaCalendar className="w-3 h-3 mr-1" />
              {formatDate(blog.created_at)}
            </div>
          </div>
          {blog.view_count !== undefined && (
            <div className="flex items-center">
              <FaEye className="w-3 h-3 mr-1" />
              {blog.view_count} views
            </div>
          )}
        </div>
        {blog.categories?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3 sm:mb-4">
            {blog.categories.slice(0, 3).map((cat, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
              >
                <FaTag className="w-2 h-2 mr-1" />
                <span className="truncate max-w-[80px]">{cat}</span>
              </span>
            ))}
            {blog.categories.length > 3 && (
              <span className="text-xs text-gray-500">
                +{blog.categories.length - 3} more
              </span>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 xs:flex xs:items-center xs:justify-between gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={(e) => handleView(blog, e)}
            className="flex items-center justify-center space-x-1 text-green-600 hover:text-green-800 hover:bg-green-50 px-2 py-1.5 sm:py-1 rounded-md transition-colors text-xs sm:text-sm"
          >
            <FaEye className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>View</span>
          </button>
          <button
            onClick={(e) => handleEdit(blog, e)}
            className="flex items-center justify-center space-x-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1.5 sm:py-1 rounded-md transition-colors text-xs sm:text-sm"
          >
            <FaEdit className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={(e) => handleDelete(blog._id, e)}
            className="flex items-center justify-center space-x-1 text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1.5 sm:py-1 rounded-md transition-colors text-xs sm:text-sm"
          >
            <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Delete</span>
          </button>
          <button className="flex items-center justify-center space-x-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-2 py-1.5 sm:py-1 rounded-md transition-colors text-xs sm:text-sm">
            <FaComment className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{blog.comments?.length || 0}</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Enhanced BlogListItem Component for List View
  const BlogListItem = ({ blog }) => (
    <div
      className="bg-white border rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={() => handleView(blog)}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Featured Image Section */}
        <div className="relative w-full sm:w-48 md:w-64 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
          {blog.featured_image?.url ? (
            <img
              src={blog.featured_image.url}
              alt={blog.image_alt_text || blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <FaEdit className="w-12 h-12 text-gray-400" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-sm ${getStatusBadge(
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

        {/* Content Section */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex-grow">
            {/* Title */}
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {blog.meta_title || blog.title || "Untitled"}
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
              {blog.meta_description ||
                blog.excerpt ||
                "No description available"}
            </p>

            {/* Rejection Reason in List View - Fetched from database */}
            {blog.status === "rejected" && blog.rejection_reason && (
              <div className="mb-3 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <FaExclamationCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-red-800 mb-1">
                      Rejection Reason (by Super Admin):
                    </p>
                    <p className="text-xs sm:text-sm text-red-700">
                      {blog.rejection_reason}
                    </p>
                    {blog.approved_at && (
                      <p className="text-xs text-red-600 mt-1">
                        Rejected on: {formatDate(blog.approved_at)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Categories */}
            {blog.categories?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {blog.categories.slice(0, 4).map((cat, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                  >
                    <FaTag className="w-2 h-2 mr-1" />
                    <span className="truncate max-w-[100px]">{cat}</span>
                  </span>
                ))}
                {blog.categories.length > 4 && (
                  <span className="text-xs text-gray-500 px-2 py-1">
                    +{blog.categories.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Meta Information Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-gray-100">
            {/* Left side - Author, Date, Views, Comments */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
              <div className="flex items-center">
                <FaUser className="w-3 h-3 mr-1" />
                <span className="truncate max-w-[120px]">{blog.author || blog.author_name || "Anonymous"}</span>
              </div>
              <div className="flex items-center">
                <FaCalendar className="w-3 h-3 mr-1" />
                <span>{formatDate(blog.created_at || blog.published_at)}</span>
              </div>
              {blog.view_count !== undefined && (
                <div className="flex items-center">
                  <FaEye className="w-3 h-3 mr-1" />
                  <span>{blog.view_count} views</span>
                </div>
              )}
              <div className="flex items-center">
                <FaComment className="w-3 h-3 mr-1" />
                <span>{blog.comments?.length || 0} comments</span>
              </div>
            </div>

            {/* Right side - Action Buttons */}
            <div className="grid grid-cols-3 sm:flex sm:items-center gap-1 sm:gap-2">
              <button
                onClick={(e) => handleView(blog, e)}
                className="flex items-center justify-center space-x-1 text-green-600 hover:text-green-800 hover:bg-green-50 px-2 sm:px-3 py-1.5 rounded-md transition-colors text-xs sm:text-sm"
                title="View Details"
              >
                <FaEye className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-medium">View</span>
              </button>
              <button
                onClick={(e) => handleEdit(blog, e)}
                className="flex items-center justify-center space-x-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 sm:px-3 py-1.5 rounded-md transition-colors text-xs sm:text-sm"
                title="Edit Blog"
              >
                <FaEdit className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-medium">Edit</span>
              </button>
              <button
                onClick={(e) => handleDelete(blog._id, e)}
                className="flex items-center justify-center space-x-1 text-red-600 hover:text-red-800 hover:bg-red-50 px-2 sm:px-3 py-1.5 rounded-md transition-colors text-xs sm:text-sm"
                title="Delete Blog"
              >
                <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-medium">Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Blog Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Manage your blog posts ({filteredAndSortedBlogs.length}{" "}
                {filteredAndSortedBlogs.length === 1 ? "blog" : "blogs"})
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm"
              >
                <FaSyncAlt
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>

              <button
                onClick={() => navigate("/blog-and-articles/add")}
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <FaPlus className="w-4 h-4" />
                <span>Add New Blog</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 lg:max-w-md">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center space-x-2">
                <FaFilter className="text-gray-500 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="pending_approval">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <FaSort className="text-gray-500 w-4 h-4" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="created_at">Created Date</option>
                  <option value="updated_at">Updated Date</option>
                  <option value="title">Title</option>
                  <option value="author">Author</option>
                </select>
              </div>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>

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
                  <FaList className="w-4 h-4" />
                </button>
              </div>

              {(searchTerm ||
                statusFilter !== "all" ||
                sortBy !== "created_at" ||
                sortOrder !== "desc") && (
                <button
                  onClick={resetFilters}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-center">
              <FaSyncAlt className="animate-spin w-6 h-6 text-blue-600 mr-3" />
              <span className="text-sm sm:text-base text-gray-600">Loading blogs...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 sm:mb-6">
            <p className="text-sm sm:text-base text-red-600">Error: {error}</p>
          </div>
        )}

        {/* Blog Content */}
        {!loading && (
          <>
            {/* Grid/List View */}
            {viewMode === "grid" ? (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3">
                {currentBlogs.map((blog) => (
                  <BlogCard key={blog._id} blog={blog} onClick={handleView} />
                ))}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {currentBlogs.map((blog) => (
                  <BlogListItem key={blog._id} blog={blog} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {filteredAndSortedBlogs.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
                <FaEdit className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  No blogs found
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Get started by creating your first blog post"}
                </p>
                <button
                  onClick={() => navigate("/blog-and-articles/add")}
                  className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  <FaPlus className="w-4 h-4" />
                  <span>Create Your First Blog</span>
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mt-4 sm:mt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                  <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
                    Showing {indexOfFirstBlog + 1} to{" "}
                    {Math.min(indexOfLastBlog, filteredAndSortedBlogs.length)}{" "}
                    of {filteredAndSortedBlogs.length} results
                  </div>

                  <div className="flex items-center space-x-1 sm:space-x-2 order-1 sm:order-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>

                    <div className="flex items-center space-x-1">
                      {Array.from(
                        { length: Math.min(totalPages, 5) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg ${
                                currentPage === pageNum
                                  ? "bg-blue-600 text-white"
                                  : "border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {isViewOpen && (
        <BlogViewModal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          blog={selectedBlog}
        />
      )}
    </div>
  );
};

export default BlogListPage;