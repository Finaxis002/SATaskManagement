import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  FileText,
  MessageSquare,
  Clock,
  Loader2,
  Upload,
  X,
} from "lucide-react";

const Support = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [issue, setIssue] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Image upload states
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // ✅ Handle Image Selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Maximum 3 images allow karte hain
    if (images.length + files.length > 2) {
      alert("You can upload maximum 2 images only");
      return;
    }

    // File size check (max 5MB per image)
    const invalidFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      alert("Each image should be less than 5MB");
      return;
    }

    // Convert images to base64
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            data: reader.result,
          },
        ]);
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // ✅ Remove Image
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!fullName || !email || !phone || !reason || !issue) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    const formData = {
      fullName,
      email,
      phone,
      reason,
      otherReason,
      issue,
      images, // ✅ Images bhi send kar rahe hain
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
        setFullName("");
        setEmail("");
        setPhone("");
        setReason("");
        setOtherReason("");
        setIssue("");
        setImages([]);
        setImagePreviews([]);
      } else {
        alert("Failed to submit. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting support request:", err);
      alert("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="space-y-5">
        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            className="flex items-center gap-2 text-gray-700 font-medium mb-2 text-sm"
          >
            <User className="w-4 h-4 text-blue-500" />
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="flex items-center gap-2 text-gray-700 font-medium mb-2 text-sm"
          >
            <Mail className="w-4 h-4 text-blue-500" />
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="flex items-center gap-2 text-gray-700 font-medium mb-2 text-sm"
          >
            <Phone className="w-4 h-4 text-blue-500" />
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        {/* Reason */}
        <div>
          <label
            htmlFor="reason"
            className="flex items-center gap-2 text-gray-700 font-medium mb-2 text-sm"
          >
            <FileText className="w-4 h-4 text-blue-500" />
            Subject <span className="text-red-500">*</span>
          </label>
          <select
            id="reason"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">What can we help you with?</option>
            <option value="error">Report an Error</option>
            <option value="feature">Request New Feature</option>
            <option value="suggestion">Give Suggestion for Improvement</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Other Reason */}
        {reason === "other" && (
          <div>
            <label
              htmlFor="otherReason"
              className="flex items-center gap-2 text-gray-700 font-medium mb-2 text-sm"
            >
              Please specify <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="otherReason"
              required
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              placeholder="Please specify your reason"
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
        )}

        {/* Message */}
        <div>
          <label
            htmlFor="issue"
            className="flex items-center gap-2 text-gray-700 font-medium mb-2 text-sm"
          >
            <MessageSquare className="w-4 h-4 text-blue-500" />
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            id="issue"
            required
            rows="5"
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            placeholder="Please describe your issue or question in detail..."
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none disabled:bg-gray-50 disabled:text-gray-400"
          ></textarea>
        </div>

        {/* ✅ Image Upload Section */}
        <div>
          <label className="flex items-center gap-2 text-gray-700 font-medium mb-2 text-sm">
            <Upload className="w-4 h-4 text-blue-500" />
            Attach Screenshots (Optional)
          </label>
          <div className="space-y-3">
            <label className="w-full px-4 py-8 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition cursor-pointer flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-blue-500">
              <Upload className="w-8 h-8" />
              <span className="text-sm font-medium">
                Click to upload images
              </span>
              <span className="text-xs">
                Max 2 images, 5MB each (JPG, PNG, GIF)
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                disabled={isSubmitting || images.length >= 3}
                className="hidden"
              />
            </label>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      disabled={isSubmitting}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3.5 rounded-xl font-semibold 
            hover:shadow-lg transform transition duration-200 flex items-center justify-center gap-2
            ${
              isSubmitting
                ? "opacity-75 cursor-not-allowed scale-100"
                : "hover:scale-[1.02]"
            }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <MessageSquare className="w-5 h-5" />
              Send Message
            </>
          )}
        </button>

        {/* Support Info */}
        <div className="pt-4">
          <h4 className="flex items-center gap-2 text-gray-700 font-medium mb-3">
            <Clock className="w-5 h-5 text-blue-500" />
            Support Information
          </h4>
          <div className="bg-gray-100/80 rounded-xl p-4 text-sm space-y-2 text-gray-600 border border-gray-200">
            <p>
              <span className="font-bold text-gray-700">Support Hours:</span>{" "}
              Mon-Sat, 10AM-7PM IST
            </p>
            <p>
              <span className="font-bold text-gray-700">Response Time:</span>{" "}
              Typically within 24 hours
            </p>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[10000] p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Success!</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Your support request has been submitted successfully. We'll get
              back to you soon!
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition font-semibold"
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
