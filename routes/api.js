var express = require("express");
var slotRouter = require("./slot");
var appointmentRouter = require("./appointment");

var app = express();

app.use("/slot/", slotRouter);
app.use("/appointments/", appointmentRouter);

module.exports = app;