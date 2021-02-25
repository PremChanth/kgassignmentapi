var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var SlotSchema = new Schema({
	date: {type: Date, required: true},
	startTime: { type: Date, required: true},
	endTime: { type: Date, required: true },
	slotType: { type: String, enum: ['morning', 'evening']}
}, {timestamps: true});

module.exports = mongoose.model("Slots", SlotSchema);