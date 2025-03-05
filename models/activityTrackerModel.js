const mongoose = require("mongoose");

const activityTrackerSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		activity: {
			type: String,
			enum: [
				"checked",
				"favorite",
				"created_list",
				"commented",
				"added_to_list",
			],
			required: true,
		},
		targetMovie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
		targetList: { type: mongoose.Schema.Types.ObjectId, ref: "List" },
		comment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
	},
	{ timestamps: true }
);

const ActivityTracker = mongoose.model(
	"ActivityTracker",
	activityTrackerSchema
);

module.exports = ActivityTracker;
