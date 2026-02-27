import { useEffect, useState } from "react";
import {
  FiAlignCenter,
  FiAlignJustify,
  FiAlignLeft,
  FiAlignRight,
  FiBold,
  FiChevronDown,
  FiChevronUp,
  FiCode,
  FiEyeOff,
  FiImage,
  FiItalic,
  FiLink,
  FiList,
  FiMessageSquare,
  FiMinus,
  FiRotateCcw,
  FiRotateCw,
  FiSave,
  FiUnderline,
} from "react-icons/fi";
import { headings, textSizes, fontFamilies } from "./StaticData";
import Swal from "sweetalert2";

const MenuBar = ({
  editor,
  showSource,
  onToggleSource,
  onSave,
  onPreview,
  onAddImage,
}) => {
  const [showTextSize, setShowTextSize] = useState(false);
  const [showHeadings, setShowHeadings] = useState(false);
  const [showFontFamily, setShowFontFamily] = useState(false);
  const [selectedFontSize, setSelectedFontSize] = useState("Size");
  const [selectedHeading, setSelectedHeading] = useState("Headings");
  const [selectedFontFamily, setSelectedFontFamily] = useState("Font");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#000000");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown-container")) {
        setShowTextSize(false);
        setShowHeadings(false);
        setShowFontFamily(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const setLink = async () => {
    const previousUrl = editor.getAttributes("link").href;

    const { value: url } = await Swal.fire({
      title: "Insert Link",
      input: "url",
      inputLabel: "Enter URL",
      inputValue: previousUrl || "",
      showCancelButton: true,
      confirmButtonText: "Insert",
      cancelButtonText: "Remove Link",
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#ef4444",
      inputValidator: (value) => {
        if (value && !value.match(/^https?:\/\/.+/)) {
          return "Please enter a valid URL starting with http:// or https://";
        }
      },
    });

    if (url === undefined) {
      return;
    }

    if (url === "" || url === null) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const setHeading = (level, label) => {
    if (level === 0) editor.chain().focus().setParagraph().run();
    else editor.chain().focus().toggleHeading({ level }).run();

    setSelectedHeading(label);
    setShowHeadings(false);
  };

  const setFontFamily = (fontFamily, label) => {
    editor.chain().focus().setFontFamily(fontFamily).run();
    setSelectedFontFamily(label);
    setShowFontFamily(false);
  };

  const setFontSize = (size, label) => {
    editor.chain().focus().setMark("textStyle", { fontSize: size }).run();
    setSelectedFontSize(label);
    setShowTextSize(false);
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 rounded-t-lg bg-gradient-to-r from-gray-50 to-gray-100 p-3">
      {/* First Row - Basic Formatting */}
      <div className="flex flex-wrap items-center gap-2 mb-3 pb-3 border-b border-gray-200">
        <div className="relative dropdown-container">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowFontFamily(!showFontFamily);
              setShowTextSize(false);
              setShowHeadings(false);
            }}
            className="flex items-center space-x-1 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700 min-w-[120px] justify-between shadow-sm"
          >
            <span className="truncate">{selectedFontFamily}</span>

            <FiChevronDown className="w-4 h-4 flex-shrink-0" />
          </button>

          {showFontFamily && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-30 max-h-60 overflow-y-auto">
              {fontFamilies.map((font, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setFontFamily(font.value, font.label)}
                  className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0 transition-colors"
                  style={{ fontFamily: font.value }}
                >
                  {font.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Text Size Dropdown */}
        <div className="relative dropdown-container">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowTextSize(!showTextSize);
              setShowHeadings(false);
            }}
            className="flex items-center space-x-1 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700 min-w-[80px] justify-between"
          >
            <span>{selectedFontSize}</span>

            <FiChevronDown className="w-4 h-4" />
          </button>

          {showTextSize && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
              {textSizes.map((size, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setFontSize(size.size, size.label)}
                  className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0"
                  style={{ fontSize: size.size }}
                >
                  {size.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Headings Dropdown */}
        <div className="relative dropdown-container">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowHeadings(!showHeadings);
              setShowTextSize(false);
            }}
            className="flex items-center space-x-1 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700 min-w-[100px] justify-between"
          >
            <span>{selectedHeading}</span>

            <FiChevronDown className="w-4 h-4" />
          </button>

          {showHeadings && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-20">
              {headings.map((heading, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setHeading(heading.level, heading.label)}
                  className={`w-full px-3 py-2 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 ${
                    editor.isActive("heading", { level: heading.level })
                      ? "bg-blue-50"
                      : ""
                  }`}
                  style={{
                    fontSize:
                      heading.level === 0
                        ? "14px"
                        : `${24 - heading.level * 2}px`,
                    fontWeight: heading.level === 0 ? "normal" : "bold",
                  }}
                >
                  {heading.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Font Style Buttons */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded border border-transparent hover:border-gray-300 hover:bg-white ${
            editor.isActive("bold")
              ? "bg-blue-100 border-blue-300 text-blue-700"
              : "text-gray-700"
          }`}
          title="Bold"
        >
          <FiBold size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded border border-transparent hover:border-gray-300 hover:bg-white ${
            editor.isActive("italic")
              ? "bg-blue-100 border-blue-300 text-blue-700"
              : "text-gray-700"
          }`}
          title="Italic"
        >
          <FiItalic size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded border border-transparent hover:border-gray-300 hover:bg-white ${
            editor.isActive("underline")
              ? "bg-blue-100 border-blue-300 text-blue-700"
              : "text-gray-700"
          }`}
          title="Underline"
        >
          <FiUnderline size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Superscript and Subscript */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={`p-2 rounded border border-transparent hover:border-gray-300 hover:bg-white ${
            editor.isActive("superscript")
              ? "bg-blue-100 border-blue-300 text-blue-700"
              : "text-gray-700"
          }`}
          title="Superscript"
        >
          <FiChevronUp size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={`p-2 rounded border border-transparent hover:border-gray-300 hover:bg-white ${
            editor.isActive("subscript")
              ? "bg-blue-100 border-blue-300 text-blue-700"
              : "text-gray-700"
          }`}
          title="Subscript"
        >
          <FiChevronDown size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Text Color */}
        <div className="flex items-center space-x-2">
          <div
            className="w-6 h-6 rounded border border-gray-400"
            style={{ backgroundColor: selectedColor }}
            title={`Selected: ${selectedColor}`}
          ></div>
          <input
            type="color"
            onChange={(event) => {
              const color = event.target.value;
              editor.chain().focus().setColor(color).run();
              setSelectedColor(color);
            }}
            value={selectedColor}
            className="w-8 h-8 p-1 rounded cursor-pointer border border-gray-300 bg-white"
            title="Pick Text Color"
          />
        </div>
      </div>

      {/* Second Row - Advanced Formatting */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded border border-transparent hover:border-gray-300 hover:bg-white ${
            editor.isActive("bulletList")
              ? "bg-green-100 border-green-300 text-green-700"
              : "text-gray-700"
          }`}
          title="Bullet List"
        >
          <FiList size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded border border-transparent hover:border-gray-300 hover:bg-white relative ${
            editor.isActive("orderedList")
              ? "bg-green-100 border-green-300 text-green-700"
              : "text-gray-700"
          }`}
          title="Numbered List"
        >
          <FiList size={18} />
          <span className="text-[10px] absolute top-0 right-0 font-bold">
            1
          </span>
        </button>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Text Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-2 rounded border border-transparent hover:border-gray-300 hover:bg-white ${
            editor.isActive({ textAlign: "left" })
              ? "bg-yellow-100 border-yellow-300 text-yellow-700"
              : "text-gray-700"
          }`}
          title="Align Left"
        >
          <FiAlignLeft size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-2 rounded border border-transparent hover:border-gray-300 hover:bg-white ${
            editor.isActive({ textAlign: "center" })
              ? "bg-yellow-100 border-yellow-300 text-yellow-700"
              : "text-gray-700"
          }`}
          title="Align Center"
        >
          <FiAlignCenter size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-2 rounded border border-transparent hover:border-gray-300 hover:bg-white ${
            editor.isActive({ textAlign: "right" })
              ? "bg-yellow-100 border-yellow-300 text-yellow-700"
              : "text-gray-700"
          }`}
          title="Align Right"
        >
          <FiAlignRight size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={`p-2 rounded border border-transparent hover:border-gray-300 hover:bg-white ${
            editor.isActive({ textAlign: "justify" })
              ? "bg-yellow-100 border-yellow-300 text-yellow-700"
              : "text-gray-700"
          }`}
          title="Justify"
        >
          <FiAlignJustify size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Block Elements */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded border border-transparent hover:border-gray-300 hover:bg-white ${
            editor.isActive("blockquote")
              ? "bg-indigo-100 border-indigo-300 text-indigo-700"
              : "text-gray-700"
          }`}
          title="Blockquote"
        >
          <FiMessageSquare size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded border border-transparent hover:border-gray-300 hover:bg-white ${
            editor.isActive("codeBlock")
              ? "bg-gray-800 text-white"
              : "text-gray-700"
          }`}
          title="Code Block"
        >
          <FiCode size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded border border-transparent hover:border-gray-300 hover:bg-white text-gray-700"
          title="Horizontal Rule"
        >
          <FiMinus size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Media */}
        <button
          type="button"
          onClick={onAddImage}
          className="p-2 rounded border border-transparent hover:border-gray-300 hover:bg-white text-gray-700"
          title="Add Image"
        >
          <FiImage size={18} />
        </button>

        <button
          type="button"
          onClick={setLink}
          className={`p-2 rounded border border-transparent hover:border-gray-300 hover:bg-white ${
            editor.isActive("link")
              ? "bg-blue-100 border-blue-300 text-blue-700"
              : "text-gray-700"
          }`}
          title="Add Link"
        >
          <FiLink size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* History */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className={`p-2 rounded border border-transparent ${
            !editor.can().chain().focus().undo().run()
              ? "opacity-50 cursor-not-allowed text-gray-400"
              : "hover:border-gray-300 hover:bg-white text-gray-700"
          }`}
          title="Undo"
        >
          <FiRotateCcw size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className={`p-2 rounded border border-transparent ${
            !editor.can().chain().focus().redo().run()
              ? "opacity-50 cursor-not-allowed text-gray-400"
              : "hover:border-gray-300 hover:bg-white text-gray-700"
          }`}
          title="Redo"
        >
          <FiRotateCw size={18} />
        </button>

        <div className="flex-1"></div>

        {/* View Controls */}
        <div className="flex items-center space-x-2">
          {/* View Toggle */}
          <button
            type="button"
            onClick={onToggleSource}
            className={`flex items-center space-x-1 px-3 py-2 rounded border border-transparent hover:border-gray-300 hover:bg-white ${
              showSource
                ? "bg-purple-100 border-purple-300 text-purple-700"
                : "text-gray-700"
            }`}
            title={showSource ? "Show Rich Text" : "Show Source Code"}
          >
            {showSource ? <FiEyeOff size={16} /> : <FiCode size={16} />}
            <span className="text-sm">{showSource ? "Visual" : "Code"}</span>
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={onSave}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md hover:from-green-600 hover:to-green-700 shadow-sm transition-all duration-200"
            title="Save Content"
          >
            <FiSave size={16} />
            <span className="text-sm font-medium">Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuBar;
