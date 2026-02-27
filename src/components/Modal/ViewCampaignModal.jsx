// components/Campaigns/ViewCampaignModal.jsx
import React from "react";
import {
  FaTimes,
  FaRocket,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaPaperclip,
  FaGlobeAmericas,
  FaTag,
  FaEnvelope,
  FaEye,
  FaPaperPlane,
} from "react-icons/fa";
import {
  HiTemplate,
  HiMail,
  HiLocationMarker,
} from "react-icons/hi";

const ViewCampaignModal = ({ campaign, isOpen, onClose, onEdit }) => {
  if (!isOpen || !campaign) return null;

  // Get status badge style
  const getStatusBadge = (status) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 border border-gray-300";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "sent":
        return "bg-green-100 text-green-800 border border-green-300";
      case "sending":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  // Get type badge style
  const getTypeBadge = (type) => {
    switch (type) {
      case "deal":
        return "bg-green-100 text-green-800 border border-green-300";
      case "announcement":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "offer":
        return "bg-purple-100 text-purple-800 border border-purple-300";
      case "newsletter":
        return "bg-orange-100 text-orange-800 border border-orange-300";
      case "custom":
        return "bg-gray-100 text-gray-800 border border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "draft":
        return <FaEdit className="text-gray-500" />;
      case "scheduled":
        return <FaClock className="text-yellow-500" />;
      case "sent":
        return <FaCheckCircle className="text-green-500" />;
      case "sending":
        return <FaPaperPlane className="text-blue-500" />;
      default:
        return <FaEdit className="text-gray-500" />;
    }
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case "deal":
        return <FaTag className="text-green-500" />;
      case "announcement":
        return <HiMail className="text-blue-500" />;
      case "offer":
        return <FaRocket className="text-purple-500" />;
      case "newsletter":
        return <HiTemplate className="text-orange-500" />;
      default:
        return <FaEdit className="text-gray-500" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Get stats percentage
  const getStatsPercentage = (campaign) => {
    if (
      !campaign.stats?.totalSubscribers ||
      campaign.stats.totalSubscribers === 0
    ) {
      return 0;
    }
    return Math.round(
      (campaign.stats.successCount / campaign.stats.totalSubscribers) * 100
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaEye className="text-xl text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Campaign Details
              </h2>
              <p className="text-gray-600 mt-1">
                View campaign information and statistics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="text-xl text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Campaign Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <HiTemplate className="text-blue-500" />
                    Basic Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Campaign Name
                      </label>
                      <p className="text-gray-900 font-semibold mt-1">
                        {campaign.name || "Unnamed Campaign"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Email Subject
                      </label>
                      <p className="text-gray-900 font-semibold mt-1">
                        {campaign.subject || "No subject"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status & Type */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaRocket className="text-purple-500" />
                    Campaign Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Status
                      </span>
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${getStatusBadge(
                          campaign.status
                        )}`}
                      >
                        {getStatusIcon(campaign.status)}
                        <span className="capitalize">
                          {campaign.status || "draft"}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Type
                      </span>
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${getTypeBadge(
                          campaign.type
                        )}`}
                      >
                        {getTypeIcon(campaign.type)}
                        <span className="capitalize">
                          {campaign.type || "custom"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates & Stats */}
              <div className="space-y-4">
                {/* Timeline */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaCalendarAlt className="text-green-500" />
                    Timeline
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">
                        Created
                      </span>
                      <span className="text-sm text-gray-900">
                        {formatDate(campaign.createdAt)}
                      </span>
                    </div>
                    {campaign.updatedAt !== campaign.createdAt && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">
                          Last Updated
                        </span>
                        <span className="text-sm text-gray-900">
                          {formatDate(campaign.updatedAt)}
                        </span>
                      </div>
                    )}
                    {campaign.status === "scheduled" &&
                      campaign.schedule?.date && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">
                            Scheduled For
                          </span>
                          <span className="text-sm text-yellow-700 font-semibold">
                            {formatDate(campaign.schedule.date)}
                          </span>
                        </div>
                      )}
                    {campaign.status === "sent" && campaign.sentAt && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">
                          Sent At
                        </span>
                        <span className="text-sm text-green-700 font-semibold">
                          {formatDate(campaign.sentAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats for Sent Campaigns */}
                {campaign.status === "sent" && campaign.stats && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FaCheckCircle className="text-green-500" />
                      Delivery Statistics
                    </h3>
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {getStatsPercentage(campaign)}%
                        </div>
                        <div className="text-sm text-gray-600">
                          Success Rate
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-500 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${getStatsPercentage(campaign)}%`,
                          }}
                        ></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-xl font-bold text-gray-900">
                            {campaign.stats.successCount || 0}
                          </div>
                          <div className="text-xs text-gray-600">Delivered</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-gray-900">
                            {campaign.stats.totalSubscribers || 0}
                          </div>
                          <div className="text-xs text-gray-600">Total</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Target Region */}
            {campaign.target?.region && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FaGlobeAmericas className="text-teal-500" />
                  Target Audience
                </h3>
                <div className="flex items-center gap-2">
                  <HiLocationMarker className="text-gray-400" />
                  <span className="text-gray-900 font-medium">
                    {campaign.target.region}
                  </span>
                </div>
              </div>
            )}

            {/* Message Content Preview */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaEnvelope className="text-orange-500" />
                Message Content
              </h3>
              <div className="border rounded-lg p-6 bg-white max-h-96 overflow-y-auto">
                {campaign.message ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: campaign.message }}
                    className="campaign-content prose prose-sm max-w-none"
                    style={{
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      lineHeight: '1.6',
                    }}
                  />
                ) : (
                  <p className="text-gray-500 italic">No content available</p>
                )}
              </div>
            </div>

            {/* Attachments */}
            {campaign.attachments && campaign.attachments.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FaPaperclip className="text-gray-600" />
                  Attachments ({campaign.attachments.length})
                </h3>
                <div className="space-y-2">
                  {campaign.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <FaPaperclip className="text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {attachment.filename}
                          </p>
                          {attachment.size && (
                            <p className="text-xs text-gray-500">
                              {Math.round(attachment.size / 1024)} KB
                            </p>
                          )}
                        </div>
                      </div>
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View File
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Close
          </button>
          {(campaign.status === "draft" || campaign.status === "scheduled") && (
            <button
              onClick={() => onEdit(campaign._id)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
              <FaEdit />
              Edit Campaign
            </button>
          )}
        </div>
      </div>

      </div>
      {/* Add CSS for proper content styling */}
      <style jsx>{`
        .campaign-content img {
          max-width: 100%;
          height: auto;
          display: block;
          border-radius: 8px;
        }

        .campaign-content p {
          margin-bottom: 1em;
          line-height: 1.6;
        }

        .campaign-content h1,
        .campaign-content h2,
        .campaign-content h3,
        .campaign-content h4,
        .campaign-content h5,
        .campaign-content h6 {
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          font-weight: 600;
          line-height: 1.3;
        }

        .campaign-content h1 { font-size: 2em; }
        .campaign-content h2 { font-size: 1.5em; }
        .campaign-content h3 { font-size: 1.25em; }
        .campaign-content h4 { font-size: 1.1em; }
        .campaign-content h5 { font-size: 1em; }
        .campaign-content h6 { font-size: 0.9em; }

        .campaign-content ul,
        .campaign-content ol {
          margin-left: 1.5em;
          margin-bottom: 1em;
        }

        .campaign-content li {
          margin-bottom: 0.5em;
        }

        .campaign-content blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1em;
          margin: 1em 0;
          color: #6b7280;
          font-style: italic;
        }

        .campaign-content code {
          background-color: #f3f4f6;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }

        .campaign-content pre {
          background-color: #1f2937;
          color: #f3f4f6;
          padding: 1em;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1em 0;
        }

        .campaign-content pre code {
          background-color: transparent;
          padding: 0;
          color: inherit;
        }

        .campaign-content a {
          color: #2563eb;
          text-decoration: underline;
        }

        .campaign-content a:hover {
          color: #1e40af;
        }

        .campaign-content strong {
          font-weight: 600;
        }

        .campaign-content em {
          font-style: italic;
        }

        .campaign-content hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 2em 0;
        }
      `}</style>
    </div>
  );
};

export default ViewCampaignModal