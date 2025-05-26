import React, { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";


const TaskCodeSelector = ({ selectedCode, setSelectedCode }) => {
  // const [taskCodes, setTaskCodes] = useState([]);
   const [options, setOptions] = useState([]);


  // useEffect(() => {
  //   fetch("https://sataskmanagementbackend.onrender.com/api/task-codes")
  //     .then((res) => res.json())
  //     .then((data) => {
  //       const options = data.map((code) => ({
  //         label: code.name,
  //         value: code.name,
  //       }));
  //       setTaskCodes(options);

  //       // If selectedCode is provided but not in options, add it
  //       if (
  //         selectedCode &&
  //         !options.some((opt) => opt.value === selectedCode.value)
  //       ) {
  //         setTaskCodes((prev) => [...prev, selectedCode]);
  //       }
  //     })
  //     .catch(console.error);
  // }, []);

  // const handleChange = async (newValue, actionMeta) => {
  //   if (actionMeta.action === "create-option") {
  //     try {
  //       const res = await fetch(
  //         "https://sataskmanagementbackend.onrender.com/api/task-codes",
  //         {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({ name: newValue.value }),
  //         }
  //       );
  //       const newCode = await res.json();
  //       const newOption = { label: newCode.name, value: newCode.name };
  //       setTaskCodes((prev) => [...prev, newOption]);
  //       setSelectedCode(newOption);
  //     } catch (err) {
  //       console.error("Failed to add new task code", err);
  //     }
  //   } else {
  //     setSelectedCode(newValue);
  //   }
  // };
useEffect(() => {
    fetch('https://sataskmanagementbackend.onrender.com/api/task-codes')
      .then(r => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
      })
      .then(data => {
        setOptions(
          data.map(code => ({
            label: code.name,
            value: code.name,
          }))
        );
      })
      .catch(console.error);
  }, []);


  // const handleChange = (option) => {
  //   setSelectedCode(option);
  // };

  return (
    // <CreatableSelect
    //   isClearable
    //   onChange={handleChange}
    //   options={taskCodes}
    //   value={selectedCode}
    //   placeholder="Select or add task code"
    // />
    // <Select
    //   isClearable
    //   isSearchable
    //   options={taskCodes}
    //   value={selectedCode}
    //   onChange={handleChange}
    //   placeholder="Select task code"
    //   classNamePrefix="select"
    //   styles={{
    //     control: (base) => ({
    //       ...base,
    //       minHeight: "42px",
    //       borderColor: "#d1d5db",
    //       "&:hover": { borderColor: "#d1d5db" },
    //     }),
    //   }}
    // />
<Select
      isClearable
      isSearchable
      options={options}
      value={selectedCode}
      onChange={setSelectedCode}
      placeholder="Select task code"
      noOptionsMessage={() => 'No matching codes'}
      styles={{
         control: (base) => ({
           ...base,
           minHeight: "42px",
           borderColor: "#d1d5db",
           "&:hover": { borderColor: "#d1d5db" },
         }),
       }}
    />
  );
};

export default TaskCodeSelector;
