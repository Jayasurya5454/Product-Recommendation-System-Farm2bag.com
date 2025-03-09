const express = require("express");
const router = express.Router();
const { trackEvent, removeEvent, getEvents } = require("../controllers/event");

router.post("/", trackEvent);  
router.delete("/", removeEvent);
router.get("/", getEvents);  
  
module.exports = router;
