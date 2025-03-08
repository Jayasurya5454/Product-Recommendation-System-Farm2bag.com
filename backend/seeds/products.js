const mongoose = require("mongoose");
require("dotenv").config();
const Product = require("../models/product.js");
const Category = require("../models/categories.js");

const categories = [
  { name: "Spinach Leaf Varieties", image: "/images_home/Spinach.webp" },
  { name: "Traditional Vegetables", image: "/images_home/tveg.webp" },
  { name: "Grains and Pulses", image: "/images_home/grains.webp" },
  { name: "Fruits", image: "/images_home/fruits.webp" },
  { name: "Grocery & Provisions", image: "/images_home/grocery.webp" },
  { name: "Pickles & Preserves", image: "/images_home/pickle.webp" },
  { name: "Podi Varieties", image: "/images_home/podi.webp" },
  { name: "Traditional Rice Varieties", image: "/images_home/rice.webp" },
];

const products = [
  {
    title: "Siru Keerai",
    description: "A nutritious leafy vegetable.",
    price: 25,
    category: "Spinach Leaf Varieties",
    quantity: 100,
    photos: ["/products/sirukeerai.webp"],
    nutritionalInfo: { calories: 25, protein: 3, fiber: 2, vitamins: ["A", "C"] },
    healthConditions: ["Heart Health", "Diabetes"],
    seasonal: true,
    discount: 5,
    trendingScore: 80,
  },
  {
    title: "Mulai Keerai",
    description: "Healthy green leafy vegetable.",
    price: 25,
    category: "Spinach Leaf Varieties",
    quantity: 120,
    photos: ["/products/mulaikeerai.webp"],
    nutritionalInfo: { calories: 20, protein: 2, fiber: 1.5, vitamins: ["A", "B6"] },
    discount: 0,
    trendingScore: 75,
  },
  {
    title: "Thandu Keerai",
    description: "Rich in vitamins and iron.",
    price: 25,
    category: "Spinach Leaf Varieties",
    quantity: 90,
    photos: ["/products/Thandukeerai.webp"],
    trendingScore: 60,
  },
  {
    title: "Brinjal",
    description: "Fresh and organic brinjal.",
    price: 30,
    category: "Traditional Vegetables",
    quantity: 50,
    photos: ["/products/brinjal.webp"],
    discount: 10,
    trendingScore: 90,
  },
  {
    title: "Toor Dal",
    description: "Protein-rich lentils.",
    price: 80,
    category: "Grains and Pulses",
    quantity: 200,
    photos: ["/products/thoordal.webp"],
    trendingScore: 100,
  },
  {
    title: "Orange",
    description: "Juicy and fresh oranges.",
    price: 50,
    category: "Fruits",
    quantity: 150,
    photos: ["/products/ORANGE.webp"],
    discount: 5,
    trendingScore: 85,
  },
];

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Database connected");

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Insert categories
    const createdCategories = await Category.insertMany(categories);
    console.log("Categories added:", createdCategories);

    // Map category names to IDs
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    // Assign category IDs to products
    const updatedProducts = products.map((product) => ({
      ...product,
      category: categoryMap[product.category],
    }));

    // Insert products
    await Product.insertMany(updatedProducts);
    console.log("Products added successfully!");

    mongoose.connection.close();
  })
  .catch((err) => console.error("Error connecting to database:", err));
