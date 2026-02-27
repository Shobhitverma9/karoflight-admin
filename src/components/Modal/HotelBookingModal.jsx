export default function HotelBookingModal({ viewData, setModal }) {
  const createdAtDate = viewData?.createdAt
    ? new Date(viewData?.createdAt)
    : null;
  const formattedDate = createdAtDate
    ? createdAtDate.toISOString().split("T")[0]
    : "";
  const checkInDateString = viewData?.details?.checkIn?.date;
  const checkOutDateString = viewData?.details?.checkOut?.date;
  const checkInDate = checkInDateString ? new Date(checkInDateString) : null;
  const checkOutDate = checkOutDateString ? new Date(checkOutDateString) : null;

  const checkInDay = checkInDate
    ? checkInDate.toLocaleDateString("en-US", {
        weekday: "long",
      }) // "Monday"
    : "";
  const checkOutDay = checkOutDate
    ? checkOutDate.toLocaleDateString("en-US", {
        weekday: "long",
      }) // "Monday"
    : "";
  return (
    <div
      className="fixed top-0 left-0 z-40 flex h-screen w-screen items-center justify-center bg-slate-300/20 backdrop-blur-sm"
      onClick={() => setModal(false)} // ✅ close on background click
      aria-labelledby="header-3a content-3a"
      aria-modal="true"
      role="dialog"
    >
      {/*    <!-- Modal --> */}
      <div
        className="flex sm:min-h-[90%] max-w-[100vw] w-full sm:w-[80%] px-4 sm:px-6 flex-col gap-6 overflow-hidden rounded bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()} // ✅ prevent close on content click
        role="document"
      >
        {/*        <!-- Modal header --> */}
        <header id="header-3a" className="flex items-center gap-4">
          <h3 className="flex-1  font-medium text-slate-700">
            Booking Id : {viewData?.bookingId}
          </h3>
          <div className="text-slate-700">Booked On : {formattedDate} </div>
          <button
            onClick={() => setModal(false)}
            className="inline-flex h-10 items-center justify-center gap-2 justify-self-center whitespace-nowrap rounded-full px-5 text-sm font-medium tracking-wide text-emerald-500 transition duration-300 hover:bg-emerald-100 hover:text-emerald-600 focus:bg-emerald-200 focus:text-emerald-700 focus-visible:outline-none disabled:cursor-not-allowed disabled:text-emerald-300 disabled:shadow-none disabled:hover:bg-transparent"
            aria-label="close dialog"
          >
            <span className="relative only:-mx-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
                role="graphics-symbol"
                aria-labelledby="title-79 desc-79"
              >
                <title id="title-79">Icon title</title>
                <desc id="desc-79">
                  A more detailed description of the icon
                </desc>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </span>
          </button>
        </header>
        {/*        <!-- Modal body --> */}
        {/* Modal Body */}
        <div id="content-3a" className="flex-1 overflow-auto space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Hotel Info */}
            <table className="w-full table-auto text-sm border border-gray-300">
              <thead>
                <tr>
                  <th
                    colSpan="2"
                    className="bg-gray-100 p-2 text-left text-base font-semibold text-gray-700"
                  >
                    Hotel Information
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr>
                  <td className="py-2 px-4 border-t border-gray-300">
                    Hotel Name
                  </td>
                  <td className="py-2 px-4 border-t border-gray-300">
                    {viewData?.details?.hotelInfo?.hotelName || "N/A"}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-t border-gray-300">
                    Address
                  </td>
                  <td className="py-2 px-4 border-t border-gray-300">
                    {viewData?.details?.hotelInfo?.address || "N/A"}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-t border-gray-300">
                    Room Type
                  </td>
                  <td className="py-2 px-4 border-t border-gray-300">
                    {viewData?.details?.roomInfo?.type || "N/A"}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-t border-gray-300">
                    Single Room Guest Capacity
                  </td>
                  <td className="py-2 px-4 border-t border-gray-300">
                    {viewData?.details?.roomInfo?.capacity || "N/A"}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Room Date Info */}
            <table className="w-full table-auto text-sm border border-gray-300">
              <thead>
                <tr>
                  <th
                    colSpan="2"
                    className="bg-gray-100 p-2 text-left text-base font-semibold text-gray-700"
                  >
                    Room Date Info
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr>
                  <td className="py-2 px-4 border-t border-gray-300">
                    Check In
                  </td>
                  <td className="py-2 px-4 border-t border-gray-300">
                    {viewData?.details?.checkIn?.date || "N/A"} - {checkInDay} -{" "}
                    {viewData?.details?.checkIn?.time || "N/A"}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-t border-gray-300">
                    Check Out
                  </td>
                  <td className="py-2 px-4 border-t border-gray-300">
                    {viewData?.details?.checkOut?.date || "N/A"} - {checkOutDay}{" "}
                    - {viewData?.details?.checkOut?.time || "N/A"}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Booking Info */}
            <table className="w-full table-auto text-sm border border-gray-300">
              <thead>
                <tr>
                  <th
                    colSpan="2"
                    className="bg-gray-100 p-2 text-left text-base font-semibold text-gray-700"
                  >
                    Booking Info
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr>
                  <td className="py-2 px-4 border-t border-gray-300">
                    Booking ID
                  </td>
                  <td className="py-2 px-4 border-t border-gray-300">
                    {viewData?.bookingId}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-t border-gray-300">
                    Lead Guest
                  </td>
                  <td className="py-2 px-4 border-t border-gray-300">
                    {viewData?.details?.guestInfo?.leadGuest || "N/A"}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-t border-gray-300">
                    Booked On
                  </td>
                  <td className="py-2 px-4 border-t border-gray-300">
                    {formattedDate}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-t border-gray-300">
                    Amount Paid
                  </td>
                  <td className="py-2 px-4 border-t border-gray-300">
                    ₹ {viewData?.amount}
                  </td>
                </tr>
                {viewData?.fullRefundExtraCharge && (
                  <tr>
                    <td className="py-2 px-4 border-t border-gray-300">
                      Full Refund Extra Charge Paid
                    </td>
                    <td className="py-2 px-4 border-t border-gray-300">
                      ₹ {viewData?.fullRefundExtraCharge}
                    </td>
                  </tr>
                )}
                {viewData?.refundAmount && (
                  <tr>
                    <td className="py-2 px-4 border-t border-gray-300">
                      Refunded Amount
                    </td>
                    <td className="py-2 px-4 border-t border-gray-300">
                      ₹ {viewData?.refundAmount}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="py-2 px-4 border-t border-gray-300">
                    Total Rooms
                  </td>
                  <td className="py-2 px-4 border-t border-gray-300">
                    {viewData?.details?.roomInfo?.quantity || "N/A"}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-t border-gray-300">
                    Payment ID
                  </td>
                  <td className="py-2 px-4 border-t border-gray-300">
                    {viewData?.razorpay_payment_id}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* User Info */}
            <table className="w-full table-auto text-sm border border-gray-300">
              <thead>
                <tr>
                  <th
                    colSpan="2"
                    className="bg-gray-100 p-2 text-left text-base font-semibold text-gray-700"
                  >
                    User Info
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr>
                  <td className="py-2 px-4 border-t border-gray-300">
                    User Name
                  </td>
                  <td className="py-2 px-4 border-t border-gray-300">
                    {viewData?.user?.name || "N/A"}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-t border-gray-300">Email</td>
                  <td className="py-2 px-4 border-t border-gray-300">
                    {viewData?.user?.email || "N/A"}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-t border-gray-300">
                    Mobile Number
                  </td>
                  <td className="py-2 px-4 border-t border-gray-300">
                    {viewData?.user?.mobileNumber || "N/A"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
