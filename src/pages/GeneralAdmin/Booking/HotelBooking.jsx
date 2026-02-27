import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Stack, Skeleton, TablePagination } from "@mui/material";
import {
  getHotelBookings,
  updateHotelBookingStatus,
} from "../../../features/action/booking";
import { Tooltip as ReactTooltip } from "react-tooltip";
import HotelBookingModal from "../../../components/Modal/HotelBookingModal";

const HotelBooking = () => {
  const { hotelData, isUpdated, isLoading } = useSelector(
    (state) => state.booking
  );
  const dispatch = useDispatch();

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState();

  const handleViewModal = (itemData) => {
    setShowViewModal(true);
    setViewData(itemData);
  };
  // Track edited statuses per booking ID
  const [editedStatuses, setEditedStatuses] = useState({});

  const handleSave = async (id) => {
    try {
      const newStatus = editedStatuses[id];
      // 👇 Call your API here
      dispatch(
        updateHotelBookingStatus({
          id,
          status: newStatus,
        })
      );

      // ✅ Refresh bookings after successful save
      dispatch(getHotelBookings());

      // After save, mark as clean
      setEditedStatuses((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = (id) => {
    setEditedStatuses((prev) => {
      const newStatuses = { ...prev };
      delete newStatuses[id]; // remove edit state
      return newStatuses;
    });
  };

  // 🔹 Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1); // ✅ Reset to first page
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // fetch on first load
  useEffect(() => {
    dispatch(
      getHotelBookings({
        page: currentPage,
        limit: rowsPerPage,
        search: debouncedSearch, // include search
      })
    );
  }, [currentPage, rowsPerPage, debouncedSearch]);

  // refetch after update
  useEffect(() => {
    if (isUpdated) {
      dispatch(
        getHotelBookings({
          page: currentPage,
          limit: rowsPerPage,
          search: debouncedSearch, // include search
        })
      );
    }
  }, [isUpdated, currentPage, rowsPerPage, debouncedSearch]);

  return (
    <>
      <div className=" mx-auto ">
        <label
          for="default-search"
          class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
        >
          Search
        </label>

        <div className="items-start justify-between md:flex">
          <div className="max-w-lg">
            <h3 className="text-gray-800 text-xl font-bold sm:text-2xl">
              Manage Hotel Bookings
            </h3>
          </div>
        </div>
        <div class="relative mt-4 ">
          <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              class="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Booking ID or Name"
            className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="text-white absolute end-2.5 bottom-2.5 bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2"
            >
              Clear
            </button>
          )}
        </div>
        <div className="mt-5 shadow-sm border rounded-lg overflow-x-auto">
          <table className="w-full table-auto text-sm text-left ">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b justify-between">
              <tr>
                <th className="py-3 px-6">Booking ID</th>
                <th className="py-3 px-6">Lead Guest</th>
                <th className="py-3 px-6">Hotel</th>
                <th className="py-3 px-6">Check In/Out</th>
                <th className="py-3 px-6">Amount</th>
                <th className="py-3 px-6">Payment Status</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="text-center px-6 py-8">
                    <Stack spacing={4}>
                      <Skeleton variant="rounded" height={30} />
                      <Skeleton variant="rounded" height={25} />
                      <Skeleton variant="rounded" height={20} />
                      <Skeleton variant="rounded" height={20} />
                      <Skeleton variant="rounded" height={20} />
                    </Stack>
                  </td>
                </tr>
              ) : Array.isArray(hotelData?.data) &&
                hotelData?.data?.length > 0 ? (
                hotelData?.data?.map((item, idx) => {
                  const currentStatus = editedStatuses[item._id] ?? item.status;

                  return (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item?.bookingId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item?.details?.guestInfo?.leadGuest}
                      </td>
                      <td
                        data-tooltip-id="hotel-tooltip"
                        data-tooltip-content={
                          item?.details?.hotelInfo?.hotelName
                        }
                        className="px-6 py-4 whitespace-nowrap max-w-44 truncate"
                      >
                        {item?.details?.hotelInfo?.hotelName}
                        <ReactTooltip id="hotel-tooltip" />
                      </td>
                      <td
                        data-tooltip-id="checkInOut-tooltip"
                        data-tooltip-content={`${item?.details?.checkIn?.date} / ${item?.details?.checkOut?.date}`}
                        className="px-6 py-4 whitespace-nowrap"
                      >
                        {new Date(
                          item?.details?.checkIn?.date
                        ).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })}
                        {" - "}
                        {new Date(
                          item?.details?.checkOut?.date
                        ).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })}
                        <ReactTooltip id="checkInOut-tooltip" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ₹ {item?.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap uppercase ">
                        {item?.paymentStatus === "paid" ? (
                          <span className="bg-green-600 text-white px-2 py-1 rounded-2xl font-medium">
                            {item?.paymentStatus}
                          </span>
                        ) : item?.paymentStatus === "refunded" ? (
                          <span className="bg-blue-700 text-white px-2 py-1 rounded-2xl font-medium">
                            {item?.paymentStatus}
                          </span>
                        ) : item?.paymentStatus ===
                          "full refund with extra charge" ? (
                          <span className="bg-purple-600 text-white px-2 py-1 rounded-2xl font-medium">
                            {item?.paymentStatus}
                          </span>
                        ) : (
                          <span className="bg-red-700 text-white px-2 py-1 rounded-2xl font-medium">
                            {item?.paymentStatus}
                          </span>
                        )}
                      </td>

                      {/* ✅ Order status dropdown */}
                      <td className="px-6 py-4 whitespace-nowrap capitalize ">
                        <select
                          value={currentStatus}
                          onChange={(e) =>
                            setEditedStatuses((prev) => ({
                              ...prev,
                              [item._id]: e.target.value,
                            }))
                          }
                          disabled={
                            item?.status === "cancelled" &&
                            (item?.paymentStatus === "refunded" ||
                              item?.paymentStatus ===
                                "full refund with extra charge")
                          }
                          className={`border border-gray-300 rounded-lg px-2 py-1 outline-none
    ${
      currentStatus === "pending"
        ? "text-yellow-600 font-semibold"
        : currentStatus === "confirmed"
        ? "text-green-600 font-semibold"
        : currentStatus === "cancelled"
        ? "text-red-700 font-semibold"
        : "text-gray-700"
    }
    ${
      item?.status === "cancelled" &&
      (item?.paymentStatus === "refunded" ||
        item?.paymentStatus === "full refund with extra charge")
        ? "bg-gray-100 cursor-not-allowed appearance-none"
        : ""
    }
  `}
                        >
                          <option
                            value="pending"
                            className="text-gray-800 font-medium"
                          >
                            Pending
                          </option>

                          <option
                            value="confirmed"
                            className="text-gray-800 font-medium"
                          >
                            Confirmed
                          </option>

                          <option
                            value="cancelled"
                            className="text-gray-800 font-medium"
                          >
                            Cancelled
                          </option>
                        </select>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                        {/* ✅ If status is edited → Show Save + Cancel */}
                        {editedStatuses[item._id] &&
                        editedStatuses[item._id] !== item.status ? (
                          <>
                            <button
                              onClick={() => handleSave(item._id)}
                              className="py-2 px-3 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => handleCancel(item._id)}
                              className="py-2 px-3 font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          /* ✅ If no edit → Show View button */
                          <button
                            onClick={() => {
                              handleViewModal(item);
                            }}
                            className="py-2 font-semibold text-blue-500 hover:text-blue-700 duration-150 hover:bg-gray-50 rounded-lg"
                          >
                            View Full Details
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr className="">
                  {" "}
                  <td colSpan="8" className="text-center px-6 py-8">
                    No matching bookings found. Please adjust your search and
                    try again.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* 🔹 Pagination */}
        <div className="flex justify-center mt-4">
          <TablePagination
            component="div"
            count={hotelData?.total || 0}
            page={currentPage - 1} // ✅ Convert to 0-based index for MUI
            onPageChange={(event, newPage) => setCurrentPage(newPage + 1)} // ✅ Convert back to 1-based
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>
      </div>
      {showViewModal && (
        <HotelBookingModal setModal={setShowViewModal} viewData={viewData} />
      )}
    </>
  );
};

export default HotelBooking;
