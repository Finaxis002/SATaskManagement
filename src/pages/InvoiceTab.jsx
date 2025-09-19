// import React, { useRef, useEffect } from 'react';

// const InvoiceTab = () => {
//   const iframeRef = useRef(null);

//   useEffect(() => {
//     // Send token to iframe after it loads
//     const handleIframeLoad = () => {
//       const token = localStorage.getItem('authToken');
//       if (token && iframeRef.current) {
//         iframeRef.current.contentWindow.postMessage(
//           { type: 'authToken', token },
//           'https://invoicing.sharda.co.in'
//         );
//       }
//     };

//     const iframe = iframeRef.current;
//     if (iframe) {
//       iframe.addEventListener('load', handleIframeLoad);
//     }

//     return () => {
//       if (iframe) {
//         iframe.removeEventListener('load', handleIframeLoad);
//       }
//     };
//   }, []);

//   return (
//     <div style={{ 
//       position: 'absolute', 
//       top: 0, 
//       left: 0, 
//       right: 0, 
//       bottom: 0,
//       overflow: 'hidden'
//     }}>
//       <iframe
//         ref={iframeRef}
//         src="https://invoicing.sharda.co.in"
//         style={{ 
//           width: '100%', 
//           height: '100%', 
//           border: 'none',
//           display: 'block'
//         }}
//         title="Invoicing Software"
//       />
//     </div>
//   );
// };

// export default InvoiceTab;


import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';

// OTP Verification Component
const InvoiceOTPVerification = ({ onVerified }) => {
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const sendOtp = async () => {
    setLoading(true);
    setErrMsg("");
    try {
      await axios.post("https://taskbe.sharda.co.in/api/send-otp-view-invoice", { 
        email: "caanunaysharda@gmail.com" 
      });
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
      const res = await axios.post("https://taskbe.sharda.co.in/api/verify-otp-view-invoice", { 
        otp: enteredOtp 
      });
      if (res.data.success) {
        onVerified();
      } else {
        setErrMsg("Invalid OTP.");
      }
    } catch {
      setErrMsg("Invalid OTP or error occurred.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4">OTP Required to Access Invoicing</h2>
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
};

// Invoice Tab Component with OTP protection
const InvoiceTab = () => {
  const [otpVerified, setOtpVerified] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (otpVerified) {
      // Send token to iframe after it loads
      const handleIframeLoad = () => {
        const token = localStorage.getItem('authToken');
        if (token && iframeRef.current) {
          iframeRef.current.contentWindow.postMessage(
            { type: 'AUTH_TOKEN', token },
            'https://invoicing.sharda.co.in'
          );
        }
      };

      const iframe = iframeRef.current;
      if (iframe) {
        iframe.addEventListener('load', handleIframeLoad);
      }

      return () => {
        if (iframe) {
          iframe.removeEventListener('load', handleIframeLoad);
        }
      };
    }
  }, [otpVerified]);

  if (!otpVerified) {
    return <InvoiceOTPVerification onVerified={() => setOtpVerified(true)} />;
  }

  return (
    <div style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0,
      overflow: 'hidden'
    }}>
      <iframe
        ref={iframeRef}
        src="https://invoicing.sharda.co.in"
        style={{ 
          width: '100%', 
          height: '100%', 
          border: 'none',
          display: 'block'
        }}
        title="Invoicing Software"
      />
    </div>
  );
};

export default InvoiceTab;