// import React, { useState, useEffect } from "react";
// import axios from "../utils/secureAxios"; // Use your axios instance

// const BankDetails = () => {
//   const [firms, setFirms] = useState([]);
//   const [showFirmModal, setShowFirmModal] = useState(false);
//   const [newFirm, setNewFirm] = useState({ name: "", address: "" });
//   const [activeFirmId, setActiveFirmId] = useState(null);
//   const [showBankModal, setShowBankModal] = useState(false);
//   const [newBank, setNewBank] = useState({
//     bankName: "",
//     accountName: "",
//     accountNumber: "",
//     ifsc: "",
//     upiIdName: "",
//     upiMobile: "",
//     upiId: "",
//   });

//   // Fetch firms on load
//   useEffect(() => {
//     fetchFirms();
//   }, []);

//   const fetchFirms = async () => {
//     const res = await axios.get("https://taskbe.sharda.co.in/firms"); // GET all firms
//     setFirms(res.data);
//   };

//   // Add Firm
//   const handleAddFirm = async () => {
//     await axios.post("https://taskbe.sharda.co.in/firms", newFirm);
//     setShowFirmModal(false);
//     setNewFirm({ name: "", address: "" });
//     fetchFirms();
//   };

//   // Add Bank to a firm
//   const handleAddBank = async () => {
//     await axios.post(`https://taskbe.sharda.co.in/firms/${activeFirmId}/banks`, newBank);
//     setShowBankModal(false);
//     setNewBank({
//       bankName: "",
//       accountName: "",
//       accountNumber: "",
//       ifsc: "",
//       upiIdName: "",
//       upiMobile: "",
//       upiId: "",
//     });
//     fetchFirms();
//   };

//   return (
//     <div className="max-w-3xl mx-auto py-8">
//       <h1 className="text-2xl font-bold mb-4">Firm & Bank Details</h1>

//       {/* Add Firm Button */}
//       <button
//         className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded"
//         onClick={() => setShowFirmModal(true)}
//       >
//         + Add Firm
//       </button>

//       {/* Firms List */}
//       {firms.length === 0 && <div>No firms found.</div>}
//       {firms.map((firm) => (
//         <div key={firm._id} className="mb-6 border rounded p-4 bg-white shadow">
//           <div className="flex items-center justify-between">
//             <div>
//               <div className="font-semibold text-lg">{firm.name}</div>
//               <div className="text-gray-500 text-sm">{firm.address}</div>
//             </div>
//             <button
//               className="px-3 py-1 bg-green-500 text-white rounded"
//               onClick={() => {
//                 setActiveFirmId(firm._id);
//                 setShowBankModal(true);
//               }}
//             >
//               + Add Bank
//             </button>
//           </div>
//           {/* Banks under this firm */}
//           <div className="mt-3">
//             {firm.banks && firm.banks.length > 0 ? (
//               <table className="w-full text-sm mt-2 border">
//                 <thead>
//                   <tr className="bg-gray-100">
//                     <th className="border p-2">Bank Name</th>
//                     <th className="border p-2">A/C Name</th>
//                     <th className="border p-2">A/C No.</th>
//                     <th className="border p-2">IFSC</th>
//                     <th className="border p-2">UPI Name</th>
//                     <th className="border p-2">UPI Mobile</th>
//                     <th className="border p-2">UPI ID</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {firm.banks.map((bank, idx) => (
//                     <tr key={idx}>
//                       <td className="border p-2">{bank.bankName}</td>
//                       <td className="border p-2">{bank.accountName}</td>
//                       <td className="border p-2">{bank.accountNumber}</td>
//                       <td className="border p-2">{bank.ifsc}</td>
//                       <td className="border p-2">{bank.upiIdName}</td>
//                       <td className="border p-2">{bank.upiMobile}</td>
//                       <td className="border p-2">{bank.upiId}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             ) : (
//               <div className="text-gray-500 text-xs mt-2">No banks added.</div>
//             )}
//           </div>
//         </div>
//       ))}

