import React, { useState } from "react";
import axios from "axios";

export default function ViewInvoiceWithOTP() {
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

   const getInvoiceBaseUrl = () => {
    // Check if we're in local development
    const isLocalDev = 
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      process.env.NODE_ENV === 'development';
    
    console.log('🌍 Environment check:', {
      hostname: window.location.hostname,
      env: process.env.NODE_ENV,
      isLocalDev: isLocalDev
    });
    
    if (isLocalDev) {
      return 'http://localhost:5174'; // Your local invoicing app
    }
    return 'https://invoicing.sharda.co.in'; // Production
  };


  // Send OTP on mount or on button click
  const sendOtp = async () => {
    setLoading(true);
    setErrMsg("");
    try {
      // await axios.post("https://taskbe.sharda.co.in/api/send-otp-view-invoice", { 
      //   email: "caanunaysharda@gmail.com" 
      // });
      const apiBase = window.location.hostname.includes('localhost')
        ? 'http://localhost:1100'
        : 'https://taskbe.sharda.co.in';
      
      await axios.post(`${apiBase}/api/send-otp-view-invoice`, { 
        email: "caanunaysharda@gmail.com" 
      });
      setOtpSent(true);
    } catch (err) {
      setErrMsg("Failed to send OTP.");
    }
    setLoading(false);
  };

  // Client-side fallback method
  const openWithClientSideMethods = (token) => {
    // const invoiceWindow = window.open('https://invoicing.sharda.co.in', '_blank');
    const invoiceBaseUrl = getInvoiceBaseUrl();
    const invoiceWindow = window.open(invoiceBaseUrl, '_blank');
    
    if (!invoiceWindow) {
      setErrMsg("Popup blocked! Please allow popups for this site.");
      return;
    }

    // Client-side fallback with retry logic
    const tryClientTransfer = (attempt = 0) => {
      if (attempt >= 3) {
        // Ultimate fallback - URL parameter
        // const fallbackUrl = `https://invoicing.sharda.co.in?authToken=${encodeURIComponent(token)}&fallback=true&timestamp=${Date.now()}`;
         const fallbackUrl = `${invoiceBaseUrl}?authToken=${encodeURIComponent(token)}&fallback=true&timestamp=${Date.now()}`;
        invoiceWindow.location.href = fallbackUrl;
        return;
      }

      try {
        invoiceWindow.postMessage(
          { 
            type: 'authToken', 
            token: token,
            isFresh: true,
            timestamp: Date.now(),
            source: 'client-fallback'
          },
          // 'https://invoicing.sharda.co.in'
           invoiceBaseUrl
        );
        console.log(`Client token transfer attempt ${attempt + 1}`);
      } catch (e) {
        setTimeout(() => tryClientTransfer(attempt + 1), 300);
      }
    };

    setTimeout(() => tryClientTransfer(), 500);
  };

  // Manual fallback for users
  const openInvoiceDirectly = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
         const apiBase = window.location.hostname.includes('localhost')
          ? 'http://localhost:1100'
          : 'https://taskbe.sharda.co.in';
        // const shareResponse = await axios.post('https://taskbe.sharda.co.in/api/token/share-auth-token', {
        //   token: token,
        //   source: 'manual-fallback'
        // });
         const shareResponse = await axios.post(`${apiBase}/api/token/share-auth-token`, {
          token: token,
          source: 'manual-fallback'
        });
        
        if (shareResponse.data.success) {
          // const invoiceUrl = `https://invoicing.sharda.co.in?shareId=${shareResponse.data.shareId}`;
           const invoiceBaseUrl = getInvoiceBaseUrl();
          const invoiceUrl = `${invoiceBaseUrl}?shareId=${shareResponse.data.shareId}`;
          window.open(invoiceUrl, '_blank');
        }
      } catch (error) {
        // Fallback to URL parameter
        // const fallbackUrl = `https://invoicing.sharda.co.in?authToken=${encodeURIComponent(token)}&direct=true`;
        const invoiceBaseUrl = getInvoiceBaseUrl();
        const fallbackUrl = `${invoiceBaseUrl}?authToken=${encodeURIComponent(token)}&direct=true`;
        window.open(fallbackUrl, '_blank');
      }
    } else {
      setErrMsg("No authentication token available. Please refresh the page and try again.");
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrMsg("");
    
    try {
      // const res = await axios.post("https://taskbe.sharda.co.in/api/verify-otp-view-invoice", { 
      //   otp: enteredOtp 
      // });
       const apiBase = window.location.hostname.includes('localhost')
        ? 'http://localhost:1100'
        : 'https://taskbe.sharda.co.in';
      
      const res = await axios.post(`${apiBase}/api/verify-otp-view-invoice`, { 
        otp: enteredOtp 
      });
      
      
      if (res.data.success) {
        setOtpVerified(true);
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          setErrMsg("No authentication token found.");
          setLoading(false);
          return;
        }

        // PRIMARY: Server-side token sharing
        try {
          // const shareResponse = await axios.post('https://taskbe.sharda.co.in/api/token/share-auth-token', {
          //   token: token,
          //   source: 'otp-verification'
          // });
           const shareResponse = await axios.post(`${apiBase}/api/token/share-auth-token`, {
            token: token,
            source: 'otp-verification'
          });
          
          if (shareResponse.data.success) {
            // Open invoice software with shareId
            // const invoiceUrl = `https://invoicing.sharda.co.in?shareId=${shareResponse.data.shareId}`;
              const invoiceBaseUrl = getInvoiceBaseUrl();
            const invoiceUrl = `${invoiceBaseUrl}?shareId=${shareResponse.data.shareId}`;
            window.open(invoiceUrl, '_blank');
            console.log('✅ Invoice opened with server-shared token');
          }
        } catch (serverError) {
          console.warn('Server token sharing failed, using fallback');
            console.error('Server error:', serverError);
          // Fallback to client-side methods
          openWithClientSideMethods(token);
        }
        
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
          <h2 className="text-xl font-semibold mb-4 text-green-600">OTP Verified Successfully!!</h2>
          {/* <p className="mb-4">Invoice software should open automatically.</p> */}
             <p className="mb-4">
            {window.location.hostname.includes('localhost') 
              ? 'Local invoice software should open automatically.' 
              : 'Invoice software should open automatically.'}
          </p>
          {/* Debug info for local development */}
          {window.location.hostname.includes('localhost') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-left text-sm">
              <p className="font-semibold">🔧 Local Development Info:</p>
              <p>Invoicing URL: {getInvoiceBaseUrl()}</p>
              <p>Backend URL: {window.location.hostname.includes('localhost') ? 'http://localhost:1100' : 'Production'}</p>
              <p>Token: {localStorage.getItem('authToken') ? '✓ Present' : '✗ Missing'}</p>
            </div>
          )}
          
          {/* Backup button in case automatic opening fails */}
          <div className="space-y-3">
            <button
              onClick={openInvoiceDirectly}
              className="bg-green-600 text-white px-4 py-2 rounded w-full hover:bg-green-700"
            >
              Open Invoice Software Manually
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
            >
              Verify Again
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
          {/* Environment indicator */}
        {window.location.hostname.includes('localhost') && (
          <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-4 text-sm">
            <span className="font-semibold">🔧 LOCAL DEVELOPMENT MODE</span>
            <p className="text-xs mt-1">Will open invoicing at: {getInvoiceBaseUrl()}</p>
          </div>
        )}
        
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
                placeholder="Enter 6-digit OTP"
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
              className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </div>
        )}
        {errMsg && <div className="text-red-600 mt-2 text-center">{errMsg}</div>}
      </div>
    </div>
  );
}
////////////////////////////////////////////////////////////

// import React, { useState } from "react";
// import axios from "axios";
// import ViewInvoices from "./ViewInvoices";
// import InvoiceTab from "./InvoiceTab";

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
//       await axios.post("https://taskbe.sharda.co.in/api/send-otp-view-invoice", { email: "caanunaysharda@gmail.com" });
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
//   return <InvoiceTab />;
// }















////////////////////////////////////////////////////////////////////////////////////////
// import React, { useState, useRef } from "react";
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
        
//         // Get token from localStorage (same as before)
//         const token = localStorage.getItem('authToken');
        
//         // Open invoice software in new tab
//         const invoiceWindow = window.open('https://invoicing.sharda.co.in', '_blank');
        
//         // Function to send token to the new window with freshness indicator
//         const sendTokenToNewWindow = () => {
//           if (invoiceWindow && token) {
//             try {
//               invoiceWindow.postMessage(
//                 { 
//                   type: 'authToken', 
//                   token: token,
//                   isFresh: true, // Add freshness flag
//                   timestamp: Date.now(), // Add current timestamp
//                   source: 'otp-verified' // Indicate it's from fresh OTP verification
//                 },
//                 'https://invoicing.sharda.co.in'
//               );
//               console.log('Token sent with freshness indicators');
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







