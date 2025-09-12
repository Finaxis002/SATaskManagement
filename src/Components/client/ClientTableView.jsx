import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

const ClientTableView = ({ clients, onEdit, onDelete }) => {
  const role = localStorage.getItem("role");

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow rounded-lg">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b text-left">S.No</th>
            <th className="px-4 py-2 border-b text-left">Client Name</th>
            <th className="px-4 py-2 border-b text-left">Business Name</th>
            <th className="px-4 py-2 border-b text-left">Contact Person</th>
            <th className="px-4 py-2 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client, idx) => (
            <tr
              key={client.id}
              className={`hover:bg-indigo-50 ${
                idx % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <td className="px-4 py-2 border-b">{idx + 1}</td>
              <td className="px-4 py-2 border-b">{client.name}</td>
              <td className="px-4 py-2 border-b">{client.businessName}</td>
              <td className="px-4 py-2 border-b">{client.contactPerson}</td>
              <td className="px-4 py-2 border-b text-right">
                {role == "admin" && (
                  <button
                    onClick={() => onEdit(client)}
                    className="inline-flex items-center text-indigo-500 hover:text-indigo-800 mr-2 pe-2"
                    title="Edit"
                  >
                    <FaEdit size={18} />
                  </button>
                )}
                <button
                  onClick={() => onDelete(client.name)}
                  className="inline-flex items-center text-red-500 hover:text-red-800"
                  title="Delete"
                >
                  <FaTrash size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientTableView;
