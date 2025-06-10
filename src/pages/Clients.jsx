import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus, FaThLarge, FaTable } from "react-icons/fa";
import Swal from "sweetalert2";
import ClientList from "../Components/client/ClientList";
import CreateClientModal from "../Components/client/CreateClientModal";
import ClientTableView from "../Components/client/ClientTableView";


const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [viewMode, setViewMode] = useState("card"); 


  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://sataskmanagementbackend.onrender.com/api/clients"
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      const formattedClients = Array.isArray(data)
        ? data.map((client) => ({
            id: client._id,
            name: client.name,
            contactPerson: client.contactPerson || "-",
            businessName: client.businessName || "-",
          }))
        : [];

      setClients(formattedClients);
    } catch (err) {
      console.error("Failed to fetch clients", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load clients. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDeleteClient = async (clientName) => {
    const result = await Swal.fire({
      title: `Delete "${clientName}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(
        "https://sataskmanagementbackend.onrender.com/api/clients",
        {
          data: { name: clientName },
        }
      );
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: `Client "${clientName}" was deleted successfully.`,
        timer: 2000,
        showConfirmButton: false,
      });
      fetchClients(); // refresh list
    } catch (err) {
      console.error("Delete failed", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to delete client. Please try again.",
      });
    }
  };

  const handleEditClient = (client) => {
    setEditingClient(client); // Set client to edit
    setShowClientModal(true); // Open modal
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-indigo-900 mb-5 text-center">
        Client Overview
      </h1>

      <div className="flex justify-end mb-4">
        <div className="flex gap-2">
    <button
      onClick={() => setViewMode("card")}
      className={`p-2 rounded ${viewMode === "card" ? "bg-indigo-200" : "bg-gray-200"}`}
      title="Card View"
    >
      <FaThLarge size={18} />
    </button>
    <button
      onClick={() => setViewMode("table")}
      className={`p-2 rounded ${viewMode === "table" ? "bg-indigo-200" : "bg-gray-200"}`}
      title="Table View"
    >
      <FaTable size={18} />
    </button>
  </div>
        <button
          onClick={() => setShowClientModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
        >
          <FaPlus /> Add Client
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-center text-gray-500">Loading clients...</p>
        </div>
      ) : clients.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-center text-gray-500">No clients found.</p>
        </div>
      ) : (
        <div className="space-y-6 mx-auto max-h-[60vh] overflow-y-auto">
          {viewMode === "card" ? (<ClientList
            clients={clients}
            onDelete={handleDeleteClient}
            onEdit={handleEditClient}
          />
          ):(
            <ClientTableView
    clients={clients}
    onEdit={handleEditClient}
    onDelete={handleDeleteClient}
  />
          )}
        </div>
      )}

      
      {showClientModal && (
        <CreateClientModal
          client={editingClient} // Pass the client being edited or null
          onClose={() => {
            setShowClientModal(false);
            setEditingClient(null); // Clear edit state on close
          }}
          onCreate={async (clientData) => {
            try {
              if (editingClient) {
                // Edit mode - update existing client
                await axios.put(
                  "https://sataskmanagementbackend.onrender.com/api/clients",
                  {
                    id: editingClient.id,
                    ...clientData,
                  }
                );
                Swal.fire({
                  icon: "success",
                  title: "Client Updated",
                  text: `"${clientData.name}" was updated successfully!`,
                  timer: 2000,
                  showConfirmButton: false,
                });
              } else {
                // Create mode - add new client
                await axios.post(
                  "https://sataskmanagementbackend.onrender.com/api/clients",
                  clientData
                );
                Swal.fire({
                  icon: "success",
                  title: "Client Created",
                  text: `"${clientData.name}" was added successfully!`,
                  timer: 2000,
                  showConfirmButton: false,
                });
              }
              fetchClients(); // Refresh the list
              setShowClientModal(false);
              setEditingClient(null);
            } catch (err) {
              // Check if error is due to duplicate client name
              if (err.response && err.response.status === 409) {
                Swal.fire({
                  icon: "warning",
                  title: "Duplicate Client",
                  text:
                    err.response.data.message ||
                    "Client with this name already exists.",
                });
              } else {
                Swal.fire({
                  icon: "error",
                  title: editingClient ? "Update Failed" : "Creation Failed",
                  text: "Unable to save client. Please try again.",
                });
              }
              console.error("Client save failed", err);
            }
          }}
        />
      )}
    </div>
  );
};

export default Clients;
