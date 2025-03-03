const Product = require("../models/product.js");
const Event = require("../models/event.js");
const AllProduct = require("../models/allProducts.js");
const createProduct = async (req, res) => {
    try {
        const { title, description, price, photos,quantity } = req.body;
        
        const product = new Product({ title, description, price, photos , quantity });
        
        await product.save();

        // create a same da in all product also
        const allProduct = new AllProduct({ productId: product._id, weights: 0 });
        await allProduct.save();

        res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
        res.status(400).json({ message: error.message });
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

        if (!product) return res.status(404).json({ message: "Product not found" });
        await Event.deleteMany({ productId }); // Remove associated events when a product is deleted from the database

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const searchProduct = async (req, res) => {
    try {
        const { title } = req.query;
        const products = await Product.find({ title: { $regex: title, $options: "i" } });

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getProductById = async (req, res) => {
    try {
        const productId = req.body.productId;
        const product = await Product.findById(productId);

        if (!product) return res.status(404).json({ message: "Product not found" });

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createProduct, getList, updateProduct, deleteProduct, searchProduct, getProductById };