//       {/* Add Firm Modal */}
//       {showFirmModal && (
//         <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
//           <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
//             <div className="mb-4">
//               <label className="font-semibold">Firm Name</label>
//               <input
//                 type="text"
//                 className="w-full border p-2 rounded mt-1"
//                 value={newFirm.name}
//                 onChange={(e) => setNewFirm({ ...newFirm, name: e.target.value })}
//               />
//             </div>
//             <div className="mb-4">
//               <label>Address</label>
//               <input
//                 type="text"
//                 className="w-full border p-2 rounded mt-1"
//                 value={newFirm.address}
//                 onChange={(e) => setNewFirm({ ...newFirm, address: e.target.value })}
//               />
//             </div>
//             <div className="flex justify-end gap-2">
//               <button className="px-3 py-1 border rounded" onClick={() => setShowFirmModal(false)}>
//                 Cancel
//               </button>
//               <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={handleAddFirm}>
//                 Add Firm
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Add Bank Modal */}
//       {showBankModal && (
//         <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
//           <div className="bg-white rounded-lg p-6 w-[28rem] shadow-xl">
//             <div className="mb-4">
//               <label className="font-semibold">Bank Name</label>
//               <input
//                 type="text"
//                 className="w-full border p-2 rounded mt-1"
//                 value={newBank.bankName}
//                 onChange={(e) => setNewBank({ ...newBank, bankName: e.target.value })}
//               />
//             </div>
//             <div className="mb-4">
//               <label>Account Name</label>
//               <input
//                 type="text"
//                 className="w-full border p-2 rounded mt-1"
//                 value={newBank.accountName}
//                 onChange={(e) => setNewBank({ ...newBank, accountName: e.target.value })}
//               />
//             </div>
//             <div className="mb-4">
//               <label>Account Number</label>
//               <input
//                 type="text"
//                 className="w-full border p-2 rounded mt-1"
//                 value={newBank.accountNumber}
//                 onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value })}
//               />
//             </div>
//             <div className="mb-4">
//               <label>IFSC Code</label>
//               <input
//                 type="text"
//                 className="w-full border p-2 rounded mt-1"
//                 value={newBank.ifsc}
//                 onChange={(e) => setNewBank({ ...newBank, ifsc: e.target.value })}
//               />
//             </div>
//             <div className="mb-4">
//               <label>UPI ID Name</label>
//               <input
//                 type="text"
//                 className="w-full border p-2 rounded mt-1"
//                 value={newBank.upiIdName}
//                 onChange={(e) => setNewBank({ ...newBank, upiIdName: e.target.value })}
//               />
//             </div>
//             <div className="mb-4">
//               <label>UPI Mobile Number</label>
//               <input
//                 type="text"
//                 className="w-full border p-2 rounded mt-1"
//                 value={newBank.upiMobile}
//                 onChange={(e) => setNewBank({ ...newBank, upiMobile: e.target.value })}
//               />
//             </div>
//             <div className="mb-4">
//               <label>UPI ID</label>
//               <input
//                 type="text"
//                 className="w-full border p-2 rounded mt-1"
//                 value={newBank.upiId}
//                 onChange={(e) => setNewBank({ ...newBank, upiId: e.target.value })}
//               />
//             </div>
//             <div className="flex justify-end gap-2">
//               <button className="px-3 py-1 border rounded" onClick={() => setShowBankModal(false)}>
//                 Cancel
//               </button>
//               <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={handleAddBank}>
//                 Add Bank
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BankDetails;




///////////////////////////////////////////////////////////////////////////



import React, { useState, useEffect } from "react";
import axios from "../utils/secureAxios";
import Swal from "sweetalert2";
import { FaPen, FaTrash } from "react-icons/fa";

