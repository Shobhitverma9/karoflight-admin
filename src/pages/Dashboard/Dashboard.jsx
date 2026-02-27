import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";

import TabNavigation from "./components/TabNavigation";
import DashboardMetrics from "./components/DashboardMetrics";
import DashboardCharts from "./components/DashboardCharts";
import CustomerTable from "./components/CustomerTable";

import {
  fetchDashboardAnalytics,
  fetchCustomers,
} from "../../features/slices/dashboard.slice";

export default function Dashboard() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("overview");

  // 🔥 Fetch data when dashboard loads
  useEffect(() => {
    dispatch(fetchDashboardAnalytics({ range: "7days" }));
  }, [dispatch]);

  // 🔥 Fetch customers only when customer tab is opened
  useEffect(() => {
    if (activeTab === "customers") {
      dispatch(fetchCustomers());
    }
  }, [activeTab, dispatch]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Travel Dashboard</h1>

      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "overview" && (
        <>
          <DashboardMetrics />
          <DashboardCharts />
        </>
      )}

      {activeTab === "customers" && <CustomerTable />}
    </div>
  );
}
