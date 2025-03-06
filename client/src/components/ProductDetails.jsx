import React from "react";
import { X, Star, ShoppingCart, Heart } from "lucide-react";

const ProductDetails = ({ product, isOpen, onClose, onAddToCart, onToggleFavorite, quantity, onIncrement, onDecrement, isFavorite }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" style={{ 
        backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl overflow-hidden relative">
        {/* Close button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full z-10"
        >        
          <X size={24} />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Product Image */}
          <div className="md:w-1/2 p-8 flex items-center justify-center bg-gray-50">
            <img
              src={product.image}
              alt={product.name}
              className="w-full max-w-md h-auto object-contain"
            />
          </div>

          {/* Product Details */}
          <div className="md:w-1/2 p-8">
            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
            
            {/* Price */}
            <div className="flex items-center mb-4">
              <p className="text-2xl font-bold text-emerald-600">₹{product.price}.00</p>
              <p className="ml-2 text-gray-500">/ 1-PS</p>
            </div>
            
            {/* Rating */}
            <div className="flex items-center mb-6">
              <div className="flex mr-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={16} 
                    className={star <= 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
              <span className="text-gray-600 text-sm">(4.0)</span>
            </div>
            
            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600">
                Fresh {product.name} sourced directly from local farms. No pesticides used.
                Rich in nutrients and perfect for your daily cooking needs.
              </p>
            </div>
            
            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Quantity</h3>
              <div className="flex items-center border rounded-md w-fit">
                <button 
                  onClick={onDecrement} 
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-2 border-x">{quantity || 1}</span>
                <button 
                  onClick={onIncrement} 
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button 
                onClick={onAddToCart} 
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-md font-medium flex items-center justify-center"
              >
                <ShoppingCart size={20} className="mr-2" />
                Add to Cart
              </button>
              
              <button 
                onClick={onToggleFavorite} 
                className="p-3 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Heart 
                  size={20} 
                  fill={isFavorite ? "#02B290" : "none"} 
                  stroke={isFavorite ? "#02B290" : "currentColor"}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;