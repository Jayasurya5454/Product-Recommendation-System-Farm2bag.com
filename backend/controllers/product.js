const Product = require("../models/product.js");
const Event = require("../models/event.js");
const AllProduct = require("../models/allProducts.js");
const axios = require("axios");

const createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();

        // create a same data in all product also
        const allProduct = new AllProduct({ productId: product._id, weights: 0 });
        await allProduct.save();

        res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const searchProductByName = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const products = await Product.find({
            title: { $regex: query, $options: "i" }
        });

        res.status(200).json(products);
    } catch (error) {
        console.error("Error in searchProductByName:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const getList = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




const updateProduct = async (req, res) => {
    try {
        const { title, description, price, photos } = req.body;
        const productId = req.params.productId;

        const updatedProduct = await Product.findByIdAndUpdate(productId, { title, description, price, photos }, { new: true });

        if (!updatedProduct) return res.status(404).json({ message: "Product not found" });

        res.status(200).json({ message: "Product updated successfully", updatedProduct });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await Product.findByIdAndDelete(productId);
        const allProduct = await AllProduct.findOne({ productId });

        if (allProduct) {
            await AllProduct.findByIdAndDelete(allProduct._id);
        }

        if (!product) return res.status(404).json({ message: "Product not found" });

        await Event.deleteMany({ productId });

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const searchProduct = async (req, res) => {
    try {
        const { description } = req.query;

        if (!description) {
            return res.status(400).json({ message: "Description query is required" });
        }

        const products = await Product.find({
            $or: [
                { title: { $regex: description, $options: "i" } },
                { description: { $regex: description, $options: "i" } },
                { "nutritionalInfo.vitamins": { $regex: description, $options: "i" } }
            ]
        });

        res.status(200).json(products);
    } catch (error) {
        console.error("Error in searchProduct:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const getProductById = async (req, res) => {
    try {
        const productId = req.params.product_id;
        const product = await Product.findById(productId);

        if (!product) return res.status(404).json({ message: "Product not found" });

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createProduct, getList, updateProduct, deleteProduct, searchProduct, getProductById,searchProductByName };
