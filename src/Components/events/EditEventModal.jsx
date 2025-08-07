import React, { useState, useEffect } from "react";
import axios from "axios";

const EditEventModal = ({ event, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    summary: "",
    description: "",
    startDateTime: "",
    endDateTime: "",
    guestEmails: [],
    userEmail: "",
  });

  useEffect(() => {
    if (event) {
      setFormData({
        summary: event.title || "",
        description: event.description || "",
        startDateTime: event.startDateTime?.slice(0, 16),
        endDateTime: event.endDateTime?.slice(0, 16),
        guestEmails: event.guestEmails || [],
        userEmail: event.userEmail || "",
      });
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGuestsChange = (e) => {
    setFormData(prev => ({ ...prev, guestEmails: e.target.value.split(",").map(v => v.trim()) }));
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.put(`/api/events/${event._id}`, formData);
      onUpdate(res.data.event);
      onClose();
    } catch (err) {
      console.error("❌ Failed to update:", err);
    }
  };

  if (!event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-[500px]">
        <h2 className="text-lg font-semibold mb-4">Edit Event</h2>

        <input name="summary" value={formData.summary} onChange={handleChange} placeholder="Title" className="mb-2 w-full border p-2 rounded" />
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="mb-2 w-full border p-2 rounded" />
        <input type="datetime-local" name="startDateTime" value={formData.startDateTime} onChange={handleChange} className="mb-2 w-full border p-2 rounded" />
        <input type="datetime-local" name="endDateTime" value={formData.endDateTime} onChange={handleChange} className="mb-2 w-full border p-2 rounded" />
        <input name="guestEmails" value={formData.guestEmails.join(", ")} onChange={handleGuestsChange} placeholder="Guest emails (comma separated)" className="mb-4 w-full border p-2 rounded" />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded bg-indigo-600 text-white">Update</button>
        </div>
      </div>
    </div>
  );
};

export default EditEventModal;
