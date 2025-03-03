// SignUp.js
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebase.js";

const SignUp = ({ onSignIn, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    // Validate password strength
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    setIsLoading(true);
    try {
      // Create user with email and password
      await createUserWithEmailAndPassword(auth, email, password);
      setIsLoading(false);
      onClose(); // Close the modal after successful signup
    } catch (error) {
      setIsLoading(false);
      setError("Sign up failed: " + error.message);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>
      <p className="text-center mb-6">
        Already have an account?
        <button 
          className="text-green-500 ml-2 hover:underline"
          onClick={onSignIn}
        >
          Sign In
        </button>
      </p>
      
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            placeholder="Create a password"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block mb-2">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            placeholder="Confirm your password"
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full py-3 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </>
  );
};

export default SignUp;