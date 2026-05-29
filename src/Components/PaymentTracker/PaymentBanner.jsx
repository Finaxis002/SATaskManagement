import React from "react";
import { DollarSign, CheckCircle2, Lock } from "lucide-react";

const PaymentBanner = ({ paidPercentage, stages }) => {
  if (!stages || stages.length === 0) {
    return null;
  }

  const clearedStages = stages.filter((s) => s.percentage <= paidPercentage);
  const lockedStages = stages.filter((s) => s.percentage > paidPercentage);
  const nextStage = lockedStages[0];

  const getBannerColor = () => {
    if (paidPercentage >= 100) return "bg-green-50 border-green-200";
    if (paidPercentage > 0) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div className={`mb-4 p-4 rounded-lg border ${getBannerColor()}`}>
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign
              className={`w-5 h-5 ${
                paidPercentage >= 100 ? "text-green-600" : "text-yellow-600"
              }`}
            />
            <span className="font-semibold text-gray-800">
              {paidPercentage}% Payment Received
            </span>
            {paidPercentage >= 100 && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Fully Paid
              </span>
            )}
          </div>

          {clearedStages.length > 0 && (
            <div className="mb-2">
              <div className="flex items-center gap-1 text-sm font-medium text-green-700 mb-1">
                <CheckCircle2 className="w-4 h-4" /> Cleared to deliver:
              </div>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-0.5 ml-4">
                {clearedStages.map((stage, idx) => (
                  <li key={idx}>{stage.description}</li>
                ))}
              </ul>
            </div>
          )}

          {lockedStages.length > 0 && (
            <div>
              <div className="flex items-center gap-1 text-sm font-medium text-gray-600 mb-1">
                <Lock className="w-4 h-4" /> Locked until higher payment:
              </div>
              <ul className="list-disc list-inside text-sm text-gray-500 ml-4">
                {lockedStages.slice(0, 2).map((stage, idx) => (
                  <li key={idx}>
                    {stage.description}{" "}
                    <span className="text-xs">(requires {stage.percentage}%)</span>
                  </li>
                ))}
                {lockedStages.length > 2 && (
                  <li className="text-xs text-gray-400">
                    +{lockedStages.length - 2} more stages
                  </li>
                )}
              </ul>
            </div>
          )}

          {nextStage && paidPercentage < 100 && (
            <div className="mt-2 pt-2 text-xs text-gray-500 border-t border-gray-200">
              Next milestone: {nextStage.percentage}% unlocks "{nextStage.description}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentBanner;