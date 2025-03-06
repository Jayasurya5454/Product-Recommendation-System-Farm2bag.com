import React from "react";
import Spinach from "../assets/images_home/Spinach.webp";
import fruits from "../assets/images_home/fruits.webp";
import grains from "../assets/images_home/grains.webp";
import  grocery from "../assets/images_home/grocery.webp";
import  pickle from "../assets/images_home/pickle.webp";
import  podi from "../assets/images_home/podi.webp";
import  rice from "../assets/images_home/rice.webp";
import  tveg from "../assets/images_home/tveg.webp";
import { Link } from "react-router-dom";


const categories = [
  { id: 1, name: "Spinach Leaf Varieties", image: Spinach },
  { id: 2, name: "Traditional Vegetables", image: tveg },
  { id: 3, name: "Grains and Pulses", image: grains },
  { id: 4, name: "Fruits", image: fruits },
  { id: 5, name: "Grocery & Provisions", image: grocery },
  { id: 6, name: "Grains & Pulses", image: pickle },
  { id: 7, name: "Podi Varieties", image: podi  },
  { id: 8, name: "Traditional Rice Varieties", image: rice },
];

const CategoryList = () => {
 
  return (
    <div className=" mt-4  mx-auto text-center py-10">
      <h2 className="text-2xl font-semibold">Category List</h2>
      <p className="text-gray-600 mb-6 mt-4 text-lg">
        Explore 1,000+ trusted organic farm products, curated into 30+ categories—shop now!
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 px-2">
  {categories.map((category) => (
    <div key={category.id} className="flex flex-col items-center">
  <Link to={`search/category/${category.id}`}>
  <img
        src={category.image}
        alt={category.name}
        className="w-36 h-36 rounded-full shadow-md object-cover"
      />
      <p className="text-sm font-medium mt-2 w-30 text-center truncate">
        {category.name}
      </p>
      </Link>
    </div>
  ))}
</div>

    </div>
  );
};

export default CategoryList;
