import React from "react";
import Navbar from "../pages/NavbarPage";
import leftimage from "../assets/Farm2bag Banner.webp";
import rightimage from "../assets/Juice2Bag Banner.webp";
import card1 from "../assets/cards/ComboBag.jpg";
import card2 from "../assets/cards/Dailyfresh.jpg";
import card3 from "../assets/cards/Juice2bag.jpg";
import card4 from "../assets/cards/Seasonal.jpg";
import { Link } from "react-router-dom";
import CategoryList from "../components/CategoryList";
import Footer from "../components/FooterComponent";
import FreshDaily from "../components/FreshDaily";
import Chatbot from "../components/Chatbot";

const cardData = [
  {
    id: 1,
    image: card2,
    title: "Daily Fresh",
    description: "Here's offers fresh, farm-sourced essentials, including milk, water, vegetables, and fruits get quick.",
  },
  {
    id: 2,
    image: card4,
    title: "Seasonal",
    description: "Seasonal vegetables, fruits, and grains are available affordably in one click.",
  },
  {
    id: 3,
    image: card1,
    title: "Combo Bags",
    description: "Combo bag list offers a week’s worth of nutritious items at a cost-effective price.",
  },
  {
    id: 4,
    image: card3,
    title: "Juice 2 Bag",
    description: "NEERA water, sugarcane juice, coconut water, fresh juice, and instant doorstep delivery!!",
  },
];

const Home = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto mt-38 flex justify-center gap-6 px-4">
       <Link to='/'>
        <img
          src={leftimage}
          alt="Farm2Bag Banner"
          className="w-175 shadow-md cursor-pointer"
        /></Link>
        <Link to='https://www.juice2bag.com/'>
        <img
          src={rightimage}
          alt="Juice2Bag Banner"
          className="w-175 shadow-md cursor-pointer"
        />
        </Link>
      </div>
   
      <div className="container mx-auto mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 px-12">
        {cardData.map((card) => (
          <div
            key={card.id}
            className="bg-zinc-100 p-3 rounded-lg shadow-md transition-all duration-300 relative flex items-center justify-between w-full "
          >
           <div className="mt-1 flex-1">
           <h3 className="text-lg font-semibold mt-1 min-h-[24px]">{card.title}</h3>
           <p className="text-gray-600 mt-1 text-[12px] ">{card.description}</p>
           </div>
           <img
              src={card.image}
              alt={card.title}
              className="mr-2 w-18 h-18 rounded-full shadow-md border-2 border-white"
            />
          </div>
        ))}
      </div>
      <CategoryList/>
      <FreshDaily/>
      <Footer/>
      <Chatbot/>
    </div>
  );
};

export default Home;
