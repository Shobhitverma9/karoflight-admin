// Admin/src/components/SearchFlightHotel/HotelBookingPage.jsx
import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

const HotelBookingPage = () => {
  const { name, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { hotel, nights, searchParams } = location.state || {};

  console.log("Hotel Booking Page:", { name, id, hotel, location });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            ← Back to Results
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Hotel Booking: {hotel?.name || name}
          </h1>
          <p className="text-gray-600 mb-6">Hotel ID: {id}</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Hotel Details</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Price per night:</strong> ₹{hotel?.price?.toLocaleString() || "N/A"}</p>
                  <p><strong>Total for {nights} nights:</strong> ₹{(hotel?.price * nights)?.toLocaleString() || "N/A"}</p>
                  <p><strong>Rating:</strong> {hotel?.rating || "N/A"}</p>
                  <p><strong>Location:</strong> {hotel?.location || "N/A"}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Booking Form</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Check-in Date</label>
                    <input type="date" className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Check-out Date</label>
                    <input type="date" className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Guests</label>
                    <input type="number" defaultValue={2} className="w-full p-2 border rounded" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 sticky top-6">
                <h3 className="text-xl font-bold mb-4">Price Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Room Price ({nights} nights)</span>
                    <span className="font-semibold">₹{(hotel?.price * nights)?.toLocaleString() || "0"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes & Fees</span>
                    <span className="font-semibold">₹{Math.round((hotel?.price * nights * 0.18) || 0).toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₹{Math.round((hotel?.price * nights * 1.18) || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <button className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600">
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelBookingPage;