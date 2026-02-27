import React, { useState, useEffect } from "react";
import {
  FiSave,
  FiFileText,
  FiImage,
  FiFolder,
  FiX,
  FiPlus,
  FiEye,
  FiUser,
  FiAlertCircle,
  FiArrowLeft,
  FiTag,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  createBlog,
  clearError,
  resetCreateState,
} from "../../../features/slices/blogSlice";
import { uploadEditorImagesAndReplace } from "../../../utils/uploadEditorImagesAndReplace";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import TipTapEditor from "../../TextEditor/TipTapEditor";
import BlogPreviewModal from "../../Modal/BlogPreviewModal";
import {
  getEffectiveUser,
  decodeTokenPayload,
} from "../../../utils/authHelper";

const CreateBlogPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { createLoading, error } = useSelector((state) => state.blogs);
  const [showPreview, setShowPreview] = useState(false);

  // Redux user
  const user = useSelector((state) => state.auth?.user);

  // Get user object from Redux/session/localStorage
  const effectiveUser = getEffectiveUser(user);

  // Get raw token from storage
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");

  // Decode token payload
  const getUserFromToken = () => {
    if (user && Object.keys(user).length > 0) {
      return {
        id: user._id,
        role: user.role,
        name: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
      };
    }

    if (effectiveUser && effectiveUser._id) {
      return {
        id: effectiveUser._id,
        role: effectiveUser.role,
        name: `${effectiveUser.first_name} ${effectiveUser.last_name}`.trim(),
        email: effectiveUser.email,
      };
    }

    if (token) {
      const payload = decodeTokenPayload(token);
      if (payload) {
        return {
          id: payload.staffId,
          role: payload.role,
          name: payload.staffName || "",
          email: payload.email || "",
        };
      }
    }

    return null;
  };

  const currentUser = getUserFromToken();
  console.log("Current User", currentUser);

  const [formData, setFormData] = useState({
    // Author Information (Auto-filled from token)
    author_id: currentUser?.id || "",
    author: currentUser?.name || "",

    // Basic Content
    title: "",
    summary: "",
    sub_title: "",
    content: "",

    // URL & SEO
    slug: "",
    blog_url: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: [],
    image_alt_text: "",

    // Featured Image
    featured_image: {
      url: "",
      alt: "",
      public_id: null,
      file: null,
    },

    // Sections (for multi-section blogs)
    sections: [],

    // Categorization
    categories: [],
    tags: [],

    // Publishing
    status: "draft", // Will be changed to 'pending_approval' on save
    published_at: "",

    // Analytics (read-only, set by backend)
    view_count: 0,
    seo_score: 0,
  });

  console.log("Form Data", formData);

  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [newSection, setNewSection] = useState({
    sub_title: "",
    body: "",
    image: { url: "", alt: "", file: null },
  });

  useEffect(() => {
    dispatch(clearError());

    // Check if user is authenticated
    if (!currentUser || !currentUser.id) {
      Swal.fire({
        icon: "error",
        title: "Authentication Required",
        text: "Please log in to create a blog post",
      }).then(() => {
        navigate("/login");
      });
    }

    return () => {
      dispatch(resetCreateState());
    };
  }, [dispatch, currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e, imageType = "featured_image") => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        Swal.fire({
          icon: "error",
          title: "Invalid File Type",
          text: "Please upload a JPEG or PNG image",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          text: "Image must be less than 5MB",
        });
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        [imageType]: {
          url: imageUrl,
          alt: prev[imageType]?.alt || "",
          public_id: null,
          file: file,
        },
      }));
    }
  };

  const removeImage = (imageType = "featured_image") => {
    if (formData[imageType]?.url) {
      URL.revokeObjectURL(formData[imageType].url);
    }
    setFormData((prev) => ({
      ...prev,
      [imageType]: { url: "", alt: "", public_id: null, file: null },
    }));
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    const slug = generateSlug(title);
    const blogUrl = `${window.location.origin}/blog-and-articles/${slug}`;

    setFormData((prev) => ({
      ...prev,
      title: title,
      meta_title: title, // Auto-fill meta title
      slug,
      blog_url: blogUrl,
    }));
  };

  // Categories Management
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

  const removeCategory = (categoryToRemove) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((cat) => cat !== categoryToRemove),
    }));
  };

  // Tags Management
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Keywords Management
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

  const removeKeyword = (keywordToRemove) => {
    setFormData((prev) => ({
      ...prev,
      meta_keywords: prev.meta_keywords.filter(
        (keyword) => keyword !== keywordToRemove
      ),
    }));
  };

  // Sections Management
  const addSection = () => {
    if (newSection.sub_title.trim() && newSection.body.trim()) {
      setFormData((prev) => ({
        ...prev,
        sections: [...prev.sections, { ...newSection }],
      }));
      setNewSection({
        sub_title: "",
        body: "",
        image: { url: "", alt: "", file: null },
      });
    } else {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Section",
        text: "Please fill in both subtitle and body for the section",
      });
    }
  };

  const removeSection = (index) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  };

  const handleSaveBlog = async (saveAsDraft = false) => {
    dispatch(clearError());

    // Validation
    const requiredFields = {
      author_id: "Author ID",
      author: "Author Name",
      title: "Title",
      content: "Blog Content",
      categories: "Category",
      meta_title: "Meta Title",
      meta_description: "Meta Description",
      image_alt_text: "Image Alt Text",
      slug: "Slug",
      blog_url: "Blog URL",
    };

    const missingFields = Object.entries(requiredFields)
      .filter(
        ([field]) =>
          !formData[field] ||
          (Array.isArray(formData[field]) && formData[field].length === 0)
      )
      .map(([_, name]) => name);

    if (missingFields.length > 0) {
      Swal.fire({
        title: "Validation Error",
        html: `The following fields are required:<br/><strong>${missingFields.join(
          ", "
        )}</strong>`,
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    // Featured image validation
    if (!formData.featured_image.file) {
      Swal.fire({
        icon: "error",
        title: "Featured Image Required",
        text: "Please upload a featured image for the blog",
      });
      return;
    }

    try {
      Swal.fire({
        title: saveAsDraft ? "Saving Draft..." : "Submitting for Approval...",
        text: "Please wait while the blog is being saved.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Upload embedded editor images to Cloudinary
      const updatedContent = await uploadEditorImagesAndReplace(
        formData.content
      );

      // Prepare FormData
      const submitData = new FormData();

      // Author info (from token)
      submitData.append("author_id", formData.author_id);
      submitData.append("author", formData.author);

      // Basic content
      submitData.append("title", formData.title);
      submitData.append("summary", formData.summary || "");
      submitData.append("sub_title", formData.sub_title || "");
      submitData.append("content", updatedContent);

      // URL & SEO
      submitData.append("slug", formData.slug);
      submitData.append("blog_url", formData.blog_url);
      submitData.append("meta_title", formData.meta_title);
      submitData.append("meta_description", formData.meta_description);
      submitData.append("image_alt_text", formData.image_alt_text);

      // Status - if saving as draft, keep draft, otherwise pending_approval
      const status = saveAsDraft ? "draft" : "pending_approval";
      submitData.append("status", status);

      if (formData.published_at) {
        submitData.append("published_at", formData.published_at);
      }

      // Arrays
      submitData.append("categories", JSON.stringify(formData.categories));
      submitData.append("tags", JSON.stringify(formData.tags));
      submitData.append(
        "meta_keywords",
        JSON.stringify(formData.meta_keywords)
      );
      submitData.append("sections", JSON.stringify(formData.sections));

      // Featured Image
      if (formData.featured_image.file) {
        submitData.append("featured_image", formData.featured_image.file);
        submitData.append(
          "featured_image_alt",
          formData.featured_image.alt || formData.image_alt_text
        );
      }

      const result = await dispatch(
        createBlog({ formData: submitData })
      ).unwrap();

      Swal.close();

      await Swal.fire({
        title: "Success!",
        html: saveAsDraft
          ? "Blog saved as draft successfully!"
          : "Blog submitted for approval!<br/><small>A SuperAdmin will review your blog before it gets published.</small>",
        icon: "success",
        timer: 3000,
        showConfirmButton: true,
      });

      navigate("/blog-and-articles");
    } catch (err) {
      Swal.close();
      console.error("Failed to create blog:", err);
      Swal.fire({
        title: "Error!",
        text: err || "Failed to create blog. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleMoveBack = () => {
    navigate("/blog-and-articles");
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BlogPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        blogData={formData}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            <div className="flex items-center space-x-3 flex-shrink-0">
              <FiFileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                  Create New Blog Post
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Creating as:{" "}
                  <span className="font-medium text-gray-700">
                    {formData.author || "Unknown"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2 sm:gap-3 justify-end">
              <div className="flex flex-col md:flex-row gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handleMoveBack}
                  className="flex items-center justify-center space-x-2 px-4 sm:px-5 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm whitespace-nowrap flex-1 xs:flex-none"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handlePreview}
                  className="flex items-center justify-center space-x-2 px-4 sm:px-5 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm whitespace-nowrap flex-1 xs:flex-none"
                >
                  <FiEye className="w-4 h-4" />
                  <span>Preview</span>
                </button>
              </div>

              <div className="flex flex-col md:flex-row  gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => handleSaveBlog(true)}
                  disabled={createLoading}
                  className="flex items-center justify-center space-x-2 px-4 sm:px-5 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50 text-sm whitespace-nowrap flex-1 xs:flex-none"
                >
                  <FiSave className="w-4 h-4" />
                  <span>Save Draft</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveBlog(false)}
                  disabled={createLoading}
                  className="flex items-center justify-center space-x-2 px-4 sm:px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm whitespace-nowrap flex-1 xs:flex-none"
                >
                  <FiSave className="w-4 h-4" />
                  <span>
                    {createLoading ? "Submitting..." : "Submit for Approval"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 sm:mb-6 flex items-start">
            <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Main Content - 3 columns */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center mb-4 sm:mb-6">
                <FiFileText className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600" />
                Basic Information
              </h2>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blog Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="Enter blog title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Summary (Brief overview)
                  </label>
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="A brief summary of your blog post"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle (Optional tagline)
                  </label>
                  <input
                    type="text"
                    name="sub_title"
                    value={formData.sub_title}
                    onChange={handleInputChange}
                    placeholder="Enter subtitle or tagline"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Blog Content Editor */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center mb-4 sm:mb-6">
                <FiFileText className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600" />
                Blog Content <span className="text-red-500 ml-1">*</span>
              </h2>
              <TipTapEditor
                content={formData.content}
                onChange={(content) =>
                  setFormData((prev) => ({ ...prev, content }))
                }
                placeholder="Write your main blog content here..."
              />
            </div>

            {/* Featured Image Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center mb-4 sm:mb-6">
                <FiImage className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600" />
                Featured Image <span className="text-red-500 ml-1">*</span>
              </h2>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Image (JPEG/PNG, max 5MB)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => handleImageChange(e, "featured_image")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {formData.featured_image.url && (
                  <div className="space-y-3">
                    <div className="relative">
                      <img
                        src={formData.featured_image.url}
                        alt="Featured image preview"
                        className="w-full h-48 sm:h-64 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage("featured_image")}
                        className="absolute cursor-pointer top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 shadow-lg"
                      >
                        <FiX className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>

                    {/* Image Alt Text */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image Alt Text <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="image_alt_text"
                        value={formData.image_alt_text}
                        onChange={handleInputChange}
                        placeholder="General alt text for blog images"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Default alt text for images
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-4 sm:space-y-6">
            {/* Author Info (Read-only from token) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center mb-3 sm:mb-4">
                <FiUser className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600" />
                Author Details
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="bg-gray-50 p-2 sm:p-3 rounded-md">
                  <p className="text-xs text-gray-500">Author ID</p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {formData.author_id || "Not logged in"}
                  </p>
                </div>
                <div className="bg-gray-50 p-2 sm:p-3 rounded-md">
                  <p className="text-xs text-gray-500">Author Name</p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {formData.author || "Unknown"}
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-2 sm:p-3 rounded-md">
                  <p className="text-xs text-blue-700">
                    <FiAlertCircle className="inline w-3 h-3 mr-1" />
                    Author info is auto-filled from your login session
                  </p>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center mb-3 sm:mb-4">
                <FiFolder className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
                Categories <span className="text-red-500 ml-1">*</span>
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addCategory())
                    }
                    placeholder="Add category"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={addCategory}
                    className="px-3 py-2 cursor-pointer bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.categories.map((category, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                    >
                      {category}
                      <button
                        type="button"
                        onClick={() => removeCategory(category)}
                        className="ml-1 cursor-pointer hover:text-green-900"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center mb-3 sm:mb-4">
                <FiTag className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-600" />
                Tags
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                    placeholder="Add tag"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 cursor-pointer bg-orange-600 text-white rounded-md hover:bg-orange-700"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 cursor-pointer hover:text-orange-900"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center mb-3 sm:mb-4">
                <FiEye className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
                SEO Settings
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title <span className="text-red-500">*</span> (max 60
                    characters)
                  </label>
                  <input
                    type="text"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleInputChange}
                    maxLength={60}
                    placeholder="Enter SEO-friendly title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                  <p
                    className={`text-xs mt-1 ${
                      formData.meta_title.length > 60
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.meta_title.length}/60 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description <span className="text-red-500">*</span>{" "}
                    (max 160 characters)
                  </label>
                  <textarea
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleInputChange}
                    maxLength={160}
                    rows={3}
                    placeholder="Brief description for search engines"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                  <p
                    className={`text-xs mt-1 ${
                      formData.meta_description.length > 160
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.meta_description.length}/160 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blog URL
                  </label>
                  <input
                    type="text"
                    name="blog_url"
                    value={formData.blog_url}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-generated from title
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="url-friendly-slug"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-generated, can be edited
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Keywords
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addKeyword())
                      }
                      placeholder="Add keyword"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={addKeyword}
                      className="px-3 py-2 cursor-pointer bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.meta_keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="ml-1 cursor-pointer hover:text-purple-900"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Publishing Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center mb-3 sm:mb-4">
                <FiFileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                Publishing
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 p-3 sm:p-4 rounded-md">
                  <p className="text-sm text-yellow-800 font-medium mb-2">
                    Content Moderation Workflow
                  </p>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>
                      • <strong>Save Draft:</strong> Save without submitting
                    </li>
                    <li>
                      • <strong>Submit for Approval:</strong> Send to SuperAdmin
                      for review
                    </li>
                    <li>
                      • <strong>SuperAdmin:</strong> Will approve or reject your
                      blog
                    </li>
                    <li>
                      • <strong>Published:</strong> Blog goes live after
                      approval
                    </li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Status
                  </label>
                  <div className="bg-gray-100 px-3 py-2 rounded-md">
                    <span className="text-sm font-medium text-gray-700">
                      {formData.status === "draft"
                        ? "Draft"
                        : "Pending Approval"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publish Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="published_at"
                    value={formData.published_at}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to publish immediately after approval
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBlogPage;
