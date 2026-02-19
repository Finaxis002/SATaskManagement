import React, { useState } from 'react';
import axios from 'axios';

const parseJwt = (token) => {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
};

const getCurrentUser = () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    const decoded = parseJwt(token);
    if (decoded) {
      return {
        userId: decoded.id || decoded._id || '',
        name:   decoded.name || decoded.fullName || decoded.username || decoded.email || 'You',
        email:  decoded.email || '',
      };
    }
  }
  return {
    userId: localStorage.getItem('userId') || '',
    name:   localStorage.getItem('userName') || 'You',
    email:  localStorage.getItem('userEmail') || '',
  };
};

// ✅ Naam nikalo — addedByName sabse pehle check karo
const getAuthorName = (rem, currentUser) => {
  // 1st: addedByName — directly DB mein save hua naam (Admin ya User dono ke liye kaam karta hai)
  if (rem.addedByName && rem.addedByName !== 'Unknown') return rem.addedByName;

  // 2nd: populated addedBy object
  if (rem.addedBy && typeof rem.addedBy === 'object') {
    if (rem.addedBy.name)  return rem.addedBy.name;
    if (rem.addedBy.email) return rem.addedBy.email;
    // ID match
    const id = (rem.addedBy._id || rem.addedBy.id || '').toString();
    if (id && id === currentUser.userId) return currentUser.name;
  }

  // 3rd: addedBy sirf ID string
  if (typeof rem.addedBy === 'string' && rem.addedBy === currentUser.userId) {
    return currentUser.name;
  }

  return 'Unknown User';
};

const RemarkModal = ({ isOpen, onClose, work, refreshData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remark, setRemark] = useState('');

  if (!isOpen || !work) return null;

  const currentUser = getCurrentUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!remark.trim()) {
      alert("Please enter a remark");
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        `https://taskbe.sharda.co.in/api/workload/personal/${work._id}/remark`,
        { remark },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Remark Added Successfully!");
      setRemark('');
      if (refreshData) refreshData();
      onClose();
    } catch (error) {
      console.error("Error adding remark:", error);
      alert("Failed to add remark. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl relative max-h-[80vh] overflow-y-auto">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Task Remarks</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1 font-medium">{work.title}</p>
        </div>

        {/* Previous Remarks */}
        {work.remarks && work.remarks.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              Previous Remarks ({work.remarks.length})
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {work.remarks.slice().reverse().map((rem, index) => {
                const authorName = getAuthorName(rem, currentUser);
                return (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-800 mb-3 leading-relaxed">{rem.text}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium border border-indigo-100">
                        <span className="w-5 h-5 bg-indigo-200 rounded-full flex items-center justify-center text-[10px] font-bold">
                          {authorName.charAt(0).toUpperCase()}
                        </span>
                        <span>{authorName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{new Date(rem.addedAt).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Remarks */}
        {(!work.remarks || work.remarks.length === 0) && (
          <div className="px-6 py-8 bg-gray-50 border-b border-gray-200 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-sm text-gray-500">No remarks yet. Be the first to comment!</p>
          </div>
        )}

        {/* Add Remark */}
        <form onSubmit={handleSubmit} className="px-6 py-5">
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Your Remark <span className="text-red-500">*</span>
            </label>
            <textarea
              rows="4"
              required
              placeholder="Enter your remark or comment..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">Your name will be displayed with the remark</p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 rounded-md font-medium transition-colors flex items-center gap-2 ${
                isSubmitting
                  ? 'bg-purple-400 text-white cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              {isSubmitting ? 'Adding...' : 'Add Remark'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RemarkModal;