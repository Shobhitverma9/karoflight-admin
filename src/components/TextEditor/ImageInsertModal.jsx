import { useState } from "react";
import {
  FiAlignCenter,
  FiAlignLeft,
  FiAlignRight,
  FiImage,
  FiLink,
  FiMaximize2,
  FiX,
} from "react-icons/fi";

const API_BASE_URL =
  import.meta.env.VITE_RENDER_API_BASE_URL || "http://localhost:5000/api";

const ImageInsertModal = ({ isOpen, onClose, onInsert }) => {
  const [imageSource, setImageSource] = useState("url");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Image adjustment properties
  const [imageWidth, setImageWidth] = useState("100%");
  const [imageHeight, setImageHeight] = useState("auto");
  const [borderRadius, setBorderRadius] = useState("8px");
  const [alignment, setAlignment] = useState("center");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        Swal.fire({
          icon: "error",
          title: "Invalid File Type",
          text: "Please select an image file",
          confirmButtonColor: "#3b82f6",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          text: "Image must be less than 5MB",
          confirmButtonColor: "#3b82f6",
        });
        return;
      }

      setSelectedFile(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const handleInsert = async () => {
    let url = "";

    if (imageSource === "url") {
      if (!imageUrl.trim()) {
        Swal.fire({
          icon: "warning",
          title: "URL Required",
          text: "Please enter an image URL",
          confirmButtonColor: "#3b82f6",
        });
        return;
      }
      url = imageUrl;
    } else {
      if (!selectedFile) {
        Swal.fire({
          icon: "warning",
          title: "File Required",
          text: "Please select an image file",
          confirmButtonColor: "#3b82f6",
        });
        return;
      }

      const formData = new FormData();
      formData.append("image", selectedFile);

      const res = await fetch(`${API_BASE_URL}/upload-editor-image`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      url = data.url;
    }

    // Calculate margin based on alignment
    let margin = "auto";
    if (alignment === "left") margin = "0 auto 0 0";
    if (alignment === "right") margin = "0 0 0 auto";
    if (alignment === "center") margin = "auto";

    onInsert({
      src: url,
      alt: imageAlt || "Image",
      width: imageWidth,
      height: imageHeight,
      borderRadius: borderRadius,
      display: "block",
      margin: margin,
    });

    handleClose();
  };

  const handleClose = () => {
    setImageSource("url");
    setImageUrl("");
    setImageAlt("");
    setSelectedFile(null);
    setPreviewUrl("");
    setImageWidth("100%");
    setImageHeight("auto");
    setBorderRadius("8px");
    setAlignment("center");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-gray-900">
            Insert & Adjust Image
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Source Selection Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setImageSource("url")}
              className={`flex-1 cursor-pointer px-4 py-2 text-sm font-medium transition-colors ${
                imageSource === "url"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FiLink className="w-4 h-4 inline mr-2" />
              From URL
            </button>
            <button
              type="button"
              onClick={() => setImageSource("upload")}
              className={`flex-1 cursor-pointer px-4 py-2 text-sm font-medium transition-colors ${
                imageSource === "upload"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FiImage className="w-4 h-4 inline mr-2" />
              Upload File
            </button>
          </div>

          {/* URL Input */}
          {imageSource === "url" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md 
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste a valid image URL (JPG, PNG, GIF, WebP)
                </p>
              </div>
            </div>
          )}

          {/* Upload Input */}
          {imageSource === "upload" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md 
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: JPG, PNG, GIF, WebP (max 5MB)
                </p>
              </div>
            </div>
          )}

          {/* Preview */}
          {(imageUrl || previewUrl) && (
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <div className="flex justify-center">
                <img
                  src={imageSource === "url" ? imageUrl : previewUrl}
                  alt="Preview"
                  style={{
                    width: imageWidth,
                    height: imageHeight,
                    borderRadius: borderRadius,
                    maxWidth: "100%",
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    e.target.src = "";
                    e.target.style.display = "none";
                  }}
                />
              </div>
            </div>
          )}

          {/* Alt Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alt Text (Recommended)
            </label>
            <input
              type="text"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="Describe the image"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Improves accessibility and SEO
            </p>
          </div>

          {/* Image Adjustment Section */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
              <FiMaximize2 className="w-4 h-4 mr-2" />
              Image Properties
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Width
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageWidth}
                    onChange={(e) => setImageWidth(e.target.value)}
                    placeholder="e.g., 100%, 500px, auto"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <select
                    onChange={(e) => setImageWidth(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Quick</option>
                    <option value="25%">25%</option>
                    <option value="50%">50%</option>
                    <option value="75%">75%</option>
                    <option value="100%">100%</option>
                    <option value="300px">300px</option>
                    <option value="500px">500px</option>
                    <option value="800px">800px</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
              </div>

              {/* Height */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageHeight}
                    onChange={(e) => setImageHeight(e.target.value)}
                    placeholder="e.g., auto, 300px, 500px"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <select
                    onChange={(e) => setImageHeight(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Quick</option>
                    <option value="auto">Auto</option>
                    <option value="200px">200px</option>
                    <option value="300px">300px</option>
                    <option value="400px">400px</option>
                    <option value="500px">500px</option>
                    <option value="600px">600px</option>
                  </select>
                </div>
              </div>

              {/* Border Radius */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Border Radius
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(e.target.value)}
                    placeholder="e.g., 8px, 50%, 0px"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <select
                    onChange={(e) => setBorderRadius(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Quick</option>
                    <option value="0px">None</option>
                    <option value="4px">Small</option>
                    <option value="8px">Medium</option>
                    <option value="16px">Large</option>
                    <option value="50%">Circle</option>
                  </select>
                </div>
              </div>

              {/* Alignment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alignment
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAlignment("left")}
                    className={`flex-1 cursor-pointer px-3 py-2 border rounded-md transition-colors ${
                      alignment === "left"
                        ? "bg-blue-100 border-blue-500 text-blue-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <FiAlignLeft className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlignment("center")}
                    className={`flex-1 cursor-pointer px-3 py-2 border rounded-md transition-colors ${
                      alignment === "center"
                        ? "bg-blue-100 border-blue-500 text-blue-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <FiAlignCenter className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlignment("right")}
                    className={`flex-1 cursor-pointer px-3 py-2 border rounded-md transition-colors ${
                      alignment === "right"
                        ? "bg-blue-100 border-blue-500 text-blue-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <FiAlignRight className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50 sticky bottom-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 cursor-pointer text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleInsert}
            className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FiImage className="w-4 h-4" />
            Insert Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageInsertModal;
