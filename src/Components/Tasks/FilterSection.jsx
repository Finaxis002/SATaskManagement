import Select from "react-select";
import { FaCalendarAlt, FaFilter, FaTimes } from "react-icons/fa";
import TaskCodeFilterSelector from "./TaskCodeFilterSelector";

const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    minHeight: "30px",
    fontSize: "0.8rem",
    borderRadius: "0.375rem",
    borderColor: "#d1d5db", // Tailwind gray-300
    boxShadow: "none",
    "&:hover": { borderColor: "#6366f1" }, // Indigo-500
  }),
  menu: (provided) => ({
    ...provided,
    fontSize: "0.85rem",
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  placeholder: (provided) => ({
    ...provided,
    color: "#6b7280", // Tailwind gray-500
    fontSize: "0.85rem",
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    padding: "0 6px",
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    padding: 4,
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

  return (
    <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200 mb-6 z-20">
      <div className="flex flex-wrap items-end gap-3">
        {/* Department */}
        <div className="flex flex-col flex-grow min-w-[180px] max-w-[220px]">
          <label className="mb-1 text-xs font-semibold text-gray-700">
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
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
            menuPortalTarget={document.body}
            placeholder="Select Department"
            isClearable
            isSearchable
          />
        </div>

        {/* Status */}
        <div className="flex flex-col flex-grow min-w-[150px] max-w-[180px]">
          <label className="mb-1 text-xs font-semibold text-gray-700">
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
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
            menuPortalTarget={document.body}
            placeholder="Select Status"
            isClearable
            isSearchable
          />
        </div>

        {/* Task Code */}
        <div className="flex flex-col flex-grow min-w-[150px] max-w-[180px]">
          <label className="mb-1 text-xs font-semibold text-gray-700">
            Task Code
          </label>
          <TaskCodeFilterSelector
            selectedCode={
              filters.code ? { label: filters.code, value: filters.code } : null
            }
            setSelectedCode={(selectedOption) =>
              handleFilterChange("code", selectedOption?.value || "")
            }
          />
        </div>

        {/* Assignee */}
        {role === "admin" && (
          <div className="flex flex-col flex-grow min-w-[150px] max-w-[180px]">
            <label className="mb-1 text-xs font-semibold text-gray-700">
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
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
              menuPortalTarget={document.body}
              placeholder="Select Assignee"
              isClearable
              isSearchable
            />
          </div>
        )}

        {/* Assigned By */}
        {role === "admin" && (
          <div className="flex flex-col flex-grow min-w-[150px] max-w-[180px]">
            <label className="mb-1 text-xs font-semibold text-gray-700">
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
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
              menuPortalTarget={document.body}
              placeholder="Select Assignor"
              isClearable
              isSearchable
            />
          </div>
        )}

        {/* Due Date */}
        <div className="flex flex-col min-w-[160px] max-w-[200px]">
          <label
            htmlFor="dueBefore"
            className="mb-1 text-xs font-semibold text-gray-700 flex items-center gap-1"
          >
            <FaCalendarAlt className="text-indigo-500" />
            Due Date (Before or On)
          </label>
          <input
            type="date"
            id="dueBefore"
            value={filters.dueBefore}
            onChange={(e) => handleFilterChange("dueBefore", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Clear Filters */}
        <div className="flex items-center justify-center min-w-[110px]">
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs font-semibold shadow-md transition"
            title="Clear All Filters"
          >
            <FaFilter />
            Clear
            <FaTimes />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
