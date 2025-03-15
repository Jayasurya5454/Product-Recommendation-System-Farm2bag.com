import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../utils/axios";
import { auth } from "../../firebase";
import { v4 as uuidv4 } from "uuid";

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [userId, setUserId] = useState(null);
  const [sessionId] = useState(() => uuidv4());
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Get user ID on component mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setUserId(user.uid);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchTerm.trim() === "") {
        setSearchResults([]);
        setShowResults(false);
        return;
      }
      setIsSearching(true);

      try {
        const response = await axiosInstance.get("/product/search", {
          params: { description: searchTerm },
        });

        if (response.data && Array.isArray(response.data)) {
          setSearchResults(response.data.slice(0, 6));
          setShowResults(true);
        } else {
          console.error("Unexpected response format:", response.data);
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchSearchResults();
      }
    }, 200);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

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

  const sendEvent = async (product, eventType) => {
    if (!userId || !product) return;

    const eventData = {
      userId,
      productId: product._id,
      eventType,
      context: {
        device: getDeviceType(),
        timeOfDay: getTimeOfDay(),
        page: "search",
        searchTerm: searchTerm
      },
      sessionId
    };

    try {
      const response = await axiosInstance.post("/event", eventData);
      console.log(`Event "${eventType}" sent successfully!`, response.data);
    } catch (error) {
      console.error("Error sending event:", error.response ? error.response.data : error.message);
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() === "") {
      setShowResults(false);
    }
  };

  const handleProductClick = (product) => {
    // Send search event before navigation
    sendEvent(product, "search");
    
    // Navigate to product page
    navigate(`/product/${product._id}`);
    setShowResults(false);
    setSearchTerm("");
  };

  const clearSearch = () => {
    setSearchTerm("");
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="What are you looking for..."
          className="w-full px-10 py-3 bg-white border border-gray-300 rounded-md outline-none text-gray-800"
          onFocus={() => searchTerm.trim() !== "" && setShowResults(true)}
        />
        <Search size={20} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
        {searchTerm && (
          <X
            size={18}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
            onClick={clearSearch}
          />
        )}
      </div>

      {showResults && (
        <div className="absolute z-30 w-full mt-1 bg-white rounded-md shadow-lg overflow-hidden">
          {isSearching ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : searchResults.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {searchResults.map((product) => (
                <li
                  key={product._id}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="flex-shrink-0 w-8 h-8 mr-3">
                  <img
                    src={product.photos}
                    alt={product.title}
                    className="w-full h-full object-cover rounded"
                     onError={(e) => {
                       e.target.onerror = null; // Prevent infinite loop
                       e.target.src = "https://via.placeholder.com/50";
                     }}
                    />
                  </div>
                  <span className="flex-grow text-sm">{product.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">No products found</div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;