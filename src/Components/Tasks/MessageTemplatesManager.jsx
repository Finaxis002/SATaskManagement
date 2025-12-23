import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Edit3,
  Trash2,
  Save,
  FileText,
  MessageSquare,
  Copy,
  Check,
  Search,
  ChevronDown,
  Calendar,
  Upload,
  Download,
  Eye,
  Filter,
  MoreVertical,
  Tag,
  Clock,
  Paperclip,
} from "lucide-react";

const DOCS = [
  "PAN",
  "Aadhaar",
  "Bank Statement",
  "Sales Invoices",
  "Purchase Invoices",
  "Form 16",
  "GST Returns",
  "ITR",
  "Address Proof",
  "Cancelled Cheque",
];

const API_URL = "https://taskbe.sharda.co.in/api/message-templates";

export default function MessageTemplatesManager() {
  const [temps, setTemps] = useState([]);
  const [filteredTemps, setFilteredTemps] = useState([]);
  const [making, setMaking] = useState(false);
  const [editId, setEditId] = useState(null);
  const [copied, setCopied] = useState(null);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [docs, setDocs] = useState([]);
  const [showDocs, setShowDocs] = useState(false);
  const [customDoc, setCustomDoc] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewTemplate, setViewTemplate] = useState(null);
  const [filterDocs, setFilterDocs] = useState(false);
  const [toast, setToast] = useState(null);

  const getToken = () => localStorage.getItem("authToken");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    let filtered = temps;
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterDocs) {
      filtered = filtered.filter(t => t.documents && t.documents.length > 0);
    }
    
    setFilteredTemps(filtered);
  }, [searchQuery, temps, filterDocs]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      setTemps(data);
    } catch (error) {
      console.error("Error fetching templates:", error);
      showToast("Failed to load templates", "error");
    } finally {
      setLoading(false);
    }
  };

  const addCustomDoc = () => {
    if (customDoc.trim() && !docs.includes(customDoc.trim())) {
      setDocs(prev => [...prev, customDoc.trim()]);
      setCustomDoc("");
    }
  };

  const removeDoc = (docToRemove) => {
    setDocs(prev => prev.filter(d => d !== docToRemove));
  };

  const create = async () => {
    if (!name.trim() || !msg.trim()) {
      showToast("Please fill in template name and message", "error");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          message: msg.trim(),
          documents: docs,
        }),
      });
      const data = await response.json();
      setTemps([data, ...temps]);
      reset();
      showToast("Template created successfully!", "success");
    } catch (error) {
      console.error("Error creating template:", error);
      showToast("Failed to create template", "error");
    }
  };

  const edit = (t) => {
    setEditId(t._id);
    setName(t.name);
    setMsg(t.message);
    setDocs(t.documents || []);
    setMaking(true);
  };

  const update = async () => {
    if (!name.trim() || !msg.trim()) {
      showToast("Please fill in template name and message", "error");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          message: msg.trim(),
          documents: docs,
        }),
      });
      const data = await response.json();
      setTemps(temps.map((t) => (t._id === editId ? data : t)));
      reset();
      showToast("Template updated successfully!", "success");
    } catch (error) {
      console.error("Error updating template:", error);
      showToast("Failed to update template", "error");
    }
  };

  const del = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?"))
      return;

    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setTemps(temps.filter((t) => t._id !== id));
      showToast("Template deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting template:", error);
      showToast("Failed to delete template", "error");
    }
  };

  const toggle = (d) =>
    setDocs((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));

  const copy = async (t) => {
    try {
      const response = await fetch(`${API_URL}/${t._id}/duplicate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      setTemps([data, ...temps]);
      setCopied(t._id);
      setTimeout(() => setCopied(null), 2000);
      showToast("Template duplicated successfully!", "success");
    } catch (error) {
      console.error("Error copying template:", error);
      showToast("Failed to duplicate template", "error");
    }
  };

  const reset = () => {
    setName("");
    setMsg("");
    setDocs([]);
    setCustomDoc("");
    setMaking(false);
    setEditId(null);
    setShowDocs(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex justify-center items-center px-4">
        <div className="text-center">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6">
            <div className="absolute inset-0 border-4 border-indigo-200 rounded-full animate-ping opacity-75"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-700 font-semibold text-base sm:text-lg">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Premium Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="py-3 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur opacity-25"></div>
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Message Templates
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  {temps.length} templates
                </p>
              </div>
            </div>
            <button
              onClick={() => setMaking(true)}
              className="w-full sm:w-auto group relative px-4 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
              <span>New Template</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Search & Filter Bar */}
        {temps.length > 0 && (
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all text-sm"
              />
            </div>
            <button
              onClick={() => setFilterDocs(!filterDocs)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all shadow-sm text-sm ${
                filterDocs
                  ? "bg-indigo-600 text-white shadow-indigo-500/30"
                  : "bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-300"
              }`}
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">With Documents</span>
              <span className="sm:hidden">Docs</span>
            </button>
          </div>
        )}

        {/* Stats Cards */}
        {temps.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 font-medium truncate">Total</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">{temps.length}</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 font-medium truncate">Docs</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">
                    {temps.filter(t => t.documents && t.documents.length > 0).length}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 font-medium truncate">Month</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">
                    {temps.filter(t => {
                      const created = new Date(t.createdAt);
                      const now = new Date();
                      return created.getMonth() === now.getMonth() && 
                             created.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filteredTemps.length === 0 ? (
            <div className="col-span-full">
              <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 shadow-sm p-8 sm:p-12 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  {searchQuery || filterDocs ? "No Results Found" : "No Templates Yet"}
                </h3>
                <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                  {searchQuery || filterDocs
                    ? "Try adjusting your search or filter"
                    : "Create your first message template"}
                </p>
                {!searchQuery && !filterDocs && (
                  <button
                    onClick={() => setMaking(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all duration-200 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Template</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredTemps.map((t) => (
              <div
                key={t._id}
                className="group bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all duration-300"
              >
                <div className="p-4 sm:p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 sm:mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {t.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>
                          {new Date(t.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <button
                        onClick={() => setViewTemplate(t)}
                        className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => copy(t)}
                        className="p-1.5 sm:p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Duplicate"
                      >
                        {copied === t._id ? (
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => edit(t)}
                        className="p-1.5 sm:p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => del(t._id)}
                        className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Message Preview */}
                  <div className="mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gradient-to-br from-gray-50 to-indigo-50/30 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-200 line-clamp-3">
                      {t.message}
                    </p>
                  </div>

                  {/* Documents */}
                  {t.documents && t.documents.length > 0 && (
                    <div className="pt-3 sm:pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-gray-900">
                          Documents
                        </span>
                        <span className="ml-auto text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-semibold">
                          {t.documents.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {t.documents.slice(0, 3).map((d, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center text-xs px-2 sm:px-2.5 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-md sm:rounded-lg border border-indigo-200 font-medium"
                          >
                            {d}
                          </span>
                        ))}
                        {t.documents.length > 3 && (
                          <span className="inline-flex items-center text-xs px-2 sm:px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md sm:rounded-lg font-medium">
                            +{t.documents.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {making && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    {editId ? "Edit Template" : "Create Template"}
                  </h2>
                  <p className="text-xs text-white/80 mt-0.5 hidden sm:block">
                    Fill in the details below
                  </p>
                </div>
              </div>
              <button
                onClick={reset}
                className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-160px)]">
              {/* Template Name */}
              <div>
                <label className="flex text-sm font-bold text-gray-900 mb-2 items-center gap-2">
                  <Tag className="w-4 h-4 text-indigo-600" />
                  Template Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., GST Filing Reminder"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  maxLength={50}
                />
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1.5">
                  <span className="hidden sm:inline">Give your template a name</span>
                  <span className={name.length >= 45 ? "text-orange-600 font-semibold" : ""}>
                    {name.length}/50
                  </span>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <label className="flex text-sm font-bold text-gray-900 mb-2 items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  Message Content
                </label>
                <textarea
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Write your message template here..."
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all text-sm font-mono"
                  rows={8}
                  maxLength={500}
                />
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1.5">
                  <span className="hidden sm:inline">Write your message</span>
                  <span className={msg.length >= 450 ? "text-orange-600 font-semibold" : ""}>
                    {msg.length}/500
                  </span>
                </div>
              </div>

              {/* Required Documents */}
              <div>
                <button
                  onClick={() => setShowDocs(!showDocs)}
                  className="flex items-center justify-between w-full px-4 py-3 sm:py-3.5 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border-2 border-indigo-200 rounded-lg sm:rounded-xl transition-all"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-bold text-gray-900 block">
                        Documents
                      </span>
                      <span className="text-xs text-gray-600">
                        {docs.length === 0 ? "None selected" : `${docs.length} selected`}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
                      showDocs ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showDocs && (
                  <div className="mt-3 sm:mt-4 p-4 sm:p-5 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-lg sm:rounded-xl border-2 border-gray-200 space-y-3 sm:space-y-4">
                    {/* Add Custom Document */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customDoc}
                        onChange={(e) => setCustomDoc(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addCustomDoc()}
                        placeholder="Add custom document"
                        className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      />
                      <button
                        onClick={addCustomDoc}
                        className="px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 font-medium text-sm flex-shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Add</span>
                      </button>
                    </div>

                    {/* Selected Documents */}
                    {docs.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Selected</p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {docs.map((d, i) => (
                            <div
                              key={i}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg font-medium text-xs"
                            >
                              <span>{d}</span>
                              <button
                                onClick={() => removeDoc(d)}
                                className="p-0.5 hover:bg-white/20 rounded transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Predefined Documents */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Quick Add</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 max-h-48 sm:max-h-64 overflow-y-auto">
                        {DOCS.map((d, i) => (
                          <button
                            key={i}
                            onClick={() => toggle(d)}
                            disabled={docs.includes(d)}
                            className={`p-2.5 sm:p-3 rounded-lg border-2 transition-all text-left ${
                              docs.includes(d)
                                ? "bg-gray-200 border-gray-300 cursor-not-allowed opacity-60"
                                : "bg-white border-gray-300 hover:border-indigo-400 hover:shadow-md active:scale-95"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <span
                                className={`text-xs sm:text-sm font-semibold truncate ${
                                  docs.includes(d)
                                    ? "text-gray-500"
                                    : "text-gray-900"
                                }`}
                              >
                                {d}
                              </span>
                              <div
                                className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                  docs.includes(d)
                                    ? "bg-indigo-600 border-indigo-600"
                                    : "border-gray-400 bg-white"
                                }`}
                              >
                                {docs.includes(d) && (
                                  <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" strokeWidth={3} />
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t-2 border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex gap-2 sm:gap-3 justify-end">
              <button
                onClick={reset}
                className="px-4 sm:px-6 py-2 sm:py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-100 font-semibold transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={editId ? update : create}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg flex items-center gap-1.5 sm:gap-2 font-semibold transition-all duration-200 text-sm"
              >
                <Save className="w-4 h-4" />
                <span>{editId ? "Update" : "Create"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Template Modal */}
      {viewTemplate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
            {/* View Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg font-bold text-white truncate">
                    Preview
                  </h2>
                  <p className="text-xs text-white/80 mt-0.5 truncate">
                    {viewTemplate.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewTemplate(null)}
                className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* View Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-160px)]">
              {/* Template Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 sm:mb-2 uppercase tracking-wide">
                  Template Name
                </label>
                <p className="text-base sm:text-lg font-bold text-gray-900 bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 border-gray-200">
                  {viewTemplate.name}
                </p>
              </div>

              {/* Message Content */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 sm:mb-2 uppercase tracking-wide">
                  Message
                </label>
                <div className="bg-gradient-to-br from-gray-50 to-indigo-50 px-4 sm:px-5 py-3 sm:py-4 rounded-lg sm:rounded-xl border-2 border-gray-200">
                  <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap font-mono">
                    {viewTemplate.message}
                  </p>
                </div>
              </div>

              {/* Required Documents */}
              {viewTemplate.documents && viewTemplate.documents.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 sm:mb-3 uppercase tracking-wide">
                    Documents ({viewTemplate.documents.length})
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                    {viewTemplate.documents.map((d, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg sm:rounded-xl border-2 border-indigo-200"
                      >
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-indigo-900 truncate">
                          {d}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="pt-3 sm:pt-4 border-t-2 border-gray-200">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                      Created
                    </label>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-900">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
                      <span className="truncate">
                        {new Date(viewTemplate.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                      Updated
                    </label>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-900">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                      <span className="truncate">
                        {viewTemplate.updatedAt
                          ? new Date(viewTemplate.updatedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "Never"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* View Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t-2 border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex gap-2 sm:gap-3 justify-end">
              <button
                onClick={() => {
                  setViewTemplate(null);
                  edit(viewTemplate);
                }}
                className="px-4 sm:px-5 py-2 sm:py-2.5 border-2 border-indigo-300 text-indigo-700 rounded-lg sm:rounded-xl hover:bg-indigo-50 font-semibold transition-all flex items-center gap-1.5 text-sm"
              >
                <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={() => setViewTemplate(null)}
                className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg font-semibold transition-all duration-200 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Beautiful Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-bottom-5 duration-300 px-4 w-full max-w-md">
          <div
            className={`flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl shadow-2xl backdrop-blur-sm border ${
              toast.type === "success"
                ? "bg-white border-green-200 text-gray-800"
                : toast.type === "error"
                ? "bg-white border-red-200 text-gray-800"
                : "bg-white border-blue-200 text-gray-800"
            }`}
          >
            <div className="flex-shrink-0">
              {toast.type === "success" ? (
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" strokeWidth={3} />
                </div>
              ) : toast.type === "error" ? (
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <X className="w-5 h-5 text-white" strokeWidth={3} />
                </div>
              ) : (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-medium">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}