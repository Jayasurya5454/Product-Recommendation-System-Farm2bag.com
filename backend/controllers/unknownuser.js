const AllProducts = require('../models/allProducts.js');
const Product = require('../models/product.js');

const getAllProducts = async (req, res) => {
    try {
        const allProducts = await AllProducts.find().sort({ weights: -1 });

        const detailedProducts = await Promise.all(
            allProducts.map(async (product) => {
                const detailedProduct = await Product.findById(product.productId);
                return detailedProduct;
            })
        );

        res.status(200).json(detailedProducts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllProducts };
