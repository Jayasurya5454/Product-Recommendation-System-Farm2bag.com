import React, { useEffect, useState } from "react";
import { ShoppingCart, Search, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import img from "../assets/Logo_with_text.webp";
import { auth } from "../../firebase.js";
import { signOut } from "firebase/auth";
import SignInWithGoogle from "../components/SignInWithGoogle.jsx";


function Navbar() {
  const [user, setUser] = useState(null);
   const navigate = useNavigate();

  const handleLogout =async () => {
     await signOut(auth);
     const confirmLogout = window.confirm("Are you sure you want to log out?");
      if (confirmLogout) {
     setUser(null);
     navigate("/");
     console.log("User logged out"); 
    }
  };
  
  

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 w-full h-20 bg-white shadow-xs z-20">
        <div className="container mx-auto flex justify-around items-center px-4 h-full">
          {/* Logo positioned left */}
          <Link to="/">
            <div className="flex items-center cursor-pointer">
              <img src={img} alt="farm2bag logo" className="h-11 px-1" />
            </div>
          </Link>

          {/* Search Bar with Proper Border Fix */}
          <div className="relative w-200 border border-gray-600 rounded-md"> 
            <input
              type="text"
              placeholder="What are you looking for..."
              className="w-full px-6 py-3 bg-gray-1000 border-none focus:ring-1 rounded-sm outline-none"
            />
            <Search
              size={20}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            />
          </div>

          {/* Icons & Buttons */}
          <div className="flex items-center space-x-6">
            <div className="relative cursor-pointer items-start ">
              <Link to="/favorites">
                <Heart size={24} className="text-gray-700 dark:text-black" />
              </Link>
            </div>

            <div className="relative cursor-pointer ">
              <Link to="/addcart" className="flex items-end  space-x-2">
              <div className="relative ">

                <ShoppingCart size={24} className="text-gray-700 dark:text-black" />
        
                <span className="absolute -top-3 -right-3 bg-emerald-500 text-white text-sm px-2 rounded-full">
                  0
                </span>
                </div>
                <span>Cart</span>
              </Link>
            </div>

            {/* <div
              
              className="flex items-center cursor-pointer"
            >
              
              <SignIn/>
            </div> */}
              {user ? (
            <button onClick={handleLogout} className=" cursor-pointer px-4 py-2 text-white bg-red-400 rounded-md hover:bg-red-600 transition-colors duration-300 flex items-center gap-2">
              Logout
            </button>
          ) : (
            <SignInWithGoogle />
          )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
