import React from "react";

function Sidebar() {
  return (
    <div className="w-45 bg-white border-r border-gray-100 flex flex-col p-5">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900">MailBox</h1>
      </div>

      <button className="mb-6 flex items-center justify-center space-x-2 bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="font-medium">Compose</span>
      </button>

      <nav className="space-y-1">
        <a href="#" className="flex items-center space-x-3 text-indigo-700 bg-indigo-50 px-4 py-2.5 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <span className="font-medium">Inbox</span>
          <span className="ml-auto bg-indigo-600 text-white text-xs font-medium px-2 py-1 rounded-full">12</span>
        </a>
        {['Sent', 'Drafts', 'Spam', 'Trash'].map((item) => (
          <a key={item} href="#" className="flex items-center space-x-3 text-gray-600 hover:bg-gray-50 px-4 py-2.5 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{item}</span>
          </a>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">SA</div>
          <div>
            <div className="font-medium text-gray-900">sauser@sharda.co.in</div>
            <div className="text-xs text-gray-500">Admin</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MailList() {
  const emails = [
    { 
      id: 1, 
      sender: "Finaxis", 
      subject: "Welcome to your Mailbox!", 
      preview: "Thank you for trying out your new mailbox. This is a sample message...", 
      time: "09:45 AM", 
      read: false,
      starred: true,
      hasAttachment: true
    },
    { 
      id: 2, 
      sender: "Support Team", 
      subject: "Your ticket has been updated", 
      preview: "We've updated your support ticket #45231 with new information...", 
      time: "Yesterday", 
      read: true,
      starred: false,
      hasAttachment: false
    },
    { 
      id: 3, 
      sender: "LinkedIn", 
      subject: "New connection request", 
      preview: "You have 3 new connection requests waiting for your response...", 
      time: "2 days ago", 
      read: true,
      starred: true,
      hasAttachment: false
    }
  ];

  return (
    <div className="w-96 border-r border-gray-100 h-full flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search mail..." 
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {emails.map((mail) => (
          <div 
            key={mail.id} 
            className={`px-5 py-4 border-b border-gray-100 cursor-pointer transition-colors ${!mail.read ? "bg-blue-50" : "hover:bg-gray-50"}`}
          >
            <div className="flex items-start space-x-3">
              <button className={`pt-1 ${mail.starred ? "text-yellow-400" : "text-gray-300 hover:text-gray-400"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <p className={`truncate ${!mail.read ? "font-semibold text-gray-900" : "text-gray-700"}`}>{mail.sender}</p>
                  <p className="text-xs text-gray-500 whitespace-nowrap ml-2">{mail.time}</p>
                </div>
                <h3 className={`truncate ${!mail.read ? "font-semibold text-gray-900" : "text-gray-700"}`}>{mail.subject}</h3>
                <p className="text-sm text-gray-500 truncate mt-1">{mail.preview}</p>
                {mail.hasAttachment && (
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    Attachment
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MailView() {
  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-semibold text-gray-900">Welcome to your Mailbox!</h2>
          <div className="flex space-x-2">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="mt-5 flex items-start">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">F</div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">Finaxis &lt;no-reply@finaxis.in&gt;</div>
            <div className="text-xs text-gray-500">to me • 09:45 AM • Jul 14, 2023</div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="prose max-w-none">
          <p>Hello,</p>
          <p>Thank you for trying out your new mailbox. This is a sample message to get you started with our service.</p>
          
          <p className="mt-4">We've designed this interface to be:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Clean and intuitive</li>
            <li>Fast and responsive</li>
            <li>Customizable to your needs</li>
          </ul>
          
          <p className="mt-4">Let us know if you have any questions!</p>
          
          <p className="mt-4">Best regards,<br/>The Finaxis Team</p>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-100">
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            Reply
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Forward
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 ml-auto">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MailBox() {
  return (
    <div className="flex h-screen  bg-white overflow-hidden">
      <Sidebar />
      <MailList />
      <MailView />
    </div>
  );
}