import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  // Add to cart function
  const addToCart = (product, quantity) => {
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex !== -1) {
      // Update quantity if product already in cart
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
      setCart(updatedCart);
    } else {
      // Add new product to cart
      setCart([...cart, { ...product, quantity }]);
    }
    
    // Update cart count
    setCartCount(prevCount => prevCount + quantity);
  };

  // Toggle favorite function
  const toggleFavorite = (product) => {
    const isFavorite = favorites.some(item => item.id === product.id);
    
    if (isFavorite) {
      // Remove from favorites
      setFavorites(favorites.filter(item => item.id !== product.id));
    } else {
      // Add to favorites
      setFavorites([...favorites, product]);
    }
  };

  // Check if product is in favorites
  const isProductFavorite = (productId) => {
    return favorites.some(item => item.id === productId);
  };

  return (
    <AppContext.Provider 
      value={{ 
        cart, 
        favorites, 
        cartCount, 
        addToCart, 
        toggleFavorite, 
        isProductFavorite 
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}