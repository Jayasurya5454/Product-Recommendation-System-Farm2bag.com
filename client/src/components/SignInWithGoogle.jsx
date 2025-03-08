import { useState, useEffect } from "react";
import { axiosInstance } from "../utils/axios.js";
import { User } from "lucide-react";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase.js";
import logimg from "../assets/signup-banner.webp";
import log2img from "../assets/signin-banner.webp";

const SignInWithGoogle = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

 
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setModalVisible(true), 10);
    } else {
      setModalVisible(false);
    }
  }, [isOpen]);

 
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setError("");

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("User Data:", { userid: user.uid, email: user.email });
      await axiosInstance.post("/user", {
        email: user.email,
        userid: user.uid,  
      });

      setModalVisible(false);
      setTimeout(() => setIsOpen(false), 300);
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled. Please try again when you're ready.");
      } else {
        setError("Google Sign-In failed: " + error.message);
      }
    }
  };

  
  const closeSignInModal = () => {
    setModalVisible(false);
    setTimeout(() => setIsOpen(false), 300);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      {user ? (
        <div className="flex items-center gap-4">
          <p>Welcome, {user.email}</p>
          <button
            className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 text-white bg-emerald-500 cursor-pointer rounded-md hover:bg-emerald-600 flex items-center gap-2 transition"
        >
          <User size={20} />
          <span>Sign In</span>
        </button>
      )}

      {/* Google Sign-In Modal with Animation */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out"
             style={{ opacity: modalVisible ? 1 : 0 ,
             backgroundColor: "rgba(0, 0, 0, 0.4)" }}>

          <div 
            className="bg-white rounded-lg shadow-lg w-full max-w-4xl flex transition-all duration-300 ease-in-out"
            style={{ 
              transform: modalVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
              opacity: modalVisible ? 1 : 0
            }}
          >
            <div className="hidden md:block w-1/2">
              <img src={logimg} alt="Banner" className="w-full h-full object-cover rounded-l-lg" />
            </div>
            <div className="w-full md:w-1/2 p-8 relative">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={closeSignInModal}>
                ✕
              </button>
              <div className="flex justify-center mb-4">
                <div className="flex items-center">
                  <img src={log2img} alt="Logo" className="h-10" />
                  <span className="text-xl font-bold text-green-600 ml-2">farm2bag</span>
                </div>
              </div>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-center">
                  {error}
                </div>
              )}
              
              <h2 className="text-2xl font-bold mb-4 text-center">Welcome Back!</h2>
              <p className="text-center mb-6">
                Sign in to access your farm2bag account
              </p>
              
              <div className="mb-6">
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full py-3 bg-white border cursor-pointer border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center gap-2 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
              
              <p className="text-center mt-6 text-sm text-gray-500">
                By continuing, you agree to farm2bag's Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignInWithGoogle;