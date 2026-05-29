import React from "react";
import { DollarSign } from "lucide-react";

const PaymentStats = ({ stats }) => {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-2">
        <DollarSign className="w-6 h-6 text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-800">Payment Tracker</h2>
      </div>

      <div className="flex gap-3 text-xs">
        <div className="px-2 py-1 bg-green-100 rounded-lg">
          <span className="text-green-700">✓ Paid: {stats.paid}</span>
        </div>
        <div className="px-2 py-1 bg-yellow-100 rounded-lg">
          <span className="text-yellow-700">⚡ Partial: {stats.partial}</span>
        </div>
        <div className="px-2 py-1 bg-red-100 rounded-lg">
          <span className="text-red-700">✗ Unpaid: {stats.unpaid}</span>
        </div>
        <div className="px-2 py-1 bg-indigo-100 rounded-lg">
          <span className="text-indigo-700">📊 Avg: {stats.avgPercentage}%</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentStats;