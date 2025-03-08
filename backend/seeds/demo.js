require('dotenv').config(); // Load environment variables from .env
const mongoose = require('mongoose');
const Product = require('../models/product.js'); // Adjust the path if needed

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const products = [
  {
    title: "Banana",
    description: "Banana, A delicious and energy-rich fruit packed with essential vitamins and minerals, perfect for a quick and healthy snack., உடல் ஆரோக்கியத்திற்கு ஏற்ற முக்கியமான வைட்டமின்கள் மற்றும் தாதுப்பொருட்கள் நிறைந்த ஒரு இனிய மற்றும் சக்தி நிறைந்த பழம், ஒரு ஆரோக்கியமான இடைவேளைக்கான சிறந்த தேர்வு.",
    price: 40,
    status: "active",
    category: "Fruits",
    quantity: 200,
    photos: "https://res.cloudinary.com/dsuftokli/image/upload/v1741414461/uploads/yzuz0wwaippx0jsdob9u.webp",
    nutritionalInfo: {
      calories: 89,
      protein: 1.1,
      fiber: 2.6,
      vitamins: ["Vitamin B6", "Vitamin C"],
    },
    healthConditions: ["digestion", "heart health"],
    seasonal: ["summer", "monsoon", "winter"],
    skinTypeCompatibility: "dry",
    complementaryProducts: ["Milk", "Honey", "Oats"],
    occupationTags: ["athlete", "teenager"],
    recipePairings: ["Milk", "Honey", "Oats"],
    discount: 0,
    trendingScore: 0,
  },
  {
    title: "Brinjal",
    description: "Brinjal, A versatile vegetable rich in antioxidants and fiber, perfect for curries and fries., உடல் ஆரோக்கியத்திற்கு ஏற்ற நார்ச்சத்து மற்றும் ஆன்டிஆக்ஸிடண்டுகள் நிறைந்த ஒரு பன்முக தன்மை கொண்ட காய்கறி, குழம்புகளுக்கும் பொரியல்களுக்கும் சிறந்த தேர்வு.",
    price: 30,
    status: "active",
    category: "Vegetables",
    quantity: 150,
    photos: "https://res.cloudinary.com/dsuftokli/image/upload/v1741414462/uploads/i9oxlbvldxjeoeso3ewe.webp",
    nutritionalInfo: {
      calories: 25,
      protein: 1.0,
      fiber: 3.0,
      vitamins: ["Vitamin C", "Vitamin K"],
    },
    healthConditions: ["diabetes", "heart health"],
    seasonal: ["summer", "rainy", "winter"],
    skinTypeCompatibility: "oily",
    complementaryProducts: ["Tomato", "Garlic", "Onion"],
    occupationTags: ["homemaker", "senior citizen"],
    recipePairings: ["Tomato", "Garlic", "Onion"],
    discount: 0,
    trendingScore: 0,
  },
  {
    title: "Egg",
    description: "Egg, A protein-rich food loaded with essential nutrients for muscle building and overall health., உடல் ஆரோக்கியத்திற்கு முக்கியமான ஊட்டச்சத்து நிறைந்த ஒரு புரோட்டீன் நிறைந்த உணவு, தசை வளர்ச்சிக்கும் முழுமையான ஆரோக்கியத்திற்கும் சிறந்த தேர்வு.",
    price: 6,
    status: "active",
    category: "Protein Foods",
    quantity: 500,
    photos: "https://res.cloudinary.com/dsuftokli/image/upload/v1741414463/uploads/djqsm92babqf5vqb4cpi.webp",
    nutritionalInfo: {
      calories: 68,
      protein: 6.3,
      fiber: 0,
      vitamins: ["Vitamin D", "Vitamin B12"],
    },
    healthConditions: ["muscle growth", "brain health"],
    seasonal: ["summer", "rainy", "winter"],
    skinTypeCompatibility: "combination",
    complementaryProducts: ["Bread", "Cheese", "Spinach"],
    occupationTags: ["athlete", "employee"],
    recipePairings: ["Bread", "Cheese", "Spinach"],
    discount: 0,
    trendingScore: 0,
  },
  {
    title: "Mango",
    description: "Mango, The king of fruits, rich in Vitamin A and C, perfect for fresh juices and desserts., உடல் ஆரோக்கியத்திற்கு ஏற்ற வைட்டமின் A மற்றும் C நிறைந்த பழங்களில் ராஜா, ஜூஸ் மற்றும் இனிப்புகளுக்கு சிறந்த தேர்வு.",
    price: 100,
    status: "active",
    category: "Fruits",
    quantity: 300,
    photos: "https://res.cloudinary.com/dsuftokli/image/upload/v1741414464/uploads/igbr99dbkxaxureuarw2.webp",
    nutritionalInfo: {
      calories: 60,
      protein: 0.8,
      fiber: 1.6,
      vitamins: ["Vitamin A", "Vitamin C"],
    },
    healthConditions: ["immunity", "eye health"],
    seasonal: ["summer"],
    skinTypeCompatibility: "normal",
    complementaryProducts: ["Milk", "Yogurt", "Sugar"],
    occupationTags: ["child", "teenager"],
    recipePairings: ["Milk", "Yogurt", "Sugar"],
    discount: 0,
    trendingScore: 0,
  }
];

async function seedDB() {
  try {
    for (const product of products) {
      const existingProduct = await Product.findOne({ title: product.title });

      if (!existingProduct) {
        await Product.create(product);
        console.log(`Added new product: ${product.title}`);
      } else {
        console.log(`Skipped existing product: ${product.title}`);
      }
    }
    mongoose.connection.close();
  } catch (err) {
    console.error("Error seeding database:", err);
    mongoose.connection.close();
  }
}

seedDB();
