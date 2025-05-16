import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import ClientList from "../Components/ClientList";
import CreateClientModal from "../Components/CreateClientModal";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClientModal, setShowClientModal] = useState(false);

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

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-indigo-900 mb-5 text-center">
        Client Overview
      </h1>

      <div className="flex justify-end mb-4">
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
          <ClientList clients={clients} onDelete={handleDeleteClient} />
        </div>
      )}

      {showClientModal && (
        <CreateClientModal
          onClose={() => setShowClientModal(false)}
          onCreate={async (clientData) => {
            try {
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

              fetchClients();
              setShowClientModal(false);
            } catch (err) {
              Swal.fire({
                icon: "error",
                title: "Creation Failed",
                text: "Unable to create client. Please try again.",
              });
              console.error("Client creation failed", err);
            }
          }}
        />
      )}
    </div>
  );
};

export default Clients;
