const express = require("express");
const router = express.Router();
const {  createUser,updateUser,getUser } = require('../controllers/user.js');


router.post("/",createUser);  
router.put("/:userid", updateUser);
router.get("/:userid",getUser);

module.exports = router;
