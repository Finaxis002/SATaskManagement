import React, { useRef, useEffect } from 'react';

const InvoiceTab = () => {
  const iframeRef = useRef(null);

  useEffect(() => {
    // Send token to iframe after it loads
    const handleIframeLoad = () => {
      const token = localStorage.getItem('authToken');
      if (token && iframeRef.current) {
        iframeRef.current.contentWindow.postMessage(
          { type: 'authToken', token },
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
  }, []);

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