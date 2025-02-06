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
			.populate("lists", "name movies")
			.populate("checkedMovies", "title posterUrl")
			.populate("favoriteMovies", "title posterUrl");

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

		const user = await User.findById(userId).populate(
			"checkedMovies",
			"tmdbId title posterUrl"
		);
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
		const id = req.params.userId;
		const user = await User.findById(id);

		const userFavoriteMovies = user.favoriteMovies;
		res.status(200).json({ message: "success", userFavoriteMovies });
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ message: "There was an error getting the user favorite movies" });
	}
};
