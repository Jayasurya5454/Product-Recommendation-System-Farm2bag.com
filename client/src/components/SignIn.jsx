import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebase.js";
import SignUp from "./SignUp";
import logimg from "../assets/signup-banner.webp";
import log2img from "../assets/signin-banner.webp"
const SignIn = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [animationClass, setAnimationClass] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAnimationClass("animate-in");
    } else {
      setAnimationClass("");
    }
  }, [isOpen]);

  const toggleSignUp = () => {
    setShowSignUp(!showSignUp);
    setError("");
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setIsOpen(false);

      // Send user ID and email to backend
      await fetch("http://localhost:5000/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid: user.uid,
          email: user.email,
        }),
      });
    } catch (error) {
      setError("Authentication failed: " + error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      {/* Sign In Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 text-white bg-emerald-500 rounded-md hover:bg-emerald-600 transition-colors duration-300 flex items-center gap-2"
      >
        <User size={20} />
        <span>Sign In</span>
      </button>

      {/* Modal Popup */}
      {isOpen && (
        <div
          className={`fixed inset-0 flex items-center justify-center transition-opacity duration-300 ${
            animationClass === "animate-in" ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
        >
          <div
            className={`bg-white rounded-lg shadow-lg w-full max-w-4xl flex transition-all duration-300 relative ${
              animationClass === "animate-in" ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Image Section */}
            <div className="hidden md:block w-1/2">
              <img src={logimg} alt="Farm2Bag Banner" className="w-full h-full object-cover rounded-l-lg" />
            </div>

            {/* Right Content Section */}
            <div className="w-full md:w-1/2 p-8">
              {/* Close button */}
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>

              <div className="flex justify-center mb-4">
                <div className="flex items-center">
                  <img src={log2img} alt="Farm2Bag Logo" className="h-10" />
                  <span className="text-xl font-bold text-green-600 ml-2">farm2bag</span>
                </div>
              </div>

              {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

              {!showSignUp ? (
                <>
                  <h2 className="text-2xl font-bold mb-4 text-center">Welcome Back!</h2>
                  <p className="text-center mb-6">
                    Don't have an account?
                    <button className="text-green-500 ml-2 hover:underline" onClick={toggleSignUp}>
                      Create Account
                    </button>
                  </p>

                  <form onSubmit={handleSignIn}>
                    <div className="mb-4">
                      <label className="block mb-2">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border rounded focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block mb-2">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border rounded focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                        placeholder="Enter your password"
                        required
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          type="button"
                          className="text-sm text-green-500 hover:underline"
                          onClick={() => alert("Password reset functionality would go here")}
                        >
                          Forgot Password?
                        </button>
                      </div>
                    </div>

                    <button type="submit" className="w-full py-3 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                      Sign In
                    </button>
                  </form>
                </>
              ) : (
                <SignUp onSignIn={toggleSignUp} onClose={() => setIsOpen(false)} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignIn;
