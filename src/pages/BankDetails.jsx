import React, { useState, useEffect } from "react";
import axios from "../utils/secureAxios"; // Use your axios instance

const BankDetails = () => {
  const [firms, setFirms] = useState([]);
  const [showFirmModal, setShowFirmModal] = useState(false);
  const [newFirm, setNewFirm] = useState({ name: "", address: "" });
  const [activeFirmId, setActiveFirmId] = useState(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [newBank, setNewBank] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
    ifsc: "",
    upiIdName: "",
    upiMobile: "",
    upiId: "",
  });

  // Fetch firms on load
  useEffect(() => {
    fetchFirms();
  }, []);

  const fetchFirms = async () => {
    const res = await axios.get("https://taskbe.sharda.co.in/firms"); // GET all firms
    setFirms(res.data);
  };

  // Add Firm
  const handleAddFirm = async () => {
    await axios.post("https://taskbe.sharda.co.in/firms", newFirm);
    setShowFirmModal(false);
    setNewFirm({ name: "", address: "" });
    fetchFirms();
  };

  // Add Bank to a firm
  const handleAddBank = async () => {
    await axios.post(`https://taskbe.sharda.co.in/firms/${activeFirmId}/banks`, newBank);
    setShowBankModal(false);
    setNewBank({
      bankName: "",
      accountName: "",
      accountNumber: "",
      ifsc: "",
      upiIdName: "",
      upiMobile: "",
      upiId: "",
    });
    fetchFirms();
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Firm & Bank Details</h1>

      {/* Add Firm Button */}
      <button
        className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded"
        onClick={() => setShowFirmModal(true)}
      >
        + Add Firm
      </button>

      {/* Firms List */}
      {firms.length === 0 && <div>No firms found.</div>}
      {firms.map((firm) => (
        <div key={firm._id} className="mb-6 border rounded p-4 bg-white shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-lg">{firm.name}</div>
              <div className="text-gray-500 text-sm">{firm.address}</div>
            </div>
            <button
              className="px-3 py-1 bg-green-500 text-white rounded"
              onClick={() => {
                setActiveFirmId(firm._id);
                setShowBankModal(true);
              }}
            >
              + Add Bank
            </button>
          </div>
          {/* Banks under this firm */}
          <div className="mt-3">
            {firm.banks && firm.banks.length > 0 ? (
              <table className="w-full text-sm mt-2 border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">Bank Name</th>
                    <th className="border p-2">A/C Name</th>
                    <th className="border p-2">A/C No.</th>
                    <th className="border p-2">IFSC</th>
                    <th className="border p-2">UPI Name</th>
                    <th className="border p-2">UPI Mobile</th>
                    <th className="border p-2">UPI ID</th>
                  </tr>
                </thead>
                <tbody>
                  {firm.banks.map((bank, idx) => (
                    <tr key={idx}>
                      <td className="border p-2">{bank.bankName}</td>
                      <td className="border p-2">{bank.accountName}</td>
                      <td className="border p-2">{bank.accountNumber}</td>
                      <td className="border p-2">{bank.ifsc}</td>
                      <td className="border p-2">{bank.upiIdName}</td>
                      <td className="border p-2">{bank.upiMobile}</td>
                      <td className="border p-2">{bank.upiId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-gray-500 text-xs mt-2">No banks added.</div>
            )}
          </div>
        </div>
      ))}

      {/* Add Firm Modal */}
      {showFirmModal && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <div className="mb-4">
              <label className="font-semibold">Firm Name</label>
              <input
                type="text"
                className="w-full border p-2 rounded mt-1"
                value={newFirm.name}
                onChange={(e) => setNewFirm({ ...newFirm, name: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label>Address</label>
              <input
                type="text"
                className="w-full border p-2 rounded mt-1"
                value={newFirm.address}
                onChange={(e) => setNewFirm({ ...newFirm, address: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 border rounded" onClick={() => setShowFirmModal(false)}>
                Cancel
              </button>
              <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={handleAddFirm}>
                Add Firm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Bank Modal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-[28rem] shadow-xl">
            <div className="mb-4">
              <label className="font-semibold">Bank Name</label>
              <input
                type="text"
                className="w-full border p-2 rounded mt-1"
                value={newBank.bankName}
                onChange={(e) => setNewBank({ ...newBank, bankName: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label>Account Name</label>
              <input
                type="text"
                className="w-full border p-2 rounded mt-1"
                value={newBank.accountName}
                onChange={(e) => setNewBank({ ...newBank, accountName: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label>Account Number</label>
              <input
                type="text"
                className="w-full border p-2 rounded mt-1"
                value={newBank.accountNumber}
                onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label>IFSC Code</label>
              <input
                type="text"
                className="w-full border p-2 rounded mt-1"
                value={newBank.ifsc}
                onChange={(e) => setNewBank({ ...newBank, ifsc: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label>UPI ID Name</label>
              <input
                type="text"
                className="w-full border p-2 rounded mt-1"
                value={newBank.upiIdName}
                onChange={(e) => setNewBank({ ...newBank, upiIdName: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label>UPI Mobile Number</label>
              <input
                type="text"
                className="w-full border p-2 rounded mt-1"
                value={newBank.upiMobile}
                onChange={(e) => setNewBank({ ...newBank, upiMobile: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label>UPI ID</label>
              <input
                type="text"
                className="w-full border p-2 rounded mt-1"
                value={newBank.upiId}
                onChange={(e) => setNewBank({ ...newBank, upiId: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 border rounded" onClick={() => setShowBankModal(false)}>
                Cancel
              </button>
              <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={handleAddBank}>
                Add Bank
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankDetails;
