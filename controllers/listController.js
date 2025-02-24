const axios = require("axios");
const User = require("../models/userModel");
const List = require("../models/listModel");
const Movie = require("../models/movieModel");

const TMDB_API_KEY = process.env.TMDB_API_KEY;

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
			"title posterUrl"
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
			.populate("movies", "title posterUrl")
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

		if (!user) {
			return res.status(404).json({ message: "No user was found" });
		}

		if (!list) {
			return res.status(404).json({ message: "No list was found" });
		}

		let movie;
		if (movieId.length === 24) {
			movie = await Movie.findById(movieId);
		} else {
			movie = await Movie.findOne({ tmdbId: movieId });
		}

		if (!movie) {
			const movieResponse = await axios.get(
				`https://api.themoviedb.org/3/movie/${movieId}`,
				{
					params: { api_key: TMDB_API_KEY, language: "en-US" },
				}
			);

			const movieData = movieResponse.data;

			const castResponse = await axios.get(
				`https://api.themoviedb.org/3/movie/${movieId}/credits`,
				{
					params: { api_key: TMDB_API_KEY, language: "en-US" },
				}
			);

			const actors = castResponse.data.cast
				.slice(0, 5)
				.map((actor) => actor.name);

			const director = castResponse.data.crew.find(
				(person) => person.job === "Director"
			);

			const directorName = director ? director.name : "Unknown";

			movie = new Movie({
				tmdbId: movieData.id,
				title: movieData.title,
				releaseYear: parseInt(movieData.release_date.split("-")[0]),
				directedBy: directorName,
				runtime: movieData.runtime,
				genre: movieData.genres.map((genre) => genre.name),
				actors,
				posterUrl: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
			});

			await movie.save();
		}

		const movieExistsInList = list.movies.some(
			(existingMovieId) => existingMovieId.toString() === movie._id.toString()
		);

		if (movieExistsInList) {
			return res.status(400).json({ message: "Movie already in the list" });
		}

		list.movies.push(movie._id);
		await list.save();

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
		const movieId = req.params.movieId;
		const listId = req.params.listId;
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
