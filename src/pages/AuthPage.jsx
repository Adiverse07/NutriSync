// AuthPage.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import {
  doSignInWithEmailAndPassword,
  doSignInWithGoogle,
  doPasswordReset,
  doCreateUserWithEmailAndPassword,
  doSignOut,
} from "../firebase/auth";
import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// If you prefer component-scoped styles, you can import a CSS file here
// import "./AuthPage.css";

function AuthPage() {
  useEffect(() => {
    console.log("AuthPage Mounted!");
  }, []);

  const navigate = useNavigate();

  // form states
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");

  // heart-following-mouse states
  const circleRef = useRef(null);
  const [heartPos, setHeartPos] = useState({ x: 0, y: 0 });

  // track mouse inside circle, clamp within ±6px
  const handleMouseMove = (e) => {
    const rect = circleRef.current.getBoundingClientRect();
    const radius = rect.width / 2;
    const centerX = rect.left + radius;
    const centerY = rect.top + radius;
    const x = e.clientX - centerX;
    const y = e.clientY - centerY;
    const clamp = (v) => Math.max(-6, Math.min(6, v));
    setHeartPos({ x: clamp(x), y: clamp(y) });
  };
  const handleMouseLeave = () => setHeartPos({ x: 0, y: 0 });

  // Email/password signup
  const handleEmailSignup = async () => {
    setError("");
    try {
      const user = await doCreateUserWithEmailAndPassword(email, password);
      if (!user?.uid) throw new Error("User object invalid or missing UID.");

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        age,
        height,
        weight,
        createdAt: serverTimestamp(),
      });

      alert("Signup successful! ✅");
      navigate("/home");
    } catch (err) {
      setError(`Signup failed: ${err.message}`);
      console.error(err);
    }
  };

  // Google authentication (signup & login)
  const handleGoogleAuth = async () => {
    setError("");
    try {
      const { user } = await doSignInWithGoogle();
      if (!user?.uid) throw new Error("Invalid Google user.");

      const uid = user.uid;
      const userRef = doc(db, "users", uid);
      const snap = await getDoc(userRef);

      if (isLogin) {
        if (!snap.exists()) {
          await doSignOut();
          throw new Error(
            "No account found for this Google user. Please sign up first."
          );
        }
        await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
        alert("Signed in with Google ✅");
      } else {
        if (snap.exists()) {
          throw new Error("User already exists—please sign in instead.");
        }
        await setDoc(userRef, {
          name: name || user.displayName || "",
          email: user.email,
          age,
          height,
          weight,
          createdAt: serverTimestamp(),
        });
        alert("Signed up with Google ✅");
      }

      navigate("/home");
    } catch (err) {
      setError(`Google authentication failed: ${err.message}`);
      console.error(err);
    }
  };

  // Email/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await doSignInWithEmailAndPassword(email, password);
      alert("Login Successful! ✅");
      navigate("/home");
    } catch (err) {
      setError(`Login failed: ${err.message}`);
      console.error(err);
    }
  };

  // Password reset
  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email first.");
      return;
    }
    try {
      await doPasswordReset(email);
      alert("Password reset email sent! ✅");
    } catch (err) {
      setError(`Password reset failed: ${err.message}`);
    }
  };

  return (
    <>
      {/* If you want to include the keyframes in a style tag */}
      <style jsx>{`
        @keyframes neon-breathe {
          0%, 100% {
            text-shadow:
              0 0 4px rgba(139,92,246,0.6),
              0 0 8px rgba(139,92,246,0.4);
          }
          50% {
            text-shadow:
              0 0 12px rgba(139,92,246,1),
              0 0 24px rgba(139,92,246,0.8);
          }
        }
        .animate-neon-breathe {
          animation: neon-breathe 2.5s ease-in-out infinite;
        }
      `}</style>

      <div className="relative min-h-screen flex items-center justify-center bg-aesthetic-radial">
        {/* ——— Breathing Neon “Nutri” & “Sync” ——— */}
        <span
          className="hidden md:block absolute left-6 top-1/2 transform -translate-y-1/2 text-8xl font-poppins font-semibold text-transparent animate-neon-breathe"
          style={{ WebkitTextStroke: "2px #8b5cf6" }}
        >
          Nutri
        </span>
        <span
          className="hidden md:block absolute right-6 top-1/2 transform -translate-y-1/2 text-8xl font-poppins font-semibold text-transparent animate-neon-breathe"
          style={{ WebkitTextStroke: "2px #8b5cf6" }}
        >
          Sync
        </span>

        <div className="w-full max-w-md px-8 py-10 mx-4">
          <div className="text-center mb-8">
            {/* Interactive Heart Circle */}
            <div
              ref={circleRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 mb-4 relative overflow-hidden"
            >
              <Heart
                className="w-8 h-8 text-white absolute transition-transform duration-75"
                style={{
                  transform: `translate(${heartPos.x}px, ${heartPos.y}px)`,
                }}
              />
            </div>

            <h2 className="text-3xl font-bold text-white">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-gray-400 mt-2">
              {isLogin
                ? "Enter your details to access your health journey"
                : "Start your personalized wellness experience"}
           </p>
          </div>

          <form
            onSubmit={isLogin ? handleLogin : (e) => e.preventDefault()}
            className="space-y-5"
          >
            {!isLogin && (
              <>
                {/* Name, Age, Height, Weight fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 rounded-lg bg-[#242442] border border-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 30"
                    className="w-full px-4 py-3 rounded-lg bg-[#242442] border border-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="e.g. 175"
                    className="w-full px-4 py-3 rounded-lg bg-[#242442] border border-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g. 68"
                    className="w-full px-4 py-3 rounded-lg bg-[#242442] border border-gray-700 text-white"
                  />
                </div>
              </>
            )}

            {/* Email & Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg bg-[#242442] border border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-[#242442] border border-gray-700 text-white"
              />
            </div>

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-violet-400 hover:text-violet-300 transition"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {isLogin ? (
                <>
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg hover:opacity-90 transition"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    className="w-full py-3 px-4 bg-[#242442] border border-gray-700 rounded-lg text-white flex items-center justify-center gap-2 hover:bg-[#2a2a4a] transition"
                  >
                    <img
                      src="https://www.google.com/favicon.ico"
                      alt="Google"
                      className="w-5 h-5"
                    />
                    Sign In with Google
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleEmailSignup}
                    className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg hover:opacity-90 transition"
                  >
                    Sign Up with Email
                  </button>
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    className="w-full py-3 px-4 bg-[#242442] border border-gray-700 rounded-lg text-white flex items-center justify-center gap-2 hover:bg-[#2a2a4a] transition"
                  >
                    <img
                      src="https://www.google.com/favicon.ico"
                      alt="Google"
                      className="w-5 h-5"
                    />
                    Sign Up with Google
                  </button>
                </>
              )}
            </div>

            {/* Toggle Login/Signup */}
            <p className="text-center text-gray-400 text-sm mt-4">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-violet-400 hover:text-violet-300 font-medium transition"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

export default AuthPage;
