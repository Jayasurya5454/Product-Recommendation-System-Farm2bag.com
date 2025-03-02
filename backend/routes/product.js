const express = require("express");
const router = express.Router();
const { createProduct, getList, updateProduct, deleteProduct, searchProduct, getProductById } = require("../controllers/product");
router.get("/",  getList);
router.put("/:product_id",  updateProduct);
router.delete("/:product_id",  deleteProduct);
router.get("/search",  searchProduct);
router.post("/products", getProductById);
router.post("/",  createProduct);

module.exports = router;