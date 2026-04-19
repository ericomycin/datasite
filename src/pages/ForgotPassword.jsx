import { useState } from "react";
import { auth } from "../config/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BeatLoader } from "react-spinners";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Check your inbox.");
      navigate("/login");
    } catch (error) {
      console.error("Error sending reset email:", error);
      toast.error("Error sending reset email: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#F3F4F6]">
      <div className="w-full max-w-md rounded-3xl shadow-2xl overflow-hidden bg-white/90 backdrop-blur-md border border-white/30 p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
          Reset Password
        </h2>
        <p className="text-slate-600 mb-6 text-center">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              "Send Reset Email"
            )}
          </button>
        </form>
        <div className="mt-6 text-center text-slate-500 text-sm">
          Remember your password?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
