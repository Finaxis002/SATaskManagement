import Select from "react-select";
import { useEffect, useState } from "react";
import { FaFilter, FaTimes } from "react-icons/fa";

export const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    width: "100%",                    // make the control fill its grid cell
    minHeight: 40,
    fontSize: 14,
    borderRadius: 12,
    borderColor: state.isFocused ? "#a5b4fc" : "#e5e7eb",
    boxShadow: state.isFocused ? "0 0 0 2px #a5b4fc33" : "none",
    background: "#ffffff",
    transition: "border-color 0.2s, box-shadow 0.2s",
    outline: "none",
    paddingLeft: 6,
    paddingRight: 6,
    "&:hover": { borderColor: "#a5b4fc" },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 8,
    marginTop: 6,
    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
    padding: 0,
    background: "#fff",
    zIndex: 20,
    width: "100%",
    maxWidth: "100%",
    whiteSpace: "normal",
    wordBreak: "break-word",
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  option: (base, state) => ({
    ...base,
    background: state.isSelected ? "#eef2ff" : state.isFocused ? "#f8fafc" : "#fff",
    color: "#1f2937",
    fontWeight: state.isSelected ? 600 : 400,
    padding: "10px 14px",
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
    "&:hover": { color: "#6366f1" },
  }),
  indicatorSeparator: (base) => ({ ...base, display: "none" }),
  input: (base) => ({ ...base, fontSize: 14, color: "#334155" }),
  clearIndicator: (base) => ({
    ...base,
    padding: "2px 6px",
    color: "#cbd5e1",
    "&:hover": { color: "#6366f1" },
  }),
  valueContainer: (base) => ({ ...base, padding: "2px 8px" }),
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
  const [mobileOpen, setMobileOpen] = useState(false); // collapsible on very small screens

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
    <div className="sticky top-0 z-20 bg-gray-50 rounded-3xl border-none shadow-md mb-4 px-3 py-2">
      {/* Header row — shows a collapse toggle on xs screens */}
      <div className="flex items-center justify-between gap-2  sm:hidden lg:hidden">
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">Filters</span>
        </div>

        {/* Clear button (inline on >=sm, icon-only on xs) */}
        <div className="hidden sm:block">
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 h-10 text-xs font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
            title="Clear All Filters"
          >
            <FaFilter className="text-[13px]" />
            Clear
            <FaTimes className="text-[12px]" />
          </button>
        </div>

        {/* Mobile toggle + clear icon */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={clearFilters}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white w-10 h-10 text-gray-700 shadow-sm hover:bg-gray-50"
            title="Clear All"
            aria-label="Clear filters"
          >
            <FaTimes />
          </button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 h-10 text-xs font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {/* Responsive grid: 1 col (xs), 2 cols (sm), 3 cols (lg), 6 cols (xl) */}
      <div
        className={`mt-3 grid gap-3 ${
          mobileOpen ? "grid" : "hidden"
        } sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6`}
      >
        {/* Department */}
        <div className="col-span-1">
          <label className="mb-1 ml-1 block text-[12px] font-medium text-gray-600 tracking-wide">
            <span className="inline-block w-1.5 h-1.5 mr-1 rounded-full bg-indigo-500 align-middle" />
            Department
          </label>
          <Select
            className="w-full"
            classNamePrefix="rs"
            options={[
              { label: "All Departments", value: "" },
              ...departments.map((d) => ({ label: d.name, value: d.name })),
            ]}
            value={
              filters.department
                ? { label: filters.department, value: filters.department }
                : null
            }
            onChange={(val) => handleFilterChange("department", val?.value || "")}
            styles={customSelectStyles}
            menuPortalTarget={document.body}
            placeholder="Select"
            isClearable
            isSearchable
          />
        </div>

        {/* Status */}
        <div className="col-span-1">
          <label className="mb-1 ml-1 block text-[12px] font-medium text-gray-600 tracking-wide">
            <span className="inline-block w-1.5 h-1.5 mr-1 rounded-full bg-yellow-500 align-middle" />
            Status
          </label>
          <Select
            className="w-full"
            classNamePrefix="rs"
            options={[
              { label: "All Status", value: "" },
              ...uniqueStatuses.map((s) => ({ label: s, value: s })),
            ]}
            value={
              filters.status ? { label: filters.status, value: filters.status } : null
            }
            onChange={(val) => handleFilterChange("status", val?.value || "")}
            styles={customSelectStyles}
            menuPortalTarget={document.body}
            placeholder="Select"
            isClearable
            isSearchable
          />
        </div>

        {/* Task Code */}
        <div className="col-span-1">
          <label className="mb-1 ml-1 block text-[12px] font-medium text-gray-600 tracking-wide">
            <span className="inline-block w-1.5 h-1.5 mr-1 rounded-full bg-blue-400 align-middle" />
            Task Code
          </label>
          <Select
            className="w-full"
            classNamePrefix="rs"
            options={options}
            value={filters.code ? { label: filters.code, value: filters.code } : null}
            onChange={(selectedOption) =>
              handleFilterChange("code", selectedOption?.value || "")
            }
            styles={customSelectStyles}
            menuPortalTarget={document.body}
            placeholder="Select"
            isClearable
            isSearchable
            noOptionsMessage={() => "No matching codes"}
          />
        </div>

        {/* Assignee (admin only) */}
        {role === "admin" && (
          <div className="col-span-1">
            <label className="mb-1 ml-1 block text-[12px] font-medium text-gray-600 tracking-wide">
              <span className="inline-block w-1.5 h-1.5 mr-1 rounded-full bg-green-400 align-middle" />
              Assignee
            </label>
            <Select
              className="w-full"
              classNamePrefix="rs"
              options={[
                { label: "All Assignees", value: "" },
                ...uniqueUsers.map((u) => ({ label: u, value: u })),
              ]}
              value={
                filters.assignee
                  ? { label: filters.assignee, value: filters.assignee }
                  : null
              }
              onChange={(val) => handleFilterChange("assignee", val?.value || "")}
              styles={customSelectStyles}
              menuPortalTarget={document.body}
              placeholder="Select"
              isClearable
              isSearchable
            />
          </div>
        )}

        {/* Assigned By (admin only) */}
        {role === "admin" && (
          <div className="col-span-1">
            <label className="mb-1 ml-1 block text-[12px] font-medium text-gray-600 tracking-wide">
              <span className="inline-block w-1.5 h-1.5 mr-1 rounded-full bg-indigo-300 align-middle" />
              Assigned By
            </label>
            <Select
              className="w-full"
              classNamePrefix="rs"
              options={[
                { label: "All Assigners", value: "" },
                ...uniqueAssignedBy.map((u) => ({ label: u, value: u })),
              ]}
              value={
                filters.assignedBy
                  ? { label: filters.assignedBy, value: filters.assignedBy }
                  : null
              }
              onChange={(val) => handleFilterChange("assignedBy", val?.value || "")}
              styles={customSelectStyles}
              menuPortalTarget={document.body}
              placeholder="Select"
              isClearable
              isSearchable
            />
          </div>
        )}

        {/* Due Date */}
        <div className="col-span-1">
          <label
            htmlFor="dueBefore"
            className="mb-1 ml-1 block text-[12px] font-medium text-gray-600 tracking-wide"
          >
            <span className="inline-block w-1.5 h-1.5 mr-1 rounded-full bg-pink-400 align-middle" />
            Due Date
          </label>
          <div className="flex h-10 items-center rounded-xl border border-gray-200 bg-white px-3">
            <input
              type="date"
              id="dueBefore"
              value={filters.dueBefore}
              onChange={(e) => handleFilterChange("dueBefore", e.target.value)}
              className="w-full h-8 text-[14px] rounded-md outline-none"
            />
          </div>
        </div>

        {/* Clear (grid item for >=sm; hidden on xs because header has one) */}
        <div className="hidden sm:flex col-span-1 items-end">
          <button
            onClick={clearFilters}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 h-10 text-xs font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
            title="Clear All Filters"
          >
            <FaFilter className="text-[13px]" />
            Clear
            <FaTimes className="text-[12px]" />
          </button>
        </div>
      </div>

      {/* Always-open grid on >=sm screens */}
      <div className="hidden sm:grid mt-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* This duplicate grid ensures filters are visible by default on >=sm.
            To avoid duplication, you can remove this block and set mobileOpen=true by default. */}
      </div>
    </div>
  );
};

export default FilterSection;
