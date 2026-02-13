// src/pages/Agent/PaymentHistory.jsx - WITH DELETE & STATUS
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  Download,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
} from "lucide-react";

const API_URL = "https://taskbe.sharda.co.in/api/agents";

const PaymentHistory = ({ agentId, onDataChange }) => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [agentId]);

  useEffect(() => {
    filterHistory();
  }, [searchTerm, filterType, history]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/${agentId}/transactions`);
      setHistory(response.data);
      setFilteredHistory(response.data);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterHistory = () => {
    let filtered = history;

    if (filterType !== "all") {
      filtered = filtered.filter((item) => item.type === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredHistory(filtered);
  };

  const handleDelete = async (item) => {
    try {
      if (item.type === "transaction") {
        await axios.delete(`${API_URL}/${agentId}/transactions/${item.id}`);
      } else {
        await axios.delete(`${API_URL}/${agentId}/payouts/${item.id}`);
      }

      setDeleteConfirm(null);
      await fetchHistory();
     
      if (onDataChange) {
        onDataChange();
      }
    } catch (err) {
      console.error("Error deleting entry:", err);
      alert("Failed to delete entry: " + err.message);
    }
  };

  const handleStatusChange = async (item, newStatus) => {
    try {
      await axios.put(`${API_URL}/${agentId}/transactions/${item.id}/status`, {
        paid: newStatus === "paid",
      });

      await fetchHistory();
      
      if (onDataChange) {
        onDataChange();
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status: " + err.message);
    }
  };

  const downloadReport = () => {
    const headers = ["Date", "Type", "Details", "Amount", "Status"];
    const rows = filteredHistory.map((item) => {
      if (item.type === "transaction") {
        return [
          new Date(item.date).toLocaleDateString(),
          "Commission",
          item.clientName,
          item.commission,
          item.paid ? "Paid" : "Pending",
        ];
      } else {
        return [
          new Date(item.date).toLocaleDateString(),
          "Payout",
          item.notes || "Payment processed",
          item.amount,
          "Completed",
        ];
      }
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payment_history_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-slate-600">Loading history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this{" "}
              {deleteConfirm.type === "transaction" ? "commission" : "payout"}{" "}
              entry?
              {deleteConfirm.type === "transaction" && (
                <span className="block mt-2 text-sm font-medium">
                  This will reduce the agent's total earned by{" "}
                  {formatCurrency(
                    deleteConfirm.commission || deleteConfirm.amount
                  )}
                </span>
              )}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <Calendar size={24} className="text-indigo-600" />
          Payment History
        </h2>
        {filteredHistory.length > 0 && (
          <button
            onClick={downloadReport}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
          >
            <Download size={18} />
            Download Report
          </button>
        )}
      </div>

      {/* Search and Filters */}
      {history.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by client name or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <FilterButton
              active={filterType === "all"}
              onClick={() => setFilterType("all")}
            >
              All
            </FilterButton>
            <FilterButton
              active={filterType === "transaction"}
              onClick={() => setFilterType("transaction")}
            >
              Commissions
            </FilterButton>
            <FilterButton
              active={filterType === "payout"}
              onClick={() => setFilterType("payout")}
            >
              Payouts
            </FilterButton>
          </div>
        </div>
      )}

      {/* History Table */}
      <HistoryTable
        history={filteredHistory}
        formatCurrency={formatCurrency}
        onDelete={setDeleteConfirm}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

const FilterButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
      active
        ? "bg-indigo-600 text-white shadow-sm"
        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
    }`}
  >
    {children}
  </button>
);

const HistoryTable = ({
  history,
  formatCurrency,
  onDelete,
  onStatusChange,
}) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="text-slate-400" size={32} />
        </div>
        <p className="text-slate-500 font-medium">No payment history yet</p>
        <p className="text-sm text-slate-400 mt-1">
          History will appear here after processing payments
        </p>
      </div>
    );
  }

  const MobileCard = ({ item }) => (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {item.type === "transaction" ? (
              <ArrowDownLeft className="text-green-600" size={16} />
            ) : (
              <ArrowUpRight className="text-red-600" size={16} />
            )}
            <p className="font-semibold text-slate-900">
              {item.type === "transaction"
                ? item.clientName
                : "Payout Processed"}
            </p>
          </div>
          <p className="text-xs text-slate-500">
            {new Date(item.date).toLocaleDateString("en-IN")}
          </p>
        </div>

        {item.type === "transaction" ? (
          <select
            value={item.paid ? "paid" : "pending"}
            onChange={(e) => onStatusChange(item, e.target.value)}
            className={`px-3 py-1 text-xs font-semibold rounded-full cursor-pointer ${
              item.paid
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
        ) : (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
            Paid Out
          </span>
        )}
      </div>

      {item.type === "transaction" ? (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Commission</p>
            <p className="font-semibold text-emerald-600">
              {formatCurrency(item.commission)}
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-3">
          <p className="text-xs text-slate-500 mb-0.5">Amount Paid</p>
          <p className="text-lg font-bold text-red-600">
            {formatCurrency(item.amount)}
          </p>
          {item.notes && (
            <p className="text-xs text-slate-600 mt-2">{item.notes}</p>
          )}
        </div>
      )}

      <button
        onClick={() => onDelete(item)}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
      >
        <Trash2 size={16} />
        Delete
      </button>
    </div>
  );

  return (
    <>
      <div className="block lg:hidden space-y-3">
        {history.map((item) => (
          <MobileCard key={item.id} item={item} />
        ))}
      </div>

      <div className="hidden lg:block overflow-hidden rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                Details
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {history.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {item.type === "transaction" ? (
                      <>
                        <ArrowDownLeft className="text-green-600" size={18} />
                        <span className="text-sm font-medium">Commission</span>
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="text-red-600" size={18} />
                        <span className="text-sm font-medium">Payout</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(item.date).toLocaleDateString("en-IN")}
                </td>
                <td className="px-6 py-4 text-sm">
                  {item.type === "transaction" ? (
                    <p className="font-medium">{item.clientName}</p>
                  ) : (
                    <div>
                      <p className="font-medium">Payment Processed</p>
                      {item.notes && (
                        <p className="text-xs text-slate-500">{item.notes}</p>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right">
                  <span
                    className={
                      item.type === "payout"
                        ? "text-red-600"
                        : "text-emerald-600"
                    }
                  >
                    {formatCurrency(
                      item.type === "transaction"
                        ? item.commission
                        : item.amount
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {item.type === "transaction" ? (
                    <select
                      value={item.paid ? "paid" : "pending"}
                      onChange={(e) => onStatusChange(item, e.target.value)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                        item.paid
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                    </select>
                  ) : (
                    <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-red-100 text-red-700">
                      Paid Out
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => onDelete(item)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PaymentHistory;