const BankDetails = () => {
  const [submittingFirm, setSubmittingFirm] = useState(false);
  const [firms, setFirms] = useState([]);
  const [activeFirmId, setActiveFirmId] = useState(null);
  const [expandedFirms, setExpandedFirms] = useState({});
  
  const [isFirmModalOpen, setIsFirmModalOpen] = useState(false);
  const [firmModalMode, setFirmModalMode] = useState("add");
  const [formFirm, setFormFirm] = useState({
    _id: "",
    name: "",
    address: "",
    gstin: "",
    phone: "",
    prefix: "",
  });

  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankModalMode, setBankModalMode] = useState("add");
  const [formBank, setFormBank] = useState({
    _id: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    ifsc: "",
    upiIdName: "",
    upiMobile: "",
    upiId: "",
  });

  const openAddFirm = () => {
    setFirmModalMode("add");
    setFormFirm({
      _id: "",
      name: "",
      address: "",
      gstin: "",
      phone: "",
      prefix: "",
    });
    setIsFirmModalOpen(true);
  };

  const openEditFirm = (firm) => {
    setFirmModalMode("edit");
    setFormFirm({
      _id: firm._id,
      name: firm.name || "",
      address: firm.address || "",
      gstin: firm.gstin || "",
      phone: firm.phone || "",
      prefix: firm.prefix || "",
    });
    setIsFirmModalOpen(true);
  };

  const closeFirmModal = () => {
    setIsFirmModalOpen(false);
  };

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });

  const submitFirm = async () => {
    const payload = {
      name: (formFirm.name || "").trim(),
      address: (formFirm.address || "").trim(),
      gstin: (formFirm.gstin || "").trim(),
      phone: (formFirm.phone || "").trim(),
      prefix: (formFirm.prefix || "").trim(),
    };

    try {
      setSubmittingFirm(true);
      if (firmModalMode === "add") {
        await axios.post("https://taskbe.sharda.co.in/firms", payload);
        Toast.fire({ icon: "success", title: "Firm created successfully" });
      } else {
        await axios.put(`https://taskbe.sharda.co.in/firms/${formFirm._id}`, payload);
        Toast.fire({ icon: "success", title: "Firm updated successfully" });
      }
      closeFirmModal();
      fetchFirms();
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const msg = data?.message ?? err?.message ?? "Unknown error";
      const code = data?.code;

      const isDupPrefix =
        status === 409 ||
        code === 11000 ||
        data?.keyPattern?.prefix ||
        (/duplicate/i.test(String(msg)) && /prefix/i.test(String(msg))) ||
        ((status === 400 || status === 422) && /prefix/i.test(String(msg)) && /exist/i.test(String(msg)));

      if (isDupPrefix) {
        await Swal.fire({
          icon: "error",
          title: "Duplicate Prefix",
          text: "This firm prefix already exists. Please choose a different prefix.",
          confirmButtonText: "OK",
          confirmButtonColor: "#2563eb",
        });
      } else {
        await Swal.fire({
          icon: "error",
          title: `Failed to ${firmModalMode === "add" ? "create" : "update"} firm`,
          text: msg,
          confirmButtonText: "OK",
          confirmButtonColor: "#2563eb",
        });
      }
    } finally {
      setSubmittingFirm(false);
    }
  };

  const openAddBank = (firmId) => {
    setActiveFirmId(firmId);
    setBankModalMode("add");
    setFormBank({
      _id: "",
      bankName: "",
      accountName: "",
      accountNumber: "",
      ifsc: "",
      upiIdName: "",
      upiMobile: "",
      upiId: "",
    });
    setIsBankModalOpen(true);
  };

  

  // submit
  // const submitFirm = async () => {
  //   if (firmModalMode === "add") {
  //     await axios.post("https://taskbe.sharda.co.in/firms", {
  //       name: formFirm.name,
  //       address: formFirm.address,
  //       gstin: formFirm.gstin,
  //       phone: formFirm.phone,
  //       prefix: formFirm.prefix,
  //     });
  //   } else {
  //     await axios.put(`https://taskbe.sharda.co.in/firms/${formFirm._id}`, {
  //       name: formFirm.name,
  //       address: formFirm.address,
  //       gstin: formFirm.gstin,
  //       phone: formFirm.phone,
  //       prefix: formFirm.prefix,
  //     });
  //   }
  //   closeFirmModal();
  //   fetchFirms();
  // };


  //   const submitFirm = async () => {
  //   const payload = {
  //     name: formFirm.name,
  //     address: formFirm.address,
  //     gstin: formFirm.gstin,
  //     phone: formFirm.phone,
  //     prefix: formFirm.prefix,
  //   };

  //   try {
  //     setSubmittingFirm(true);

  //     if (firmModalMode === "add") {
  //       await axios.post("https://taskbe.sharda.co.in/firms", payload);
  //       alert("Firm created successfully.");
  //     } else {
  //       await axios.put(`https://taskbe.sharda.co.in/firms/${formFirm._id}`, payload);
  //       alert("Firm updated successfully.");
  //     }

  //     closeFirmModal();
  //     fetchFirms();
  //   } catch (err) {
  //     // Try to understand backend error shapes
  //     const status = err?.response?.status;
  //     const msg = err?.response?.data?.message ?? err?.message ?? "Unknown error";
  //     const code = err?.response?.data?.code;

  //     const isDupPrefix =
  //       status === 409 ||                              // common for conflicts
  //       code === 11000 ||                              // Mongo duplicate key
  //       err?.response?.data?.keyPattern?.prefix ||    // Mongo key pattern
  //       /duplicate/i.test(String(msg)) && /prefix/i.test(String(msg));

  //     if (isDupPrefix) {
  //       alert("This firm prefix already exists. Please choose a different prefix.");
  //     } else {
  //       alert(`Failed to ${firmModalMode === "add" ? "create" : "update"} firm: ${msg}`);
  //     }
  //   } finally {
  //     setSubmittingFirm(false);
  //   }
  // };


  const openEditBank = (firmId, bank) => {
    setActiveFirmId(firmId);
    setBankModalMode("edit");
    setFormBank({
      _id: bank._id,
      bankName: bank.bankName || "",
      accountName: bank.accountName || "",
      accountNumber: bank.accountNumber || "",
      ifsc: bank.ifsc || "",
      upiIdName: bank.upiIdName || "",
      upiMobile: bank.upiMobile || "",
      upiId: bank.upiId || "",
    });
    setIsBankModalOpen(true);
  };

  const closeBankModal = () => setIsBankModalOpen(false);

  const submitBank = async () => {
    if (!activeFirmId) return;
    try {
      if (bankModalMode === "add") {
        await axios.post(
          `https://taskbe.sharda.co.in/firms/${activeFirmId}/banks`,
          formBank
        );
      } else {
        await axios.put(
          `https://taskbe.sharda.co.in/firms/${activeFirmId}/banks/${formBank._id}`,
          formBank
        );
      }
      closeBankModal();
      fetchFirms();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFirms();
  }, []);

  const fetchFirms = async () => {
    const res = await axios.get("https://taskbe.sharda.co.in/firms");
    setFirms(res.data);
  };

  const toggleFirmExpansion = (firmId) => {
    setExpandedFirms((prev) => ({
      ...prev,
      [firmId]: !prev[firmId],
    }));
  };

  const handleDeleteFirm = async (firmId) => {
    try {
      await axios.delete(`https://taskbe.sharda.co.in/firms/${firmId}`);
      fetchFirms();
    } catch (error) {
      console.error("Error deleting firm:", error);
    }
  };

  const handleDeleteBank = async (firmId, bankId) => {
    try {
      await axios.delete(
        `https://taskbe.sharda.co.in/firms/${firmId}/banks/${bankId}`
      );
      fetchFirms();
    } catch (error) {
      console.error("Error deleting bank:", error);
    }
  };

  const confirmDelete = (type, onConfirm) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete this ${type}?`
    );
    if (isConfirmed) {
      onConfirm();
    }
  };

  return (
    <div className="w-full mx-auto flex flex-col px-2 sm:px-4">
      <div className="max-h-[calc(100vh-220px)] overflow-y-auto pb-8">
        <div className="pt-4 flex-shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
              Firm & Bank Management
            </h1>
            <button
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              onClick={openAddFirm}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add New Firm
            </button>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6 pb-6">
          {firms.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h3 className="mt-4 text-base sm:text-lg font-medium text-gray-900">
                No firms found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first firm
              </p>
              <button
                className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm sm:text-base"
                onClick={openAddFirm}
              >
                Add Firm
              </button>
            </div>
          ) : (
            firms.map((firm) => (
              <div
                key={firm._id}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div
                  className="p-4 sm:p-6 cursor-pointer hover:bg-gray-300 transition-colors bg-gray-200"
                  onClick={() => toggleFirmExpansion(firm._id)}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 break-words">
                          {firm.name}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 break-words">
                          {firm.address}
                        </p>
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 text-gray-500 transition-transform flex-shrink-0 ml-2 ${
                          expandedFirms[firm._id] ? "rotate-180" : ""
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm font-medium text-blue-700 px-2 py-1 bg-blue-50 rounded">
                        {firm.banks?.length || 0}{" "}
                        {firm.banks?.length === 1 ? "Bank" : "Banks"}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddBank(firm._id);
                        }}
                        className="flex-1 sm:flex-none px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 text-xs sm:text-sm"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="hidden sm:inline">Add Bank</span>
                        <span className="sm:hidden">Add</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditFirm(firm);
                        }}
                        className="px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        <FaPen className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete("firm", () => handleDeleteFirm(firm._id));
                        }}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        <FaTrash className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {expandedFirms[firm._id] && (
                  <div className="border-t border-gray-200 p-3 sm:p-6">
                    {firm.banks && firm.banks.length > 0 ? (
                      <div className="overflow-x-auto">
                        {/* Mobile Card View */}
                        <div className="block md:hidden space-y-3">
                          {firm.banks.map((bank, idx) => (
                            <div
                              key={idx}
                              className="bg-gray-50 rounded-lg p-3 space-y-2"
                            >
                              <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-gray-900 text-sm">
                                  {bank.bankName}
                                </h3>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => openEditBank(firm._id, bank)}
                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() =>
                                      confirmDelete("bank", () =>
                                        handleDeleteBank(firm._id, bank._id)
                                      )
                                    }
                                    className="text-red-600 hover:text-red-800 text-xs"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                              <div className="space-y-1 text-xs text-gray-600">
                                <div>
                                  <span className="font-medium">A/C Name:</span>{" "}
                                  {bank.accountName}
                                </div>
                                <div>
                                  <span className="font-medium">A/C Number:</span>{" "}
                                  {bank.accountNumber}
                                </div>
                                <div>
                                  <span className="font-medium">IFSC:</span>{" "}
                                  {bank.ifsc}
                                </div>
                                {(bank.upiIdName || bank.upiMobile || bank.upiId) && (
                                  <div className="pt-1 border-t border-gray-200 mt-2">
                                    <div className="font-medium mb-1">UPI Details:</div>
                                    {bank.upiIdName && <div>Name: {bank.upiIdName}</div>}
                                    {bank.upiMobile && <div>Mobile: {bank.upiMobile}</div>}
                                    {bank.upiId && <div>ID: {bank.upiId}</div>}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Bank Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  A/C Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  A/C Number
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  IFSC
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  UPI Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {firm.banks.map((bank, idx) => (
                                <tr
                                  key={idx}
                                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                >
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {bank.bankName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {bank.accountName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {bank.accountNumber}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {bank.ifsc}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div>Name: {bank.upiIdName || "-"}</div>
                                    <div>Mobile: {bank.upiMobile || "-"}</div>
                                    <div>ID: {bank.upiId || "-"}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <button
                                      onClick={() => openEditBank(firm._id, bank)}
                                      className="mr-2 text-blue-600 hover:text-blue-800"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() =>
                                        confirmDelete("bank", () =>
                                          handleDeleteBank(firm._id, bank._id)
                                        )
                                      }
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 sm:py-8">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                          />
                        </svg>
                        <h3 className="mt-4 text-base sm:text-lg font-medium text-gray-900">
                          No banks added
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Add a bank account to this firm
                        </p>
                        <button
                          className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm"
                          onClick={() => openAddBank(firm._id)}
                        >
                          Add Bank Account
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Firm Modal */}
      {isFirmModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {firmModalMode === "add" ? "Add New Firm" : "Edit Firm"}
                </h2>
                <button
                  onClick={closeFirmModal}
                  className="text-gray-400 hover:text-gray-500 text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Firm Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
                    value={formFirm.name}
                    onChange={(e) =>
                      setFormFirm({ ...formFirm, name: e.target.value })
                    }
                    placeholder="Enter firm name"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
                    value={formFirm.address}
                    onChange={(e) =>
                      setFormFirm({ ...formFirm, address: e.target.value })
                    }
                    placeholder="Enter firm address"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
                    value={formFirm.gstin}
                    onChange={(e) =>
                      setFormFirm({ ...formFirm, gstin: e.target.value })
                    }
                    placeholder="Enter GSTIN"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
                    value={formFirm.phone}
                    onChange={(e) =>
                      setFormFirm({ ...formFirm, phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Firm Prefix
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
                    value={formFirm.prefix}
                    onChange={(e) =>
                      setFormFirm({ ...formFirm, prefix: e.target.value })
                    }
                    placeholder="Enter Firm Prefix"
                  />
                </div>
              </div>

              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <button
                  onClick={closeFirmModal}
                  className="w-full sm:w-auto px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={submitFirm}
                  disabled={submittingFirm}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-md text-sm"
                >
                  {submittingFirm
                    ? "Saving..."
                    : firmModalMode === "add"
                    ? "Add Firm"
                    : "Update Firm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bank Modal */}
      {isBankModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {bankModalMode === "add" ? "Add Bank Account" : "Edit Bank Account"}
                </h2>
                <button
                  onClick={closeBankModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="sm:col-span-2 md:col-span-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formBank.accountName}
                    onChange={(e) =>
                      setFormBank({ ...formBank, accountName: e.target.value })
                    }
                    placeholder="Enter account name"
                  />
                </div>

                <div className="sm:col-span-2 md:col-span-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formBank.accountNumber}
                    onChange={(e) =>
                      setFormBank({
                        ...formBank,
                        accountNumber: e.target.value,
                      })
                    }
                    placeholder="Enter account number"
                  />
                </div>

                <div className="sm:col-span-2 md:col-span-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formBank.ifsc}
                    onChange={(e) =>
                      setFormBank({ ...formBank, ifsc: e.target.value })
                    }
                    placeholder="Enter IFSC code"
                  />
                </div>

                <div className="sm:col-span-2 border-t pt-3 sm:pt-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-3">
                    UPI Details (Optional)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        UPI ID Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formBank.upiIdName}
                        onChange={(e) =>
                          setFormBank({
                            ...formBank,
                            upiIdName: e.target.value,
                          })
                        }
                        placeholder="Enter UPI ID name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        UPI Mobile
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formBank.upiMobile}
                        onChange={(e) =>
                          setFormBank({
                            ...formBank,
                            upiMobile: e.target.value,
                          })
                        }
                        placeholder="Enter mobile number"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        UPI ID
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formBank.upiId}
                        onChange={(e) =>
                          setFormBank({ ...formBank, upiId: e.target.value })
                        }
                        placeholder="Enter UPI ID"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <button
                  onClick={closeBankModal}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={submitBank}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                >
                  {bankModalMode === "add" ? "Add Bank Account" : "Update Bank Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankDetails;