const { title } = require("process");
const User = require("../models/userModel");

exports.getAllUsers = async (req, res) => {
	try {
		const users = await User.find().select("-password");

		res.status(200).json({ message: "success", users });
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ message: "There was an error when fetching all users" });
	}
};

exports.getUser = async (req, res) => {
	try {
		const id = req.params.userId;
		const user = await User.findById(id)
			.select("-password")
			.populate({
				path: "lists",
				populate: {
					path: "movies",
					select: "title posterUrl",
				},
			})
			.populate("checkedMovies", "title posterUrl")
			.populate("favoriteMovies", "title posterUrl")
			.populate({
				path: "comments",
				populate: { path: "movie", select: "title posterUrl" },
			});

		res.status(200).json({ message: "success", user });
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ message: "There was an error when fetching user details" });
	}
};

exports.getUserCheckedMovies = async (req, res) => {
	try {
		const userId = req.params.userId;

		const user = await User.findById(userId).populate({
			path: "checkedMovies",
			select: "tmdbId title posterUrl",
		});
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res
			.status(200)
			.json({ message: "success", checkedMovies: user.checkedMovies });
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ message: "There was an error getting the user checked movies" });
	}
};

exports.getUserFavoriteMovies = async (req, res) => {
	try {
		const userId = req.params.userId;

		const user = await User.findById(userId).populate(
			"favoriteMovies",
			"tmdbId title posterUrl"
		);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res
			.status(200)
			.json({ message: "success", favoriteMovies: user.favoriteMovies });
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ message: "There was an error getting the user favorite movies" });
	}
};

exports.followUser = async (req, res) => {
	try {
		const { userId } = req.params; // User to be followed
		const appUserId = req.user.userId; // Authenticated user (who is following)

		if (!userId) {
			return res.status(400).json({ message: "No user ID found" });
		}

		if (userId === appUserId) {
			return res.status(400).json({ message: "You cannot follow yourself" });
		}

		const updatedUser = await User.findByIdAndUpdate(
			appUserId,
			{ $addToSet: { following: userId } },
			{ new: true }
		).select("-password");

		await User.findByIdAndUpdate(
			userId,
			{ $addToSet: { followers: appUserId } },
			{ new: true }
		);

		return res
			.status(200)
			.json({ message: "Successfully followed the user", updatedUser });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error when trying to follow user" });
	}
};

exports.unfollowUser = async (req, res) => {
	try {
		const { userId } = req.params;
		const appUserId = req.user.userId;

		if (!userId) {
			return res.status(400).json({ message: "No user ID found" });
		}

		if (userId === appUserId) {
			return res.status(400).json({ message: "You cannot unfollow yourself" });
		}

		const updatedUser = await User.findByIdAndUpdate(
			appUserId,
			{ $pull: { following: userId } },
			{ new: true }
		).select("-password");

		await User.findByIdAndUpdate(
			userId,
			{ $pull: { followers: appUserId } },
			{ new: true }
		);

		return res
			.status(200)
			.json({ message: "Successfully unfollowed the user", updatedUser });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error when trying to unfollow user" });
	}
};
