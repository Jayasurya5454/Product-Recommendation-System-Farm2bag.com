import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Homepage from "../src/pages/Home";
import Favorites from "./pages/FavoritesPage";
import SearchProducts from "./pages/Searchproduct";
import Products from "./pages/ProductsPage";
import { AppProvider } from "./components/AppContext";
function App() {
  return (
    <AppProvider>
    <Router>
      <Routes>
      <Route path="/" element={<Homepage />} />
        <Route path="/search/category/:id" element={<SearchProducts />} />
        <Route path="/wishlist" element={<Favorites/>}/>  
        <Route path="/product/:id" element={<Products/>} />      
      </Routes>
    </Router>
    </AppProvider>
  );
}

export default App;