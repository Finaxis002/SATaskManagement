

// import React, { useState } from "react";
// import axios from "axios";

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
//       await axios.post("https://taskbe.sharda.co.in/api/send-otp-view-invoice", { 
//         email: "caanunaysharda@gmail.com" 
//       });
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
//       const res = await axios.post("https://taskbe.sharda.co.in/api/verify-otp-view-invoice", { 
//         otp: enteredOtp 
//       });
//       if (res.data.success) {
//         setOtpVerified(true);
        
//         // Open invoice software in new tab
//         const token = localStorage.getItem('authToken');
//         const invoiceWindow = window.open('https://invoicing.sharda.co.in', '_blank');
        
//         // Function to send token to the new window
//         const sendTokenToNewWindow = () => {
//           if (invoiceWindow && token) {
//             try {
//               invoiceWindow.postMessage(
//                 { type: 'authToken', token },
//                 'https://invoicing.sharda.co.in'
//               );
//             } catch (e) {
//               // Retry after a short delay if window isn't ready
//               setTimeout(sendTokenToNewWindow, 100);
//             }
//           }
//         };
        
//         // Start trying to send the token
//         setTimeout(sendTokenToNewWindow, 500);
//       } else {
//         setErrMsg("Invalid OTP.");
//       }
//     } catch {
//       setErrMsg("Invalid OTP or error occurred.");
//     }
//     setLoading(false);
//   };

//   if (otpVerified) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[60vh]">
//         <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full text-center">
//           <h2 className="text-xl font-semibold mb-4 text-green-600">OTP Verified Successfully!!</h2>
//           <p className="mb-4">Invoice software has been opened in a new tab..</p>
          
//           <button
//             onClick={() => window.location.reload()}
//             className="bg-blue-600 text-white px-4 py-2 rounded"
//           >
//             Verify Again..
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col items-center justify-center min-h-[60vh]">
//       <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
//         <h2 className="text-xl font-semibold mb-4">OTP Required</h2>
//         {otpSent ? (
//           <>
//             <form onSubmit={verifyOtp}>
//               <label className="block mb-2">Enter OTP sent to <b>caanunaysharda@gmail.com</b></label>
//               <input
//                 type="text"
//                 value={enteredOtp}
//                 onChange={(e) => setEnteredOtp(e.target.value)}
//                 className="border px-3 py-2 rounded w-full mb-3"
//                 maxLength={6}
//                 required
//                 autoFocus
//               />
//               <button
//                 type="submit"
//                 className="bg-blue-600 text-white px-4 py-2 rounded w-full"
//                 disabled={loading}
//               >
//                 {loading ? "Verifying..." : "Verify OTP"}
//               </button>
//             </form>
//             <button
//               onClick={sendOtp}
//               className="text-sm text-blue-600 underline mt-3"
//               disabled={loading}
//             >
//               Resend OTP
//             </button>
//           </>
//         ) : (
//           <div>
//             <p className="mb-4">You need to verify with OTP to access the invoicing system.</p>
//             <button
//               onClick={sendOtp}
//               className="bg-blue-600 text-white px-4 py-2 rounded"
//               disabled={loading}
//             >
//               {loading ? "Sending OTP..." : "Send OTP"}
//             </button>
//           </div>
//         )}
//         {errMsg && <div className="text-red-600 mt-2">{errMsg}</div>}
//       </div>
//     </div>
//   );
// }

















import React, { useState, useRef } from "react";
import axios from "axios";

export default function ViewInvoiceWithOTP() {
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [authToken, setAuthToken] = useState(""); // Store token in state
  const invoiceWindowRef = useRef(null);

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
      
      console.log("OTP Response:", res.data);
      
      if (res.data.success) {
        // Get token from response
        const token = res.data.token || res.data.authToken || res.data.data?.token;
        
        if (!token) {
          setErrMsg("Authentication token not received from server.");
          setLoading(false);
          return;
        }

        // Store token in state (fresh token)
        setAuthToken(token);
        setOtpVerified(true);
        
        // Open invoice software immediately with fresh token
        openInvoiceWithToken(token);
        
      } else {
        setErrMsg("Invalid OTP.");
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setErrMsg("Invalid OTP or error occurred.");
    }
    setLoading(false);
  };

  const openInvoiceWithToken = (token) => {
    // Open invoice software in new tab
    const invoiceUrl = 'https://invoicing.sharda.co.in';
    invoiceWindowRef.current = window.open(invoiceUrl, '_blank');
    
    if (!invoiceWindowRef.current) {
      setErrMsg("Popup blocked! Please allow popups for this site.");
      return;
    }

    // Wait for the window to load and send fresh token
    let attempts = 0;
    const maxAttempts = 15;
    
    const sendFreshToken = () => {
      attempts++;
      
      if (attempts >= maxAttempts) {
        console.warn('Max attempts reached');
        return;
      }

      if (invoiceWindowRef.current && !invoiceWindowRef.current.closed) {
        try {
          // Send token with current timestamp to ensure it's fresh
          const messageData = {
            type: 'AUTH_TOKEN',
            token: token,
            source: 'otp-verification',
            timestamp: Date.now(), // Current timestamp
            isFresh: true
          };
          
          console.log('Sending fresh token attempt', attempts, messageData);
          invoiceWindowRef.current.postMessage(messageData, 'https://invoicing.sharda.co.in');
          
        } catch (error) {
          console.error('Error sending token:', error);
        }
        
        // Continue retrying with fresh token
        setTimeout(sendFreshToken, 300);
      }
    };

    // Start sending token immediately
    setTimeout(sendFreshToken, 500);
  };

  // Manual token resend with current token
  const resendToken = () => {
    if (invoiceWindowRef.current && !invoiceWindowRef.current.closed && authToken) {
      const messageData = {
        type: 'AUTH_TOKEN',
        token: authToken,
        source: 'otp-verification',
        timestamp: Date.now(),
        isFresh: true
      };
      
      invoiceWindowRef.current.postMessage(messageData, 'https://invoicing.sharda.co.in');
      console.log("Fresh token resent:", messageData);
    }
  };

  if (otpVerified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h2 className="text-xl font-semibold mb-4 text-green-600">OTP Verified Successfully!</h2>
          <p className="mb-4">Invoice software has been opened with fresh authentication token.</p>
          <p className="text-sm text-gray-600 mb-4">
            Token Status: <span className="text-green-600">Fresh</span>
          </p>
          
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded block w-full"
            >
              Verify Again
            </button>
            <button
              onClick={resendToken}
              className="bg-green-600 text-white px-4 py-2 rounded block w-full"
            >
              Resend Fresh Token
            </button>
          </div>
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
                onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="border px-3 py-2 rounded w-full mb-3 text-center text-lg font-mono"
                maxLength={6}
                required
                autoFocus
                placeholder="000000"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 disabled:bg-blue-300"
                disabled={loading || enteredOtp.length !== 6}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
            <button
              onClick={sendOtp}
              className="text-sm text-blue-600 underline mt-3 disabled:text-gray-400"
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
              className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </div>
        )}
        {errMsg && <div className="text-red-600 mt-2 p-2 bg-red-50 rounded text-sm">{errMsg}</div>}
      </div>
    </div>
  );
}