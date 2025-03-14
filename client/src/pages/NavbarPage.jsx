import React, { useEffect, useState } from "react";
import { ShoppingCart, Search, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import img from "../assets/Logo_with_text.webp";
import { auth } from "../../firebase.js";
import SignInWithGoogle from "../components/SignInWithGoogle.jsx";
import { useAppContext } from "../components/AppContext"; 
import CartSidebar from "../components/CartSidebar";
import FavoritesSidebar from "../components/FavoritesSidebar";
import SearchBar from "../components/Searchbar.jsx";
import RegisterForm from "../components/RegisterForm.jsx";

function Navbar() {
  const [user, setUser] = useState(null);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isFavoritesOpen, setFavoritesOpen] = useState(false);
  
  // Use context properly
  const { cartCount, favorites } = useAppContext();
  const favoritesCount = favorites?.length || 0;

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
          
          <SearchBar/>

          {/* Icons & Buttons */}
          <div className="flex items-center space-x-8">
            {/* Favorites Icon */}
            <div className="relative cursor-pointer" onClick={() => setFavoritesOpen(true)}>
              <Heart size={24} className="text-gray-700 dark:text-black" />
              {favoritesCount > 0 && (
                <span className="absolute -top-3 -right-3 bg-emerald-500 text-white text-sm px-2 rounded-full">
                  {favoritesCount}
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
           <RegisterForm/>
            {/* Authentication Button - Using SignInWithGoogle component */}
            <SignInWithGoogle />
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