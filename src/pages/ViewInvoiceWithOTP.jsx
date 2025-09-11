// import React, { useState } from "react";
// import axios from "axios";
// import ViewInvoices from "./ViewInvoices";

// export default function ViewInvoiceWithOTP() {
//   const [otpSent, setOtpSent] = useState(false);
//   const [enteredOtp, setEnteredOtp] = useState("");
//   const [otpVerified, setOtpVerified] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [errMsg, setErrMsg] = useState("");

//   // Send OTP on mount or on button click
//   const sendOtp = async () => {
//     setLoading(true);
//     setErrMsg("");
//     try {
//       await axios.post("https://taskbe.sharda.co.in/api/send-otp-view-invoice", { email: "finaxis.ai@gmail.com" });
//       setOtpSent(true);
//     } catch (err) {
//       setErrMsg("Failed to send OTP.");
//     }
//     setLoading(false);
//   };

//   const verifyOtp = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrMsg("");
//     try {
//       const res = await axios.post("https://taskbe.sharda.co.in/api/verify-otp-view-invoice", { otp: enteredOtp });
//       if (res.data.success) {
//         setOtpVerified(true);
//       } else {
//         setErrMsg("Invalid OTP.");
//       }
//     } catch {
//       setErrMsg("Invalid OTP or error occurred.");
//     }
//     setLoading(false);
//   };

  

//   if (!otpVerified) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[60vh]">
//         <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
//           <h2 className="text-xl font-semibold mb-4">OTP Required</h2>
//           {otpSent ? (
//             <>
//               <form onSubmit={verifyOtp}>
//                 <label className="block mb-2">Enter OTP sent to <b>caanunaysharda@gmail.com</b></label>
//                 <input
//                   type="text"
//                   value={enteredOtp}
//                   onChange={(e) => setEnteredOtp(e.target.value)}
//                   className="border px-3 py-2 rounded w-full mb-3"
//                   maxLength={6}
//                   required
//                   autoFocus
//                 />
//                 <button
//                   type="submit"
//                   className="bg-blue-600 text-white px-4 py-2 rounded w-full"
//                   disabled={loading}
//                 >
//                   {loading ? "Verifying..." : "Verify OTP"}
//                 </button>
//               </form>
//               <button
//                 onClick={sendOtp}
//                 className="text-sm text-blue-600 underline mt-3"
//                 disabled={loading}
//               >
//                 Resend OTP
//               </button>
//             </>
//           ) : (
//             <div>
//               <button
//                 onClick={sendOtp}
//                 className="bg-blue-600 text-white px-4 py-2 rounded"
//                 disabled={loading}
//               >
//                 {loading ? "Sending OTP..." : "Send OTP"}
//               </button>
//             </div>
//           )}
//           {errMsg && <div className="text-red-600 mt-2">{errMsg}</div>}
//         </div>
//       </div>
//     );
//   }

//   // If verified, show the real invoices page
//   return <ViewInvoices />;
// }




import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import ViewInvoices from "./ViewInvoices";

