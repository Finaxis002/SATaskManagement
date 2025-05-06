import React, { useEffect, useState } from "react";
import Select from "react-select";

const Completed = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [clientOptions, setClientOptions] = useState([]);

  // Get user role and email from localStorage
  const role = localStorage.getItem("role");
  const userEmail = localStorage.getItem("userId");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(
          "https://sataskmanagementbackend.onrender.com/api/tasks"
        );
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        console.error("Failed to fetch completed tasks:", err);
      }
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch("https://sataskmanagementbackend.onrender.com/api/clients");
        const data = await res.json();
        setClientOptions(data);
      } catch (err) {
        console.error("Failed to fetch clients", err);
      }
    };

    fetchClients();
  }, []);

  const completedTasks = tasks.filter(
    (task) =>
      task.status === "Completed" &&
      (selectedClient === "" || task.clientName === selectedClient)
  );

  return (
    <div className="p-6 h-[90vh] w-[180vh]  overflow-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:gap-4">
        <label
          htmlFor="client-filter"
          className="text-sm font-medium text-gray-700"
        >
          Filter by Client:
        </label>
        {/* <select
         id="client-filter"
         options={[
            { value: "", label: "All Clients" },
            ...clientOptions.map((client) => ({
              value: client.name,
              label: client.name,
            })),
          ]}
          
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="w-full sm:w-64 border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        >
          <option value="">All Clients</option>
          {clientOptions.map((client) => (
            <option key={client} value={client}>
              {client}
            </option>
          ))}
        </select> */}

        <Select
          id="client-filter"
          options={[
            { value: "", label: "All Clients" },
            ...clientOptions.map((client) => ({
              value: client,
              label: client,
            })),
          ]}
          value={
            selectedClient
              ? { value: selectedClient, label: selectedClient }
              : { value: "", label: "All Clients" }
          }
          onChange={(selectedOption) => setSelectedClient(selectedOption.value)}
          className="w-full sm:w-64 text-sm"
          isSearchable={true}
          placeholder="Select client..."
        />
      </div>

      <table className="min-w-[1300px] w-full table-auto border-collapse text-sm text-gray-800">
        <thead className="bg-gradient-to-r from-indigo-400 to-indigo-700 text-white text-sm">
          <tr className="text-left">
            <th className="py-4 px-4 min-w-[70px] font-semibold">S. No</th>
            <th className="py-4 px-6 min-w-[180px] font-semibold">Task Name</th>
            <th className="py-4 px-6  min-w-[250px] font-semibold">
              Work Description + Code
            </th>
            <th className="py-4 px-6 min-w-[180px] font-semibold">
              Date of Work
            </th>
            <th className="py-4 px-6 min-w-[180px] font-semibold cursor-pointer">
              Due Date
            </th>
            <th className="py-4 px-6 min-w-[160px] font-semibold text-center">
              Status
            </th>

            <th className="py-4 px-6 min-w-[250px] font-semibold">Team</th>
            <th className="py-4 px-6 min-w-[130px] font-semibold">
              Assigned By
            </th>
          </tr>
        </thead>

        <tbody>
          {completedTasks.length === 0 ? (
            <tr>
              <td colSpan="10" className="text-center py-6 text-gray-500">
                🚫 No completed tasks available.
              </td>
            </tr>
          ) : (
            completedTasks.map((task, index) => (
              <tr key={task._id} className="border-b">
                <td className="py-3 px-4">{index + 1}</td>

                <td className="py-3 px-4">{task.taskName}</td>

                <td className="py-3 px-4">
                  {task.workDesc}{" "}
                  {task.code && (
                    <span className="text-blue-600 font-semibold ml-2">
                      ({task.code})
                    </span>
                  )}
                </td>

                <td className="py-3 px-4">
                  {task.assignedDate
                    ? new Date(task.assignedDate).toLocaleDateString("en-GB")
                    : "—"}
                </td>

                <td className="py-3 px-4">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString("en-GB")
                    : "—"}
                </td>

                <td className="py-3 px-4 text-center">
                  <span className="bg-green-200 text-green-700 px-2 py-1 rounded-full text-xs">
                    {task.status}
                  </span>
                </td>

                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {task.assignees?.map((a) => (
                      <span
                        key={a.email}
                        className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full"
                      >
                        {a.name}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="py-3 px-4">{task.assignedBy?.name || "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Completed;
