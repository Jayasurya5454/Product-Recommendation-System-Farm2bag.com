const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String, // Store image URL or file path
    required: false,
  },
});

module.exports = mongoose.model("Category", CategorySchema);
