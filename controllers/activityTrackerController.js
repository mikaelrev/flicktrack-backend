const ActivityTracker = require("../models/activityTrackerModel");

exports.getAllActivities = async (req, res) => {
	try {
		const activities = await ActivityTracker.find()
			.populate("user", "username profileImage")
			.populate("targetMovie", "title posterUrl")
			.populate("targetList", "name")
			.populate("comment", "content createdAt");
		res.status(200).json({ message: "success", activities });
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ message: "Error when adding movie to checked list" });
	}
};
