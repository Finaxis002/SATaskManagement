import React, { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";

export const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: 12,
    borderColor: state.isFocused ? "#a5b4fc" : "#e5e7eb",
    boxShadow: state.isFocused ? "0 0 0 2px #a5b4fc33" : "none",
    minHeight: 40,
    fontSize: 15,
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
    background: "",
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
    fontSize: 15,
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
    fontSize: 15,
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

const TaskCodeSelector = ({ selectedCode, setSelectedCode }) => {
  // const [taskCodes, setTaskCodes] = useState([]);
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
    <Select
      isClearable
      isSearchable
      options={options}
      value={selectedCode}
      onChange={setSelectedCode}
      placeholder="Select task code"
      noOptionsMessage={() => "No matching codes"}
      styles={{
        ...customSelectStyles,
      }}
    />
  );
};

export default TaskCodeSelector;
