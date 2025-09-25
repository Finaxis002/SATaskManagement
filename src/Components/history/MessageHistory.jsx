import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageSquare, 
  Calendar, 
  RefreshCw, 
  AlertCircle,
  Clock,
  Search,
  Filter,
  Download,
  TrendingUp,
  Send,
  MessageCircle
} from 'lucide-react';

const MessageHistory = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [clientName, setClientName] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`https://taskbe.sharda.co.in/api/message-history?clientId=${clientId}`);
        if (response.headers['content-type']?.includes('application/json')) {
          setMessages(response.data);
          setFilteredMessages(response.data);
          if (response.data.length > 0 && response.data[0].clientName) {
            setClientName(response.data[0].clientName);
          }
        } else {
          setError("Unexpected response format. Please check the server.");
        }
      } catch (error) {
        setError("Error fetching message history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    if (clientId) fetchMessages();
  }, [clientId]);

  useEffect(() => {
    let filtered = messages;
    if (searchTerm) {
      filtered = filtered.filter(message =>
        message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.sentBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterBy !== 'all') {
      filtered = filtered.filter(message => {
        if (filterBy === 'sent') return message.sentBy !== clientName && message.sentBy !== 'Client';
        if (filterBy === 'received') return message.sentBy === clientName || message.sentBy === 'Client';
        return true;
      });
    }
    setFilteredMessages(filtered);
  }, [searchTerm, filterBy, messages, clientName]);

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  const handleExport = () => {
    const csvContent = messages.map(msg => 
      `"${msg.sentBy}","${msg.message.replace(/"/g, '""')}","${new Date(msg.sentAt).toLocaleString()}"`
    ).join('\n');
    const blob = new Blob([`Sender,Message,Date\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `message-history-${clientName || clientId}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diff = Math.floor((now - messageDate) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return messageDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white shadow rounded-lg p-8">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
              <span className="text-base font-medium text-gray-700">Loading communication history...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white shadow rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Unable to load messages</h3>
              <p className="mt-2 text-sm text-gray-500">{error}</p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleRefresh}
                  className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white shadow rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No communication history</h3>
              <p className="mt-2 text-sm text-gray-500">There are no messages recorded for this client yet.</p>
              <div className="mt-6">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Return to Client List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    // keep page scrollable too
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Communication History</h1>
                <p className="text-sm text-gray-500">
                  {clientName ? `${clientName}` : `Client ID: ${clientId}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExport}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {/* Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5 flex items-center">
              <MessageSquare className="h-6 w-6 text-gray-600 flex-shrink-0" />
              <div className="ml-5">
                <div className="text-sm font-medium text-gray-500 truncate">Total Messages</div>
                <div className="text-lg font-semibold text-gray-900">{messages.length}</div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5 flex items-center">
              <Send className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <div className="ml-5">
                <div className="text-sm font-medium text-gray-500 truncate">Received</div>
                <div className="text-lg font-semibold text-gray-900">
                  {messages.filter(m => m.sentBy === clientName || m.sentBy === 'Client').length}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5 flex items-center">
              <TrendingUp className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div className="ml-5">
                <div className="text-sm font-medium text-gray-500 truncate">Sent</div>
                <div className="text-lg font-semibold text-gray-900">
                  {messages.filter(m => m.sentBy !== clientName && m.sentBy !== 'Client').length}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5 flex items-center">
              <Clock className="h-6 w-6 text-purple-600 flex-shrink-0" />
              <div className="ml-5">
                <div className="text-sm font-medium text-gray-500 truncate">Latest Activity</div>
                <div className="text-sm font-medium text-gray-900">
                  {messages.length > 0 ? formatRelativeTime(messages[0].sentAt) : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-2">
          <div className="px-4 py-4 ">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search messages or senders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Communications</option>
                  <option value="sent">Outbound Messages</option>
                  <option value="received">Inbound Messages</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Timeline (SCROLLABLE) */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-2 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Message Timeline</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Complete communication history with timestamps and message details.
            </p>
          </div>

          {/* 👇 Scroll container: adjust height as you like */}
          <div
            className="
              px-4 py-4 sm:p-3
              max-h-[60vh] 
              overflow-y-auto
              pr-2
              scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100
            "
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flow-root">
              {/* removed -mb-8 to avoid clipping the last item */}
              <ul className="mb-8">
                {filteredMessages.map((message, index) => (
                  <li key={message._id || index}>
                    <div className="relative pb-8">
                      {index !== filteredMessages.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span
                            className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              message.sentBy === clientName || message.sentBy === 'Client'
                                ? 'bg-blue-500'
                                : 'bg-green-500'
                            }`}
                          >
                            {message.sentBy === clientName || message.sentBy === 'Client'
                              ? <MessageCircle className="h-4 w-4 text-white" />
                              : <Send className="h-4 w-4 text-white" />
                            }
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <p className="text-sm font-medium text-gray-900">{message.sentBy}</p>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  message.sentBy === clientName || message.sentBy === 'Client'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {message.sentBy === clientName || message.sentBy === 'Client' ? 'Inbound' : 'Outbound'}
                              </span>
                            </div>
                            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                              <p className="text-sm text-gray-900 leading-relaxed">{message.message}</p>
                            </div>
                            {message.clientName && (
                              <p className="mt-2 text-xs text-gray-500">Client: {message.clientName}</p>
                            )}
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <time dateTime={message.sentAt}>
                                {new Date(message.sentAt).toLocaleDateString()}
                              </time>
                            </div>
                            <div className="mt-1 text-xs text-gray-400">
                              {new Date(message.sentAt).toLocaleTimeString()}
                            </div>
                            <div className="mt-1 text-xs font-medium text-gray-600">
                              {formatRelativeTime(message.sentAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {filteredMessages.length === 0 && searchTerm && (
                <div className="text-center py-12">
                  <Search className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No messages found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No messages match your search criteria: "{searchTerm}"
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => setSearchTerm('')}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Clear search
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageHistory;
