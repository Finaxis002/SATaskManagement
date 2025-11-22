import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Send,
  User,
  Building2,
  MessageSquare,
  Hash,
  FileText,
  Layers,
  ChevronRight,
  ChevronDown,
  Clock,
  History,
} from "lucide-react";

// Mock data for demo purposes
const mockTask = {
  _id: "task123",
  code: "GST",
  assignedBy: { name: "John Smith" },
  clientName: "ABC Industries Pvt Ltd",
  clientId: "CLI_2024_001",
};

// Document Library
const DOC_LIBRARY = {
  project_report: {
    followup: [
      "Last 12M Bank Statement",
      "Latest ITR (Promoter)",
      "Machinery Quotations",
      "Site Photos",
    ],
    all: [
      "PAN (Promoter/Entity)",
      "Aadhaar (Promoters)",
      "Incorporation / Deed / MOA-AOA",
      "Address Proof (Office/Unit)",
      "Last 12M Bank Statement",
      "Last 3Y Financials (BS/P&L)",
      "Existing Loan Sanctions & Schedules",
      "Net Worth Certificate (Promoter)",
      "Machinery Quotations/Proforma",
      "Land/Building Papers / Rent-Leave",
      "Unit Photos",
    ],
  },
  msme: {
    followup: ["Bank Details (Cancelled Cheque)", "Business Address Proof"],
    all: [
      "Aadhaar (Owner/Authorised)",
      "PAN (Owner/Entity)",
      "Business Address Proof",
      "Bank Details (Cancelled Cheque/Passbook)",
      "Nature of Business (Products/Services)",
      "No. of Employees (if needed)",
    ],
  },
  gst: {
    followup: ["Sales Invoices", "Purchase Invoices (ITC)"],
    all: [
      "PAN (Owner/Entity)",
      "Aadhaar (Owner/Directors)",
      "Photo (Owner/Directors)",
      "Business Address Proof (Ownership/Rent+NOC)",
      "Bank Proof (Cancelled Cheque/Passbook)",
      "MOA/AOA/Deed/COI (if applicable)",
      "DSC (Companies/LLP)",
      "Sales Invoices",
      "Purchase Invoices",
      "Expense Bills",
      "Debit/Credit Notes",
      "E-Way Bills (if any)",
    ],
  },
  itr: {
    followup: ["Form 16 / 26AS", "Bank Statement (FY)"],
    all: [
      "PAN & Aadhaar",
      "Bank Statement / Passbook (FY)",
      "Form 16 (Salaried)",
      "Form 26AS",
      "Investment Proofs (80C etc.)",
      "Home Loan Statement (80C/24B)",
      "Rent Receipts (HRA)",
      "Capital Gains Working (Equity/MF/Property)",
      "Books of Accounts / BS & P&L (Business)",
      "TDS Certificates (16A/16B etc.)",
    ],
  },
};

const CODE_ALIASES = [
  {
    key: "project_report",
    match: ["PR", "PRJ", "PROJECT", "PROJECTREPORT", "DPR", "CMA", "CMAREPORT"],
  },
  { key: "msme", match: ["MSME", "UDYAM", "UDHYAM"] },
  {
    key: "gst",
    match: ["GST", "GSTR", "GSTR1", "GSTR-1", "GSTR3B", "GSTR-3B", "GSTREG"],
  },
  { key: "itr", match: ["ITR", "INCOMETAX", "TAX"] },
];

function resolveServiceKey(codeRaw = "") {
  const norm = (codeRaw || "")
    .toString()
    .toUpperCase()
    .replace(/[\s\-_.]/g, "");
  for (const row of CODE_ALIASES) {
    if (row.match.some((m) => norm.includes(m))) return row.key;
  }
  if (DOC_LIBRARY[norm]) return norm;
  return null;
}

const buildMasterAllDocs = () => {
  const allArrays = Object.values(DOC_LIBRARY).map((svc) => svc.all || []);
  const unique = Array.from(
    new Set(allArrays.flat().map((s) => s.trim()))
  ).filter(Boolean);
  unique.sort((a, b) => a.localeCompare(b));
  return unique;
};

const GENERIC_DOCS = {
  followup: ["PAN", "Aadhaar", "Basic Address Proof", "Latest Bank Statement"],
};

