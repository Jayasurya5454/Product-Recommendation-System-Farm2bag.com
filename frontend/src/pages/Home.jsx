import React from "react";
import Navbar from "../pages/Navbar";
import leftimage from "../assets/Farm2bag Banner.webp";
import rightimage from "../assets/Juice2Bag Banner.webp";
import card1 from "../assets/cards/ComboBag.jpg";
import card2 from "../assets/cards/Dailyfresh.jpg";
import card3 from "../assets/cards/Juice2bag.jpg";
import card4 from "../assets/cards/Seasonal.jpg";

const cardData = [
  {
    id: 1,
    image: card1,
    title: "Organic Fruits",
    description: "Fresh organic fruits sourced directly from farms.",
  },
  {
    id: 2,
    image: card2,
    title: "Cold-Pressed Juice",
    description: "Healthy and refreshing cold-pressed juices.",
  },
  {
    id: 3,
    image: card3,
    title: "Dairy Products",
    description: "Pure and fresh dairy products for daily needs.",
  },
  {
    id: 4,
    image: card4,
    title: "Organic Vegetables",
    description: "Locally sourced, pesticide-free vegetables.",
  },
];

const Home = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto mt-24 flex justify-center gap-4 px-4">
        <img
          src={leftimage}
          alt="Farm2Bag Banner"
          className="w-1/2 rounded-lg shadow-md"
        />
        <img
          src={rightimage}
          alt="Juice2Bag Banner"
          className="w-1/2 rounded-lg shadow-md"
        />
      </div>

      
      <div className="container mx-auto mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 px-4">
        {cardData.map((card) => (
          <div
            key={card.id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 relative"
          >
           
            <img
              src={card.image}
              alt={card.title}
              className="w-16 h-16 rounded-full absolute top-4 right-4 shadow-md border-2 border-white"
            />

           
            <h3 className="text-lg font-semibold mt-12">{card.title}</h3>
            <p className="text-gray-600 mt-2">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
