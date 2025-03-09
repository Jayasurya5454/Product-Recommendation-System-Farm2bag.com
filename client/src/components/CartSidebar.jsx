import React, { useState, useEffect } from "react";
import { X, Trash2, ShoppingBag, Minus, Plus, Check } from "lucide-react";
import { useAppContext } from "./AppContext"; // Adjust path as needed
import { axiosInstance } from "../utils/axios"; // Axios instance for API calls
import { auth } from "../../firebase"; // Firebase authentication
import { v4 as uuidv4 } from "uuid"; // Unique session ID generator

const CartSidebar = ({ isOpen, onClose }) => {
  const { 
    cart, 
    removeFromCart, 
    updateCartItemQuantity 
  } = useAppContext();
  
  const [userId, setUserId] = useState(null);
  const [sessionId, setSessionId] = useState(() => uuidv4());
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setUserId(user.uid);
    });

    return () => unsubscribe();
  }, []);

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 1) {
      updateCartItemQuantity(productId, newQuantity);
    }
  };

  const getDeviceType = () => {
    const userAgent = navigator.userAgent;
    if (/Mobi|Android/i.test(userAgent)) return "mobile";
    if (/iPad|Tablet/i.test(userAgent)) return "tablet";
    return "desktop";
  };

  const getTimeOfDay = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) return "morning";
    if (hours >= 12 && hours < 17) return "afternoon";
    if (hours >= 17 && hours < 21) return "evening";
    return "night";
  };

  const sendPurchaseEvent = async () => {
    if (!userId || cart.length === 0) return;

    setIsCheckingOut(true);

    // Based on error message, we need to match the exact structure expected by backend
    // The error indicates "AllProduct validation failed: productId: Path `productId` is required"
    const eventData = {
      userId,
      productId: cart[0].id, // Add the required productId field
      eventType: "purchase",
      context: {
        device: getDeviceType(),
        timeOfDay: getTimeOfDay(),
        cartItems: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1
        })),
        totalAmount: calculateTotal()
      },
      sessionId
    };

    try {
      const response = await axiosInstance.post("/event", eventData);
      console.log("Purchase event sent successfully!", response.data);
      setCheckoutSuccess(true);
      
      // Reset checkout state after displaying success message
      setTimeout(() => {
        setCheckoutSuccess(false);
        setIsCheckingOut(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error sending purchase event:", error.response ? error.response.data : error.message);
      setIsCheckingOut(false);
    }
  };

  // If sidebar is closed, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" style={{ pointerEvents: isOpen ? 'auto' : 'none' }}>
      {/* Semi-transparent overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" 
        style={{ 
            backgroundColor: "rgba(0, 0, 0, 0.4)" }}
        onClick={onClose}
      />
      
      {/* Sidebar container */}
      <div 
        className="absolute top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl transition-transform duration-300"
        style={{ 
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Your Cart ({cart.length})</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content area */}
        <div className="h-full overflow-auto pb-32">
          {/* Success message overlay */}
          {checkoutSuccess && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                  <Check size={32} className="text-emerald-600" />
                </div>
                <h3 className="text-xl font-medium text-emerald-600 mb-2">Order Placed Successfully!</h3>
                <p className="text-gray-600">Thank you for your purchase</p>
              </div>
            </div>
          )}
          
          <div className="p-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <ShoppingBag size={64} className="text-gray-300 mb-4" />
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center p-4 border-b">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="ml-4 flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-emerald-600 font-medium">₹{item.price}.00</p>
                      <div className="flex items-center mt-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, (item.quantity || 1) - 1)}
                          className="p-1 bg-gray-100 rounded-full"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-2">{item.quantity || 1}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, (item.quantity || 1) + 1)}
                          className="p-1 bg-gray-100 rounded-full"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-gray-500 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Footer with checkout button */}
        {cart.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t shadow-md">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Subtotal:</span>
              <span className="font-bold text-lg">₹{calculateTotal()}.00</span>
            </div>
            <button 
              onClick={sendPurchaseEvent}
              disabled={isCheckingOut}
              className={`w-full ${isCheckingOut ? 'bg-emerald-400' : 'bg-emerald-600 hover:bg-emerald-700'} text-white py-3 px-4 rounded font-medium flex items-center justify-center`}
            >
              {isCheckingOut ? (
                <>
                  <span className="mr-2">Processing...</span>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </>
              ) : (
                "Proceed to Checkout"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;