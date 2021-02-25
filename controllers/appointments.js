const Appointments = require("../models/AppointmentsModel");
const { body,validationResult, query } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// Appointments Schema
function AppointmentData(data) {
    this.id = data._id;
    this.appointment_date = data.appointment_date;
	this.patient_name= data.patient_name;
	this.phone_number = data.phone_number;
	this.appointment = data.appointment;
	this.waiting = data.waiting;
}

/**
 * Create Appointments.
 * 
 * @param {string}      appointment_date
 * @param {string}      patient_name 
 * @param {string}      phone_number
 * @param {string}      appointment
 * @param {string}      waiting
 * 
 * @returns {Object}
 */
exports.createAppointment = [
    body("appointment_date", "Appointment date must not be empty.").isLength({ min: 1 }).trim(),
	body("patient_name", "Patient name must not be empty.").isLength({ min: 1 }).trim(),
	body("phone_number", "Phone number must not be empty.").isLength({ min: 1 }).trim(),
	body("appointment", "Appointment must not be empty.").isLength({ min: 1 }).trim(),
	async(req, res) => {
		try {
			const errors = validationResult(req);
			
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {

                // check time appointments already added
                let startDate = new Date(req.body.appointment_date + ' ' + '00:00:00');
				let endDate = new Date(req.body.appointment_date + ' ' + '23:59:59');
				
				console.log()

				var appointmentFound = await Appointments.find(
					{
                        appointment_date: {
                            $gte: startDate,
                            $lte: endDate
                        },
                        appointment: req.body.appointment
					}
				);

				// console.log('appointmentFound', appointmentFound);
				if (appointmentFound && appointmentFound.length) {
					return apiResponse.ErrorResponse(res, 'Appointment already added.');
				}


				var appointment = new Appointments(
				{ 		
                        appointment_date: new Date(req.body.appointment_date),
                        patient_name: req.body.patient_name,
                        phone_number: req.body.phone_number,
						appointment: req.body.appointment,
						waited: req.body.waited
				});
	
				// Save Appointment
				appointment.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let appointmentData = new AppointmentData(appointment);
					return apiResponse.successResponseWithData(res,"Appointment Success.", appointmentData);
				});
			}
		} catch (err) {
			console.log('err', err);
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * get Appointments.
 * 
 * @param appointment_date
 * 
 * @returns {Array}
 */
exports.getAppointments = [
	query("appointment_date", "appointment_date must not be empty.").isLength({ min: 1 }).trim(),
	async (req, res) => {
		try {
			let startDate = req.query.date + ' ' + '00:00:00';
			let endDate = req.query.date + ' ' + '23:59:59';
			// const appointments = await Appointments.find({
			// 	date: {
			// 		$gte: new Date(startDate),
			// 		$lte: new Date(endDate)
			// 	}
			// });
			const appointments = await Appointments.find();
			return apiResponse.successResponseWithData(res,"Success.", appointments);
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];