export default function ViewInvoiceWithOTP() {
  const email = "caanunaysharda@gmail.com"; // change if dynamic

  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [verified, setVerified] = useState(false);

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef(Array(6).fill(null));

  const otp = digits.join("");
  const canVerify = otp.length === 6 && !loading;

  // Masked email for display
  const maskedEmail = useMemo(() => {
    const [n, d] = email.split("@");
    const [d1, ...rest] = (d || "").split(".");
    const mask = (s, k = 1) =>
      s.length <= k ? s : s.slice(0, k) + "•".repeat(s.length - k);
    return `${mask(n, 1)}@${mask(d1 || "", 1)}${rest.length ? "." + rest.join(".") : ""}`;
  }, [email]);

  // Cooldown tick
  useEffect(() => {
    if (!cooldown) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const focusIndex = (i) => {
    const el = inputsRef.current[i];
    if (el) {
      el.focus();
      el.select?.();
    }
  };

  const onChange = (i, v) => {
    setErr("");
    const only = v.replace(/\D/g, "").slice(0, 1);
    setDigits((d) => {
      const nd = [...d];
      nd[i] = only;
      return nd;
    });
    if (only && i < 5) focusIndex(i + 1);
  };

  const onKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      if (digits[i]) {
        setDigits((d) => {
          const nd = [...d];
          nd[i] = "";
          return nd;
        });
      } else if (i > 0) {
        focusIndex(i - 1);
        setDigits((d) => {
          const nd = [...d];
          nd[i - 1] = "";
          return nd;
        });
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      focusIndex(i - 1);
    } else if (e.key === "ArrowRight" && i < 5) {
      focusIndex(i + 1);
    } else if (e.key === "Enter" && canVerify) {
      verify();
    }
  };

  const onPaste = (e) => {
    e.preventDefault();
    setErr("");
    const clip = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!clip) return;
    const arr = clip.split("").slice(0, 6);
    setDigits(["", "", "", "", "", ""].map((_, i) => arr[i] || ""));
    focusIndex(Math.min(arr.length, 6) - 1 || 0);
  };

  const send = async () => {
  try {
    setLoading(true);
    setErr("");

    // NOTE: no body — this matches your working call elsewhere
    await axios.post("https://taskbe.sharda.co.in/api/send-otp-view-invoice");

    setOtpSent(true);
    setCooldown(30);
    setDigits(["", "", "", "", "", ""]);
    setTimeout(() => focusIndex(0), 0);
  } catch (e) {
    // surface the real reason on screen to debug if it ever fails
    const msg =
      e?.response?.data?.error ||
      e?.response?.statusText ||
      e?.message ||
      "Failed to send OTP. Please try again.";
    setErr(msg);
    console.error("OTP send failed:", e);
  } finally {
    setLoading(false);
  }
};


  const verify = async () => {
    if (!canVerify) return;
    try {
      setLoading(true);
      setErr("");
      const res = await axios.post(
        "https://taskbe.sharda.co.in/api/verify-otp-view-invoice",
        { otp }
      );
      if (res?.data?.success) setVerified(true);
      else setErr("Invalid OTP.");
    } catch (e) {
      setErr(e?.response?.data?.error || "Invalid OTP or error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const AUTO_SEND_ON_MOUNT = false; // set true if you ever want auto-send

useEffect(() => {
  if (AUTO_SEND_ON_MOUNT && !otpSent) send();
}, [otpSent]);


  if (verified) return <ViewInvoices />;


  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-xl font-semibold text-gray-900">OTP Required</h1>
          <p className="mt-2 text-sm text-gray-600">
            {otpSent
              ? <>Enter the 6-digit code sent to <span className="font-medium text-gray-900">{maskedEmail}</span>.</>
              : "We’ll send a one-time password to your email to continue."}
          </p>

          {!otpSent ? (
            <button
              onClick={send}
              disabled={loading}
              className={`mt-6 w-full rounded-lg px-4 py-2.5 text-white font-medium
                ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {loading ? "Sending…" : "Send OTP"}
            </button>
          ) : (

            <>
              <div className="mt-5 grid grid-cols-6 gap-2" onPaste={onPaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    value={d}
                    onChange={(e) => onChange(i, e.target.value)}
                    onKeyDown={(e) => onKeyDown(i, e)}
                    inputMode="numeric"
                    maxLength={1}
                    className="h-11 w-11 text-center text-lg font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label={`OTP digit ${i + 1}`}
                  />
                ))}
              </div>

              {err && <div className="mt-3 text-sm text-red-600">{err}</div>}

              <button
                onClick={verify}
                disabled={!canVerify}
                className={`mt-5 w-full rounded-lg px-4 py-2.5 text-white font-medium
                  ${canVerify ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
              >
                {loading ? "Verifying…" : "Verify OTP"}
              </button>

              <div className="mt-3 text-sm text-gray-600 flex items-center justify-between">
                <span>Didn’t get the code?</span>
                <button
                  onClick={send}
                  disabled={cooldown > 0 || loading}
                  className={`font-medium ${cooldown > 0 || loading ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:underline"}`}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
