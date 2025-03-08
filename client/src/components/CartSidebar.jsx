import React from "react";
import { X, Trash2, ShoppingBag } from "lucide-react";
import { useAppContext } from "./AppContext"; // Adjust path as needed

const CartSidebar = ({ isOpen, onClose }) => {
  const { 
    cart, 
    removeFromCart, 
    //updateCartItemQuantity 
  } = useAppContext();

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

//   const handleQuantityChange = (productId, newQuantity) => {
//     if (newQuantity >= 1) {
//       updateCartItemQuantity(productId, newQuantity);
//     }
//   };

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
                        
                        <span className="px-2">{item.quantity}</span>
                        
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
            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded font-medium">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;