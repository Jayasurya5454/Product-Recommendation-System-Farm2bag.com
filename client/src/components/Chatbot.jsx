import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from "../utils/axios";
import axios from "axios"

const Chatbot = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const productsEndRef = useRef(null);
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_MODEL_BACKEND;
  // Fetch products when the chatbot is opened
  
  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      scrollToBottom();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    productsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Function to fetch products from the backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${backendUrl}/${userId || "null"}`);
      
      // Transform the product data to match the expected structure
      const transformedProducts = response.data.map(product => ({
        id: product._id, // Ensure we have id property
        name: product.title || product.name, // Map title to name
        price: product.price,
        image: product.photos || product.image, // Map photos to image
        description: product.description
      }));
      
      setProducts(transformedProducts);
    } catch (err) {
      setError("Failed to fetch products. Please try again later.");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    setIsOpen(false); // Close the chatbot after navigation
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Chatbot Icon Button */}
      <button 
        onClick={toggleChatbot}
        className="fixed bottom-4 right-4 bg-emerald-600 text-white p-3 rounded-full shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 z-50"
        aria-label="Toggle Product Finder"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        )}
      </button>

      {/* Background Overlay - Only visible when chatbot is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
          onClick={toggleChatbot}
          aria-hidden="true"
        ></div>
      )}

      {/* Products Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'transform-none' : 'transform translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="bg-emerald-600 p-4 text-white">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold">Our Products</h1>
              <button 
                onClick={toggleChatbot}
                className="text-white focus:outline-none"
                aria-label="Close Product Finder"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {loading && (
              <div className="flex justify-center items-center py-6">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
                <p>{error}</p>
              </div>
            )}
            
            {!loading && !error && products.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <p>No products available at this time.</p>
              </div>
            )}
            
            {products.map((product) => (
              <div 
                key={product.id} 
                className="mb-4 bg-white rounded-lg shadow-sm p-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleProductClick(product.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="h-16 w-16 bg-gray-50 rounded flex items-center justify-center p-1">
                    <img 
                      src={product.image || "https://via.placeholder.com/64x64?text=No+Image"} 
                      alt={product.name} 
                      className="h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm mb-1 truncate">{product.name}</h3>
                    <p className="text-emerald-600 font-bold">₹{product.price?.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={productsEndRef} />
          </div>
          
          <div className="p-4 border-t bg-white">
            <div className="text-center text-sm text-gray-500">
              Click on any product to view details
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbot;