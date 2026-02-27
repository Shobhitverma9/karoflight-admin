import React, { useState, useEffect } from "react";
import { 
  FaTimes, 
  FaImage, 
  FaTag, 
  FaFolder, 
  FaEye,
  FaUser,
  FaSave,
  FaCalendar
} from "react-icons/fa";
import TipTapEditor from "../TextEditor/TipTapEditor";
import Swal from "sweetalert2";

export default function BlogEditModal({ isOpen, onClose, blog, onSave }) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author_name: "",
    author_id: "",
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
  const [activeTab, setActiveTab] = useState("content"); // content, seo, settings

  // Pre-fill form when blog changes
  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || blog.meta_title || "",
        content: blog.content || "",
        author_name: blog.author_name || blog.author || "",
        author_id: blog.author_id || "",
        featured_image: blog.featured_image || { url: "", alt: "", file: null },
        categories: blog.categories || [],
        meta_title: blog.meta_title || blog.title || "",
        meta_description: blog.meta_description || "",
        blog_url: blog.blog_url || "",
        slug: blog.slug || "",
        meta_keywords: blog.meta_keywords || [],
        image_alt_text: blog.image_alt_text || "",
        status: blog.status || "draft",
        published_at: blog.published_at || "",
      });
      
      // Set image preview if exists
      if (blog.featured_image?.url) {
        setImagePreview(blog.featured_image.url);
      }
    }
  }, [blog]);

  if (!isOpen || !blog) return null;

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
      setImagePreview(imageUrl);
      setFormData(prev => ({
        ...prev,
        featured_image: {
          ...prev.featured_image,
          file: file,
          url: imageUrl
        }
      }));
    }
  };

  const removeImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview("");
    setFormData(prev => ({
      ...prev,
      featured_image: { url: "", alt: "", file: null }
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

  const handleMetaTitleChange = (e) => {
    const title = e.target.value;
    const slug = generateSlug(title);
    const blogUrl = `${window.location.origin}/blog/${slug}`;
    
    setFormData(prev => ({ 
      ...prev, 
      meta_title: title,
      title: title, // Also update main title
      slug,
      blog_url: blogUrl
    }));
  };

  // Categories Management
  const addCategory = () => {
    if (newCategory.trim() && !formData.categories.includes(newCategory.trim())) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()]
      }));
      setNewCategory("");
    }
  };

  const removeCategory = (categoryToRemove) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat !== categoryToRemove)
    }));
  };

  // Keywords Management
  const addKeyword = () => {
    if (newKeyword.trim() && !formData.meta_keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        meta_keywords: [...prev.meta_keywords, newKeyword.trim()]
      }));
      setNewKeyword("");
    }
  };

  const removeKeyword = (keywordToRemove) => {
    setFormData(prev => ({
      ...prev,
      meta_keywords: prev.meta_keywords.filter(keyword => keyword !== keywordToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.content) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Title and Content are required!",
      });
      return;
    }

    if (formData.categories.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "At least one category is required!",
      });
      return;
    }

    try {
      // Create FormData if there's a new image file
      let submitData;
      
      if (formData.featured_image.file) {
        submitData = new FormData();
        
        // Append all fields
        Object.keys(formData).forEach(key => {
          if (key !== 'featured_image') {
            if (Array.isArray(formData[key])) {
              submitData.append(key, JSON.stringify(formData[key]));
            } else {
              submitData.append(key, formData[key] || "");
            }
          }
        });

        // Append image
        submitData.append('featured_image', formData.featured_image.file);
        submitData.append('featured_image_alt', formData.featured_image.alt || formData.image_alt_text);
      } else {
        // No new image, send JSON
        submitData = {
          ...formData,
          featured_image: blog.featured_image // Keep existing image
        };
      }

      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error("Error saving blog:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save blog. Please try again.",
      });
    }
  };

  const tabs = [
    { id: "content", label: "Content", icon: FaEye },
    { id: "seo", label: "SEO & Meta", icon: FaTag },
    { id: "settings", label: "Settings", icon: FaFolder },
  ];

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center space-x-3">
            <FaEye className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-bold">Edit Blog Post</h2>
              <p className="text-blue-100 text-sm">Update your blog content and settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-600 hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-gray-50 border-b border-gray-200 px-6">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600 bg-white"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(95vh-200px)]">
          <div className="p-6 space-y-6">
            {/* Content Tab */}
            {activeTab === "content" && (
              <div className="space-y-6">
                {/* Title */}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
                    required
                  />
                </div>

                {/* Blog Content Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blog Content <span className="text-red-500">*</span>
                  </label>
                  <TipTapEditor
                    content={formData.content}
                    onChange={handleContentChange}
                    placeholder="Write your blog content here..."
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
                          className="w-full h-64 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 shadow-lg"
                        >
                          <FaTimes className="w-4 h-4" />
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
                          value={formData.featured_image.alt}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            featured_image: { ...prev.featured_image, alt: e.target.value }
                          }))}
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
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                      placeholder="Add category"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={addCategory}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.categories.map((category, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {category}
                        <button
                          type="button"
                          onClick={() => removeCategory(category)}
                          className="ml-2 hover:text-green-900"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === "seo" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title <span className="text-red-500">*</span> (max 60 characters)
                  </label>
                  <input
                    type="text"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleMetaTitleChange}
                    maxLength={60}
                    placeholder="SEO-friendly title"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className={`text-xs mt-1 ${formData.meta_title.length > 60 ? 'text-red-500' : 'text-gray-500'}`}>
                    {formData.meta_title.length}/60 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description <span className="text-red-500">*</span> (max 160 characters)
                  </label>
                  <textarea
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleChange}
                    maxLength={160}
                    rows={3}
                    placeholder="Brief description for search engines"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className={`text-xs mt-1 ${formData.meta_description.length > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                    {formData.meta_description.length}/160 characters
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-generated from meta title, can be edited
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                    readOnly
                  />
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
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                      placeholder="Add keyword"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={addKeyword}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.meta_keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="ml-2 hover:text-purple-900"
                        >
                          <FaTimes className="w-3 h-3" />
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
                    placeholder="General alt text for blog images"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author Name
                    </label>
                    <input
                      type="text"
                      name="author_name"
                      value={formData.author_name}
                      onChange={handleChange}
                      placeholder="Enter author name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author ID
                    </label>
                    <input
                      type="text"
                      name="author_id"
                      value={formData.author_id}
                      onChange={handleChange}
                      placeholder="Author ID"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                {formData.status === "published" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Published Date
                    </label>
                    <input
                      type="datetime-local"
                      name="published_at"
                      value={formData.published_at ? new Date(formData.published_at).toISOString().slice(0, 16) : ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer with Actions */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <FaSave className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}