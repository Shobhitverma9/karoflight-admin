import {
  FiCalendar,
  FiClock,
  FiEye,
  FiShare2,
  FiUser,
  FiX,
} from "react-icons/fi";

const BlogPreviewModal = ({ isOpen, onClose, blogData }) => {
  if (!isOpen) return null;

  const previewBlog = {
    title: blogData.meta_title || "Untitled Blog Post",
    summary: blogData.meta_description || "",
    content: blogData.content || "<p>No content yet...</p>",
    category: blogData.categories[0] || "General",
    author: { name: blogData.author_name || "Author" },
    featuredImage:
      blogData.featured_image.url ||
      "https://images.unsplash.com/photo-1488646953014-85cb44e25838?w=1200&h=600&fit=crop",
    imageAlt:
      blogData.featured_image.alt || blogData.image_alt_text || "Blog image",
    date: new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    readTime: "8 min read",
    views: 0,
    tags:
      blogData.meta_keywords.length > 0 ? blogData.meta_keywords : ["preview"],
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 bg-opacity-50 flex items-start justify-center pt-10 pb-5">
      <div className="relative w-full max-w-6xl bg-gray-50 rounded-lg shadow-2xl mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-100 text-gray-800 rounded-full p-2 shadow-lg transition"
        >
          <FiX className="w-6 h-6" />
        </button>

        {/* Preview Badge */}
        <div className="absolute top-4 left-4 z-10 bg-yellow-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg flex items-center gap-2">
          <FiEye className="w-5 h-5" />
          PREVIEW MODE
        </div>

        {/* Scrollable Preview Content */}
        <div className="max-h-[85vh] overflow-y-auto">
          {/* Hero Section */}
          <section className="bg-white pt-16">
            <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
              <span className="inline-block bg-[#FF671F] text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                {previewBlog.category}
              </span>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0A0A4A] mb-4">
                {previewBlog.title}
              </h1>

              <p className="text-lg text-gray-600 mb-6">
                {previewBlog.summary}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-2">
                  <FiUser size={16} />
                  <span className="font-medium text-gray-700">
                    {previewBlog.author.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCalendar size={16} />
                  <span>{previewBlog.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiClock size={16} />
                  <span>{previewBlog.readTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiEye size={16} />
                  <span>{previewBlog.views} views</span>
                </div>

                <div className="ml-auto flex items-center gap-3">
                  <FiShare2
                    size={16}
                    className="cursor-pointer hover:text-[#FF671F]"
                  />
                </div>
              </div>

              {previewBlog.featuredImage && (
                <div className="rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={previewBlog.featuredImage}
                    alt={previewBlog.imageAlt}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Main Content Section */}
          <section className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Content - Preserves All Editor Styles */}
              <div className="flex-1">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
                  <style>{`
                    /* Base styles that work with editor styles */
                    .preview-blog-content {
                      font-family: system-ui, -apple-system, sans-serif;
                      line-height: 1.6;
                      color: #374151;
                    }
                    
                    /* Heading spacing (sizes come from editor) */
                    .preview-blog-content h1 {
                      font-weight: 700;
                      line-height: 1.2;
                      margin-top: 2rem;
                      margin-bottom: 1rem;
                    }
                    
                    .preview-blog-content h2 {
                      font-weight: 700;
                      line-height: 1.3;
                      margin-top: 1.75rem;
                      margin-bottom: 0.875rem;
                    }
                    
                    .preview-blog-content h3 {
                      font-weight: 600;
                      line-height: 1.4;
                      margin-top: 1.5rem;
                      margin-bottom: 0.75rem;
                    }
                    
                    .preview-blog-content h4 {
                      font-weight: 600;
                      line-height: 1.4;
                      margin-top: 1.25rem;
                      margin-bottom: 0.625rem;
                    }
                    
                    .preview-blog-content h5 {
                      font-weight: 600;
                      line-height: 1.5;
                      margin-top: 1rem;
                      margin-bottom: 0.5rem;
                    }
                    
                    .preview-blog-content h6 {
                      font-weight: 600;
                      line-height: 1.5;
                      margin-top: 0.875rem;
                      margin-bottom: 0.5rem;
                    }
                    
                    /* Paragraph spacing */
                    .preview-blog-content p {
                      margin-bottom: 1rem;
                      line-height: 1.8;
                    }
                    
                    /* Lists */
                    .preview-blog-content ul,
                    .preview-blog-content ol {
                      padding-left: 2rem;
                      margin-bottom: 1rem;
                    }
                    
                    .preview-blog-content ul {
                      list-style-type: disc;
                    }
                    
                    .preview-blog-content ol {
                      list-style-type: decimal;
                    }
                    
                    .preview-blog-content li {
                      margin-bottom: 0.5rem;
                      line-height: 1.8;
                    }
                    
                    .preview-blog-content li p {
                      margin-bottom: 0.25rem;
                    }
                    
                    /* Links */
                    .preview-blog-content a {
                      color: #3b82f6;
                      text-decoration: underline;
                    }
                    
                    .preview-blog-content a:hover {
                      color: #2563eb;
                    }
                    
                    /* Blockquotes */
                    .preview-blog-content blockquote {
                      border-left: 4px solid #e5e7eb;
                      padding-left: 1.5rem;
                      margin: 1.5rem 0;
                      font-style: italic;
                      color: #6b7280;
                    }
                    
                    /* Code blocks */
                    .preview-blog-content pre {
                      background-color: #1f2937;
                      color: #f9fafb;
                      padding: 1.25rem;
                      border-radius: 0.5rem;
                      overflow-x: auto;
                      margin: 1.5rem 0;
                      font-family: 'Courier New', Consolas, Monaco, monospace;
                    }
                    
                    .preview-blog-content pre code {
                      background-color: transparent;
                      padding: 0;
                      color: inherit;
                      font-size: 0.875rem;
                    }
                    
                    /* Inline code */
                    .preview-blog-content code {
                      background-color: #f3f4f6;
                      padding: 0.125rem 0.375rem;
                      border-radius: 0.25rem;
                      font-family: 'Courier New', Consolas, Monaco, monospace;
                      font-size: 0.9em;
                      color: #ef4444;
                    }
                    
                    /* Images - preserve all styles from editor */
                    .preview-blog-content img {
                      max-width: 100%;
                      height: auto;
                    }
                    
                    /* Horizontal rule */
                    .preview-blog-content hr {
                      border: none;
                      border-top: 2px solid #e5e7eb;
                      margin: 2rem 0;
                    }
                    
                    /* Tables */
                    .preview-blog-content table {
                      width: 100%;
                      border-collapse: collapse;
                      margin: 1.5rem 0;
                    }
                    
                    .preview-blog-content th,
                    .preview-blog-content td {
                      border: 1px solid #e5e7eb;
                      padding: 0.75rem;
                      text-align: left;
                    }
                    
                    .preview-blog-content th {
                      background-color: #f9fafb;
                      font-weight: 600;
                    }
                    
                    /* Text formatting */
                    .preview-blog-content strong {
                      font-weight: 700;
                    }
                    
                    .preview-blog-content em {
                      font-style: italic;
                    }
                    
                    .preview-blog-content u {
                      text-decoration: underline;
                    }
                    
                    .preview-blog-content s {
                      text-decoration: line-through;
                    }
                    
                    /* Subscript and Superscript */
                    .preview-blog-content sub {
                      vertical-align: sub;
                      font-size: smaller;
                    }
                    
                    .preview-blog-content sup {
                      vertical-align: super;
                      font-size: smaller;
                    }
                    
                    /* First and last element margins */
                    .preview-blog-content > *:first-child {
                      margin-top: 0;
                    }
                    
                    .preview-blog-content > *:last-child {
                      margin-bottom: 0;
                    }
                  `}</style>
                  <div
                    className="preview-blog-content"
                    dangerouslySetInnerHTML={{ __html: previewBlog.content }}
                  />
                </div>

                {/* Author Bio */}
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
                  <div className="w-20 h-20 rounded-full bg-[#0A0A4A] flex items-center justify-center text-white text-2xl font-bold">
                    {previewBlog.author.name.charAt(0)}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="font-semibold text-gray-800 text-xl">
                      {previewBlog.author.name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Travel writer & expert sharing insights and tips
                    </p>
                  </div>
                </div>

                {/* Category and Tags */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Category
                    </h3>
                    <span className="px-4 py-2 bg-gray-200 rounded-full text-sm">
                      {previewBlog.category}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {previewBlog.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-sm text-gray-700 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:w-96">
                <div className="sticky top-4 space-y-6">
                  {/* Newsletter */}
                  <div className="bg-[#0A0A4A] text-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-2">
                      Weekly Newsletter
                    </h2>
                    <p className="text-sm mb-4">
                      Get exclusive travel tips delivered to your inbox
                    </p>
                    <div className="space-y-3">
                      <input
                        type="email"
                        placeholder="Your email"
                        className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/70 focus:outline-none"
                        disabled
                      />
                      <button className="w-full bg-[#FF671F] text-white font-semibold py-2 rounded-lg opacity-50 cursor-not-allowed">
                        Subscribe
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BlogPreviewModal;