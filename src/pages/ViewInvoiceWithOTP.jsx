import React, { useState } from "react";
import axios from "axios";
import ViewInvoices from "./ViewInvoices";

export default function ViewInvoiceWithOTP() {
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // Send OTP on mount or on button click
  const sendOtp = async () => {
    setLoading(true);
    setErrMsg("");
    try {
      await axios.post("https://taskbe.sharda.co.in/api/send-otp-view-invoice", { email: "caanunaysharda@gmail.com" });
      setOtpSent(true);
    } catch (err) {
      setErrMsg("Failed to send OTP.");
    }
    setLoading(false);
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrMsg("");
    try {
      const res = await axios.post("https://taskbe.sharda.co.in/api/verify-otp-view-invoice", { otp: enteredOtp });
      if (res.data.success) {
        setOtpVerified(true);
      } else {
        setErrMsg("Invalid OTP.");
      }
    } catch {
      setErrMsg("Invalid OTP or error occurred.");
    }
    setLoading(false);
  };

  if (otpVerified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full text-center">
          <h2 className="text-xl font-semibold mb-4 text-green-600">OTP Verified Successfully!</h2>
          <p className="mb-4">Invoice software has been opened in a new tab.</p>
          
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Verify Again..
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4">OTP Required</h2>
        {otpSent ? (
          <>
            <form onSubmit={verifyOtp}>
              <label className="block mb-2">Enter OTP sent to <b>caanunaysharda@gmail.com</b></label>
              <input
                type="text"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                className="border px-3 py-2 rounded w-full mb-3"
                maxLength={6}
                required
                autoFocus
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded w-full"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
            <button
              onClick={sendOtp}
              className="text-sm text-blue-600 underline mt-3"
              disabled={loading}
            >
              Resend OTP
            </button>
          </>
        ) : (
          <div>
            <p className="mb-4">You need to verify with OTP to access the invoicing system.</p>
            <button
              onClick={sendOtp}
              className="bg-blue-600 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </div>
        )}
        {errMsg && <div className="text-red-600 mt-2">{errMsg}</div>}
      </div>
    </div>
  );
}