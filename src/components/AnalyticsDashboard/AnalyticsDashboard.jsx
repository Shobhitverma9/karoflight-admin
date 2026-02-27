import React, { useState, useEffect } from 'react';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiUsers,
  FiXCircle,
  FiCheckCircle,
  FiRefreshCw,
  FiBarChart2,
  FiPieChart,
  FiActivity,
  FiDownload,
  FiFilter
} from 'react-icons/fi';
import { FaRupeeSign } from "react-icons/fa";

import { useDispatch, useSelector } from "react-redux";
import { fetchAdminAnalytics } from "../../features/slices/adminAnalyticsSlice";

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState("7days");
  const [selectedMetric, setSelectedMetric] = useState("overview");
  const [isRealTime, setIsRealTime] = useState(true);

  const dispatch = useDispatch();

  // ✅ FIRST: read from Redux
  const {
    analytics = {},
    chartData = {},
    recentActivity = [],
    loading,
  } = useSelector((state) => state.adminAnalytics);

  // ✅ SECOND: derive safe arrays
  const dailyBookings = chartData.dailyBookings || [];
  const revenueByService = chartData.revenueByService || [];
  const topPerformers = chartData.topPerformers || [];
  const cancellationReasons = chartData.cancellationReasons || [];

  // ✅ THIRD: computed values
  const maxDailyBookings =
    dailyBookings.length > 0
      ? Math.max(...dailyBookings.map((d) => d.bookings))
      : 1;

  useEffect(() => {
    dispatch(fetchAdminAnalytics({ range: timeRange }));
  }, [dispatch, timeRange]);

if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="text-gray-500">Loading analytics…</span>
    </div>
  );
}


  const getActivityIcon = (type) => {
    return type === 'booking' ? <FiCheckCircle className="text-green-500" /> : <FiXCircle className="text-orange-500" />;
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      refunded: 'bg-orange-100 text-orange-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const exportReport = () => {
    const reportData = {
      analytics,
      chartData,
      recentActivity,
      generatedAt: new Date().toISOString()
    };
    
    console.log('Exporting analytics report:', reportData);
    alert('Analytics report exported successfully! Check console for details.');
  };


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Real-time booking, cancellation, and revenue analytics</p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
              <div className={`w-2 h-2 rounded-full ${isRealTime ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-medium text-gray-700">
                {isRealTime ? 'Live' : 'Paused'}
              </span>
              <button
                onClick={() => setIsRealTime(!isRealTime)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <FiRefreshCw className={isRealTime ? 'animate-spin' : ''} />
              </button>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="year">This Year</option>
            </select>
            <button
              onClick={exportReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiDownload />
              Export
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiBarChart2 className="text-2xl text-blue-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${analytics.bookingGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.bookingGrowth >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                {Math.abs(analytics.bookingGrowth)}%
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Total Bookings</h3>
            <p className="text-3xl font-bold text-gray-900">{analytics.totalBookings.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">{analytics.activeBookings} active bookings</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
<FaRupeeSign className="text-2xl text-green-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.revenueGrowth >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                {Math.abs(analytics.revenueGrowth)}%
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Total Revenue</h3>
            <p className="text-3xl font-bold text-gray-900">₹{analytics.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            <p className="text-xs text-gray-500 mt-2">Avg: ₹{analytics.averageBookingValue.toFixed(2)} per booking</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FiXCircle className="text-2xl text-orange-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${analytics.cancellationGrowth <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.cancellationGrowth <= 0 ? <FiTrendingDown /> : <FiTrendingUp />}
                {Math.abs(analytics.cancellationGrowth)}%
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Cancellations</h3>
            <p className="text-3xl font-bold text-gray-900">{analytics.totalCancellations}</p>
            <p className="text-xs text-gray-500 mt-2">Rate: {analytics.cancellationRate}%</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiCheckCircle className="text-2xl text-purple-600" />
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                <FiTrendingUp />
                5.2%
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Completed</h3>
            <p className="text-3xl font-bold text-gray-900">{analytics.completedBookings.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">{analytics.pendingBookings} pending</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Bookings Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Daily Bookings</h2>
              <FiBarChart2 className="text-gray-400" />
            </div>
            <div className="space-y-4">
{dailyBookings.map((day, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{day.date}</span>
                    <div className="flex gap-4">
                      <span className="text-green-600">{day.bookings} bookings</span>
                      <span className="text-orange-600">{day.cancellations} cancelled</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(day.bookings / maxDailyBookings) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 w-20 text-right">₹{(day.revenue / 1000).toFixed(1)}k</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by Service */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Revenue by Service</h2>
              <FiPieChart className="text-gray-400" />
            </div>
            <div className="space-y-4">
              {revenueByService.map((service, index) => {
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${colors[index]}`}></div>
                        <span className="text-sm font-medium text-gray-700">{service.service}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">₹{service.revenue.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{service.bookings} bookings</p>
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${colors[index]} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${service.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Top Performers */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Top Performers</h2>
              <FiActivity className="text-gray-400" />
            </div>
            <div className="space-y-4">
{topPerformers.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.category}</p>
                      <p className="text-sm text-gray-600">{item.bookings} bookings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{item.revenue.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <FiTrendingUp />
                      {item.growth}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cancellation Reasons */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Cancellation Reasons</h2>
              <FiXCircle className="text-gray-400" />
            </div>
            <div className="space-y-3">
{cancellationReasons.map((reason, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700">{reason.reason}</span>
                    <span className="font-semibold text-gray-900">{reason.count}</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-orange-400 to-red-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${reason.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{reason.percentage}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isRealTime ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600">Live updates</span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentActivity.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getActivityIcon(activity.type)}
                        <span className="text-sm font-medium text-gray-900 capitalize">{activity.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.user}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{activity.service}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{activity.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(activity.status)}`}>
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;