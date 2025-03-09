import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../../firebase.js'; // Make sure path is correct

const AppContext = createContext();

export function AppProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      // Reset and reload data when user changes
      setIsInitialized(false);
    });
    return () => unsubscribe();
  }, []);

  // Load data from localStorage only once on initial mount or when user changes
  useEffect(() => {
    if (!isInitialized) {
      try {
        // Use user-specific keys for localStorage
        const userKey = currentUser ? currentUser.uid : 'guest';
        
        const savedCart = localStorage.getItem(`cart_${userKey}`) 
          ? JSON.parse(localStorage.getItem(`cart_${userKey}`)) 
          : [];
        const savedFavorites = localStorage.getItem(`favorites_${userKey}`) 
          ? JSON.parse(localStorage.getItem(`favorites_${userKey}`)) 
          : [];

        setCart(savedCart);
        setFavorites(savedFavorites);

        // Calculate initial cart count
        const totalItems = savedCart.reduce((count, item) => count + (item.quantity || 0), 0);
        setCartCount(totalItems);
        setIsInitialized(true);
      } catch (error) {
        console.error("Error loading data from localStorage:", error);
        // Fallback to empty arrays if there's an error
        setCart([]);
        setFavorites([]);
        setCartCount(0);
        setIsInitialized(true);
      }
    }
  }, [currentUser, isInitialized]);

  // Save cart to localStorage whenever it changes, but only after initial load
  useEffect(() => {
    if (isInitialized) {
      try {
        // Use user-specific key for localStorage
        const userKey = currentUser ? currentUser.uid : 'guest';
        localStorage.setItem(`cart_${userKey}`, JSON.stringify(cart));
        
        // Update cart count based on current cart
        const totalItems = cart.reduce((count, item) => count + (item.quantity || 0), 0);
        setCartCount(totalItems);
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
      }
    }
  }, [cart, isInitialized, currentUser]);

  // Save favorites to localStorage whenever they change, but only after initial load
  useEffect(() => {
    if (isInitialized) {
      try {
        // Use user-specific key for localStorage
        const userKey = currentUser ? currentUser.uid : 'guest';
        localStorage.setItem(`favorites_${userKey}`, JSON.stringify(favorites));
      } catch (error) {
        console.error("Error saving favorites to localStorage:", error);
      }
    }
  }, [favorites, isInitialized, currentUser]);

  // Add to cart function
  const addToCart = (product, quantity = 1) => {
    // Ensure product has all required properties
    if (!product || !product.id) {
      console.error("Invalid product:", product);
      return;
    }

    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex !== -1) {
        // Update quantity if product already in cart
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity = (updatedCart[existingItemIndex].quantity || 0) + quantity;
        return updatedCart;
      } else {
        // Add new product to cart with required properties
        return [...prevCart, { 
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: quantity 
        }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateCartItemQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCart(prevCart => {
      return prevCart.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  // Toggle favorite function
  const toggleFavorite = (product) => {
    // Ensure product has all required properties
    if (!product || !product.id) {
      console.error("Invalid product:", product);
      return;
    }

    setFavorites(prevFavorites => {
      const isFavorite = prevFavorites.some(item => item.id === product.id);
      
      if (isFavorite) {
        // Remove from favorites
        return prevFavorites.filter(item => item.id !== product.id);
      } else {
        // Add to favorites with required properties
        return [...prevFavorites, { 
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image
        }];
      }
    });
  };

  // Check if product is in favorites
  const isProductFavorite = (productId) => {
    return favorites.some(item => item.id === productId);
  };

  const moveToCart = (product) => {
    addToCart(product, 1);
    // Optionally remove from favorites if you want that behavior
    // setFavorites(prevFavorites => prevFavorites.filter(item => item.id !== product.id));
  };

  const clearCartAndFavorites = () => {
    setCart([]);
    setFavorites([]);
    setCartCount(0);
  };

  return (
    <AppContext.Provider 
      value={{ 
        cart, 
        favorites, 
        cartCount, 
        currentUser,
        addToCart, 
        removeFromCart,
        updateCartItemQuantity,
        toggleFavorite, 
        isProductFavorite,
        moveToCart,
        clearCartAndFavorites
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