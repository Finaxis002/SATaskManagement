import React, { useState } from "react";

const Support = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [issue, setIssue] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      fullName,
      email,
      phone,
      reason,
      otherReason,
      issue,
    };

    try {
      const res = await fetch("https://taskbe.sharda.co.in/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setShowPopup(true);

        // ✅ reset all fields
        setFullName("");
        setEmail("");
        setPhone("");
        setReason("");
        setOtherReason("");
        setIssue("");
      } else {
        alert("Failed to submit. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting support request:", err);

      alert("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="bg-gray-50 p-6 flex items-start justify-center overflow-y-scroll h-full relative">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Contact Finaxis Support
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-gray-700 font-medium">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium">
              Email ID <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-gray-700 font-medium">
              Phone No <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Reason for contacting */}
          <div className="overflow-hidden">
            <label htmlFor="reason" className="block text-gray-700 font-medium">
              Reason for Contacting <span className="text-red-500">*</span>
            </label>
            <select
              id="reason"
              name="reason"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full md:w-full md:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none overflow-hidden"
            >
              <option className="text-[13px]" value="">-- Select an option --</option>
              <option className="text-[13px]" value="error">Report an Error</option>
              <option className="text-[13px]" value="feature">Request New Feature</option>
              <option className="text-[13px]" value="suggestion">Give Suggestion for Improvement</option>
              <option className="text-[13px]" value="other">Other</option>
            </select>
          </div>

          {/* Other Reason */}
          {reason === "other" && (
            <div>
              <label
                htmlFor="otherReason"
                className="block text-gray-700 font-medium"
              >
                Please specify <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="otherReason"
                name="otherReason"
                required
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          )}

          {/* Issue/Feedback */}
          <div>
            <label htmlFor="issue" className="block text-gray-700 font-medium">
              Please share your issue or feedback{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              id="issue"
              name="issue"
              required
              rows="4"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition duration-200"
          >
            Submit
          </button>
        </form>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-96 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">✅ Success</h3>
            <p className="text-gray-600 mb-6">
              Your support request has been submitted successfully!
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
