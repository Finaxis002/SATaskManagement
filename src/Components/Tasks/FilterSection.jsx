import Select from "react-select";
import { useEffect, useState } from "react";
import { FaCalendarAlt, FaFilter, FaTimes } from "react-icons/fa";
import TaskCodeFilterSelector from "./TaskCodeFilterSelector";

export const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: 12,
    borderColor: state.isFocused ? "#a5b4fc" : "#e5e7eb",
    boxShadow: state.isFocused ? "0 0 0 2px #a5b4fc33" : "none",
    minHeight: 40,
    fontSize: 14,
    background: "#f9fafb",
    transition: "border-color 0.2s, box-shadow 0.2s",
    outline: "none",
    "&:hover": {
      borderColor: "#a5b4fc",
    },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 12,
    marginTop: 6,
    boxShadow: "0 6px 36px 0 rgba(31, 41, 55, 0.15)",
    padding: 0,
    background: "#fff",
    zIndex: 20,
    overflowX: "hidden",
    width: "100%", // <-- Match the control width
    minWidth: 0, // <-- Allow shrinking
    maxWidth: "100%", // <-- Prevent growing beyond control
    whiteSpace: "normal",
    wordBreak: "break-word",
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    background: state.isSelected
      ? "#e0e7ff"
      : state.isFocused
      ? "#f3f4f6"
      : "#fff",
    color: "#2a3342",
    fontWeight: state.isSelected ? 600 : 400,
    padding: "10px 16px",
    fontSize: 14,
    cursor: "pointer",
    transition: "background 0.18s, color 0.18s",
    borderRadius: 8,
    margin: "2px 6px",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: 400,
    letterSpacing: ".01em",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#334155",
    fontSize: 14,
    fontWeight: 500,
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? "#6366f1" : "#94a3b8",
    transition: "color 0.18s",
    padding: "2px 6px",
    "&:hover": {
      color: "#6366f1",
    },
  }),
  indicatorSeparator: (base) => ({
    ...base,
    display: "none",
  }),
  input: (base) => ({
    ...base,
    fontSize: 14,
    color: "#334155",
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: "2px 6px",
    color: "#cbd5e1",
    "&:hover": {
      color: "#6366f1",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "2px 8px",
  }),
};

