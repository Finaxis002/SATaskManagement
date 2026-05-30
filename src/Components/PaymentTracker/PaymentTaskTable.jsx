import React, { useState } from "react";
import { Edit2, DollarSign, Eye, ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

const PaymentTaskTable = ({ tasks, onViewDetails, onEditStages, onLogPayment }) => {
  const [sortField, setSortField] = useState("taskName");
  const [sortDir, setSortDir] = useState("asc");
  const [expandedRow, setExpandedRow] = useState(null);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sorted = [...tasks].sort((a, b) => {
    let aVal = a[sortField] ?? "";
    let bVal = b[sortField] ?? "";
    if (typeof aVal === "string") aVal = aVal.toLowerCase();
    if (typeof bVal === "string") bVal = bVal.toLowerCase();
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }) => {
    if (sortField !== field)
      return <ChevronsUpDown className="w-3 h-3 text-gray-400 inline ml-1" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3 h-3 text-indigo-500 inline ml-1" />
      : <ChevronDown className="w-3 h-3 text-indigo-500 inline ml-1" />;
  };

  const getPaymentStatusColor = (pct) => {
    if (pct >= 100) return "bg-green-100 text-green-700";
    if (pct > 0) return "bg-yellow-100 text-yellow-700";
    return "bg-red-50 text-red-600";
  };

  const getPaymentStatusLabel = (pct) => {
    if (pct >= 100) return "Fully Paid";
    if (pct > 0) return "Partial";
    return "Unpaid";
  };

  const thClass =
    "px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:text-gray-700 whitespace-nowrap";
  const tdClass = "px-3 py-2.5 text-sm text-gray-700 align-middle";

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full border-collapse text-sm">
        {/* ── Header ── */}
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className={thClass} style={{ width: 32 }} />
            <th className={thClass} onClick={() => handleSort("taskName")}>
              Task Name <SortIcon field="taskName" />
            </th>
            <th className={thClass} onClick={() => handleSort("clientName")}>
              Client <SortIcon field="clientName" />
            </th>
            <th className={thClass} onClick={() => handleSort("status")}>
              Task Status <SortIcon field="status" />
            </th>
            <th className={thClass}>Stages</th>
            <th className={thClass} onClick={() => handleSort("paidPercentage")}>
              Paid % <SortIcon field="paidPercentage" />
            </th>
            <th className={thClass}>Progress</th>
            <th className={thClass}>Payment Status</th>
            <th
              className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
              style={{ width: 120 }}
            >
              Actions
            </th>
          </tr>
        </thead>

        {/* ── Body ── */}
        <tbody className="divide-y divide-gray-100">
          {sorted.length === 0 && (
            <tr>
              <td colSpan={9} className="px-4 py-10 text-center text-gray-400 text-sm">
                No tasks with payment tracking found
              </td>
            </tr>
          )}

          {sorted.map((task) => {
            const pct = task.paidPercentage || 0;
            const stages = task.paymentStages || [];
            const isExpanded = expandedRow === task._id;

            return (
              <React.Fragment key={task._id}>
                {/* ── Main row ── */}
                <tr
                  className={`transition-colors ${
                    isExpanded ? "bg-indigo-50/40" : "hover:bg-gray-50"
                  }`}
                >
                  {/* Expand toggle */}
                  <td className="px-2 py-2.5 text-center align-middle">
                    {stages.length > 0 && (
                      <button
                        onClick={() =>
                          setExpandedRow(isExpanded ? null : task._id)
                        }
                        className="p-0.5 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title={isExpanded ? "Collapse stages" : "Expand stages"}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </td>

                  {/* Task name */}
                  <td className={tdClass}>
                    <span className="font-medium text-gray-800 truncate max-w-[200px] block">
                      {task.taskName}
                    </span>
                  </td>

                  {/* Client */}
                  <td className={tdClass}>
                    <span className="text-gray-500 text-xs">
                      {task.clientName || "—"}
                    </span>
                  </td>

                  {/* Task status */}
                  <td className={tdClass}>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium
                        ${task.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : task.status === "In Progress"
                          ? "bg-blue-100 text-blue-700"
                          : task.status === "Overdue"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {task.status || "—"}
                    </span>
                  </td>

                  {/* Stages count */}
                  <td className={tdClass}>
                    <span className="text-xs text-gray-500">
                      {stages.length > 0 ? (
                        <>
                          <span className="font-medium text-gray-700">
                            {stages.filter((s) => s.status === "paid").length}
                          </span>
                          <span className="text-gray-400">/{stages.length} paid</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </span>
                  </td>

                  {/* Paid % */}
                  <td className={tdClass}>
                    <span className="font-semibold text-gray-800">{pct}%</span>
                  </td>

                  {/* Progress bar */}
                  <td className={tdClass} style={{ minWidth: 120 }}>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            pct >= 100
                              ? "bg-green-500"
                              : pct > 0
                              ? "bg-indigo-500"
                              : "bg-gray-300"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Payment status badge */}
                  <td className={tdClass}>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${getPaymentStatusColor(pct)}`}
                    >
                      {getPaymentStatusLabel(pct)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className={tdClass}>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditStages(task)}
                        className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded transition-colors"
                        title="Edit stages"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onLogPayment(task)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Log payment"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                      </button>
                      {/* <button
                        onClick={() => onViewDetails(task)}
                        className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button> */}
                    </div>
                  </td>
                </tr>

                {/* ── Expanded stages sub-rows ── */}
                {isExpanded && stages.length > 0 && (
                  <tr className="bg-indigo-50/30">
                    <td colSpan={9} className="px-0 py-0">
                      <div className="mx-8 my-2 rounded-lg border border-indigo-100 overflow-hidden">
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="bg-indigo-50 border-b border-indigo-100">
                              <th className="px-3 py-2 text-left font-semibold text-indigo-600 uppercase tracking-wide">
                                #
                              </th>
                              <th className="px-3 py-2 text-left font-semibold text-indigo-600 uppercase tracking-wide">
                                Description
                              </th>
                              <th className="px-3 py-2 text-left font-semibold text-indigo-600 uppercase tracking-wide">
                                Percentage
                              </th>
                              <th className="px-3 py-2 text-left font-semibold text-indigo-600 uppercase tracking-wide">
                                Stage Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-indigo-50">
                            {stages.map((stage, idx) => (
                              <tr
                                key={stage._id || idx}
                                className="bg-white hover:bg-indigo-50/30 transition-colors"
                              >
                                <td className="px-3 py-2 text-gray-400 font-mono">
                                  {idx + 1}
                                </td>
                                <td className="px-3 py-2 text-gray-700">
                                  {stage.description || "—"}
                                </td>
                                <td className="px-3 py-2 font-semibold text-gray-700">
                                  {stage.percentage}%
                                </td>
                                <td className="px-3 py-2">
                                  <span
                                    className={`inline-flex px-2 py-0.5 rounded-full font-medium ${
                                      stage.status === "paid"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-50 text-red-600"
                                    }`}
                                  >
                                    {stage.status === "paid" ? "Paid" : "Unpaid"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentTaskTable;
