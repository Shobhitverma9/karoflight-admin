// components/Modal/BlogViewModal.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaTimes,
  FaUser,
  FaCalendar,
  FaTag,
  FaFolder,
  FaEye,
  FaComment,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaExclamationTriangle,
  FaEdit,
  FaCheck,
} from "react-icons/fa";
import {
  fetchComments,
  moderateComment,
  clearError,
  clearCommentSuccess,
  resetModeratingState,
} from "../../features/slices/blogSlice";
import { toast } from "react-hot-toast";
import "./BlogViewModal.css";

const API_BASE_URL = import.meta.env.VITE_RENDER_API_BASE_URL;

const BlogViewModal = ({
  isOpen,
  onClose,
  blog,
  onEdit,
  onApprove,
  onReject,
  approveLoading,
}) => {
  const dispatch = useDispatch();
  const [filter, setFilter] = useState("all");
  const [userDetailsCache, setUserDetailsCache] = useState({});
  const [loadingUsers, setLoadingUsers] = useState({});

  // Get auth token
  const getAuthToken = () => {
    return (
      sessionStorage.getItem("token") || sessionStorage.getItem("authToken")
    );
  };

  // Get comments from Redux store (from blogs slice)
  const {
    comments = [],
    commentsLoading: loading = false,
    moderating = false,
    commentError: error,
    commentSuccess: success,
  } = useSelector((state) => state.blogs || {});

  // Fetch user details by user ID
  const fetchUserDetails = async (userId) => {
    if (!userId || userDetailsCache[userId] || loadingUsers[userId]) {
      return userDetailsCache[userId] || null;
    }

    setLoadingUsers((prev) => ({ ...prev, [userId]: true }));

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userDetails = data.data || data.user || data;
        setUserDetailsCache((prev) => ({ ...prev, [userId]: userDetails }));
        return userDetails;
      }
    } catch (err) {
      console.error(`Failed to fetch user ${userId}:`, err);
    } finally {
      setLoadingUsers((prev) => ({ ...prev, [userId]: false }));
    }

    return null;
  };

  // Fetch all user details for comments
  useEffect(() => {
    if (comments && comments.length > 0) {
      comments.forEach((comment) => {
        const userId = comment.user_id || comment.userId || comment.user;
        if (userId && typeof userId === "string") {
          fetchUserDetails(userId);
        }
      });
    }
  }, [comments]);

  // Fetch comments when modal opens and reset moderating state
  useEffect(() => {
    if (isOpen && blog?._id) {
      dispatch(resetModeratingState());
      dispatch(fetchComments(blog._id));
    }
  }, [isOpen, blog?._id, dispatch]);

  // Handle success/error notifications
  useEffect(() => {
    if (success) {
      toast.success(success);
      dispatch(clearCommentSuccess());
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [success, error, dispatch]);

  if (!isOpen || !blog) return null;

  // Helper to check if URL is YouTube
  const isYouTubeUrl = (url) =>
    url && (url.includes("youtube.com") || url.includes("youtu.be"));

  // Convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return "";

    if (url.includes("youtu.be")) {
      const videoId = url.split("/").pop().split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes("youtube.com/watch")) {
      const params = new URLSearchParams(url.split("?")[1]);
      const videoId = params.get("v");
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "Not published";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusStyles = {
      published: "bg-green-100 text-green-800 border-green-200",
      draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
      archived: "bg-gray-100 text-gray-800 border-gray-200",
      pending_approval: "bg-blue-100 text-blue-800 border-blue-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };

    return statusStyles[status] || statusStyles.draft;
  };

  // Get user display info
  const getUserDisplayInfo = (comment) => {
    const userId = comment.user_id || comment.userId || comment.user;

    // Check if we have cached user details
    if (userId && userDetailsCache[userId]) {
      const user = userDetailsCache[userId];
      return {
        name: user.name || user.full_name || user.username || "User",
        email: user.email || "No email",
        isLoading: false,
      };
    }

    // Fallback to comment fields
    return {
      name:
        comment.authorName || comment.user_name || comment.name || "Anonymous",
      email:
        comment.authorEmail ||
        comment.user_email ||
        comment.email ||
        "No email",
      isLoading: loadingUsers[userId] || false,
    };
  };

  // Comment management functions
  const handleApproveComment = async (commentId) => {
    try {
      const token = getAuthToken();
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      const moderatorId = user._id || user.id;

      await dispatch(
        moderateComment({
          blogId: blog._id,
          commentId,
          action: "approve",
          moderator_id: moderatorId,
        })
      ).unwrap();
    } catch (err) {
      console.error("Failed to approve comment:", err);
      toast.error(err || "Failed to approve comment");
    }
  };

  const handleRejectComment = async (commentId) => {
    try {
      const token = getAuthToken();
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      const moderatorId = user._id || user.id;

      await dispatch(
        moderateComment({
          blogId: blog._id,
          commentId,
          action: "reject",
          moderator_id: moderatorId,
        })
      ).unwrap();
    } catch (err) {
      console.error("Failed to reject comment:", err);
      toast.error(err || "Failed to reject comment");
    }
  };

  // Get comment counts with safe array operations
  const totalComments = Array.isArray(comments) ? comments.length : 0;
  const approvedComments = Array.isArray(comments)
    ? comments.filter((c) => c.status === "approved").length
    : 0;
  const pendingComments = Array.isArray(comments)
    ? comments.filter((c) => c.status === "pending").length
    : 0;
  const rejectedComments = Array.isArray(comments)
    ? comments.filter((c) => c.status === "rejected").length
    : 0;

  // Filter comments based on selected filter
  const filteredComments = Array.isArray(comments)
    ? comments.filter((comment) => {
        if (filter === "all") return true;
        return comment.status === filter;
      })
    : [];

  // Get comment status badge
  const getCommentStatusBadge = (status) => {
    const styles = {
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
    return styles[status] || styles.pending;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 bg-opacity-70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close Button */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FaEye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Blog Details
              </h1>
              <p className="text-sm text-gray-500">View complete blog post</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            title="Close"
          >
            <FaTimes className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
          <div className="p-6 space-y-6">
            {/* Blog Header Info */}
            <div className="space-y-4">
              {/* Title and Status */}
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                  {blog.title || blog.meta_title || "Untitled Blog"}
                </h2>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
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

              {/* Rejection Reason Display */}
              {blog.status === "rejected" && blog.rejection_reason && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-red-900 mb-2">
                        Rejection Reason (by Super Admin)
                      </h3>
                      <p className="text-red-800 leading-relaxed">
                        {blog.rejection_reason}
                      </p>
                      {blog.approved_at && (
                        <p className="text-sm text-red-700 mt-2">
                          Rejected on: {formatDate(blog.approved_at)}
                        </p>
                      )}
                      {blog.approved_by && (
                        <p className="text-sm text-red-700">
                          Rejected by: Admin ID - {blog.approved_by}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FaUser className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">
                    {blog.author_name || blog.author || "Anonymous"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendar className="w-4 h-4 text-green-600" />
                  <span>
                    {formatDate(blog.published_at || blog.created_at)}
                  </span>
                </div>
                {blog.view_count !== undefined && (
                  <div className="flex items-center gap-2">
                    <FaEye className="w-4 h-4 text-gray-500" />
                    <span>{blog.view_count} views</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="w-4 h-4 text-green-600" />
                  <span>{approvedComments} approved</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaComment className="w-4 h-4 text-blue-600" />
                  <span>{totalComments} total comments</span>
                </div>
              </div>

              {/* Meta Description */}
              {blog.meta_description && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <p className="text-blue-900 italic">
                    {blog.meta_description}
                  </p>
                </div>
              )}

              {/* Excerpt */}
              {blog.excerpt && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                  <p className="text-green-900 italic">{blog.excerpt}</p>
                </div>
              )}
            </div>

            {/* Action Buttons for Rejected Blogs */}
            {blog.status === "rejected" && onEdit && onApprove && (
              <div className="flex gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={onEdit}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <FaEdit className="w-4 h-4" />
                  Edit Blog
                </button>
                <button
                  onClick={onApprove}
                  disabled={approveLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                >
                  <FaCheck className="w-4 h-4" />
                  {approveLoading ? "Approving..." : "Approve & Publish"}
                </button>
              </div>
            )}

            {/* Featured Image */}
            {blog.featured_image?.url && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Featured Image
                </h3>
                <div className="relative overflow-hidden rounded-lg shadow-md">
                  <img
                    src={blog.featured_image.url}
                    alt={
                      blog.featured_image.alt ||
                      blog.image_alt_text ||
                      blog.title
                    }
                    className="w-full h-80 object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {(blog.featured_image.alt || blog.image_alt_text) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <p className="text-white text-sm">
                        {blog.featured_image.alt || blog.image_alt_text}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Video Content */}
            {blog.video_url && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Video Content
                </h3>
                <div className="relative overflow-hidden rounded-lg shadow-md bg-black">
                  {isYouTubeUrl(blog.video_url) ? (
                    <iframe
                      width="100%"
                      height="400"
                      src={getYouTubeEmbedUrl(blog.video_url)}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-lg"
                    />
                  ) : (
                    <video
                      src={blog.video_url}
                      controls
                      className="w-full h-80 object-contain rounded-lg"
                      controlsList="nodownload"
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              </div>
            )}

            {/* Blog Content */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Content</h3>
              <style>{`
                    /* Base styles that work with editor styles */
                    .view-blog-content {
                      font-family: system-ui, -apple-system, sans-serif;
                      line-height: 1.6;
                      color: #374151;
                    }
                    
                    /* Heading spacing (sizes come from editor) */
                    .view-blog-content h1 {
                      font-weight: 700;
                      line-height: 1.2;
                      margin-top: 2rem;
                      margin-bottom: 1rem;
                    }
                    
                    .view-blog-content h2 {
                      font-weight: 700;
                      line-height: 1.3;
                      margin-top: 1.75rem;
                      margin-bottom: 0.875rem;
                    }
                    
                    .view-blog-content h3 {
                      font-weight: 600;
                      line-height: 1.4;
                      margin-top: 1.5rem;
                      margin-bottom: 0.75rem;
                    }
                    
                    .view-blog-content h4 {
                      font-weight: 600;
                      line-height: 1.4;
                      margin-top: 1.25rem;
                      margin-bottom: 0.625rem;
                    }
                    
                    .view-blog-content h5 {
                      font-weight: 600;
                      line-height: 1.5;
                      margin-top: 1rem;
                      margin-bottom: 0.5rem;
                    }
                    
                    .view-blog-content h6 {
                      font-weight: 600;
                      line-height: 1.5;
                      margin-top: 0.875rem;
                      margin-bottom: 0.5rem;
                    }
                    
                    /* Paragraph spacing */
                    .view-blog-content p {
                      margin-bottom: 1rem;
                      line-height: 1.8;
                    }
                    
                    /* Lists */
                    .view-blog-content ul,
                    .view-blog-content ol {
                      padding-left: 2rem;
                      margin-bottom: 1rem;
                    }
                    
                    .view-blog-content ul {
                      list-style-type: disc;
                    }
                    
                    .view-blog-content ol {
                      list-style-type: decimal;
                    }
                    
                    .view-blog-content li {
                      margin-bottom: 0.5rem;
                      line-height: 1.8;
                    }
                    
                    .view-blog-content li p {
                      margin-bottom: 0.25rem;
                    }
                    
                    /* Links */
                    .view-blog-content a {
                      color: #3b82f6;
                      text-decoration: underline;
                    }
                    
                    .view-blog-content a:hover {
                      color: #2563eb;
                    }
                    
                    /* Blockquotes */
                    .view-blog-content blockquote {
                      border-left: 4px solid #e5e7eb;
                      padding-left: 1.5rem;
                      margin: 1.5rem 0;
                      font-style: italic;
                      color: #6b7280;
                    }
                    
                    /* Code blocks */
                    .view-blog-content pre {
                      background-color: #1f2937;
                      color: #f9fafb;
                      padding: 1.25rem;
                      border-radius: 0.5rem;
                      overflow-x: auto;
                      margin: 1.5rem 0;
                      font-family: 'Courier New', Consolas, Monaco, monospace;
                    }
                    
                    .view-blog-content pre code {
                      background-color: transparent;
                      padding: 0;
                      color: inherit;
                      font-size: 0.875rem;
                    }
                    
                    /* Inline code */
                    .view-blog-content code {
                      background-color: #f3f4f6;
                      padding: 0.125rem 0.375rem;
                      border-radius: 0.25rem;
                      font-family: 'Courier New', Consolas, Monaco, monospace;
                      font-size: 0.9em;
                      color: #ef4444;
                    }
                    
                    /* Images - preserve all styles from editor */
                    .view-blog-content img {
                      max-width: 100%;
                      height: auto;
                    }
                    
                    /* Horizontal rule */
                    .view-blog-content hr {
                      border: none;
                      border-top: 2px solid #e5e7eb;
                      margin: 2rem 0;
                    }
                    
                    /* Tables */
                    .view-blog-content table {
                      width: 100%;
                      border-collapse: collapse;
                      margin: 1.5rem 0;
                    }
                    
                    .view-blog-content th,
                    .view-blog-content td {
                      border: 1px solid #e5e7eb;
                      padding: 0.75rem;
                      text-align: left;
                    }
                    
                    .view-blog-content th {
                      background-color: #f9fafb;
                      font-weight: 600;
                    }
                    
                    /* Text formatting */
                    .view-blog-content strong {
                      font-weight: 700;
                    }
                    
                    .view-blog-content em {
                      font-style: italic;
                    }
                    
                    .view-blog-content u {
                      text-decoration: underline;
                    }
                    
                    .view-blog-content s {
                      text-decoration: line-through;
                    }
                    
                    /* Subscript and Superscript */
                    .view-blog-content sub {
                      vertical-align: sub;
                      font-size: smaller;
                    }
                    
                    .view-blog-content sup {
                      vertical-align: super;
                      font-size: smaller;
                    }
                    
                    /* First and last element margins */
                    .view-blog-content > *:first-child {
                      margin-top: 0;
                    }
                    
                    .view-blog-content > *:last-child {
                      margin-bottom: 0;
                    }
                  `}</style>
              <div
                className="view-blog-content"
                style={{ minHeight: "200px" }}
                dangerouslySetInnerHTML={{
                  __html:
                    blog.content ||
                    '<p class="text-gray-500 italic">No content available.</p>',
                }}
              />
            </div>

            {/* Comments Management Section */}
            <div className="space-y-4 border-t-2 border-gray-300 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaComment className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">
                    Comments Management
                  </h3>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      filter === "all"
                        ? "bg-white text-blue-600 shadow"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    All ({totalComments})
                  </button>
                  <button
                    onClick={() => setFilter("pending")}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      filter === "pending"
                        ? "bg-white text-yellow-600 shadow"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Pending ({pendingComments})
                  </button>
                  <button
                    onClick={() => setFilter("approved")}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      filter === "approved"
                        ? "bg-white text-green-600 shadow"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Approved ({approvedComments})
                  </button>
                  <button
                    onClick={() => setFilter("rejected")}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      filter === "rejected"
                        ? "bg-white text-red-600 shadow"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Rejected ({rejectedComments})
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-gray-500">Loading comments...</p>
                </div>
              ) : (
                /* Comments List */
                <div className="space-y-3">
                  {filteredComments.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                      <FaComment className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No comments to display</p>
                    </div>
                  ) : (
                    filteredComments.map((comment) => {
                      const commentId = comment._id || comment.id;
                      const userInfo = getUserDisplayInfo(comment);

                      return (
                        <div
                          key={commentId}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <FaUser className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-semibold text-gray-900">
                                      {userInfo.isLoading ? (
                                        <span className="inline-block animate-pulse bg-gray-200 h-4 w-24 rounded"></span>
                                      ) : (
                                        userInfo.name
                                      )}
                                    </h4>
                                    <span
                                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getCommentStatusBadge(
                                        comment.status
                                      )}`}
                                    >
                                      {comment.status === "approved" && (
                                        <FaCheckCircle className="w-3 h-3 mr-1" />
                                      )}
                                      {comment.status === "rejected" && (
                                        <FaTimesCircle className="w-3 h-3 mr-1" />
                                      )}
                                      {comment.status === "pending" && (
                                        <FaClock className="w-3 h-3 mr-1" />
                                      )}
                                      {comment.status.charAt(0).toUpperCase() +
                                        comment.status.slice(1)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500">
                                    {userInfo.isLoading ? (
                                      <span className="inline-block animate-pulse bg-gray-200 h-3 w-32 rounded mt-1"></span>
                                    ) : (
                                      userInfo.email
                                    )}
                                  </p>
                                </div>
                              </div>
                              <p className="text-gray-700 pl-13 whitespace-pre-wrap">
                                {comment.content ||
                                  comment.comment ||
                                  comment.text ||
                                  "No content"}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500 pl-13">
                                <span className="flex items-center gap-1">
                                  <FaCalendar className="w-3 h-3" />
                                  {formatDate(
                                    comment.created_at || comment.createdAt
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            {comment.status === "pending" && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleApproveComment(commentId)
                                  }
                                  disabled={moderating}
                                  className={`px-4 py-2 bg-green-600 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2 ${
                                    moderating
                                      ? "opacity-50 cursor-not-allowed"
                                      : "hover:bg-green-700"
                                  }`}
                                >
                                  <FaCheckCircle className="w-4 h-4" />
                                  {moderating ? "Processing..." : "Approve"}
                                </button>
                                <button
                                  onClick={() => handleRejectComment(commentId)}
                                  disabled={moderating}
                                  className={`px-4 py-2 bg-red-600 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2 ${
                                    moderating
                                      ? "opacity-50 cursor-not-allowed"
                                      : "hover:bg-red-700"
                                  }`}
                                >
                                  <FaTimesCircle className="w-4 h-4" />
                                  {moderating ? "Processing..." : "Reject"}
                                </button>
                              </div>
                            )}
                            {comment.status === "approved" && (
                              <button
                                onClick={() => handleRejectComment(commentId)}
                                disabled={moderating}
                                className={`px-4 py-2 bg-red-600 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2 ${
                                  moderating
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-red-700"
                                }`}
                              >
                                <FaTimesCircle className="w-4 h-4" />
                                {moderating ? "Processing..." : "Reject"}
                              </button>
                            )}
                            {comment.status === "rejected" && (
                              <button
                                onClick={() => handleApproveComment(commentId)}
                                disabled={moderating}
                                className={`px-4 py-2 bg-green-600 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2 ${
                                  moderating
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-green-700"
                                }`}
                              >
                                <FaCheckCircle className="w-4 h-4" />
                                {moderating ? "Processing..." : "Approve"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Tags and Categories Section */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FaTag className="w-4 h-4 text-blue-600" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full hover:bg-blue-200 transition-colors duration-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {blog.categories && blog.categories.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FaFolder className="w-4 h-4 text-green-600" />
                    Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {blog.categories.map((category, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full hover:bg-green-200 transition-colors duration-200"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Meta Keywords */}
            {blog.meta_keywords && blog.meta_keywords.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Meta Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {blog.meta_keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* SEO Information */}
            {(blog.meta_title ||
              blog.meta_description ||
              blog.slug ||
              blog.blog_url) && (
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  SEO Information
                </h3>

                {blog.meta_title && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Title
                    </label>
                    <p className="text-gray-900 bg-white p-3 rounded border">
                      {blog.meta_title}
                    </p>
                  </div>
                )}

                {blog.meta_description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Description
                    </label>
                    <p className="text-gray-900 bg-white p-3 rounded border">
                      {blog.meta_description}
                    </p>
                  </div>
                )}

                {blog.slug && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug
                    </label>
                    <p className="text-gray-900 bg-white p-3 rounded border font-mono text-sm">
                      {blog.slug}
                    </p>
                  </div>
                )}

                {blog.blog_url && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blog URL
                    </label>
                    <a
                      href={blog.blog_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline bg-white p-3 rounded border block break-all"
                    >
                      {blog.blog_url}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Additional Information */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Blog ID:</span>
                  <p className="text-gray-600 font-mono bg-white px-2 py-1 rounded mt-1 text-xs">
                    {blog._id || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Author ID:</span>
                  <p className="text-gray-600 font-mono bg-white px-2 py-1 rounded mt-1 text-xs">
                    {blog.author_id || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <p className="text-gray-600 mt-1">
                    {formatDate(blog.created_at)}
                  </p>
                </div>
                {blog.updated_at && blog.updated_at !== blog.created_at && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Last Updated:
                    </span>
                    <p className="text-gray-600 mt-1">
                      {formatDate(blog.updated_at)}
                    </p>
                  </div>
                )}
                {blog.published_at && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Published:
                    </span>
                    <p className="text-gray-600 mt-1">
                      {formatDate(blog.published_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogViewModal;