const FilterSection = ({
  filters,
  handleFilterChange,
  departments,
  uniqueUsers,
  uniqueAssignedBy,
  uniqueStatuses,
  role,
}) => {
  const clearFilters = () => {
    handleFilterChange("department", "");
    handleFilterChange("status", "");
    handleFilterChange("code", "");
    handleFilterChange("assignee", "");
    handleFilterChange("assignedBy", "");
    handleFilterChange("dueBefore", "");
  };

  const [options, setOptions] = useState([]);

  useEffect(() => {
    fetch("https://taskbe.sharda.co.in/api/task-codes")
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
      })
      .then((data) => {
        setOptions(
          data.map((code) => ({
            label: code.name,
            value: code.name,
          }))
        );
      })
      .catch(console.error);
  }, []);

  return (
    // <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200 mb-6 z-20">
    //   <div className="flex flex-wrap items-end gap-3">
    //     {/* Department */}
    //     <div className="flex flex-col flex-grow min-w-[180px] max-w-[220px]">
    //       <label className="mb-1 text-xs font-semibold text-gray-700">
    //         Department
    //       </label>
    //       <Select
    //         options={[
    //           { label: "All Departments", value: "" },
    //           ...departments.map((d) => ({ label: d.name, value: d.name })),
    //         ]}
    //         value={
    //           filters.department
    //             ? { label: filters.department, value: filters.department }
    //             : null
    //         }
    //         onChange={(val) =>
    //           handleFilterChange("department", val?.value || "")
    //         }
    //         styles={{
    //           ...customSelectStyles,
    //           menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    //         }}
    //         menuPortalTarget={document.body}
    //         placeholder="Select Department"
    //         isClearable
    //         isSearchable
    //       />
    //     </div>

    //     {/* Status */}
    //     <div className="flex flex-col flex-grow min-w-[150px] max-w-[180px]">
    //       <label className="mb-1 text-xs font-semibold text-gray-700">
    //         Status
    //       </label>
    //       <Select
    //         options={[
    //           { label: "All Status", value: "" },
    //           ...uniqueStatuses.map((s) => ({ label: s, value: s })),
    //         ]}
    //         value={
    //           filters.status
    //             ? { label: filters.status, value: filters.status }
    //             : null
    //         }
    //         onChange={(val) => handleFilterChange("status", val?.value || "")}
    //         styles={{
    //           ...customSelectStyles,
    //           menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    //         }}
    //         menuPortalTarget={document.body}
    //         placeholder="Select Status"
    //         isClearable
    //         isSearchable
    //       />
    //     </div>

    //     {/* Task Code */}
    //     <div className="flex flex-col flex-grow min-w-[150px] max-w-[180px]">
    //       <label className="mb-1 text-xs font-semibold text-gray-700">
    //         Task Code
    //       </label>
    //       <TaskCodeFilterSelector
    //         selectedCode={
    //           filters.code ? { label: filters.code, value: filters.code } : null
    //         }
    //         setSelectedCode={(selectedOption) =>
    //           handleFilterChange("code", selectedOption?.value || "")
    //         }
    //       />
    //     </div>

    //     {/* Assignee */}
    //     {role === "admin" && (
    //       <div className="flex flex-col flex-grow min-w-[150px] max-w-[180px]">
    //         <label className="mb-1 text-xs font-semibold text-gray-700">
    //           Assignee
    //         </label>
    //         <Select
    //           options={[
    //             { label: "All Assignees", value: "" },
    //             ...uniqueUsers.map((u) => ({ label: u, value: u })),
    //           ]}
    //           value={
    //             filters.assignee
    //               ? { label: filters.assignee, value: filters.assignee }
    //               : null
    //           }
    //           onChange={(val) =>
    //             handleFilterChange("assignee", val?.value || "")
    //           }
    //           styles={{
    //             ...customSelectStyles,
    //             menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    //           }}
    //           menuPortalTarget={document.body}
    //           placeholder="Select Assignee"
    //           isClearable
    //           isSearchable
    //         />
    //       </div>
    //     )}

    //     {/* Assigned By */}
    //     {role === "admin" && (
    //       <div className="flex flex-col flex-grow min-w-[150px] max-w-[180px]">
    //         <label className="mb-1 text-xs font-semibold text-gray-700">
    //           Assigned By
    //         </label>
    //         <Select
    //           options={[
    //             { label: "All Assigners", value: "" },
    //             ...uniqueAssignedBy.map((u) => ({ label: u, value: u })),
    //           ]}
    //           value={
    //             filters.assignedBy
    //               ? { label: filters.assignedBy, value: filters.assignedBy }
    //               : null
    //           }
    //           onChange={(val) =>
    //             handleFilterChange("assignedBy", val?.value || "")
    //           }
    //           styles={{
    //             ...customSelectStyles,
    //             menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    //           }}
    //           menuPortalTarget={document.body}
    //           placeholder="Select Assignor"
    //           isClearable
    //           isSearchable
    //         />
    //       </div>
    //     )}

    //     {/* Due Date */}
    //     <div className="flex flex-col min-w-[160px] max-w-[200px]">
    //       <label
    //         htmlFor="dueBefore"
    //         className="mb-1 text-xs font-semibold text-gray-700 flex items-center gap-1"
    //       >
    //         <FaCalendarAlt className="text-indigo-500" />
    //         Due Date (Before or On)
    //       </label>
    //       <input
    //         type="date"
    //         id="dueBefore"
    //         value={filters.dueBefore}
    //         onChange={(e) => handleFilterChange("dueBefore", e.target.value)}
    //         className="w-full h-[30px] text-[0.8rem] rounded-md border border-gray-300 px-2 shadow-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
    //       />
    //     </div>

    //     {/* Clear Filters */}
    //     <div className="flex items-center justify-center min-w-[110px]">
    //       <button
    //         onClick={clearFilters}
    //         className="flex items-center gap-1 bg-[#b1afaf] hover:bg-[#fcfbfb]  px-3 py-1 rounded-md text-xs font-semibold shadow-md transition text-black"
    //         title="Clear All Filters"
    //       >
    //         <FaFilter />
    //         Clear
    //         <FaTimes />
    //       </button>
    //     </div>
    //   </div>
    // </div>

    <div className="p-2 bg-white rounded-2xl shadow-lg border border-gray-100 mb-6">
      <div className="flex flex-wrap items-end gap-4">
        {/* Department */}
        <div className="flex flex-col flex-grow min-w-[170px] max-w-[200px]">
          <label className="mb-1 ml-1 text-[12px] font-medium text-gray-600 tracking-wide flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 mr-1"></span>
            Department
          </label>
          <Select
            options={[
              { label: "All Departments", value: "" },
              ...departments.map((d) => ({ label: d.name, value: d.name })),
            ]}
            value={
              filters.department
                ? { label: filters.department, value: filters.department }
                : null
            }
            onChange={(val) =>
              handleFilterChange("department", val?.value || "")
            }
            styles={{
              ...customSelectStyles,
            }}
            menuPortalTarget={document.body}
            placeholder="Select"
            isClearable
            isSearchable
          />
        </div>

        {/* Status */}
        <div className="flex flex-col flex-grow min-w-[140px] max-w-[170px]">
          <label className="mb-1 ml-1 text-[12px] font-medium text-gray-600 tracking-wide flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400 mr-1"></span>
            Status
          </label>
          <Select
            options={[
              { label: "All Status", value: "" },
              ...uniqueStatuses.map((s) => ({ label: s, value: s })),
            ]}
            value={
              filters.status
                ? { label: filters.status, value: filters.status }
                : null
            }
            onChange={(val) => handleFilterChange("status", val?.value || "")}
            styles={{
              ...customSelectStyles,
              control: (base) => ({
                ...base,
                borderRadius: 12,
                borderColor: "#e5e7eb",
                boxShadow: "none",
                minHeight: 36,
                fontSize: 14,
                background: "#f9fafb",
              }),
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
            menuPortalTarget={document.body}
            placeholder="Select"
            isClearable
            isSearchable
          />
        </div>

        {/* Task Code */}
        {/* Task Code */}
        <div className="flex flex-col flex-grow min-w-[140px] max-w-[170px]">
          <label className="mb-1 ml-1 text-[12px] font-medium text-gray-600 tracking-wide flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-300 mr-1"></span>
            Task Code
          </label>
          <Select
            options={options}
            value={
              filters.code ? { label: filters.code, value: filters.code } : null
            }
            onChange={(selectedOption) =>
              handleFilterChange("code", selectedOption?.value || "")
            }
            styles={{
              ...customSelectStyles,
              control: (base) => ({
                ...base,
                borderRadius: 12,
                borderColor: "#e5e7eb",
                boxShadow: "none",
                minHeight: 36,
                fontSize: 14,
                background: "#f9fafb",
              }),
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
            menuPortalTarget={document.body}
            placeholder="Select"
            isClearable
            isSearchable
            noOptionsMessage={() => "No matching codes"}
          />
        </div>

        {/* Assignee */}
        {role === "admin" && (
          <div className="flex flex-col flex-grow min-w-[140px] max-w-[170px]">
            <label className="mb-1 ml-1 text-[12px] font-medium text-gray-600 tracking-wide flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1"></span>
              Assignee
            </label>
            <Select
              options={[
                { label: "All Assignees", value: "" },
                ...uniqueUsers.map((u) => ({ label: u, value: u })),
              ]}
              value={
                filters.assignee
                  ? { label: filters.assignee, value: filters.assignee }
                  : null
              }
              onChange={(val) =>
                handleFilterChange("assignee", val?.value || "")
              }
              styles={{
                ...customSelectStyles,
                control: (base) => ({
                  ...base,
                  borderRadius: 12,
                  borderColor: "#e5e7eb",
                  boxShadow: "none",
                  minHeight: 36,
                  fontSize: 14,
                  background: "#f9fafb",
                }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
              menuPortalTarget={document.body}
              placeholder="Select"
              isClearable
              isSearchable
            />
          </div>
        )}

        {/* Assigned By */}
        {role === "admin" && (
          <div className="flex flex-col flex-grow min-w-[140px] max-w-[170px]">
            <label className="mb-1 ml-1 text-[12px] font-medium text-gray-600 tracking-wide flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-200 mr-1"></span>
              Assigned By
            </label>
            <Select
              options={[
                { label: "All Assigners", value: "" },
                ...uniqueAssignedBy.map((u) => ({ label: u, value: u })),
              ]}
              value={
                filters.assignedBy
                  ? { label: filters.assignedBy, value: filters.assignedBy }
                  : null
              }
              onChange={(val) =>
                handleFilterChange("assignedBy", val?.value || "")
              }
              styles={{
                ...customSelectStyles,
                control: (base) => ({
                  ...base,
                  borderRadius: 12,
                  borderColor: "#e5e7eb",
                  boxShadow: "none",
                  minHeight: 36,
                  fontSize: 14,
                  background: "#f9fafb",
                }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
              menuPortalTarget={document.body}
              placeholder="Select"
              isClearable
              isSearchable
            />
          </div>
        )}

        {/* Due Date */}
        <div className="flex flex-col min-w-[150px] max-w-[180px]">
          <label
            htmlFor="dueBefore"
            className="mb-1 ml-1 text-[12px] font-medium text-gray-600 tracking-wide flex items-center gap-1"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-pink-300 mr-1"></span>
            Due Date
          </label>
          <input
            type="date"
            id="dueBefore"
            value={filters.dueBefore}
            onChange={(e) => handleFilterChange("dueBefore", e.target.value)}
            className="w-full h-[36px] text-[14px] rounded-lg border border-gray-200 px-2 shadow focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-[#f9fafb]"
          />
        </div>

        {/* Clear Filters */}
        <div className="flex items-center justify-center min-w-[105px] mt-6">
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-50 hover:from-gray-300 hover:to-gray-200 px-4 py-2 rounded-xl text-xs font-semibold shadow transition text-gray-800 border border-gray-200"
            title="Clear All Filters"
          >
            <FaFilter className="text-[13px]" />
            Clear
            <FaTimes className="text-[12px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