const MessagePopup = ({
  isOpen = true,
  onClose = () => {},
  task = mockTask,
  sendMessage = () => {},
}) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [checklistType, setChecklistType] = useState("followup");
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [clientId, setClientId] = useState("");
  const [isLoadingClientId, setIsLoadingClientId] = useState(false);
  const [documentsExpanded, setDocumentsExpanded] = useState(false);
  
  // Message history states
  const [messageHistory, setMessageHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  const assignedBy = task?.assignedBy?.name || "Unknown";
  const clientName = task?.clientName || task?.client?.name || "No client";
  const taskId = task?._id;

  const loggedInUserName = localStorage.getItem("name") || "Default User";

  const serviceKey = useMemo(() => resolveServiceKey(task?.code), [task?.code]);
  const MASTER_ALL_DOCS = useMemo(() => buildMasterAllDocs(), []);

  const documentOptions = useMemo(() => {
    if (checklistType === "all") {
      return MASTER_ALL_DOCS.map((d) => ({ label: d, value: d }));
    }
    const lib = serviceKey ? DOC_LIBRARY[serviceKey] : null;
    const list = lib?.followup || GENERIC_DOCS.followup || [];
    return list.map((d) => ({ label: d, value: d }));
  }, [checklistType, serviceKey, MASTER_ALL_DOCS]);

  useEffect(() => {
    setSelectedDocs([]);
  }, [serviceKey, checklistType]);

  // Fetch client ID based on client name
  useEffect(() => {
    const fetchClientId = async () => {
      const taskClientId =
        task?.clientId ||
        task?.client?.id ||
        task?.client?._id ||
        task?.client?.clientId;
      if (taskClientId) {
        setClientId(taskClientId);
        return;
      }

      if (clientName && clientName !== "No client" && isOpen) {
        setIsLoadingClientId(true);
        try {
          const token = localStorage.getItem("authToken");
          if (!token) {
            setClientId("No client ID available");
            return;
          }

          const response = await fetch(
            "https://taskbe.sharda.co.in/api/clients",
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "x-app-client": "frontend-authenticated",
              },
            }
          );

          if (response.ok) {
            const clients = await response.json();
            const matchingClient = Array.isArray(clients)
              ? clients.find(
                  (client) =>
                    (client.name || client) === clientName ||
                    (typeof client === "object" && client.name === clientName)
                )
              : null;

            if (matchingClient) {
              const foundClientId =
                matchingClient.id ||
                matchingClient._id ||
                matchingClient.clientId ||
                matchingClient.ID;
              setClientId(foundClientId || "ID not found");
            } else {
              setClientId("Client not found");
            }
          } else {
            setClientId("Unable to fetch ID");
          }
        } catch (error) {
          console.error("Error fetching client ID:", error);
          setClientId("Error fetching ID");
        } finally {
          setIsLoadingClientId(false);
        }
      } else {
        setClientId("No client ID available");
      }
    };

    fetchClientId();
  }, [clientName, task, isOpen]);

  // Fetch message history based on taskId
  useEffect(() => {
    const fetchMessageHistory = async () => {
      if (!taskId || !isOpen) {
        console.log('Skipping fetch - taskId:', taskId, 'isOpen:', isOpen);
        return;
      }

      setIsLoadingHistory(true);
      setHistoryError(null);

      try {
        const token = localStorage.getItem("authToken");
        const url = `http://localhost:1100/api/message-history?taskId=${encodeURIComponent(taskId)}`;
        console.log('Fetching message history from:', url);
        
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-app-client": "frontend-authenticated",
          },
        });

        console.log('Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Received messages:', data);
          // Sort messages by sentAt (newest first)
          const sortedMessages = Array.isArray(data) 
            ? data.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
            : [];
          setMessageHistory(sortedMessages);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error response:', errorData);
          setHistoryError(errorData.message || "Failed to load message history");
        }
      } catch (error) {
        console.error("Error fetching message history:", error);
        setHistoryError("Error loading messages");
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchMessageHistory();
  }, [taskId, isOpen]);

  const handleSendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed && selectedDocs.length === 0) return;

    const docsArray = selectedDocs.map((d) => d.value);
    const docsText = docsArray.length > 0 ? `\n\nDocuments Requested:\n- ${docsArray.join("\n- ")}` : "";

    const payload = {
      taskId: task?._id || null,
      clientName: clientName,
      clientId: clientId,
      message: `${trimmed}${docsText}`,
      documents: docsArray,
      checklistType,
      serviceKey: serviceKey || "generic",
      sentAt: new Date().toISOString(),
      sentBy: loggedInUserName,
    };

    setIsSending(true);
    try {
      await sendMessage(payload);
      setMessage("");
      setSelectedDocs([]);
      
      // Refresh message history after sending
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `https://taskbe.sharda.co.in/api/message-history?taskId=${taskId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-app-client": "frontend-authenticated",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const sortedMessages = Array.isArray(data) 
          ? data.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
          : [];
        setMessageHistory(sortedMessages);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const toggleDocument = (doc) => {
    setSelectedDocs((prev) => {
      const exists = prev.find((d) => d.value === doc.value);
      if (exists) {
        return prev.filter((d) => d.value !== doc.value);
      }
      return [...prev, doc];
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 1 ? "Just now" : `${minutes}m ago`;
      }
      return `${hours}h ago`;
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const limit = 500;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center md:ml-17 justify-center z-50 p-3 lg:p-6 md:mt-14">
      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-2xl relative w-full sm:max-w-2xl lg:max-w-[95vw] xl:max-w-[1400px] max-h-[85vh] lg:max-h-[90vh] overflow-hidden flex flex-col mt-2">
        {/* Fixed Header */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 px-4 sm:px-6 lg:px-8 py-3 relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/10 backdrop-blur-md rounded-xl lg:rounded-2xl border border-white/20">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  Send Client Message
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm mt-0.5 lg:mt-1 hidden sm:block">
                  Professional communication portal
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isSending}
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-200 disabled:opacity-50"
            >
              <X className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Main Content - Three Column Layout */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Left Panel - Client Info & Documents */}
          <div className="w-full lg:w-[30%] border-b lg:border-b-0 lg:border-r border-gray-100 bg-gradient-to-br from-slate-50 to-white overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-6">
              {/* Client Information */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Client Information
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                      <User className="w-4 h-4 text-indigo-500" />
                      Assigned By
                    </label>
                    <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                      <span className="text-gray-800 font-medium">
                        {assignedBy}
                      </span>
                    </div>
                  </div>

                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                      <Building2 className="w-4 h-4 text-purple-500" />
                      Client Name
                    </label>
                    <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                      <span className="text-gray-800 font-medium">
                        {clientName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Selection */}
              <div>
                <button
                  onClick={() => setDocumentsExpanded(!documentsExpanded)}
                  className="flex items-center justify-between w-full lg:pointer-events-none"
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-6">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-purple-600" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Document Request
                    </h3>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 lg:hidden ${
                      documentsExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`${
                    documentsExpanded ? "block" : "hidden"
                  } lg:block space-y-4 lg:space-y-6`}
                >
                  {/* Checklist Type Selector */}
                  <div className="mb-4 lg:mb-6">
                    <div className="flex items-center gap-2 mb-2 lg:mb-3">
                      <Layers className="w-3 h-3 lg:w-4 lg:h-4 text-gray-600" />
                      <span className="text-xs lg:text-sm font-medium text-gray-700">
                        Document Type
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setChecklistType("followup")}
                        className={`p-2 lg:p-3 text-xs lg:text-sm font-medium rounded-lg lg:rounded-xl border transition-all duration-200 ${
                          checklistType === "followup"
                            ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        Follow Up
                      </button>
                      <button
                        onClick={() => setChecklistType("all")}
                        className={`p-2 lg:p-3 text-xs lg:text-sm font-medium rounded-lg lg:rounded-xl border transition-all duration-200 ${
                          checklistType === "all"
                            ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        All Documents
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 lg:mt-2">
                      {checklistType === "all"
                        ? "Showing every document from all services."
                        : serviceKey
                        ? `Detected service: ${serviceKey.replace(/_/g, " ")}`
                        : "Service not detected — using generic follow-up list"}
                    </p>
                  </div>

                  {/* Document List */}
                  <div className="space-y-2 max-h-48 sm:max-h-56 lg:max-h-64 overflow-y-auto">
                    {documentOptions.map((doc, index) => (
                      <div
                        key={index}
                        onClick={() => toggleDocument(doc)}
                        className={`p-2 lg:p-3 rounded-lg border cursor-pointer transition-all duration-200 touch-manipulation ${
                          selectedDocs.find((d) => d.value === doc.value)
                            ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs lg:text-sm font-medium pr-2">
                            {doc.label}
                          </span>
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                              selectedDocs.find((d) => d.value === doc.value)
                                ? "bg-indigo-600 border-indigo-600"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedDocs.find(
                              (d) => d.value === doc.value
                            ) && (
                              <div className="w-2 h-2 bg-white rounded-sm"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedDocs.length > 0 && (
                    <button
                      onClick={() => setSelectedDocs([])}
                      className="text-xs lg:text-sm text-indigo-600 hover:text-indigo-700 hover:underline touch-manipulation mt-3"
                    >
                      Clear all selections ({selectedDocs.length})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Middle Panel - Message Composition */}
          <div className="w-full lg:w-[35%] bg-white border-r border-gray-100 overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-6 h-full flex flex-col">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 lg:mb-6">
                <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-green-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Compose Message
                </h3>
              </div>

              {/* Message Input */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 relative min-h-[200px]">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message here...

You can use Ctrl/Cmd + Enter to send quickly"
                    className="w-full h-full p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 bg-gray-50/50 shadow-sm text-gray-800 placeholder-gray-500"
                    maxLength={limit}
                    disabled={isSending}
                  />
                  <div className="absolute bottom-3 lg:bottom-4 right-3 lg:right-4 flex items-center gap-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-md ${
                        message.length > limit * 0.9
                          ? "text-orange-600 bg-orange-50"
                          : "text-gray-500 bg-white border border-gray-200"
                      }`}
                    >
                      {message.length}/{limit}
                    </span>
                  </div>
                </div>

                {/* Selected Documents Preview */}
                {selectedDocs.length > 0 && (
                  <div className="mt-3 lg:mt-4 p-3 lg:p-4 bg-blue-50 rounded-lg lg:rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600" />
                      <span className="text-xs lg:text-sm font-medium text-blue-800">
                        Requesting {selectedDocs.length} document
                        {selectedDocs.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="text-xs text-blue-600 space-y-1">
                      {selectedDocs.slice(0, 3).map((doc, index) => (
                        <div key={index} className="flex items-center gap-1">
                          <ChevronRight className="w-3 h-3" />
                          <span>{doc.label}</span>
                        </div>
                      ))}
                      {selectedDocs.length > 3 && (
                        <div className="flex items-center gap-1 text-blue-500">
                          <span>... and {selectedDocs.length - 3} more</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6">
                  <div className="text-xs text-gray-500">
                    {message.trim() || selectedDocs.length > 0
                      ? "Ready to send"
                      : "Enter a message or select documents"}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      disabled={isSending}
                      className="px-4 py-2 text-sm font-medium rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={
                        isSending ||
                        (!message.trim() && selectedDocs.length === 0)
                      }
                      className="group px-6 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {isSending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Message History */}
            <div className="w-full lg:w-[35%] bg-gradient-to-br from-gray-50 to-white overflow-y-auto">
              <div className="p-4 sm:p-6 lg:p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <History className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-orange-600" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Message History
                    </h3>
                  </div>
                  {messageHistory.length > 0 && (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                      {messageHistory.length}
                    </span>
                  )}
                </div>

                {/* Message History Content */}
                <div className="flex-1 overflow-y-auto">
                  {isLoadingHistory ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <div className="w-8 h-8 border-3 border-gray-300 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
                      <p className="text-sm">Loading messages...</p>
                    </div>
                  ) : historyError ? (
                    <div className="flex flex-col items-center justify-center h-full text-red-500">
                      <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
                      <p className="text-sm">{historyError}</p>
                    </div>
                  ) : messageHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <MessageSquare className="w-16 h-16 mb-4 opacity-30" />
                      <p className="text-sm font-medium mb-1">No messages yet</p>
                      <p className="text-xs text-center px-4">
                        Send your first message to start the conversation
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messageHistory.map((msg, index) => (
                        <div
                          key={msg._id || index}
                          className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                          {/* Message Header */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                {msg.sentBy?.charAt(0)?.toUpperCase() || "?"}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {msg.sentBy || "Unknown"}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatDate(msg.sentAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Message Content */}
                          <div className="mt-3">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                              {msg.message}
                            </p>
                          </div>

                          {/* Document Indicators */}
                          {msg.documents && msg.documents.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-3 h-3 text-indigo-600" />
                                <span className="text-xs font-medium text-indigo-600">
                                  {msg.documents.length} document{msg.documents.length !== 1 ? "s" : ""} requested
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {msg.documents.slice(0, 3).map((doc, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md"
                                  >
                                    {doc}
                                  </span>
                                ))}
                                {msg.documents.length > 3 && (
                                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                                    +{msg.documents.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MessagePopup;