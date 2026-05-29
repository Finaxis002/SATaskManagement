import React from "react";

const PaymentFilters = ({ filter, setFilter, searchTerm, setSearchTerm, stats }) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            filter === "all"
              ? "bg-white shadow-sm text-indigo-600"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          All ({stats.total})
        </button>
        <button
          onClick={() => setFilter("partial")}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            filter === "partial"
              ? "bg-white shadow-sm text-yellow-600"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          Partial ({stats.partial})
        </button>
        <button
          onClick={() => setFilter("unpaid")}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            filter === "unpaid"
              ? "bg-white shadow-sm text-red-600"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          Unpaid ({stats.unpaid})
        </button>
      </div>

      <div className="flex-1 max-w-xs">
        <input
          type="text"
          placeholder="Search task or client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>
  );
};

export default PaymentFilters;