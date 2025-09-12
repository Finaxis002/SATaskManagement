// DepartmentSelector.jsx
import React, { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";

const DepartmentSelector = ({ selectedDepartments, setSelectedDepartments }) => {
  const [allDepartments, setAllDepartments] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check user role on component mount
  useEffect(() => {
    const userRole = localStorage.getItem("role");
    setIsAdmin(userRole === "admin");
  }, []);

  // Fetch departments on component mount
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await fetch("https://taskbe.sharda.co.in/api/departments");
        const data = await res.json();
        setAllDepartments(data.map((dept) => dept.name));
      } catch (err) {
        console.error("Failed to load departments", err);
      }
    };

    loadDepartments();
  }, []);

  // Handle department selection
//   const handleDepartmentChange = async (selectedOptions) => {
//     const selectedValues = selectedOptions.map((option) => option.value);

//     // Add newly typed departments to DB if not already present
//     const newDepartments = selectedValues.filter(
//       (val) => !allDepartments.includes(val)
//     );

//     for (let dept of newDepartments) {
//       try {
//         await fetch("https://taskbe.sharda.co.in/api/departments", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ name: dept }),
//         });
//       } catch (err) {
//         console.error("Failed to add department:", dept);
//       }
//     }

//     setAllDepartments((prev) => [...new Set([...prev, ...newDepartments])]);
//     setSelectedDepartments(selectedValues);
//   };
// Handle department selection
const handleDepartmentChange = async (selectedOptions, actionMeta) => {
    const selectedValues = selectedOptions.map((option) => option.value);

    // For create action, verify admin role
    if (actionMeta.action === "create-option") {
      if (!isAdmin) {
        alert("Only admin users can create new departments");
        return; // Prevent the creation
      }

      const newDepartment = actionMeta.option.value;
      
      try {
        // Add the new department to the database
        await fetch("https://taskbe.sharda.co.in/api/departments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newDepartment }),
        });
        
        // Update the local list of departments
        setAllDepartments((prev) => [...prev, newDepartment]);
      } catch (err) {
        console.error("Failed to add department:", newDepartment);
        return; // Don't update selection if creation failed
      }
    }

    setSelectedDepartments(selectedValues);
  };

  return (
    // <CreatableSelect
    //   isMulti
    //   name="departments"
    //   options={allDepartments.map((dep) => ({ label: dep, value: dep }))}
    //   value={selectedDepartments.map((dep) => ({ label: dep, value: dep }))}
    //   onChange={handleDepartmentChange}
    //   className="w-full"
    //   classNamePrefix="react-select"
    //   placeholder="Select or add departments"
    // />
    <CreatableSelect
    
      isMulti
      name="departments"
      options={allDepartments.map((dep) => ({ label: dep, value: dep }))}
      value={selectedDepartments.map((dep) => ({ label: dep, value: dep }))}
      onChange={handleDepartmentChange}
      className="w-full"
      classNamePrefix="react-select"
      placeholder="Select departments"
      isOptionDisabled={(option) => 
        // Disable the "create new" option for non-admin users
        option.__isNew__ && !isAdmin
      }
      noOptionsMessage={({ inputValue }) => 
        isAdmin 
          ? `Press Enter to create "${inputValue}"` 
          : "No departments found. Only admins can create new departments."
      }
      formatCreateLabel={(inputValue) => 
        isAdmin 
          ? `Create "${inputValue}"` 
          : "Admin privileges required to create"
      }
    /> 
  );
};

export default DepartmentSelector;