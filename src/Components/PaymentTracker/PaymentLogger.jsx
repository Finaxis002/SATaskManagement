import React from "react";
import { Percent } from "lucide-react";

const PaymentLogger = ({
  taskName,
  currentPercentage,
  paymentPercentage,
  setPaymentPercentage,
  paymentNote,
  setPaymentNote,
  onSave,
  onCancel,
  saving,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Current Payment: {currentPercentage}%
        </label>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          New Payment Percentage
        </label>
        <div className="relative">
          <input
            type="number"
            step="any"
            min="0"
            max="100"
            value={paymentPercentage}
            onChange={(e) => setPaymentPercentage(e.target.value)}
            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter percentage received"
          />
          <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (Optional)
        </label>
        <textarea
          value={paymentNote}
          onChange={(e) => setPaymentNote(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          rows="3"
          placeholder="Transaction reference, date received, UPI ID, etc."
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
        >
          {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          Update Payment
        </button>
      </div>
    </div>
  );
};

export default PaymentLogger;