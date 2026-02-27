import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import { toast } from "react-hot-toast";
import {
  LuUsers,
  LuMail,
  LuFilter,
  LuSearch,
  LuDownload,
  LuTrash2,
  LuRefreshCw,
  LuChevronDown,
  LuChevronUp,
} from "react-icons/lu";

const SubscribersPage = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [unsubscribing, setUnsubscribing] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Get token from Redux store and sessionStorage
  const { token, user } = useSelector((state) => state.auth);
  const baseURL = import.meta.env.VITE_RENDER_API_BASE_URL;

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Get token with proper priority
  const getToken = () => {
    // Priority: Redux -> sessionStorage -> localStorage
    return (
      token || sessionStorage.getItem("token") || localStorage.getItem("token")
    );
  };

  // Helper function to safely extract user ID
  const getUserId = (userData) => {
    if (!userData) return null;
    
    if (typeof userData === 'string') {
      return userData;
    }
    
    // If it's an object, try common ID fields
    return userData._id || userData.id || userData.userId || null;
  };

  // Fetch all subscribers from backend
  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const authToken = getToken();

      console.log("🔍 Fetching subscribers...");
      console.log("Token exists:", !!authToken);
      console.log("Token preview:", authToken?.substring(0, 20) + "...");
      console.log("API URL:", `${baseURL}/subscriptions/all`);

      if (!authToken) {
        throw new Error("Authentication required. Please login.");
      }

      const response = await fetch(`${baseURL}/subscriptions/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Request headers:", {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      });

      console.log("Response status:", response.status);

      if (response.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch subscribers: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("✅ Subscribers data:", data);

      // FIXED: Handle the actual response structure
      let subscribersList = [];
      
      if (data.subscribers && Array.isArray(data.subscribers)) {
        // Direct subscribers array
        subscribersList = data.subscribers;
      } else if (data.data && Array.isArray(data.data)) {
        // Nested data.subscribers structure
        subscribersList = data.data;
      } else if (data.success && data.data && Array.isArray(data.data)) {
        // Success wrapper with data
        subscribersList = data.data;
      } else if (Array.isArray(data)) {
        // Direct array response
        subscribersList = data;
      }
      
      console.log("📋 Processed subscribers list:", subscribersList);
      setSubscribers(subscribersList);
      
      if (subscribersList.length > 0) {
        toast.success(`Loaded ${subscribersList.length} subscribers`);
      } else {
        toast.info("No subscribers found");
      }
      
    } catch (error) {
      console.error("❌ Error fetching subscribers:", error);
      toast.error(error.message || "Failed to load subscribers");
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  // Unsubscribe user
  const handleUnsubscribe = async (email) => {
    if (!window.confirm(`Are you sure you want to unsubscribe ${email}?`)) {
      return;
    }

    setUnsubscribing((prev) => ({ ...prev, [email]: true }));

    try {
      const authToken = getToken();

      if (!authToken) {
        throw new Error("Authentication required. Please login.");
      }

      const response = await fetch(
        `${baseURL}/subscriptions/unsubscribe?email=${encodeURIComponent(
          email
        )}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to unsubscribe: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.success) {
        toast.success("Subscriber unsubscribed successfully");
        // Refresh the list
        fetchSubscribers();
      } else {
        throw new Error(data.message || "Failed to unsubscribe");
      }
    } catch (error) {
      console.error("Error unsubscribing:", error);
      toast.error(error.message || "Failed to unsubscribe");
    } finally {
      setUnsubscribing((prev) => ({ ...prev, [email]: false }));
    }
  };

  // Export subscribers to CSV
  const exportSubscribers = () => {
    const activeSubscribers = subscribers.filter(
      (sub) => sub.status === "active"
    );

    if (activeSubscribers.length === 0) {
      toast.error("No active subscribers to export");
      return;
    }

    const csvHeaders = "Email,User ID,Subscribed Date,Status\n";
    const csvRows = activeSubscribers
      .map(
        (sub) =>
          `"${sub.email}","${getUserId(sub.userId) || "N/A"}","${new Date(
            sub.subscribedAt
          ).toLocaleDateString()}","${sub.status}"`
      )
      .join("\n");

    const csvContent = csvHeaders + csvRows;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${activeSubscribers.length} subscribers`);
  };

  // Filter subscribers based on search and filters
  const filteredSubscribers = subscribers.filter((subscriber) => {
    const matchesSearch = subscriber.email
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || subscriber.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalSubscribers = subscribers.length;
  const activeSubscribers = subscribers.filter(
    (sub) => sub.status === "active"
  ).length;
  const inactiveSubscribers = subscribers.filter(
    (sub) => sub.status === "unsubscribed"
  ).length;
  const activeRate =
    totalSubscribers > 0
      ? ((activeSubscribers / totalSubscribers) * 100).toFixed(1)
      : 0;

  // New subscribers this month
  const newThisMonth = subscribers.filter((sub) => {
    const subDate = new Date(sub.subscribedAt);
    const now = new Date();
    return (
      subDate.getMonth() === now.getMonth() &&
      subDate.getFullYear() === now.getFullYear()
    );
  }).length;

  useEffect(() => {
    const authToken = getToken();

    if (!authToken) {
      toast.error("Please login to view subscribers");
      setLoading(false);
      return;
    }

    fetchSubscribers();
  }, []);

  // Mobile Card Component
  const SubscriberCard = ({ subscriber }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <LuMail className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {subscriber.email}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Subscribed: {new Date(subscriber.subscribedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
            subscriber.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {subscriber.status}
        </span>
      </div>
      
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          {new Date(subscriber.subscribedAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
        {subscriber.status === "active" ? (
          <button
            onClick={() => handleUnsubscribe(subscriber.email)}
            disabled={unsubscribing[subscriber.email]}
            className="text-red-600 hover:text-red-900 inline-flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {unsubscribing[subscriber.email] ? (
              <>
                <ClipLoader size={12} color="#dc2626" />
                <span>Unsubscribing...</span>
              </>
            ) : (
              <>
                <LuTrash2 className="w-4 h-4" />
                <span>Unsubscribe</span>
              </>
            )}
          </button>
        ) : (
          <span className="text-gray-400 text-sm">Unsubscribed</span>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ClipLoader size={40} color="#3B82F6" />
          <p className="mt-4 text-gray-600">Loading subscribers...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!getToken()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-lg p-6 sm:p-8 max-w-md w-full">
          <div className="text-red-500 mb-4">
            <LuUsers className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            Please login to view subscribers
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <LuUsers className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
                  Subscribers Management
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">
                  Manage your newsletter subscriber list
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 self-stretch sm:self-auto">
              <button
                onClick={fetchSubscribers}
                disabled={loading}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:border-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex-1 sm:flex-none justify-center"
              >
                <LuRefreshCw
                  className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`}
                />
                <span className="hidden xs:inline">Refresh</span>
              </button>
              <button
                onClick={exportSubscribers}
                disabled={subscribers.length === 0}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:border-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex-1 sm:flex-none justify-center"
              >
                <LuDownload className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Export CSV</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 border-l-4 border-indigo-500">
            <p className="text-xs sm:text-sm text-gray-600">Total Subscribers</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
              {totalSubscribers}
            </p>
            <p className="text-xs text-gray-600 mt-1 sm:mt-2">All time subscribers</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 border-l-4 border-green-500">
            <p className="text-xs sm:text-sm text-gray-600">Active Subscribers</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
              {activeSubscribers}
            </p>
            <p className="text-xs text-gray-600 mt-1 sm:mt-2">
              {activeRate}% active rate
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 border-l-4 border-blue-500">
            <p className="text-xs sm:text-sm text-gray-600">Unsubscribed</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
              {inactiveSubscribers}
            </p>
            <p className="text-xs text-gray-600 mt-1 sm:mt-2">
              {totalSubscribers > 0
                ? ((inactiveSubscribers / totalSubscribers) * 100).toFixed(1)
                : 0}
              % rate
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 border-l-4 border-purple-500">
            <p className="text-xs sm:text-sm text-gray-600">New This Month</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
              {newThisMonth}
            </p>
            <p className="text-xs text-gray-600 mt-1 sm:mt-2">Current month growth</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          {/* Mobile Filter Toggle */}
          <div className="sm:hidden flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Filters & Search</h3>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 p-2"
            >
              <LuFilter className="w-4 h-4" />
              {showMobileFilters ? <LuChevronUp className="w-4 h-4" /> : <LuChevronDown className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="relative flex-1">
              <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent w-full text-sm sm:text-base"
              />
            </div>

            {/* Desktop Filters */}
            <div className="hidden sm:flex items-center gap-3">
              <LuFilter className="text-gray-600 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm sm:text-base"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="unsubscribed">Unsubscribed</option>
              </select>
            </div>

            {/* Mobile Filters */}
            <div className={`sm:hidden space-y-3 ${showMobileFilters ? 'block' : 'hidden'}`}>
              <div className="flex items-center gap-3">
                <LuFilter className="text-gray-600 w-4 h-4" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="unsubscribed">Unsubscribed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Subscribers List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredSubscribers.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <LuUsers className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
              <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-gray-900">
                No subscribers found
              </h3>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500 px-4">
                {subscribers.length === 0
                  ? "You don't have any subscribers yet."
                  : "No subscribers match your current filters."}
              </p>
            </div>
          ) : isMobile ? (
            // Mobile Card View
            <div className="p-3 sm:p-4">
              {filteredSubscribers.map((subscriber) => (
                <SubscriberCard key={subscriber._id} subscriber={subscriber} />
              ))}
            </div>
          ) : (
            // Desktop Table View
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscribed Date
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubscribers.map((subscriber) => {
                    const userId = getUserId(subscriber.userId);
                    return (
                      <tr key={subscriber._id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <LuMail className="w-4 h-4 text-gray-400 mr-2" />
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {subscriber.email}
                            </div>
                          </div>
                        </td>
                       
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              subscriber.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {subscriber.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(subscriber.subscribedAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                          <div className="text-xs text-gray-400">
                            {new Date(subscriber.subscribedAt).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                          {subscriber.status === "active" ? (
                            <button
                              onClick={() => handleUnsubscribe(subscriber.email)}
                              disabled={unsubscribing[subscriber.email]}
                              className="text-red-600 hover:text-red-900 inline-flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              {unsubscribing[subscriber.email] ? (
                                <>
                                  <ClipLoader size={12} color="#dc2626" />
                                  <span>Unsubscribing...</span>
                                </>
                              ) : (
                                <>
                                  <LuTrash2 className="w-4 h-4" />
                                  <span>Unsubscribe</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              Unsubscribed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          {filteredSubscribers.length > 0 && (
            <div className="bg-gray-50 px-3 sm:px-6 py-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <p className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                  Showing{" "}
                  <span className="font-medium">
                    {filteredSubscribers.length}
                  </span>{" "}
                  of <span className="font-medium">{subscribers.length}</span>{" "}
                  subscribers
                </p>
                <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SubscribersPage;