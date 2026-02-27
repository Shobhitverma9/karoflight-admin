// ViewCampaignModal.jsx
import React from "react";
import {
  FaTimesCircle,
  FaEdit,
  FaPaperPlane,
} from "react-icons/fa";

export default function ViewCampaignModal({
  campaign,
  onClose,
  onEdit,
  onSend,
  onReject,
  sending = false,
  rejecting = false,
}) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Campaign Preview</h2>
            <p className="text-blue-100 text-sm mt-1">{campaign.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 rounded-full p-2 transition-colors"
            aria-label="Close modal"
          >
            <FaTimesCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-4">
            {/* Campaign Name and Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Campaign Name
                </label>
                <p className="text-gray-900">{campaign.name}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Type
                </label>
                <p className="text-gray-900 capitalize">{campaign.type}</p>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Status
              </label>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                {campaign.status.replace("_", " ").toUpperCase()}
              </span>
            </div>

            {/* Email Subject */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email Subject
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {campaign.subject}
              </p>
            </div>

            {/* Message Content */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Message Content
              </label>
              <div
                className="prose max-w-none bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-900"
                dangerouslySetInnerHTML={{
                  __html: campaign.message,
                }}
              />
            </div>

            {/* Attachments */}
            {campaign.attachments?.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Attachments ({campaign.attachments.length})
                </label>
                <div className="space-y-2">
                  {campaign.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                      <span className="text-sm text-gray-700">
                        📎 {att.filename}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Creator Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Created By
                </label>
                <p className="text-gray-900">
                  {campaign.createdBy?.username || "Unknown"}
                </p>
                <p className="text-sm text-gray-600">
                  {campaign.createdBy?.email || "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Created At
                </label>
                <p className="text-gray-900">{formatDate(campaign.createdAt)}</p>
              </div>
            </div>

            {/* Target Region */}
            {campaign.target?.region && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Target Region
                </label>
                <p className="text-gray-900 bg-blue-50 p-3 rounded-lg">
                  {campaign.target.region}
                </p>
              </div>
            )}

            {/* Schedule Date */}
            {campaign.scheduleDate?.date && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Scheduled For
                </label>
                <p className="text-gray-900 bg-blue-50 p-3 rounded-lg">
                  {formatDate(campaign.scheduleDate.date)}
                  {campaign.scheduleDate.isSent && (
                    <span className="ml-2 text-xs text-green-600 font-semibold">
                      ✓ Sent
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Rejection Reason */}
            {campaign.rejectionReason && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Rejection Reason
                </label>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <p className="text-sm text-red-700">
                    {campaign.rejectionReason}
                  </p>
                </div>
              </div>
            )}

            {/* Campaign Stats (if sent) */}
            {campaign.stats && campaign.status === "sent" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Campaign Statistics
                </label>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {campaign.stats.totalSubscribers || 0}
                    </p>
                    <p className="text-xs text-gray-600">Total Subscribers</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {campaign.stats.sentCount || 0}
                    </p>
                    <p className="text-xs text-gray-600">Sent</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {campaign.stats.successCount || 0}
                    </p>
                    <p className="text-xs text-gray-600">Success</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {campaign.stats.failedCount || 0}
                    </p>
                    <p className="text-xs text-gray-600">Failed</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="bg-gray-50 p-6 flex justify-between border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
          <div className="flex space-x-3">
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <FaEdit className="inline w-4 h-4 mr-2" />
                Edit
              </button>
            )}
            {onSend && (
              <button
                onClick={onSend}
                disabled={sending}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <FaPaperPlane className="inline w-4 h-4 mr-2" />
                {sending ? "Sending..." : "Send"}
              </button>
            )}
            {onReject && (
              <button
                onClick={onReject}
                disabled={rejecting}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <FaTimesCircle className="inline w-4 h-4 mr-2" />
                {rejecting ? "Rejecting..." : "Reject"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}