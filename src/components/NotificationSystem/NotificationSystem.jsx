// NotificationSystem.jsx
import React, { useState, useEffect } from "react";
import {
  FiBell,
  FiMail,
  FiMessageSquare,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiSettings,
  FiSend,
  FiUsers,
  FiClock,
  FiFilter,
  FiSearch,
  FiShare2,
  FiEye,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../../features/slices/notification.slice";
import Swal from "sweetalert2";

const NotificationSystem = () => {
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [shareDetails, setShareDetails] = useState({
    supportTeam: "",
    additionalNotes: "",
    attachDocuments: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    smsEnabled: true,
    emailAddress: "admin@company.com",
    smsNumber: "+1-555-0100",
    notifyOnCancellation: true,
    notifyOnRefund: true,
    soundEnabled: true,
    autoForward: false,
  });

  const normalizeNotification = (n) => {
    const type = (n.type || "SYSTEM").toLowerCase();

    return {
      id: n._id,
      title: n.title || "Notification",
      message: n.message || "",
      type, // cancellation | refund | system
      priority: n.meta?.priority || "low",

      status: n.isRead ? "read" : "unread",
      read: n.isRead,

      timestamp: n.createdAt,

      bookingId: n.meta?.bookingId || "N/A",
      transactionId: n.meta?.transactionId || "N/A",
      amount: Number(n.meta?.amount || 0),

      customerName: n.meta?.customerName || "Customer",
      customerEmail: n.meta?.customerEmail || "-",
      customerPhone: n.meta?.customerPhone || "-",

      service: n.meta?.service || "GENERAL",

      sentVia: n.meta?.sentVia || ["system"],
      cancellationReason: n.meta?.reason || "-",
    };
  };

  const dispatch = useDispatch();

  const {
    list: notifications,
    unreadCount,
    loading,
    page,
    hasMore,
  } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1 }));
  }, [dispatch]);

  const markAsRead = (id) => {
    dispatch(markNotificationAsRead(id));
  };

  const markAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const getTypeBadge = (type) => {
    return type === "cancellation"
      ? "bg-orange-100 text-orange-800"
      : "bg-blue-100 text-blue-800";
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    };
    return styles[priority] || "bg-gray-100 text-gray-800";
  };

  const getStatusBadge = (status) => {
    const styles = {
      unread: "bg-blue-100 text-blue-800",
      read: "bg-gray-100 text-gray-800",
      processing: "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };
const confirmDeleteOne = (id) => {
  Swal.fire({
    title: "Delete this notification?",
    text: "You won't be able to recover it.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Yes, delete",
  }).then((result) => {
    if (result.isConfirmed) {
      dispatch(deleteNotification(id));

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Notification removed.",
        timer: 1200,
        showConfirmButton: false,
      });
    }
  });
};


