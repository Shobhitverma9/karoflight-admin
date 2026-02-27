import { useSelector } from "react-redux";
import { LuBookOpen, LuDollarSign, LuUsers, LuRefreshCw } from "react-icons/lu";
import { MdOutlineCancel } from "react-icons/md";
import { FaRupeeSign } from "react-icons/fa";
const DashboardMetrics = () => {
  const analytics = useSelector(
    (s) => s.dashboard.analytics.analytics
  );

  const stats = [
    {
      title: "Total Bookings",
      value: analytics.totalBookings,
      icon: <LuBookOpen size={20} />,
    },
    {
      title: "Revenue",
      value: `₹${analytics.totalRevenue}`,
      icon: <FaRupeeSign size={20} />,
    },
    {
      title: "Completed",
      value: analytics.completedBookings,
      icon: <LuUsers size={20} />,
    },
    {
      title: "Cancellations",
      value: analytics.totalCancellations,
      icon: <MdOutlineCancel size={20} />,
    },
    {
      title: "Avg Booking",
      value: `₹${Math.round(analytics.averageBookingValue)}`,
      icon: <LuRefreshCw size={20} />,
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {stats.map((item, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow p-5 flex items-center gap-4"
        >
          <div className="p-3 bg-gray-100 rounded-lg">{item.icon}</div>
          <div>
            <p className="text-sm text-gray-500">{item.title}</p>
            <p className="text-xl font-bold">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardMetrics;
