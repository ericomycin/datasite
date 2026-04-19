import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { toast } from "sonner";

export default function NavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = [
  // { label: "Home", path: "/home", icon: <i class="fa-solid fa-arrow-up-right-dots"></i> },
  { label: "Dashboard", path: "/dashboard", icon: <i class="fa-solid fa-arrow-up-right-dots"></i> },
  { label: "Orders", path: "/orders", icon: <i class="fa-solid fa-cart-arrow-down"></i> },
  { label: "Users", path: "/users", icon: <i class="fa-solid fa-user"></i> },
  { label: "Account Settings", path: "/settings", icon: <i class="fa-solid fa-gear"></i> },
];
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error logging out");
    }
  };

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-linear-to-br from-indigo-700 via-indigo-600 to-cyan-500 text-white p-6 overflow-y-auto transform transition duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-white text-lg hover:opacity-75"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold mb-2">Data Hub</h2>
        {/* <p className="text-xs text-indigo-100 mb-5">
          Access your analytics, users, and tasks with a single dashboard.
        </p> */}

        <nav className="space-y-8">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
               <Link
        key={item.path}
        to={item.path}
        onClick={() => {
          if (window.innerWidth < 1024) setSidebarOpen(false);
        }}
        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-sm transition duration-200 ${
          isActive
            ? "bg-white text-indigo-700 shadow-lg"
            : "bg-white/10 hover:bg-white/20 text-white"
        }`}
      >
        {item.icon}
        <span>{item.label}</span>
      </Link>
            );
          })}
        </nav>

        <button
          onClick={handleSignOut}
         className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-[red] transition"
>
        {/* <i class="fa-solid fa-gear"></i> */}
          Logout
        </button>
      </aside>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden transition-opacity duration-300"
        />
      )}

      <div className="mb-6 flex items-center justify-between lg:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-slate-100 transition"
        >
          <svg
            className="w-6 h-6 text-slate-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </>
  );
}
