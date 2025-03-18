const ActivityTracker = require("../models/activityTrackerModel");

exports.getAllActivities = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		const activities = await ActivityTracker.find()
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.populate("user", "username profileImage")
			.populate("targetMovie", "tmdbId title posterUrl")
			.populate("targetList", "name")
			.populate("comment", "content createdAt");

		const totalActivities = await ActivityTracker.countDocuments();

		res.status(200).json({
			message: "success",
			activities,
			totalPages: Math.ceil(totalActivities / limit),
			currentPage: page,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching activities" });
	}
};
