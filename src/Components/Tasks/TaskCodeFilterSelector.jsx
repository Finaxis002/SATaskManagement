import React, { useState, useEffect } from "react";
import Select from "react-select";

const TaskCodeFilterSelector = ({ selectedCode, setSelectedCode }) => {
  const [taskCodes, setTaskCodes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTaskCodes = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          "https://sataskmanagementbackend.onrender.com/api/task-codes"
        );
        const data = await res.json();
        const options = data.map((code) => ({
          label: code.name,
          value: code.name,
        }));
        setTaskCodes(options);
      } catch (err) {
        console.error("Failed to fetch task codes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskCodes();
  }, []);

  return (
    <Select
      isClearable
      isSearchable
      isLoading={loading}
      options={taskCodes}
      value={selectedCode}
      onChange={setSelectedCode}
      placeholder="Select task code"
      classNamePrefix="select"
      menuPortalTarget={document.body} // Portal outside of scrollable parent
      styles={{
        control: (base) => ({
          ...base,
          height: 30,
          minHeight: "30px",
          fontSize: "0.75rem",
          borderColor: "#d1d5db",
          borderRadius: "0.375rem",
          boxShadow: "none",
          "&:hover": {
            borderColor: "#d1d5db",
          },
        }),
        menu: (base) => ({
          ...base,
          zIndex: 9999, // Make sure it goes above sticky headers
        }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        valueContainer: (base) => ({
          ...base,
          height: 30,
        }),
      }}
    />
  );
};

export default TaskCodeFilterSelector;
