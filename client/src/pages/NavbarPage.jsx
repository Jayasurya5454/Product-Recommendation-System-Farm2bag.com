import React from "react";
import { ShoppingCart, User, Search, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import img from "../assets/Logo_with_text.webp";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 w-full h-20 bg-white shadow-xs z-20">
        <div className="container mx-auto flex justify-between items-center px-4 h-full">
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
          <div className="flex items-center space-x-10">
            <div className="relative cursor-pointer">
              <Link to="/favorites">
                <Heart size={24} className="text-gray-700 dark:text-black" />
              </Link>
            </div>

            <div className="relative cursor-pointer">
              <Link to="/addcart" className="flex items-center space-x-2">
              <div className="relative">

                <ShoppingCart size={24} className="text-gray-700 dark:text-black" />
        
                <span className="absolute -top-3 -right-3 bg-emerald-500 text-white text-sm px-2 rounded-full">
                  0
                </span>
                </div>
                <span>Cart</span>
              </Link>
            </div>

            <div
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-2 transition-all duration-300 cursor-pointer"
            >
              <User size={24} />
              <span>Sign In</span>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
