const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const StationsSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		userId: {
			type: String,
			required: true,
		},
		identificator: {
			type: String,
			required: true,
			unique: true,
		},
		longitude: {
			type: String,
			required: true,
		},
		latitude: {
			type: String,
			required: true,
		},
		rating: {
			type: String,
		},
		values:[]
	},
	{
		timestamps: true,
	}
);

const Station = mongoose.model("Station", StationsSchema);
module.exports = Station;
