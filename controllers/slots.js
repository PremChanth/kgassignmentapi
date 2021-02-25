const Slots = require("../models/SlotModel");
const { body,validationResult, query } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// Book Schema
function SlotData(data) {
	this.id = data._id;
	this.date= data.date;
	this.startTime = data.startTime;
	this.endTime = data.endTime;
	this.slotType = data.slotType;
}

/**
 * Create Slots.
 * 
 * @param {string}      date 
 * @param {string}      startTime
 * @param {string}      endTime
 * @param {string}      slotType
 * 
 * @returns {Object}
 */
exports.createSlot = [
	body("date", "date must not be empty.").isLength({ min: 1 }).trim(),
	body("startTime", "start time must not be empty.").isLength({ min: 1 }).trim(),
	body("endTime", "end time must not be empty.").isLength({ min: 1 }).trim(),
	body("slotType", "slot type must not be empty.").isLength({ min: 1 }).trim(),
	async(req, res) => {
		try {
			const errors = validationResult(req);
			
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {

				var date = new Date(Number(req.body.date));
				var startDateTime = new Date(Number(req.body.startTime));
				var endDateTime = new Date(Number(req.body.endTime));

				// check endDate greater than startDate
				if (endDateTime.getTime() <= startDateTime.getTime()) {
					return apiResponse.ErrorResponse(res, 'End time should be greater than start time.');
				}

				// check the time with morning/evening Slots
				if (req.body.slotType === 'morning') {
					let morningStartHour = new Date(Number(req.body.date));
					morningStartHour.setHours(9);
					morningStartHour.setMinutes(0);

					let morningEndHour = new Date(Number(req.body.date));
					morningEndHour.setHours(12);
					morningEndHour.setMinutes(0);

					if ((startDateTime.getTime() < morningStartHour.getTime()) || (startDateTime.getTime() > morningEndHour) || (endDateTime.getTime() < morningStartHour.getTime()) || (endDateTime.getTime() > morningEndHour)) {
						return apiResponse.ErrorResponse(res, 'Add time slot should between 9.00 AM to 12.00 PM.');
					}
				}

				// check the time with morning/evening Slots
				if (req.body.slotType === 'evening') {
					let eveningStartHour = new Date(Number(req.body.date));
					eveningStartHour.setHours(17);
					eveningStartHour.setMinutes(0);

					let eveningEndHour = new Date(Number(req.body.date));
					eveningEndHour.setHours(21);
					eveningEndHour.setMinutes(0);

					if ((startDateTime.getTime() < eveningStartHour.getTime()) || (startDateTime.getTime() > eveningEndHour) || (endDateTime.getTime() < eveningStartHour.getTime()) || (endDateTime.getTime() > eveningEndHour)) {
						return apiResponse.ErrorResponse(res, 'Evening time slot should between 5.00 PM to 9.00 PM.');
					}
				}

				if (req.body.slotType === 'evening') {
					if (endDateTime.getTime() <= startDateTime.getTime()) {
						return apiResponse.ErrorResponse(res, 'End time should be greater than start time.');
					}
				}

				// check time slot already added

				var slotFound = await Slots.find({ $or: [
					{
						startTime: {
							$gt: startDateTime,
							$lt: endDateTime
						}
					},
					{
						endTime: {
							$gt: startDateTime,
							$lt: endDateTime
						}
					}
				]});


				if (slotFound && slotFound.length) {
					return apiResponse.ErrorResponse(res, 'Time slot already added.');
				}

				// console.log('date', date);
				// console.log('startDateTime', startDateTime);
				// console.log('endDateTime', endDateTime);

				var slot = new Slots(
				{ 		date: date,
						startTime: startDateTime,
						endTime: endDateTime,
						slotType: req.body.slotType
				});
	
				// Save slot
				slot.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let slotData = new SlotData(slot);
					return apiResponse.successResponseWithData(res,"Slot add Success.", slotData);
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
 * get slots.
 * 
 * @param date
 * 
 * @returns {Array}
 */
exports.getSlots = [
	query("date", "date must not be empty.").isLength({ min: 1 }).trim(),
	async (req, res) => {
		try {
			let startDate = req.query.date + ' ' + '00:00:00';
			let endDate = req.query.date + ' ' + '23:59:59';
			const slots = await Slots.find({
				date: {
					$gte: new Date(startDate),
					$lte: new Date(endDate)
				}
			});
			return apiResponse.successResponseWithData(res,"Success.", slots);
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];
