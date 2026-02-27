import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaDownload,
  FaUndo,
  FaBan,
} from "react-icons/fa";
import toast from "react-hot-toast";

import {
  fetchAdminTransactions,
  refundAdminTransaction,
  cancelAdminBooking,
} from "../../features/slices/adminTransactionSlice";

const TransactionManagement = () => {
  const dispatch = useDispatch();

  // UI state
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Refund modal
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState("");

  // Cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTransaction, setCancelTransaction] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  // Redux state
  const { transactions, loading, refundLoading, cancelLoading, error } =
    useSelector((state) => state.adminTransactions);

  // 🔹 Fetch transactions on filter/search change
  useEffect(() => {
    dispatch(fetchAdminTransactions({ status: filter, search: searchTerm }));
  }, [dispatch, filter, searchTerm]);

  // Show error toast
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // ---------------------------
  // Helpers
  // ---------------------------
  const normalizeStatus = (status) => status?.toLowerCase();

  const getStatusIcon = (status) => {
    switch (normalizeStatus(status)) {
      case "paid":
        return <FaCheckCircle className="text-green-500" />;
      case "refunded":
        return <FaTimesCircle className="text-yellow-500" />;
      case "failed":
        return <FaExclamationCircle className="text-red-500" />;
      case "refund_pending":
        return <FaBan className="text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      paid: "bg-green-100 text-green-800",
      refunded: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      pending: "bg-gray-100 text-gray-800",
      refund_pending: "bg-orange-100 text-orange-800",
    };
    return styles[normalizeStatus(status)] || styles.pending;
  };

  // ---------------------------
  // Derived data
  // ---------------------------
  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      const matchesFilter =
        filter === "all" || normalizeStatus(txn.paymentStatus) === filter;

      const matchesSearch =
        txn.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.razorpay_payment_id?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [transactions, filter, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: transactions.length,
      successful: transactions.filter((t) => t.paymentStatus === "Paid").length,
      cancelled: transactions.filter((t) => t.paymentStatus === "Refunded").length,
      failed: transactions.filter((t) => t.paymentStatus === "Failed").length,
      totalRevenue: transactions
        .filter((t) => t.paymentStatus === "Paid")
        .reduce((sum, t) => sum + t.amount, 0),
    };
  }, [transactions]);

  // ---------------------------
  // Refund Actions
  // ---------------------------
  const handleInitiateRefund = (transaction) => {
    setSelectedTransaction(transaction);
    setShowRefundModal(true);
  };

  const processRefund = async () => {
    if (!refundReason.trim()) return;

    await dispatch(
      refundAdminTransaction({
        bookingId: selectedTransaction.bookingId,
        reason: refundReason,
      })
    );

    setShowRefundModal(false);
    setRefundReason("");
    setSelectedTransaction(null);
  };

  // ---------------------------
  // Cancel Actions
  // ---------------------------
  const handleInitiateCancel = (txn) => {
    setCancelTransaction(txn);
    setShowCancelModal(true);
  };

  const processCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please enter a cancellation reason");
      return;
    }

    const result = await dispatch(
      cancelAdminBooking({
        bookingId: cancelTransaction.bookingId,
        reason: cancelReason,
      })
    );

    if (cancelAdminBooking.fulfilled.match(result)) {
      toast.success("Booking cancelled successfully via TripJack ✅");
    }

    setShowCancelModal(false);
    setCancelReason("");
    setCancelTransaction(null);
  };

  // ---------------------------
  // Export
  // ---------------------------
  const exportReport = () => {
    const csvContent = [
      ["Booking ID", "User", "Amount", "Status", "Payment ID", "Date"],
      ...filteredTransactions.map((txn) => [
        txn.bookingId,
        txn.user || "Guest",
        txn.amount,
        txn.paymentStatus,
        txn.transactionId || "-",
        txn.date ? new Date(txn.date).toLocaleString() : "-",
      ]),
    ]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${Date.now()}.csv`;
    a.click();
  };

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Transaction Management</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {[
            ["Total", stats.total],
            ["Paid", stats.successful],
            ["Refunded", stats.cancelled],
            ["Failed", stats.failed],
            ["Revenue", `₹${stats.totalRevenue}`],
          ].map(([label, value]) => (
            <div key={label} className="bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-500">{label}</div>
              <div className="text-2xl font-bold">{value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded shadow mb-6 flex gap-3 flex-wrap">
          <input
            className="border px-3 py-2 rounded flex-1 min-w-[200px]"
            placeholder="Search booking / payment / user"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {["all", "paid", "refunded", "failed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded ${filter === f ? "bg-blue-600 text-white" : "bg-gray-100"
                }`}
            >
              {f.toUpperCase()}
            </button>
          ))}

          <button
            onClick={exportReport}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            <FaDownload />
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded shadow overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center">Loading transactions...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Booking ID</th>
                  <th className="p-3 text-left">User</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((txn) => (
                  <tr key={txn._id} className="border-t">
                    <td className="p-3 font-mono text-sm">{txn.bookingId}</td>
                    <td className="p-3">{txn.user || "Guest"}</td>
                    <td className="p-3">₹{txn.amount}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          txn.paymentStatus
                        )}`}
                      >
                        {getStatusIcon(txn.paymentStatus)}{" "}
                        {txn.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {/* Refund button — only for Paid */}
                        {txn.paymentStatus === "Paid" && (
                          <button
                            onClick={() => handleInitiateRefund(txn)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            <FaUndo /> Refund
                          </button>
                        )}

                        {/* Cancel button — only for Paid */}
                        {txn.paymentStatus === "Paid" && (
                          <button
                            onClick={() => handleInitiateCancel(txn)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            <FaBan /> Cancel
                          </button>
                        )}

                        {txn.paymentStatus === "Refund_PENDING" && (
                          <span className="text-orange-500 text-xs font-medium">
                            Cancelled — Refund Pending
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* ===================== REFUND MODAL ===================== */}
        {showRefundModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-96 shadow-xl">
              <h3 className="font-bold text-lg mb-1">Initiate Refund</h3>
              <p className="text-sm text-gray-500 mb-4">
                Booking:{" "}
                <span className="font-mono font-semibold">
                  {selectedTransaction?.bookingId}
                </span>
              </p>
              <textarea
                className="border w-full p-2 mb-4 rounded"
                rows={3}
                placeholder="Reason for refund"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              />
              <div className="flex gap-3">
                <button
                  onClick={processRefund}
                  disabled={refundLoading || !refundReason.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
                >
                  {refundLoading ? "Processing..." : "Confirm Refund"}
                </button>
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="bg-gray-200 px-4 py-2 rounded w-full"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== CANCEL MODAL ===================== */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-[420px] shadow-xl">
              <div className="flex items-center gap-2 mb-1">
                <FaBan className="text-red-500 text-xl" />
                <h3 className="font-bold text-lg text-red-600">
                  Cancel Booking
                </h3>
              </div>
              <p className="text-sm text-gray-500 mb-1">
                This will call TripJack's cancellation API and mark the booking
                as <strong>CANCELLED</strong>.
              </p>
              <p className="text-sm text-gray-700 mb-4">
                Booking:{" "}
                <span className="font-mono font-semibold">
                  {cancelTransaction?.bookingId}
                </span>{" "}
                &nbsp;·&nbsp; Amount:{" "}
                <span className="font-semibold">₹{cancelTransaction?.amount}</span>
              </p>
              <textarea
                className="border w-full p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-red-300"
                rows={3}
                placeholder="Reason for cancellation (required)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              <div className="flex gap-3">
                <button
                  onClick={processCancel}
                  disabled={cancelLoading || !cancelReason.trim()}
                  className="bg-red-600 text-white px-4 py-2 rounded w-full font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {cancelLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Cancelling...
                    </>
                  ) : (
                    "Confirm Cancel"
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason("");
                  }}
                  className="bg-gray-200 px-4 py-2 rounded w-full"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionManagement;
