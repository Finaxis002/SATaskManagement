import React, { useState, useEffect } from 'react';
import { X, Send, User, Building2, MessageSquare, Hash } from 'lucide-react';
import axios from 'axios';
import Select from 'react-select';  // Import Select

const MessagePopup = ({ isOpen, onClose, task, sendMessage }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [clientOptions, setClientOptions] = useState([]);
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');

  // Safe fallbacks with better client ID handling
  const assignedBy = task?.assignedBy?.name || 'Unknown';
  const clientNameFromTask = task?.clientName || task?.client?.name || 'No client';
  const clientIdFromTask = task?.clientId || task?.client?.id || task?.client?._id || task?.client?.clientId || null;

  // Function to find client ID by client name
  const findClientIdByName = (name, clients) => {
    if (!name || !Array.isArray(clients)) return null;
    const client = clients.find(client => 
      (client.name || client) === name
    );
    return client ? (client.id || client._id || client.clientId) : null;
  };

  // Fetch clients data
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const { data } = await axios.get('https://taskbe.sharda.co.in/api/clients', {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-app-client': 'frontend-authenticated',
          },
        });
        const formattedClients = Array.isArray(data)
          ? data.map((client) => ({
              label: client.name || client,
              value: client.name || client,
              clientId: client.id || client._id || client.clientId, // Store clientId as well
            }))
          : [];
        setClientOptions(formattedClients);
        
        // Initialize client values if they exist from the task
        const defaultClientName = task?.clientName || clientNameFromTask;
        const defaultClientId = task?.clientId || clientIdFromTask;
        
        setClientName(defaultClientName);
        
        // If we have a client name but no client ID, try to find the ID from the fetched data
        if (defaultClientName && !defaultClientId) {
          const foundClientId = findClientIdByName(defaultClientName, data);
          setClientId(foundClientId || '');
        } else {
          setClientId(defaultClientId || '');
        }
      } catch (e) {
        console.error('Failed to fetch clients', e);
      }
    };

    if (isOpen) {
      fetchClients();
    }
  }, [isOpen, task, clientNameFromTask, clientIdFromTask]);

  // Handle client selection
  const handleClientChange = (selectedOption) => {
    if (selectedOption) {
      setClientName(selectedOption.value);
      setClientId(selectedOption.clientId || ''); // Set client ID when client is selected
    } else {
      setClientName('');
      setClientId(''); // Clear client ID when no client is selected
    }
  };

  const handleSendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    console.log('Sending message:', trimmed);

    const currentDateTime = new Date().toISOString();
    
    const payload = {
      taskId: task?._id || null,
      clientName: clientName || 'No client',
      clientId: clientId || null,
      message: trimmed,
      sentAt: currentDateTime,
      sentBy: task?.assignedBy?.name || 'Unknown',
    };

    setIsSending(true);
    try {
      // Send message through the existing sendMessage function
      await sendMessage(payload);
      console.log('Message sent:', payload);

      // Also send to message-history API
      try {
        const token = localStorage.getItem('authToken');
        await axios.post('https://taskbe.sharda.co.in/api/message-history', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-app-client': 'frontend-authenticated',
            'Content-Type': 'application/json',
          },
        });
        console.log('Message history saved:', payload);
      } catch (historyError) {
        console.error('Failed to save message history:', historyError);
        // Don't fail the whole operation if history save fails
      }

      setMessage('');
      onClose();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  const limit = 500;

  // Define selectBaseStyles for custom styling of the Select component
  const selectBaseStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 44,
      borderRadius: 12,
      borderColor: state.isFocused ? '#a5b4fc' : '#e5e7eb',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(99,102,241,0.25)' : 'none',
      ':hover': { borderColor: '#a5b4fc' },
      fontSize: 14,
      fontFamily: 'Inter, ui-sans-serif, system-ui',
      background: '#fff',
    }),
    valueContainer: (base) => ({ ...base, padding: '4px 10px' }),
    input: (base) => ({ ...base, fontSize: 14, color: '#0f172a' }),
    singleValue: (base) => ({ ...base, fontSize: 14, fontWeight: 500, color: '#0f172a' }),
    placeholder: (base) => ({ ...base, color: '#94a3b8' }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? '#6366f1' : '#94a3b8',
      padding: '2px 8px',
    }),
    clearIndicator: (base) => ({ ...base, padding: '2px 8px', color: '#cbd5e1' }),
    indicatorSeparator: () => ({ display: 'none' }),
    menu: (base) => ({
      ...base,
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 14px 40px rgba(2,8,23,0.15)',
    }),
    option: (base, state) => ({
      ...base,
      fontSize: 14,
      padding: '10px 12px',
      background: state.isSelected ? '#eef2ff' : state.isFocused ? '#f8fafc' : '#fff',
      color: '#0f172a',
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl relative w-full max-w-md transform transition-all duration-300 scale-100 animate-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold">Send Message</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                disabled={isSending}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-indigo-100 text-sm">Communicate with your client</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Assigned By */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 text-indigo-500" />
                Assigned By
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={assignedBy}
                  readOnly
                  className="w-full p-3 pl-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                />
              </div>
            </div>

            {/* Client Name */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Building2 className="w-4 h-4 text-purple-500" />
                Client Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={clientName || 'No client'}
                  readOnly
                  className="w-full p-3 pl-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                />
              </div>
            </div>

            {/* Client ID Field */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Hash className="w-4 h-4 text-emerald-500" />
                Client ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={clientId || 'No client ID available'}
                  readOnly
                  className="w-full p-3 pl-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                />
              </div>
              {clientId && (
                <p className="text-xs text-emerald-600 mt-1 ml-1">
                  ✓ Client ID available
                </p>
              )}
              {!clientId && (
                <p className="text-xs text-gray-500 mt-1 ml-1">
                  No client ID found for this task
                </p>
              )}
            </div>
          </div>

          {/* Message Input */}
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 text-green-500" />
              Your Message
            </label>
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here... (Ctrl + Enter to send)"
                className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all duration-200 bg-white shadow-sm"
                rows={4}
                maxLength={limit}
                disabled={isSending}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <span className={`text-xs ${message.length > limit * 0.9 ? 'text-orange-500' : 'text-gray-400'}`}>
                  {message.length}/{limit}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isSending}
              className="px-6 py-2.5 text-sm font-medium rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || isSending}
              className="group px-6 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
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
  );
};

export default MessagePopup;