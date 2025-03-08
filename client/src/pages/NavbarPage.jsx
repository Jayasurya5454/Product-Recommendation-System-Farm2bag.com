import React, { useEffect, useState } from "react";
import { ShoppingCart, Search, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import img from "../assets/Logo_with_text.webp";
import { auth } from "../../firebase.js";
import { signOut } from "firebase/auth";
import SignInWithGoogle from "../components/SignInWithGoogle.jsx";
import { useAppContext } from "../components/AppContext"; // Ensure path is correct
import CartSidebar from "../components/CartSidebar";
import FavoritesSidebar from "../components/FavoritesSidebar";

function Navbar() {
  const [user, setUser] = useState(null);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isFavoritesOpen, setFavoritesOpen] = useState(false);
  const navigate = useNavigate();
  
  let cartCount = 0;
  let favorites = [];
  
  try {
    const appContext = useAppContext();
    cartCount = appContext?.cart?.length || 0;
    favorites = appContext?.favorites || [];
  } catch (error) {
    console.error("Context not available:", error);
  }

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await signOut(auth);
      setUser(null);
      navigate("/");
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
          {/* Logo */}
          <Link to="/">
            <div className="flex items-center cursor-pointer">
              <img src={img} alt="farm2bag logo" className="h-11 px-1" />
            </div>
          </Link>

          {/* Search Bar */}
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
          <div className="flex items-center space-x-8">
            {/* Favorites Icon */}
            <div className="relative cursor-pointer" onClick={() => setFavoritesOpen(true)}>
              <Heart size={24} className="text-gray-700 dark:text-black" />
              {favorites.length > 0 && (
                <span className="absolute -top-3 -right-3 bg-emerald-500 text-white text-sm px-2 rounded-full">
                  {favorites.length}
                </span>
              )}
            </div>

            {/* Cart Icon */}
            <div className="relative cursor-pointer" onClick={() => setCartOpen(true)}>
              <ShoppingCart size={24} className="text-gray-700 dark:text-black" />
              {cartCount > 0 && (
                <span className="absolute -top-3 -right-3 bg-emerald-500 text-white text-sm px-2 rounded-full">
                  {cartCount}
                </span>
              )}
            </div>

            {/* Authentication Button */}
            {user ? (
              <button onClick={handleLogout} className="cursor-pointer px-4 py-2 text-white bg-red-400 rounded-md hover:bg-red-600 transition-colors duration-300 flex items-center gap-2">
                Logout
              </button>
            ) : (
              <SignInWithGoogle />
            )}
          </div>
        </div>
      </nav>

      {/* Sidebars */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
      <FavoritesSidebar isOpen={isFavoritesOpen} onClose={() => setFavoritesOpen(false)} />
    </>
  );
}

export default Navbar;
