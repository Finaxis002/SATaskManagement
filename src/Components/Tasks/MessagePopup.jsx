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
  Info,
  Edit3,
} from "lucide-react";

// Mock data for demo purposes
const mockTask = {
  _id: "task123",
  code: "GST",
  assignedBy: { name: "CA Anunay Sharda" }, // Changed for testing
  clientName: "ABC Industries PvLtd",
  clientId: "CLI_2024_001",
};

// --- CONFIGURATION: Phone Numbers Mapping ---
const ASSIGNED_NUMBERS = {
  "CA Shraddha Atal": "917000148090",
  "CA Anunay Sharda": "917987021896",
  "CA Anugrah Sharda": "917999858202",
};

// Default number agar assignedBy name list me na mile to
const DEFAULT_WHATSAPP_NUMBER = "917999858202";

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

  // NEW STATE: For controlling the "Show More" in the preview box
  const [showAllSelectedDocs, setShowAllSelectedDocs] = useState(false);

  // Mobile Tab State
  const [activeTab, setActiveTab] = useState("compose");

  // Template Selection States
  const [templates, setTemplates] = useState([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);

  // Message history states
  const [messageHistory, setMessageHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  // Task details state
  const [taskDetails, setTaskDetails] = useState(null);
  const [isLoadingTask, setIsLoadingTask] = useState(false);

  const taskId = task?._id;
  const loggedInUserName = localStorage.getItem("name") || "Default User";

  // NEW FUNCTION: Remove document from preview list
  const handleRemoveDoc = (docValueToRemove) => {
    setSelectedDocs((prev) => prev.filter((d) => d.value !== docValueToRemove));
  };

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!isOpen) return;

      setIsLoadingTemplates(true);
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("https://taskbe.sharda.co.in/api/message-templates", {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-app-client": "frontend-authenticated",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, [isOpen]);

  // Fetch complete task details
  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!taskId || !isOpen) return;

      setIsLoadingTask(true);
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `https://taskbe.sharda.co.in/api/tasks/${taskId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "x-app-client": "frontend-authenticated",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setTaskDetails(data);
        } else {
          console.error("Failed to fetch task details");
          setTaskDetails(task);
        }
      } catch (error) {
        console.error("Error fetching task details:", error);
        setTaskDetails(task);
      } finally {
        setIsLoadingTask(false);
      }
    };

    fetchTaskDetails();
  }, [taskId, isOpen, task]);

  // Extract data from taskDetails with multiple fallbacks
  const currentTask = taskDetails || task;

  const assignedBy = useMemo(() => {
    return (
      currentTask?.assignedBy?.name || currentTask?.assignedBy || "Unknown"
    );
  }, [currentTask]);

  const clientName = useMemo(() => {
    const name =
      currentTask?.clientName ||
      currentTask?.client?.name ||
      currentTask?.client?.clientName ||
      currentTask?.client ||
      currentTask?.name ||
      "No client";

    return typeof name === "string" ? name : "No client";
  }, [currentTask]);

  const serviceKey = useMemo(
    () => resolveServiceKey(currentTask?.code),
    [currentTask?.code]
  );
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
    setShowAllSelectedDocs(false); // Reset expansion on type change
  }, [serviceKey, checklistType]);

  // Fetch client ID based on client name
  useEffect(() => {
    const fetchClientId = async () => {
      const taskClientId =
        currentTask?.clientId ||
        currentTask?.client?.id ||
        currentTask?.client?._id ||
        currentTask?.client?.clientId;

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

          const response = await fetch("https://taskbe.sharda.co.in/api/clients", {
            headers: {
              Authorization: `Bearer ${token}`,
              "x-app-client": "frontend-authenticated",
            },
          });

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
  }, [clientName, currentTask, isOpen]);

  // Updated History Fetching
  useEffect(() => {
    const fetchMessageHistory = async () => {
      if (!taskId || !isOpen) {
        return;
      }

      const isClientIdValid =
        clientId &&
        !clientId.toString().includes("not found") &&
        !clientId.toString().includes("available") &&
        !clientId.toString().includes("Error") &&
        !clientId.toString().includes("Loading");

      if (!isClientIdValid) {
        return;
      }

      setIsLoadingHistory(true);
      setHistoryError(null);

      try {
        const token = localStorage.getItem("authToken");

        let url = `https://taskbe.sharda.co.in/api/message-history?taskId=${encodeURIComponent(
          taskId
        )}`;
        url += `&clientId=${encodeURIComponent(clientId)}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-app-client": "frontend-authenticated",
          },
        });

        if (response.ok) {
          const data = await response.json();
          const sortedMessages = Array.isArray(data)
            ? data.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
            : [];
          setMessageHistory(sortedMessages);
        } else {
          const errorData = await response.json().catch(() => ({}));
          setHistoryError(
            errorData.message || "Failed to load message history"
          );
        }
      } catch (error) {
        console.error("Error fetching message history:", error);
        setHistoryError("Error loading messages");
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchMessageHistory();
  }, [taskId, isOpen, clientId]);

  // Handle Send Message
  const handleSendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed && selectedDocs.length === 0) return;

    const docsArray = selectedDocs.map((d) => d.value);

    // --- DYNAMIC NUMBER LOGIC STARTS HERE ---
    const assigneeName = assignedBy ? assignedBy.trim() : "";
    const whatsappNumber = ASSIGNED_NUMBERS[assigneeName] || DEFAULT_WHATSAPP_NUMBER;
    // --- DYNAMIC NUMBER LOGIC ENDS HERE ---

    const baseUrl = `https://wa.me/${whatsappNumber}?text=`;

    let fullMessage = `*Client:* ${clientName}\n\n`;
    if (trimmed) fullMessage += `*Message:*\n${trimmed}\n\n`;

    let docsSection = "";
    if (docsArray.length > 0) {
      docsSection = `*Documents Requested:*\n${docsArray
        .map((doc) => `• ${doc}`)
        .join("\n")}`;
    }

    const maxUrlLength = 2000;
    let finalWhatsappText = fullMessage + docsSection;
    let encodedMessage = encodeURIComponent(finalWhatsappText);

    if (baseUrl.length + encodedMessage.length > maxUrlLength) {
      const limitDocs = 10;
      const visibleDocs = docsArray.slice(0, limitDocs);
      const remainingCount = docsArray.length - limitDocs;

      const shortDocSection = `*Documents Requested:*\n${visibleDocs
        .map((doc) => `• ${doc}`)
        .join(
          "\n"
        )}\n\n_...and ${remainingCount} more documents (See portal/email)_`;

      finalWhatsappText = fullMessage + shortDocSection;
      encodedMessage = encodeURIComponent(finalWhatsappText);
    }

    const whatsappURL = `${baseUrl}${encodedMessage}`;

    const payload = {
      taskId: taskId || null,
      clientName: clientName,
      clientId: clientId,
      message: `${trimmed}${
        docsArray.length > 0
          ? `\n\nDocuments Requested:\n- ${docsArray.join("\n- ")}`
          : ""
      }`,
      documents: docsArray,
      checklistType,
      serviceKey: serviceKey || "generic",
      sentAt: new Date().toISOString(),
      sentBy: loggedInUserName,
    };

    setIsSending(true);
    setHistoryError(null);

    try {
      await sendMessage(payload);
      window.open(whatsappURL, "_blank");

      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        sentBy: loggedInUserName,
        sentAt: new Date().toISOString(),
        message: trimmed,
        documents: docsArray,
        taskId: taskId,
      };

      setMessageHistory((prev) => [optimisticMessage, ...prev]);
      setMessage("");
      setSelectedDocs([]);
      setSelectedTemplate(null);

      const token = localStorage.getItem("authToken");

      const isClientIdValid =
        clientId &&
        !clientId.toString().includes("not found") &&
        !clientId.toString().includes("available");

      if (isClientIdValid) {
        let refreshUrl = `https://taskbe.sharda.co.in/api/message-history?taskId=${encodeURIComponent(
          taskId
        )}`;
        refreshUrl += `&clientId=${encodeURIComponent(clientId)}`;

        const response = await fetch(refreshUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-app-client": "frontend-authenticated",
          },
        });
        if (response.ok) {
          const data = await response.json();
          const sortedMessages = Array.isArray(data)
            ? data.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
            : [];
          setMessageHistory(sortedMessages);
        }
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

  const applyTemplate = (template) => {
    setMessage(template.message);
    if (template.documents && template.documents.length > 0) {
      const templateDocs = template.documents.map((doc) => ({
        label: doc,
        value: doc,
      }));
      setSelectedDocs(templateDocs);
    }
    setSelectedTemplate(template._id);
    setShowTemplates(false);
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
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const limit = 500;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-0 sm:p-3 lg:p-6 lg:mt-16">
      <div className="bg-white rounded-none sm:rounded-2xl lg:rounded-3xl shadow-2xl relative w-full h-full sm:h-auto sm:max-w-2xl lg:max-w-[95vw] xl:max-w-[1400px] sm:max-h-[85vh] lg:max-h-[90vh] overflow-hidden flex flex-col mt-28 sm:mt-0">
        {/* Fixed Header */}
        <div className="bg-gradient-to-r from-green-900 via-green-700 to-green-900 px-3 sm:px-6 lg:px-8 py-3 sm:py-3 relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-green-500/20"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <div className="flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl lg:rounded-2xl border border-white/20">
                <MessageSquare className="w-4 h-4 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-white">
                  Send WhatsApp Message
                </h2>
                 {/* Displaying to whom the message will go (Optional UI enhancement) */}
                <span className="text-xs text-green-200">via: {assignedBy}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isSending}
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-200 disabled:opacity-50"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 lg:w-5 lg:h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Mobile Tabs - Only visible on mobile */}
        <div className="lg:hidden bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium text-sm transition-all duration-200 ${
                activeTab === "info"
                  ? "text-green-600 border-b-2 border-green-600 bg-green-50/50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Info className="w-4 h-4" />
              <span>Info</span>
            </button>
            <button
              onClick={() => setActiveTab("compose")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium text-sm transition-all duration-200 ${
                activeTab === "compose"
                  ? "text-green-600 border-b-2 border-green-600 bg-green-50/50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Compose</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium text-sm transition-all duration-200 relative ${
                activeTab === "history"
                  ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50/50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <History className="w-4 h-4" />
              <span>History</span>
              {messageHistory.length > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                  {messageHistory.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Info Panel */}
          <div
            className={`${
              activeTab === "info" ? "block" : "hidden"
            } lg:block w-full lg:w-[30%] border-b lg:border-b-0 lg:border-r border-gray-100 bg-gradient-to-br from-slate-50 to-white overflow-y-auto`}
          >
            <div className="p-3 sm:p-6 lg:p-6">
              {/* Client Information */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    Client Information
                  </h3>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="group">
                    <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
                      Assigned By
                    </label>
                    <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-2.5 sm:p-3 shadow-sm">
                      <span className="text-sm sm:text-base text-gray-800 font-medium">
                        {isLoadingTask ? "Loading..." : assignedBy}
                      </span>
                    </div>
                  </div>

                  <div className="group">
                    <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">
                      <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
                      Client Name
                    </label>
                    <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-2.5 sm:p-3 shadow-sm">
                      <span className="text-sm sm:text-base text-gray-800 font-medium">
                        {isLoadingTask ? "Loading..." : clientName}
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
                    <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-green-600" />
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
                            ? "bg-green-50 border-green-200 text-green-700 shadow-sm"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        Follow Up
                      </button>
                      <button
                        onClick={() => setChecklistType("all")}
                        className={`p-2 lg:p-3 text-xs lg:text-sm font-medium rounded-lg lg:rounded-xl border transition-all duration-200 ${
                          checklistType === "all"
                            ? "bg-green-50 border-green-200 text-green-700 shadow-sm"
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
                  <div className="space-y-1.5 sm:space-y-2 max-h-48 sm:max-h-56 lg:max-h-64 overflow-y-auto">
                    {documentOptions.map((doc, index) => (
                      <div
                        key={index}
                        onClick={() => toggleDocument(doc)}
                        className={`p-2.5 sm:p-3 rounded-lg border cursor-pointer transition-all duration-200 touch-manipulation ${
                          selectedDocs.find((d) => d.value === doc.value)
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium pr-2">
                            {doc.label}
                          </span>
                          <div
                            className={`w-4 h-4 sm:w-4 sm:h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                              selectedDocs.find((d) => d.value === doc.value)
                                ? "bg-green-600 border-green-600"
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
                      className="text-xs lg:text-sm text-green-600 hover:text-green-700 hover:underline touch-manipulation mt-3"
                    >
                      Clear all selections ({selectedDocs.length})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

        {/* Compose Panel */}
          <div
            className={`${
              activeTab === "compose" ? "flex" : "hidden"
            } lg:flex w-full lg:w-[35%] bg-white border-r border-gray-100 flex-col overflow-hidden`}
          >
            <div className="p-3 sm:p-6 lg:p-6 flex-1 flex flex-col min-h-0 overflow-y-auto">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-6">
                <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-green-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Compose Message
                </h3>
              </div>

              {/* Template Selector */}
              <div className="mb-4 flex-shrink-0">
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 mb-3"
                >
                  <FileText className="w-4 h-4" />
                  <span>Use Template ({templates.length})</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      showTemplates ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showTemplates && (
                  <div className="space-y-2 max-h-40 sm:max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-xl border border-gray-200">
                    {isLoadingTemplates ? (
                      <div className="text-center py-4 text-sm text-gray-500">
                        Loading templates...
                      </div>
                    ) : templates.length === 0 ? (
                      <div className="text-center py-4 text-sm text-gray-500">
                        No templates available
                      </div>
                    ) : (
                      templates.map((template) => (
                        <div
                          key={template._id}
                          onClick={() => applyTemplate(template)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                            selectedTemplate === template._id
                              ? "bg-green-50 border-green-300"
                              : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                {template.name}
                              </h4>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {template.message}
                              </p>
                              {template.documents && template.documents.length > 0 && (
                                <div className="flex items-center gap-1 mt-2">
                                  <FileText className="w-3 h-3 text-green-600" />
                                  <span className="text-xs text-green-600">
                                    {template.documents.length} docs
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
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
                    className="w-full h-full p-3 sm:p-4 text-sm sm:text-base border border-gray-200 rounded-lg sm:rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-300 bg-gray-50/50 shadow-sm text-gray-800 placeholder-gray-500"
                    maxLength={limit}
                    disabled={isSending}
                  />
                  <div className="absolute bottom-2 sm:bottom-3 lg:bottom-4 right-2 sm:right-3 lg:right-4 flex items-center gap-2">
                    <span
                      className={`text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md ${
                        message.length > limit * 0.9
                          ? "text-orange-600 bg-orange-50"
                          : "text-gray-500 bg-white border border-gray-200"
                      }`}
                    >
                      {message.length}/{limit}
                    </span>
                  </div>
                </div>

                {/* Selected Documents Preview - UPDATED WITH SHOW MORE & REMOVE */}
                {selectedDocs.length > 0 && (
                  <div className="mt-3 lg:mt-4 p-3 lg:p-4 bg-green-50 rounded-lg lg:rounded-xl border border-green-100 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-3 h-3 lg:w-4 lg:h-4 text-green-600" />
                      <span className="text-xs lg:text-sm font-medium text-green-800">
                        Requesting {selectedDocs.length} document
                        {selectedDocs.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="text-xs text-green-600 space-y-1">
                      {/* Toggle Logic: Display all if expanded, otherwise first 3 */}
                      {(showAllSelectedDocs ? selectedDocs : selectedDocs.slice(0, 3)).map((doc, index) => (
                        <div key={index} className="flex items-center justify-between group">
                          <div className="flex items-center gap-1">
                            <ChevronRight className="w-3 h-3 flex-shrink-0" />
                            <span>{doc.label}</span>
                          </div>
                          
                          {/* Remove Button */}
                          <button 
                            onClick={() => handleRemoveDoc(doc.value)} 
                            className="p-1 hover:bg-green-200 rounded cursor-pointer text-green-700"
                            title="Remove document"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {/* Show More / Show Less Button */}
                      {selectedDocs.length > 3 && (
                        <div 
                          onClick={() => setShowAllSelectedDocs(!showAllSelectedDocs)}
                          className="flex items-center gap-1 text-green-500 cursor-pointer hover:text-green-700 mt-2 select-none font-medium"
                        >
                          <span>
                            {showAllSelectedDocs 
                              ? "Show less" 
                              : `... and ${selectedDocs.length - 3} more`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center pt-4 sm:pt-6 gap-3 sm:gap-0 flex-shrink-0">
                  <div className="text-xs text-gray-500 text-center sm:text-left">
                    {message.trim() || selectedDocs.length > 0
                      ? "Ready to send"
                      : "Enter a message or select documents"}
                  </div>

                  <div className="flex gap-2 sm:gap-3">
                    <button
                      onClick={onClose}
                      disabled={isSending}
                      className="flex-1 sm:flex-none px-4 py-2 sm:py-2 text-sm font-medium rounded-lg sm:rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={
                        isSending ||
                        (!message.trim() && selectedDocs.length === 0)
                      }
                      className="flex-1 sm:flex-none group px-4 sm:px-6 py-2 sm:py-2 text-sm font-medium rounded-lg sm:rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
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

          {/* History Panel */}
          <div
            className={`${
              activeTab === "history" ? "block" : "hidden"
            } lg:block w-full lg:w-[35%] bg-gradient-to-br from-gray-50 to-white overflow-y-auto`}
          >
            <div className="p-3 sm:p-6 lg:p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
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
                    <div className="w-7 h-7 sm:w-8 sm:h-8 border-3 border-gray-300 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
                    <p className="text-xs sm:text-sm">Loading messages...</p>
                  </div>
                ) : messageHistory.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {messageHistory.map((msg, index) => (
                      <div
                        key={msg._id || index}
                        className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        {/* Message Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                              {msg.sentBy?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-semibold text-gray-900">
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
                        <div className="mt-2 sm:mt-3">
                          <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap break-words">
                            {msg.message}
                          </p>
                        </div>

                        {/* Document Indicators */}
                        {msg.documents && msg.documents.length > 0 && (
                          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                              <FileText className="w-3 h-3 text-indigo-600" />
                              <span className="text-xs font-medium text-indigo-600">
                                {msg.documents.length} document
                                {msg.documents.length !== 1 ? "s" : ""} requested
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {msg.documents.slice(0, 3).map((doc, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-indigo-50 text-indigo-700 rounded-md"
                                >
                                  {doc}
                                </span>
                              ))}
                              {msg.documents.length > 3 && (
                                <span className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-600 rounded-md">
                                  +{msg.documents.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : historyError ? (
                  <div className="flex flex-col items-center justify-center h-full text-red-500">
                    <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 mb-3 opacity-50" />
                    <p className="text-xs sm:text-sm px-4 text-center">
                      {historyError}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 opacity-30" />
                    <p className="text-xs sm:text-sm font-medium mb-1">
                      No messages yet
                    </p>
                    <p className="text-xs text-center px-4">
                      Send your first message to start the conversation
                    </p>
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