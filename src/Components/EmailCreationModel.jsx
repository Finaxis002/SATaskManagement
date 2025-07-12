import React from "react";
import { Eye , UserPlus , AtSign , Lock , EyeOff , AlertCircle , CheckCircle2, Loader2 } from "lucide-react";

const EmailCreationModel = ({
  handleSubmit,
  email,
  pwVisible,
  password,
  cpwVisible,
  confirmPassword,
  errorMsg,
  successMsg,
  closeModal,
  loading,
  setEmail,
  setPassword, 
  setConfirmPassword,
  setPwVisible,
  setCpwVisible
}) => {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px] transition-all duration-300">
  <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 animate-scale-in">
    <div className="text-center mb-6">
      <div className="mx-auto flex justify-center mb-3">
        <div className="p-2.5 rounded-full bg-indigo-50 text-indigo-500">
          <UserPlus className="w-6 h-6" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-800">Create New Mail User</h2>
      <p className="text-gray-500 mt-1 text-sm">Add a new email account to your system</p>
    </div>

    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Email Address</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <AtSign className="w-4 h-4" />
          </div>
          <input
            type="email"
            required
            className="w-full pl-9 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200"
            placeholder="username@sharda.co.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">New Password</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type={pwVisible ? "text" : "password"}
            required
            className="w-full pl-9 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
            onClick={() => setPwVisible(!pwVisible)}
            aria-label={pwVisible ? "Hide password" : "Show password"}
          >
            {pwVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Confirm Password</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type={cpwVisible ? "text" : "password"}
            required
            className="w-full pl-9 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
            onClick={() => setCpwVisible(!cpwVisible)}
            aria-label={cpwVisible ? "Hide password" : "Show password"}
          >
            {cpwVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="px-4 py-2.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          {errorMsg}
        </div>
      )}
      
      {successMsg && (
        <div className="px-4 py-2.5 rounded-lg bg-green-50 text-green-600 text-sm font-medium flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          {successMsg}
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
          onClick={closeModal}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`px-5 py-2.5 rounded-xl font-medium text-white shadow-sm transition-all duration-200 ${
            loading 
              ? 'bg-indigo-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md'
          }`}
        >
          {loading ? (
            <span className="inline-flex items-center">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </span>
          ) : (
            'Create Account'
          )}
        </button>
      </div>
    </form>
  </div>
</div>
  );
};

export default EmailCreationModel;
