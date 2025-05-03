// DepartmentSelector.jsx
import React, { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";

const DepartmentSelector = ({ selectedDepartments, setSelectedDepartments }) => {
  const [allDepartments, setAllDepartments] = useState([]);

  // Fetch departments on component mount
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await fetch("https://sataskmanagementbackend.onrender.com/api/departments");
        const data = await res.json();
        setAllDepartments(data.map((dept) => dept.name));
      } catch (err) {
        console.error("Failed to load departments", err);
      }
    };

    loadDepartments();
  }, []);

  // Handle department selection
  const handleDepartmentChange = async (selectedOptions) => {
    const selectedValues = selectedOptions.map((option) => option.value);

    // Add newly typed departments to DB if not already present
    const newDepartments = selectedValues.filter(
      (val) => !allDepartments.includes(val)
    );

    for (let dept of newDepartments) {
      try {
        await fetch("https://sataskmanagementbackend.onrender.com/api/departments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: dept }),
        });
      } catch (err) {
        console.error("Failed to add department:", dept);
      }
    }

    setAllDepartments((prev) => [...new Set([...prev, ...newDepartments])]);
    setSelectedDepartments(selectedValues);
  };

  return (
    <CreatableSelect
      isMulti
      name="departments"
      options={allDepartments.map((dep) => ({ label: dep, value: dep }))}
      value={selectedDepartments.map((dep) => ({ label: dep, value: dep }))}
      onChange={handleDepartmentChange}
      className="w-full"
      classNamePrefix="react-select"
      placeholder="Select or add departments"
    />
  );
};

export default DepartmentSelector;
