var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var AppointmentSchema = new Schema({
    appointment_date: { type: Date, required: true },
	patient_name: { type: String, required: true },
	phone_number: { type: Number, required: true },
	appointment: { type: String, required: true },
	waited: { type: String }
}, {timestamps: true});

module.exports = mongoose.model("Appointments", AppointmentSchema);