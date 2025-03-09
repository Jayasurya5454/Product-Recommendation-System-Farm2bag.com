const cloudinary = require("../connections/cloudinary.js");
const fs = require("fs");
const path = require("path");


const assetsFolder = path.join(__dirname, "../../client/src/assets/complipro");


const uploadImages = async () => {
  try {
    const files = fs.readdirSync(assetsFolder); 

    for (const file of files) {
      const filePath = path.join(assetsFolder, file);
      
      
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "uploads", 
      });

      console.log(` Uploaded: ${file} → ${result.secure_url}`);
    }

    console.log(" All images uploaded successfully!");
  } catch (error) {
    console.error(" Error uploading images:", error);
  }
};


uploadImages();