const confirmDeleteAll = () => {
  Swal.fire({
    title: "Delete all notifications?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc2626", // red-600
    cancelButtonColor: "#6b7280",  // gray-500
    confirmButtonText: "Yes, delete all",
  }).then((result) => {
    if (result.isConfirmed) {
      dispatch(deleteAllNotifications());

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "All notifications have been deleted.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  });
};


  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    if (!notification.read) {
      dispatch(markNotificationAsRead(notification.id));
    }
  };

  const handleShareWithSupport = (notification) => {
    setSelectedNotification(notification);
    setShowShareModal(true);
  };

  const processShare = () => {
    if (!shareDetails.supportTeam) {
      alert("Please select a support team");
      return;
    }

    console.log("Sharing notification with support:", {
      notificationId: selectedNotification.id,
      bookingId: selectedNotification.bookingId,
      supportTeam: shareDetails.supportTeam,
      additionalNotes: shareDetails.additionalNotes,
      attachDocuments: shareDetails.attachDocuments,
      sharedAt: new Date().toISOString(),
      sharedBy: "Admin User",
    });

    // setNotifications(notifications.map(n =>
    //   n.id === selectedNotification.id
    //     ? { ...n, status: 'processing' }
    //     : n
    // ));

    alert(
      `Cancellation details shared with ${shareDetails.supportTeam} team successfully!`
    );
    setShowShareModal(false);
    setShareDetails({
      supportTeam: "",
      additionalNotes: "",
      attachDocuments: false,
    });
  };
  const uiNotifications = notifications.map(normalizeNotification);

  const filteredNotifications = uiNotifications.filter((n) => {
    const matchesType = filterType === "all" || n.type === filterType;
    const matchesPriority =
      filterPriority === "all" || n.priority === filterPriority;
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesType && matchesPriority && matchesSearch;
  });

const stats = {
  total: notifications.length,
  unread: notifications.filter((n) => !n.isRead).length,
  cancellations: notifications.filter((n) => n.type === "cancellation").length,
  refunds: notifications.filter((n) => n.type === "refund").length,
  high: notifications.filter((n) => n.priority === "high").length,
};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Notification System
            </h1>
            <p className="text-gray-600">
              Real-time alerts for cancellations and refund requests
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiCheckCircle />
              Mark All Read
            </button>

<button
  onClick={confirmDeleteAll}
  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
>
  <FiXCircle />
  Delete All
</button>




            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiSettings />
              Settings
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <FiBell className="text-3xl text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.unread}
                </p>
              </div>
              <FiAlertCircle className="text-3xl text-blue-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cancellations</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.cancellations}
                </p>
              </div>
              <FiXCircle className="text-3xl text-orange-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Refunds</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.refunds}
                </p>
              </div>
              <FiRefreshCw className="text-3xl text-blue-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{stats.high}</p>
              </div>
              <FiAlertCircle className="text-3xl text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="cancellation">Cancellations</option>
                <option value="refund">Refunds</option>
              </select>
            </div>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            <div className="relative flex-1 w-full">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <FiBell className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No notifications found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={`p-3 rounded-full ${
                          notification.read ? "bg-gray-100" : "bg-blue-100"
                        }`}
                      >
                        {notification.type === "cancellation" ? (
                          <FiXCircle
                            className={`text-2xl ${
                              notification.read
                                ? "text-gray-600"
                                : "text-orange-600"
                            }`}
                          />
                        ) : (
                          <FiRefreshCw
                            className={`text-2xl ${
                              notification.read
                                ? "text-gray-600"
                                : "text-blue-600"
                            }`}
                          />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>

                        <p className="text-gray-600 mb-3">
                          {notification.message}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(
                              notification.type
                            )}`}
                          >
                            {notification.type?.charAt(0)?.toUpperCase() +
                              notification.type?.slice(1).toUpperCase() +
                              notification.type.slice(1)}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(
                              notification.priority
                            )}`}
                          >
                            {notification.priority.charAt(0).toUpperCase() +
                              notification.priority.slice(1)}{" "}
                            Priority
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                              notification.status
                            )}`}
                          >
                            {notification.status.charAt(0).toUpperCase() +
                              notification.status.slice(1)}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FiClock />
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          <span>Booking: {notification.bookingId}</span>
                          <span>Amount: ${notification.amount.toFixed(2)}</span>
                          <div className="flex items-center gap-1">
                            <span>Sent via:</span>
                            {notification.sentVia.includes("email") && (
                              <FiMail className="text-blue-500" />
                            )}
                            {notification.sentVia.includes("sms") && (
                              <FiMessageSquare className="text-green-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">


<button
  onClick={() => confirmDeleteOne(notification.id)}
  className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
  title="Delete notification"
>
  <FiXCircle className="text-xl" />
</button>






                      {/* <button
                        onClick={() => handleViewDetails(notification)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FiEye className="text-xl" />
                      </button> */}
                      {/* <button
                        onClick={() => handleShareWithSupport(notification)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        title="Share with Support"
                      >
                        <FiShare2 className="text-xl" />
                      </button> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* {selectedNotification && !showShareModal && (
          <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Notification Details
                  </h2>
                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiXCircle className="text-2xl" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Notification ID
                    </label>
                    <p className="mt-1 text-gray-900 font-semibold">
                      {selectedNotification.id}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Type
                      </label>
                      <div className="mt-1">
                        <span
                          className={`px-3 py-1 text-sm font-semibold rounded-full ${getTypeBadge(
                            selectedNotification.type
                          )}`}
                        >
                          {selectedNotification.type
                            ? selectedNotification.type
                                .charAt(0)
                                .toUpperCase() +
                              selectedNotification.type.slice(1)
                            : "System"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Priority
                      </label>
                      <div className="mt-1">
                        <span
                          className={`px-3 py-1 text-sm font-semibold rounded-full ${getPriorityBadge(
                            selectedNotification.priority
                          )}`}
                        >
                          {selectedNotification.priority
                            .charAt(0)
                            .toUpperCase() +
                            selectedNotification.priority.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Name
                        </label>
                        <p className="mt-1 text-gray-900">
                          {selectedNotification.customerName}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Email
                        </label>
                        <p className="mt-1 text-gray-900">
                          {selectedNotification.customerEmail}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Phone
                        </label>
                        <p className="mt-1 text-gray-900">
                          {selectedNotification.customerPhone}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Service
                        </label>
                        <p className="mt-1 text-gray-900">
                          {selectedNotification.service}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Booking Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Booking ID
                        </label>
                        <p className="mt-1 text-gray-900 font-semibold">
                          {selectedNotification.bookingId}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Transaction ID
                        </label>
                        <p className="mt-1 text-gray-900 font-semibold">
                          {selectedNotification.transactionId}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Amount
                        </label>
                        <p className="mt-1 text-gray-900 font-bold text-lg">
                          ${selectedNotification.amount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Timestamp
                        </label>
                        <p className="mt-1 text-gray-900">
                          {new Date(
                            selectedNotification.timestamp
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-gray-500">
                      Cancellation Reason
                    </label>
                    <p className="mt-1 text-gray-900">
                      {selectedNotification.cancellationReason}
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-gray-500">
                      Notification Sent Via
                    </label>
                    <div className="mt-2 flex gap-2">
                      {selectedNotification.sentVia.includes("email") && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          <FiMail /> Email
                        </span>
                      )}
                      {selectedNotification.sentVia.includes("sms") && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          <FiMessageSquare /> SMS
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processShare}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <FiSend />
                    Share with Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        )} */}

        {showSettingsModal && (
          <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Notification Settings
                  </h2>
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiXCircle className="text-2xl" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="border-b pb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <FiMail className="text-2xl text-blue-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Email Notifications
                          </h3>
                          <p className="text-sm text-gray-600">
                            Receive alerts via email
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailEnabled}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              emailEnabled: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    {notificationSettings.emailEnabled && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={notificationSettings.emailAddress}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              emailAddress: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>

                  <div className="border-b pb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <FiMessageSquare className="text-2xl text-green-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            SMS Notifications
                          </h3>
                          <p className="text-sm text-gray-600">
                            Receive alerts via text message
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.smsEnabled}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              smsEnabled: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                    {notificationSettings.smsEnabled && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={notificationSettings.smsNumber}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              smsNumber: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    )}
                  </div>

                  <div className="border-b pb-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Notification Types
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            Cancellation Requests
                          </p>
                          <p className="text-sm text-gray-600">
                            Get notified when customers request cancellations
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.notifyOnCancellation}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                notifyOnCancellation: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            Refund Requests
                          </p>
                          <p className="text-sm text-gray-600">
                            Get notified when refund requests are submitted
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.notifyOnRefund}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                notifyOnRefund: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Additional Settings
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            Sound Alerts
                          </p>
                          <p className="text-sm text-gray-600">
                            Play sound when new notifications arrive
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.soundEnabled}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                soundEnabled: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            Auto-forward to Support
                          </p>
                          <p className="text-sm text-gray-600">
                            Automatically share high priority alerts with
                            support team
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.autoForward}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                autoForward: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      console.log(
                        "Notification settings saved:",
                        notificationSettings
                      );
                      alert("Settings saved successfully!");
                      setShowSettingsModal(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <FiCheckCircle />
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSystem;
