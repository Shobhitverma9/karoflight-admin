import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import { toast } from "react-hot-toast";

const SitemapManager = () => {
  const [seoPages, setSeoPages] = useState([]);
  const [sitemapXml, setSitemapXml] = useState("");
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState({});
  
  const { userData } = useSelector((state) => state.auth);
  const baseURL = import.meta.env.VITE_RENDER_API_BASE_URL;

  // Fetch published SEO pages
  const fetchSeoPages = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${baseURL}/seo`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch SEO pages: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Filter published pages on frontend since backend doesn't have status filter
      const publishedPages = data.data ? data.data.filter(page => page.status === 'published') : [];
      setSeoPages(publishedPages);
    } catch (err) {
      console.error("Error fetching SEO pages:", err);
      toast.error("Failed to fetch SEO pages");
    }
  };

  // Generate sitemap
  const generateSitemap = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/seo/sitemap.xml`);
      
      if (!res.ok) {
        throw new Error(`Failed to generate sitemap: ${res.status}`);
      }
      
      const xml = await res.text();
      setSitemapXml(xml);
      toast.success("Sitemap generated successfully");
    } catch (err) {
      console.error("Error generating sitemap:", err);
      toast.error("Failed to generate sitemap");
    } finally {
      setLoading(false);
    }
  };

  // Publish a page
  const publishPage = async (id) => {
    setPublishing(prev => ({ ...prev, [id]: true }));
    
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${baseURL}/seo/${id}/publish`, {
        method: "PATCH",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error(`Failed to publish page: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.success) {
        toast.success("Page published successfully");
        fetchSeoPages(); // refresh list
      } else {
        throw new Error(data.message || "Failed to publish page");
      }
    } catch (err) {
      console.error("Error publishing page:", err);
      toast.error(err.message || "Failed to publish page");
    } finally {
      setPublishing(prev => ({ ...prev, [id]: false }));
    }
  };

  // Download sitemap as XML file
  const downloadSitemap = () => {
    if (!sitemapXml) {
      toast.error("No sitemap to download");
      return;
    }

    const blob = new Blob([sitemapXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Sitemap downloaded successfully");
  };

  // Copy sitemap to clipboard
  const copySitemapToClipboard = async () => {
    if (!sitemapXml) {
      toast.error("No sitemap to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(sitemapXml);
      toast.success("Sitemap copied to clipboard");
    } catch (err) {
      console.error("Failed to copy sitemap:", err);
      toast.error("Failed to copy sitemap");
    }
  };

  useEffect(() => {
    fetchSeoPages();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sitemap Management</h1>
        <p className="text-gray-600 mt-2">
          Manage your website sitemap and published SEO pages
        </p>
      </div>

      {/* Sitemap Generation Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Sitemap Generator</h2>
          <div className="flex gap-3">
            <button
              onClick={generateSitemap}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? <ClipLoader size={16} color="#ffffff" /> : null}
              {loading ? "Generating..." : "Generate Sitemap"}
            </button>
          </div>
        </div>

        {sitemapXml && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-gray-900">Sitemap Preview</h3>
              <div className="flex gap-2">
                <button
                  onClick={copySitemapToClipboard}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Copy XML
                </button>
                <button
                  onClick={downloadSitemap}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
            <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto max-h-96">
              <code>{sitemapXml}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Published Pages Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Published SEO Pages</h2>
          <button
            onClick={fetchSeoPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Refresh
          </button>
        </div>

        {seoPages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
            <p className="mt-2">No published pages found</p>
            <p className="text-sm">Publish some SEO pages to see them here</p>
          </div>
        ) : (
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {seoPages.map((page) => (
                  <tr key={page._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{page.title}</div>
                        <div className="text-sm text-gray-500">
                          <code className="bg-gray-100 px-1 py-0.5 rounded">/{page.slug}</code>
                        </div>
                        {page.canonicalUrl && (
                          <div className="text-xs text-blue-600 mt-1 truncate">
                            {page.canonicalUrl}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {page.pageType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        page.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {page.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => publishPage(page._id)}
                        disabled={publishing[page._id]}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                      >
                        {publishing[page._id] ? (
                          <>
                            <ClipLoader size={12} color="#ffffff" />
                            Publishing...
                          </>
                        ) : (
                          'Publish Again'
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats */}
        {seoPages.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Showing {seoPages.length} published page{seoPages.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default SitemapManager;