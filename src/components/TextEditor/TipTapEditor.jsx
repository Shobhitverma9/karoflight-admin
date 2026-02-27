import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import FontFamily from "@tiptap/extension-font-family";
import Swal from "sweetalert2";
import "./TipTapEditor.css";
import ImageInsertModal from "./ImageInsertModal.jsx";
import MenuBar from "./MenuBar.jsx";

const API_BASE_URL =
  import.meta.env.VITE_RENDER_API_BASE_URL || "http://localhost:5000/api";

const lowlight = createLowlight(common);

// Custom Image Extension with adjustable properties
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) =>
          element.style.width || element.getAttribute("width"),
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { style: `width: ${attributes.width}` };
        },
      },
      height: {
        default: null,
        parseHTML: (element) =>
          element.style.height || element.getAttribute("height"),
        renderHTML: (attributes) => {
          if (!attributes.height) return {};
          return { style: `height: ${attributes.height}` };
        },
      },
      borderRadius: {
        default: null,
        parseHTML: (element) => element.style.borderRadius,
        renderHTML: (attributes) => {
          if (!attributes.borderRadius) return {};
          return { style: `border-radius: ${attributes.borderRadius}` };
        },
      },
      display: {
        default: "block",
        parseHTML: (element) => element.style.display,
        renderHTML: (attributes) => {
          return { style: `display: ${attributes.display || "block"}` };
        },
      },
      margin: {
        default: "auto",
        parseHTML: (element) => element.style.margin,
        renderHTML: (attributes) => {
          return { style: `margin: ${attributes.margin || "auto"}` };
        },
      },
    };
  },
});

// Extended TextStyle with fontSize support
const CustomTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (element) => element.style.fontSize,
        renderHTML: (attributes) => {
          if (!attributes.fontSize) {
            return {};
          }
          return {
            style: `font-size: ${attributes.fontSize}`,
          };
        },
      },
    };
  },
});

// Custom subscript extension
const Subscript = CustomTextStyle.extend({
  name: "subscript",

  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => {
          return {
            style: "vertical-align: sub; font-size: smaller;",
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "sub",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["sub", HTMLAttributes, 0];
  },

  addCommands() {
    return {
      toggleSubscript:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name);
        },
    };
  },
});

// Custom superscript extension
const Superscript = CustomTextStyle.extend({
  name: "superscript",

  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => {
          return {
            style: "vertical-align: super; font-size: smaller;",
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "sup",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["sup", HTMLAttributes, 0];
  },

  addCommands() {
    return {
      toggleSuperscript:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name);
        },
    };
  },
});

const TipTapEditor = ({
  content,
  onChange,
  placeholder = "Start writing your blog content...",
}) => {
  const [showSource, setShowSource] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [previewContent, setPreviewContent] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        codeBlock: false,
      }),
      Underline,
      Subscript,
      Superscript,
      CustomImage.configure({
        HTMLAttributes: {
          class: "editor-image",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      CustomTextStyle,
      FontFamily,
      Color,
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class:
            "bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm my-4 overflow-x-auto",
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none focus:outline-none min-h-[500px] p-6 leading-relaxed",
        style: "font-family: system-ui, -apple-system, sans-serif;",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const handleSourceToggle = () => {
    setShowSource(!showSource);
  };

  const handleSourceChange = (e) => {
    const newContent = e.target.value;
    onChange(newContent);
    if (editor) {
      editor.commands.setContent(newContent);
    }
  };

  const handleSave = async () => {
    const html = editor.getHTML();

    try {
      const response = await fetch(`${API_BASE_URL}/blogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: blogTitle,
          content: html,
        }),
      });

      const data = await response.json();
      Swal.fire("Saved!", "Your post has been saved successfully!", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to save post", "error");
    }
  };

  const handlePreview = () => {
    const currentContent = editor?.getHTML() || content;
    setPreviewContent(currentContent);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
  };

  const handleImageInsert = (imageProps) => {
    if (editor) {
      editor.chain().focus().setImage(imageProps).run();
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg bg-white shadow-sm">
      <MenuBar
        editor={editor}
        showSource={showSource}
        onToggleSource={handleSourceToggle}
        onSave={handleSave}
        onPreview={handlePreview}
        onAddImage={() => setShowImageModal(true)}
      />

      {showSource ? (
        <div className="relative">
          <textarea
            value={content}
            onChange={handleSourceChange}
            placeholder="Write your HTML content here..."
            className="w-full h-96 p-4 font-mono text-sm border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-gray-50"
            style={{ minHeight: "500px" }}
          />
          <div className="absolute bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded text-xs font-medium">
            HTML Source
          </div>
        </div>
      ) : (
        <div className="relative">
          <style>{`
            .editor-image {
              max-width: 100%;
              height: auto;
            }
          `}</style>
          <EditorContent
            editor={editor}
            className="min-h-[500px] bg-white prose-editor"
          />
        </div>
      )}

      <ImageInsertModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onInsert={handleImageInsert}
      />
    </div>
  );
};

export default TipTapEditor;
