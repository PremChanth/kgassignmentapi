var express = require("express");
const AppointmentController = require("../controllers/appointments");

var router = express.Router();


router.post("/", AppointmentController.createAppointment);
router.get("/", AppointmentController.getAppointments);

module.exports = router;