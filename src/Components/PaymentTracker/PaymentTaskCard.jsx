import React from "react";
import { DollarSign, Edit2, Eye } from "lucide-react";

const PaymentTaskCard = React.memo(({ task, onViewDetails, onEditStages, onLogPayment }) => {
  const paidPercentage = task.paidPercentage || 0;
  const stages = task.paymentStages || [];
  const clearedCount = stages.filter((s) => s.percentage <= paidPercentage).length;
  const totalStages = stages.length;

  const getStatusColor = () => {
    if (paidPercentage >= 100) return "text-green-600 bg-green-50";
    if (paidPercentage > 0) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 truncate">{task.taskName}</h3>
          {task.clientName && (
            <p className="text-xs text-gray-500 mt-0.5">Client: {task.clientName}</p>
          )}
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {paidPercentage}% paid
        </div>
      </div>

      {totalStages > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Payment progress</span>
            <span>
              {clearedCount}/{totalStages} stages cleared
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${paidPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* {stages.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {stages.slice(0, 3).map((stage, idx) => (
            <span
              key={idx}
              className={`text-[10px] px-1.5 py-0.5 rounded ${
                stage.percentage <= paidPercentage
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {stage.percentage}%
            </span>
            
          ))}
          {stages.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
              +{stages.length - 3}
            </span>
          )}
        </div>
      )} */}

      {stages.length > 0 && (
        <div className="mt-3 space-y-1">
          {stages.slice(0, 3).map((stage, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium ${stage.percentage <= paidPercentage
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                    }`}
                >
                  {stage.percentage}%
                </span>
                <span className="text-[10px] text-gray-500 truncate">
                  {stage.description}
                </span>
              </div>
              <span
                className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${stage.status === "paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-50 text-red-600"
                  }`}
              >
                {stage.status === "paid" ? "Paid" : "Unpaid"}
              </span>
            </div>
          ))}
          {stages.length > 3 && (
            <p className="text-[10px] text-gray-400 pl-0.5">
              +{stages.length - 3} more stages
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 pt-2 border-t border-gray-100">
        <button
          onClick={() => onEditStages(task)}
          className="flex items-center gap-1 px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
        >
          <Edit2 className="w-3 h-3" /> Stages
        </button>
        <button
          onClick={() => onLogPayment(task)}
          className="flex items-center gap-1 px-2 py-1 text-xs text-green-600 hover:bg-green-50 rounded transition-colors"
        >
          <DollarSign className="w-3 h-3" /> Log Payment
        </button>
        <button
          onClick={() => onViewDetails(task)}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded transition-colors ml-auto"
        >
          <Eye className="w-3 h-3" /> View
        </button>
      </div>
    </div>
  );
});

PaymentTaskCard.displayName = "PaymentTaskCard";

export default PaymentTaskCard;