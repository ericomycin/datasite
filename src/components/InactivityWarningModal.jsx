import { useState } from "react";

export default function InactivityWarningModal({
  isOpen,
  countdown,
  onExtend,
  onLogout,
}) {
  const [isClosing, setIsClosing] = useState(false);

  if (!isOpen) return null;

  const handleLogout = () => {
    setIsClosing(true);
    setTimeout(onLogout, 300);
  };

  const handleExtend = () => {
    setIsClosing(true);
    setTimeout(onExtend, 300);
  };

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeString = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return (
    <div
      className={`fixed inset-0 bg-black transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      } z-40`}
      onClick={handleExtend}
    >
      <div
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 max-w-md w-11/12 transition-all duration-300 z-50 ${
          isClosing ? "scale-90 opacity-0" : "scale-100 opacity-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Session Expiring Soon
            </h2>
            <p className="text-slate-600">
              Your session will expire due to inactivity.
            </p>
          </div>

          <div className="my-8 p-6 bg-orange-50 rounded-xl border-2 border-orange-200">
            <p className="text-sm text-slate-600 mb-2">Time remaining</p>
            <p className="text-5xl font-bold text-orange-600 font-mono">
              {timeString}
            </p>
          </div>

          <p className="text-xs text-slate-500 mb-6">
            Click anywhere or interact with the page to extend your session
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              className="flex-1 bg-red-100 text-red-700 hover:bg-red-200 font-medium py-2 px-4 rounded-lg transition"
            >
              Logout Now
            </button>
            <button
              onClick={handleExtend}
              className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700 font-medium py-2 px-4 rounded-lg transition"
            >
              Stay Logged In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
