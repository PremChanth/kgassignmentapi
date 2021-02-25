var express = require("express");
const SlotsController = require("../controllers/slots");

var router = express.Router();


router.post("/", SlotsController.createSlot);
router.get("/", SlotsController.getSlots);

module.exports = router;