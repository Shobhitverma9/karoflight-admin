import { useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DashboardCharts = () => {
  const dailyBookings = useSelector(
    (s) => s.dashboard.analytics.chartData.dailyBookings
  );

  if (!dailyBookings.length) {
    return (
      <div className="bg-white p-5 rounded-xl shadow text-center text-gray-500">
        No booking data available
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h2 className="font-semibold mb-4">Bookings Trend</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={dailyBookings}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="bookings" fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardCharts;
