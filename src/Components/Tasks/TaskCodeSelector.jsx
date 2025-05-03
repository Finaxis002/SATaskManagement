import React, { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';

const TaskCodeSelector = ({ selectedCode, setSelectedCode }) => {
  const [taskCodes, setTaskCodes] = useState([]);
//   const [selectedCode, setSelectedCode] = useState(null);

  useEffect(() => {
    // Fetch existing task codes
    fetch('https://sataskmanagementbackend.onrender.com/api/task-codes')
      .then((res) => res.json())
      .then((data) => setTaskCodes(data.map((code) => ({ label: code.name, value: code.name }))))
      .catch((err) => console.error('Failed to load task codes', err));
  }, []);

  useEffect(() => {
    // Set the initial selected task code (for editing)
    if (selectedCode) {
      const defaultCode = taskCodes.find(code => code.value === selectedCode);
      setSelectedCode(defaultCode || null);
    }
  }, [selectedCode, taskCodes, setSelectedCode]);

  const handleChange = async (newValue, actionMeta) => {
    if (actionMeta.action === 'create-option') {
      // Ensure you're only sending the string value, not the full object
      const newTaskCode = newValue.value;  // Use only the 'value' field
      try {
        const res = await fetch('https://sataskmanagementbackend.onrender.com/api/task-codes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newTaskCode }),  // Send only the 'name' string
        });
        const newCode = await res.json();
        const newOption = { label: newCode.name, value: newCode.name };
        setTaskCodes((prev) => [...prev, newOption]);
        setSelectedCode(newOption);
      } catch (err) {
        console.error('Failed to add new task code', err);
      }
    } else {
      setSelectedCode(newValue);
    }
  };
  

  return (
    <CreatableSelect
      isClearable
      onChange={handleChange}
      options={taskCodes}
      value={selectedCode}
      placeholder="Select or add task code"
    />
  );
};

export default TaskCodeSelector;
