import React, { useState } from "react";
import FlightHome from "../../../components/SuperAdmin/SearchFlightHotel/Flight/FlightHome";
import HotelHome from "../../../components/SuperAdmin/SearchFlightHotel/Hotel/HotelHome";
import { MdFlight } from "react-icons/md";
import { FaHotel } from "react-icons/fa";

const AdminSearch = () => {
  const [activeTab, setActiveTab] = useState("flight"); // flight | hotel

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Top Toggle */}
      <div className="flex justify-center pt-6">
        <div className="bg-white rounded-xl shadow-sm flex overflow-hidden border">
          <button
            onClick={() => setActiveTab("flight")}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition ${
              activeTab === "flight"
                ? "bg-[#1E293B] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <MdFlight />
            Flight
          </button>

          <button
            onClick={() => setActiveTab("hotel")}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition ${
              activeTab === "hotel"
                ? "bg-[#1E293B] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FaHotel />
            Hotels
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === "flight" ? <FlightHome /> : <HotelHome />}
      </div>
    </div>
  );
};

export default AdminSearch;