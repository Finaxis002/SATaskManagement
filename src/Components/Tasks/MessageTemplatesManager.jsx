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
} from "lucide-react";
import axios from "axios";

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
  const [making, setMaking] = useState(false);
  const [editId, setEditId] = useState(null);
  const [copied, setCopied] = useState(null);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [docs, setDocs] = useState([]);
  const [showDocs, setShowDocs] = useState(false);
  const [loading, setLoading] = useState(false);

  const getToken = () => localStorage.getItem("authToken");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setTemps(response.data);
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
      const response = await axios.post(
        API_URL,
        {
          name: name.trim(),
          message: msg.trim(),
          documents: docs,
        },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      setTemps([response.data, ...temps]);
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
      const response = await axios.put(
        `${API_URL}/${editId}`,
        {
          name: name.trim(),
          message: msg.trim(),
          documents: docs,
        },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      setTemps(temps.map((t) => (t._id === editId ? response.data : t)));
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
      await axios.delete(`${API_URL}/${id}`, {
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
      const response = await axios.post(
        `${API_URL}/${t._id}/duplicate`,
        {},
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      setTemps([response.data, ...temps]);
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
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Message Templates
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Create and manage templates
                </p>
              </div>
            </div>
            {!making && (
              <button
                onClick={() => setMaking(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>New Template</span>
              </button>
            )}
          </div>
        </div>

        {making && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editId ? "Edit" : "Create"} Template
              </h2>
              <button
                onClick={reset}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., GST Reminder"
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500"
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Write message..."
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 resize-none"
                  rows={6}
                  maxLength={500}
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {msg.length}/500
                </div>
              </div>
              <div>
                <button
                  onClick={() => setShowDocs(!showDocs)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3 hover:text-green-600"
                >
                  <FileText className="w-4 h-4" />
                  <span>Documents ({docs.length})</span>
                </button>
                {showDocs && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-4 bg-gray-50 rounded-xl">
                    {DOCS.map((d, i) => (
                      <div
                        key={i}
                        onClick={() => toggle(d)}
                        className={`p-3 rounded-lg border cursor-pointer ${
                          docs.includes(d)
                            ? "bg-green-50 border-green-300 text-green-700"
                            : "bg-white border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{d}</span>
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              docs.includes(d)
                                ? "bg-green-600 border-green-600"
                                : "border-gray-300"
                            }`}
                          >
                            {docs.includes(d) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={reset}
                  className="px-6 py-3 border text-gray-700 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={editId ? update : create}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center gap-2 shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  <span>{editId ? "Update" : "Create"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {temps.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl shadow-lg p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Templates
              </h3>
              <p className="text-gray-600 mb-6">Create your first template</p>
              <button
                onClick={() => setMaking(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl"
              >
                <Plus className="w-5 h-5" />
                <span>Create</span>
              </button>
            </div>
          ) : (
            temps.map((t) => (
              <div
                key={t._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {t.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Created: {new Date(t.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copy(t)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Copy"
                    >
                      {copied === t._id ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => edit(t)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Edit"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => del(t._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl">
                    {t.message}
                  </p>
                </div>
                {t.documents && t.documents.length > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Documents ({t.documents.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {t.documents.map((d, i) => (
                        <span
                          key={i}
                          className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
