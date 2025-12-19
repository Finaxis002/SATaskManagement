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
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const getToken = () => localStorage.getItem("authToken");

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredTemps(
        temps.filter(
          (t) =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.message.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredTemps(temps);
    }
  }, [searchQuery, temps]);

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
      alert("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const create = async () => {
    if (!name.trim() || !msg.trim()) {
      alert("Please fill in template name and message");
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
      alert("Template created successfully!");
    } catch (error) {
      console.error("Error creating template:", error);
      alert("Failed to create template");
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
      alert("Please fill in template name and message");
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
      alert("Template updated successfully!");
    } catch (error) {
      console.error("Error updating template:", error);
      alert("Failed to update template");
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
      alert("Template deleted successfully!");
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("Failed to delete template");
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
    } catch (error) {
      console.error("Error copying template:", error);
      alert("Failed to copy template");
    }
  };

  const reset = () => {
    setName("");
    setMsg("");
    setDocs([]);
    setMaking(false);
    setEditId(null);
    setShowDocs(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Elegant Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl blur opacity-40"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Message Templates
                </h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  {temps.length} templates • Manage communication
                </p>
              </div>
            </div>
            <button
              onClick={() => setMaking(true)}
              className="group relative px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              <span>New Template</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search */}
        {temps.length > 0 && (
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 shadow-sm transition-all"
              />
            </div>
          </div>
        )}

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTemps.length === 0 ? (
            <div className="col-span-full">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-xl p-16 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchQuery ? "No Results Found" : "No Templates Yet"}
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {searchQuery
                    ? "Try adjusting your search query"
                    : "Create your first message template to streamline your communication"}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setMaking(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create Template</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredTemps.map((t) => (
              <div
                key={t._id}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {t.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {new Date(t.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => copy(t)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Duplicate"
                      >
                        {copied === t._id ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => edit(t)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => del(t._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 rounded-xl border border-gray-100 max-h-32 overflow-y-auto">
                      {t.message}
                    </p>
                  </div>

                  {t.documents && t.documents.length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-700">
                          Required Documents
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                          {t.documents.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {t.documents.map((d, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center text-xs px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg border border-blue-200/50 font-medium"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Premium Modal */}
      {making && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  {editId ? "Edit Template" : "Create New Template"}
                </h2>
              </div>
              <button
                onClick={reset}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., GST Filing Reminder"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  maxLength={50}
                />
                <div className="text-right text-xs text-gray-500 mt-1.5">
                  {name.length}/50 characters
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message Content
                </label>
                <textarea
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Write your message template here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none transition-all"
                  rows={8}
                  maxLength={500}
                />
                <div className="text-right text-xs text-gray-500 mt-1.5">
                  {msg.length}/500 characters
                </div>
              </div>

              <div>
                <button
                  onClick={() => setShowDocs(!showDocs)}
                  className="flex items-center justify-between w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 hover:from-gray-100 hover:to-blue-100 border border-gray-200 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700">
                      Required Documents
                    </span>
                    <span className="text-xs px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                      {docs.length} selected
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      showDocs ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showDocs && (
                  <div className="mt-3 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                      {DOCS.map((d, i) => (
                        <button
                          key={i}
                          onClick={() => toggle(d)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            docs.includes(d)
                              ? "bg-blue-50 border-blue-400 shadow-sm"
                              : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-sm font-medium ${
                                docs.includes(d)
                                  ? "text-blue-700"
                                  : "text-gray-700"
                              }`}
                            >
                              {d}
                            </span>
                            <div
                              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                docs.includes(d)
                                  ? "bg-blue-600 border-blue-600"
                                  : "border-gray-300"
                              }`}
                            >
                              {docs.includes(d) && (
                                <Check className="w-3.5 h-3.5 text-white" />
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={reset}
                className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editId ? update : create}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/40 hover:scale-105 flex items-center gap-2 font-semibold transition-all duration-200"
              >
                <Save className="w-4 h-4" />
                <span>{editId ? "Update Template" : "Create Template"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}