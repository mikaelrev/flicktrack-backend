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
		const user = await User.findById(id).select("-password");

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
		const id = req.params.userId;
		const user = await User.findById(id);

		const userCheckedMovies = user.checkedMovies;
		res.status(200).json({ message: "success", userCheckedMovies });
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
