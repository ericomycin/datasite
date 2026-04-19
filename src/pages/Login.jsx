import { useState } from "react";
import { auth, db } from "../config/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BeatLoader } from "react-spinners";
import { collection, query, where, getDocs } from "firebase/firestore";

import "../App.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("All fields are required");

      return;
    }
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      const q = query(collection(db, "users"), where("userId", "==", user.uid));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        console.log(data.isActive);
        if (!data.isActive) {
          toast.error("Account needs activation");

          await signOut(auth);
          setLoading(false);
          return;
        } else {
          navigate("/dashboard");
        }
      } else {
        setLoading(false);

        toast.error("Account not found");
      }
    } catch (error) {
      setLoading(false);
      if (error.code === "auth/invalid-credential") {
        toast.error("Invalid Credentials");
      }
      if (error.code === "auth/invalid-email") {
        toast.error("Invalid Email");
      }
      if (error.code === "auth/missing-password") {
        toast.error("Invalid Password");
      }
      console.log(error);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#F3F4F6]">
        <div className="w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden bg-white/90 backdrop-blur-md border border-white/30 grid grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col justify-center gap-6 p-10 lg:p-10 bg-linear-to-br from-indigo-700 via-indigo-600 to-cyan-500 text-white">
            <h1 className="text-2xl md:text-3xl font-extrabold">Data Hub</h1>
            <p className="text-sm md:text-base text-indigo-100 max-w-xl leading-relaxed">
              Get your affordable data from the best
            </p>
            {/* <ul className="space-y-3 text-sm md:text-base">
              <li className="flex items-start gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                  ✓
                </span>
                Secure, password-based login
              </li>
              <li className="flex items-start gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                  ✓
                </span>
                Seamless Google SSO 1-click sign in
              </li>
              <li className="flex items-start gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                  ✓
                </span>
                Works great on mobile and desktop
              </li>
            </ul> */}
          </div>

          <div className="p-8 lg:p-12 bg-white">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Login</h2>
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition duration-200"
              >
                {loading ? (
                  <BeatLoader height={8} width={2} margin={1} color="#fff" />
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-slate-500 text-sm">
              <a
                href="/forgot-password"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Forgot Password?
              </a>
            </div>

            <div className="mt-6 text-center text-slate-500 text-sm">
              No account?{" "}
              <a
                href="/signup"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
