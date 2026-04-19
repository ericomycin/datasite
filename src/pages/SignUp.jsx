import { useState } from "react";
import { auth } from "../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
// import { googleProvider } from "../config/firebase";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import "../App.css";

export default function SignUp() {
  // Declaring State Variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [telephone, setTelephone] = useState("");
  const [loading, setLoading] = useState(false);
  // const [googleSignLoading, setGoogleSignLoading] = useState(false);

  //Navigation
  const navigate = useNavigate();
  // Determine Password Strength
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };
  const passwordStrength = getPasswordStrength(password);
  const getStrengthLabel = (strength) => {
    if (strength === 0) return "";
    if (strength <= 2) return "Weak";
    if (strength <= 3) return "Fair";
    if (strength <= 4) return "Good";
    return "Strong";
  };
  const getStrengthColor = (strength) => {
    if (strength <= 2) return "bg-red-500";
    if (strength <= 3) return "bg-yellow-500";
    if (strength <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  // Add User Info/Details to Database
  const addUserInfo = async () => {
    try {
      const docRef = await addDoc(collection(db, "users"), {
        email: email,
        fullName: fullName,
        telephone: telephone,
        userId: auth?.currentUser?.uid,
        wallet: 0,
        role: "Agent",
        isActive: false,
        createdAt: new Date(),
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  //Submit Form
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (confirmPassword !== password) {
      toast.error("Passwords do not match");

      return;
    }
    if (!email || !password || !confirmPassword || !fullName || !telephone) {
      toast.error("All fields are required");

      return;
    }
    try {
      setLoading(true);
      // const userCredential =
       await createUserWithEmailAndPassword(auth, email, password);
// await sendEmailVerification(userCredential.user);
      addUserInfo();
      setLoading(false);
      toast.success("Account created successfully");
      navigate("/login");
    } catch (error) {
      if (error.code === "auth/weak-password") {
        toast.error("Password must be at least 8 characters");
        setLoading(false);
      } else if (error.code === "auth/email-already-in-use") {
        toast.error("Email already in use");
        setLoading(false);
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email address");
        setLoading(false);
      } else {
        toast.error("Something went wrong. Please check again");
        setLoading(false);
      }
    }
  };

  // const handleSignInWithGoogle = async (e) => {
  //   e.preventDefault();
  //   setGoogleSignLoading(true);
  //   try {
  //     await signInWithPopup(auth, googleProvider);
  //     setGoogleSignLoading(false);
  //   } catch (error) {
  //     console.log(error);
  //     setGoogleSignLoading(false);
  //   }
  //   console.log("Email:", email, "Password:", password);
  //   console.log(auth?.currentUser);
  //   console.log(auth);
  // };
  console.log(auth?.currentUser);

  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#F3F4F6]">
        <div className="w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden bg-white/90 backdrop-blur-md border border-white/30 grid grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col justify-center gap-6 p-10 lg:p-10 bg-linear-to-br from-indigo-700 via-indigo-600 to-cyan-500 text-white">
            <h1 className="text-2xl md:text-3xl font-extrabold">Data Hub</h1>
            {/* <p className="text-sm md:text-base text-indigo-100 max-w-xl leading-relaxed">
              Create your account and get access to powerful insights, easy data
              management, and real-time analytics. Sign up in seconds and start
              growing your business with confidence.
            </p> */}
            {/* <ul className="space-y-3 text-sm md:text-base">
              <li className="flex items-start gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                  ✓
                </span>
                Fast, secure authentication
              </li>
              <li className="flex items-start gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                  ✓
                </span>
                One-click Google sign in
              </li>
              <li className="flex items-start gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                  ✓
                </span>
                Mobile-friendly responsive design
              </li>
            </ul> */}
          </div>

          <div className="p-8 lg:p-12 bg-white">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Sign Up</h2>
            <form onSubmit={handleSignUp} className="space-y-5">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Telephone
                </label>
                <input
                  type="tel"
                  placeholder="Enter your telephone"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {getStrengthLabel(passwordStrength)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Password must be at least 8 characters with uppercase,
                      lowercase, number, and special character
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm password"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {confirmPassword && (
                <div>
                  {confirmPassword === password ? (
                    <span className="text-[green]">Passwords match</span>
                  ) : (
                    <span className="text-[red]">Passwords do not match</span>
                  )}
                </div>
              )}
              <button
                disabled={loading}
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition duration-200"
              >
                {loading ? (
                  <BeatLoader height={8} width={2} margin={1} color="#fff" />
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>

            {/* <button
              onClick={handleSignInWithGoogle}
              className="mt-4 w-full py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition duration-200"
            >
              {googleSignLoading ? (
                <BeatLoader height={8} width={2} margin={1} color="#fff" />
              ) : (
                "Join With Google"
              )}
            </button> */}

            <div className="mt-6 text-center text-slate-500 text-sm">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Log in
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
