import React from "react";
import { X, Heart } from "lucide-react";
import { useAppContext } from "./AppContext"; // Adjust path as needed

const FavoritesSidebar = ({ isOpen, onClose }) => {
  const { 
    favorites, 
    toggleFavorite, 
    //addToCart 
  } = useAppContext();

 

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
          <h2 className="text-xl font-semibold">Your Favorites ({favorites.length})</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content area */}
        <div className="h-full overflow-auto">
          <div className="p-4">
            {favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Heart size={64} className="text-gray-300 mb-4" />
                <p className="text-gray-500">No favorites yet</p>
              </div>
            ) : (
              <>
                {favorites.map((item) => (
                  <div key={item.id} className="flex items-center p-4 border-b">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="ml-4 flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-emerald-600 font-medium">₹{item.price}.00</p>
                      {/* <button
                        onClick={() => handleMoveToCart(item)}
                        className="mt-2 px-3 py-1 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                      >
                        Add to cart
                      </button> */}
                    </div>
                    <button
                      onClick={() => toggleFavorite(item)}
                      className="p-2 text-emerald-500"
                    >
                      <Heart size={16} fill="#02B290" />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoritesSidebar;