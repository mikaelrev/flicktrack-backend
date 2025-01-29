const axios = require("axios");
const User = require("../models/userModel");
const List = require("../models/listModel");
const Movie = require("../models/movieModel");

const TMDB_API_KEY = process.env.TMDB_API_KEY;

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
		res.status(500).json({ message: "There was an error fethching lists" });
	}
};

exports.createNewUserList = async (req, res) => {
	try {
		const userId = req.params.userId;
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

		res.status(201).json({ message: "success", newList });
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ message: "There was an error creating a new user list" });
	}
};

exports.addMovieToList = async (req, res) => {
	try {
		const userId = req.params.userId;
		const listId = req.params.listId;
		const tmdbId = req.params.movieId;

		if (!userId || !listId || !tmdbId) {
			return res
				.status(400)
				.json({ message: "User, List, or Movie ID is missing" });
		}

		const user = await User.findById(userId);
		const list = await List.findById(listId);
		let movie = await Movie.findOne({ tmdbId });

		if (!user) {
			return res.status(404).json({ message: "No user was found" });
		}

		if (!list) {
			return res.status(404).json({ message: "No list was found" });
		}

		if (!movie) {
			const movieResponse = await axios.get(
				`https://api.themoviedb.org/3/movie/${tmdbId}`,
				{
					params: { api_key: TMDB_API_KEY, language: "en-US" },
				}
			);

			const movieData = movieResponse.data;

			const castResponse = await axios.get(
				`https://api.themoviedb.org/3/movie/${tmdbId}/credits`,
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
				tmdbId,
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
		res
			.status(500)
			.json({ message: "There was an error adding the movie to the list" });
	}
};
