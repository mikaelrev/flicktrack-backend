const User = require("../models/userModel");
const List = require("../models/listModel");
const Movie = require("../models/movieModel");
const ActivityTracker = require("../models/activityTrackerModel");

exports.getAllLists = async (req, res) => {
	try {
		const lists = await List.find()
			.populate("movies", "title posterUrl")
			.populate("owner", "username profileImage");

		if (!lists) {
			return res.status(404).json({ message: "No lists was found" });
		}

		res.status(200).json({ message: "success", lists });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "There was an error fethching lists" });
	}
};

exports.getAllUserLists = async (req, res) => {
	try {
		const userId = req.params.userId;
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ message: "No user was found" });
		}

		const lists = await List.find({ owner: userId }).populate(
			"movies",
			"tmdbId title posterUrl"
		);

		res.status(200).json({ message: "success", lists });
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ message: "There was an error fethching the user's lists" });
	}
};

exports.getSingleList = async (req, res) => {
	try {
		const listId = req.params.listId;

		const list = await List.findOne({ _id: listId })
			.populate("movies", "tmdbId title posterUrl")
			.populate("owner", "username");

		console.log(list);

		res.status(200).json({ message: "success", list });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "There was an error fetching the list" });
	}
};

exports.createNewUserList = async (req, res) => {
	try {
		const userId = req.user.userId;
		const user = await User.findById(userId);
		const { name } = req.body;

		if (!user) {
			return res.status(404).json({ message: "No user was found" });
		}

		const existingList = await List.findOne({ name, owner: userId });
		if (existingList) {
			return res
				.status(400)
				.json({ message: "A list with this name already exists" });
		}

		const newList = await List.create({ name: name, owner: userId });

		user.lists.push(newList._id);
		await user.save();

		await ActivityTracker.create({
			user: userId,
			activity: "created_list",
			targetList: newList._id,
		});

		res.status(201).json({ message: "success", newList });
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ message: "There was an error creating a new user list" });
	}
};

exports.renameList = async (req, res) => {
	try {
		const userId = req.user.userId;
		const { listId } = req.params;
		const { newListName } = req.body;

		if (!userId || !listId || !newListName) {
			return res
				.status(400)
				.json({ message: "User ID, List ID, or new name is missing" });
		}

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "No user was found" });
		}

		const list = await List.findById(listId);
		if (!list) {
			return res.status(404).json({ message: "No list was found" });
		}

		list.name = newListName;

		await list.save();

		res.status(201).json({ message: "List name was updated", list });
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ message: "There was an error when updating the list name" });
	}
};

exports.addMovieToList = async (req, res) => {
	try {
		const userId = req.user.userId;
		const listId = req.params.listId;
		const movieId = req.params.movieId;

		if (!userId || !listId || !movieId) {
			return res
				.status(400)
				.json({ message: "User, List, or Movie ID is missing" });
		}

		const user = await User.findById(userId);
		const list = await List.findById(listId);
		const movie = await Movie.findOne({
			$or: [{ _id: movieId }, { tmdbId: movieId }],
		});

		if (!user) {
			return res.status(404).json({ message: "No user was found" });
		}

		if (!list) {
			return res.status(404).json({ message: "No list was found" });
		}

		if (!movie) {
			return res.status(404).json({ message: "Movie not found in database" });
		}

		if (list.movies.includes(movie._id)) {
			return res.status(400).json({ message: "Movie already in the list" });
		}

		list.movies.push(movie._id);
		await list.save();

		await ActivityTracker.create({
			user: userId,
			activity: "added_to_list",
			targetMovie: movie._id,
			targetList: list._id,
		});

		res.status(200).json({ message: "Movie added to list", list });
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: "There was an error when adding the movie to the list",
		});
	}
};

exports.removeMovieFromList = async (req, res) => {
	try {
		const { movieId, listId } = req.params;
		const userId = req.user.userId;

		if (!movieId || !listId || !userId) {
			return res
				.status(400)
				.json({ message: "User, Movie ID or List ID is missing" });
		}

		const list = await List.findById(listId);
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ message: "No user was found" });
		}

		if (!list) {
			return res.status(404).json({ message: "No list was found" });
		}

		if (list.owner.toString() !== userId) {
			return res.status(403).json({
				message: "You do not have permission to remove movies from this list",
			});
		}

		const movieIndex = list.movies.findIndex(
			(existingMovieId) => existingMovieId.toString() === movieId
		);

		if (movieIndex === -1) {
			return res.status(404).json({
				message:
					"Movie not found in the list, or it may have already been deleted",
			});
		}

		list.movies.splice(movieIndex, 1);
		await list.save();

		res.status(200).json({ message: "Movie removed from the list", list });
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: "There was an error when removing movie from the list",
		});
	}
};

exports.deleteList = async (req, res) => {
	try {
		const userId = req.user.userId;
		const { listId } = req.params;

		if (!listId || !userId) {
			return res.status(400).json({ message: "User, or List ID is missing" });
		}

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "No user was found" });
		}

		const list = await List.findById(listId);
		if (!list) {
			return res.status(404).json({ message: "No list was found" });
		}

		if (list.owner.toString() !== userId) {
			return res
				.status(403)
				.json({ message: "You do not have permission to delete this list" });
		}

		await list.deleteOne();

		res.status(204).json();
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ message: "There was an error when deleting the list" });
	}
};
