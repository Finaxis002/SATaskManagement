import React from "react";
import { ChevronDown, ChevronUp, Percent, Plus, X } from "lucide-react";

const StageEditor = ({ stages, onChange, onAdd, onRemove }) => {
  const updateStage = (index, field, value) => {
    const updated = stages.map((stage, i) =>
      i === index ? { ...stage, [field]: value } : stage
    );
    onChange(updated);
  };

  const moveStage = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= stages.length) return;
    const updated = [...stages];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {stages.map((stage, idx) => (
        <div
          key={idx}
          className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative w-24">
                <input
                  type="number"
                  step="any"
                  min="0"
                  max="100"
                  value={stage.percentage}
                  onChange={(e) =>
                    updateStage(idx, "percentage", e.target.value)
                  }
                  className="w-full px-2 py-1 pr-6 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="%"
                />
                <Percent className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
              </div>
              <span className="text-xs text-gray-500">%</span>
              <button
                type="button"
                onClick={() => moveStage(idx, -1)}
                disabled={idx === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                title="Move stage up"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => moveStage(idx, 1)}
                disabled={idx === stages.length - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                title="Move stage down"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="p-1 text-red-400 hover:text-red-600 ml-auto"
                title="Remove stage"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description + status row */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={stage.description}
                onChange={(e) =>
                  updateStage(idx, "description", e.target.value)
                }
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Deliverable description (e.g., Start working, Send first draft)"
              />

              {/* ✅ Paid / Unpaid dropdown */}
              <select
                value={stage.status || "unpaid"}
                onChange={(e) => updateStage(idx, "status", e.target.value)}
                className={`shrink-0 text-xs font-medium px-2 py-1 rounded border cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors
                  ${
                    stage.status === "paid"
                      ? "bg-green-50 text-green-700 border-green-300"
                      : "bg-red-50 text-red-600 border-red-300"
                  }`}
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
      >
        <Plus className="w-4 h-4" /> Add Stage
      </button>
    </div>
  );
};

export default StageEditor;








// import React from "react";
// import { ChevronDown, ChevronUp, Percent, Plus, X } from "lucide-react";

// const StageEditor = ({ stages, onChange, onAdd, onRemove }) => {
//   const updateStage = (index, field, value) => {
//     const updated = [...stages];
//     updated[index][field] =
//       field === "percentage" ? parseFloat(value) || 0 : value;
//     onChange(updated);
//   };

//   const moveStage = (index, direction) => {
//     const newIndex = index + direction;
//     if (newIndex < 0 || newIndex >= stages.length) return;
//     const updated = [...stages];
//     [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
//     onChange(updated);
//   };

//   return (
//     <div className="space-y-3">
//       {stages.map((stage, idx) => (
//         <div
//           key={idx}
//           className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
//         >
//           <div className="flex-1 space-y-2">
//             <div className="flex items-center gap-2">
//               <div className="relative w-24">
//                 <input
//                   type="number"
//                   step="any"
//                   min="0"
//                   max="100"
//                   value={stage.percentage}
//                   onChange={(e) =>
//                     updateStage(idx, "percentage", e.target.value)
//                   }
//                   className="w-full px-2 py-1 pr-6 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
//                   placeholder="%"
//                 />
//                 <Percent className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
//               </div>
//               <span className="text-xs text-gray-500">%</span>
//               <button
//                 type="button"
//                 onClick={() => moveStage(idx, -1)}
//                 disabled={idx === 0}
//                 className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
//                 title="Move stage up"
//               >
//                 <ChevronUp className="w-4 h-4" />
//               </button>
//               <button
//                 type="button"
//                 onClick={() => moveStage(idx, 1)}
//                 disabled={idx === stages.length - 1}
//                 className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
//                 title="Move stage down"
//               >
//                 <ChevronDown className="w-4 h-4" />
//               </button>
//               <button
//                 type="button"
//                 onClick={() => onRemove(idx)}
//                 className="p-1 text-red-400 hover:text-red-600 ml-auto"
//                 title="Remove stage"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>
//             <input
//               type="text"
//               value={stage.description}
//               onChange={(e) => updateStage(idx, "description", e.target.value)}
//               className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
//               placeholder="Deliverable description (e.g., Start working, Send first draft)"
//             />
//           </div>
//         </div>
//       ))}
//       <button
//         type="button"
//         onClick={onAdd}
//         className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
//       >
//         <Plus className="w-4 h-4" /> Add Stage
//       </button>
//     </div>
//   );
// };

// export default StageEditor;
