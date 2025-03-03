const axios = require("axios");
const User = require("../models/userModel");
const Movie = require("../models/movieModel");
const ActivityTracker = require("../models/activityTrackerModel");

const TMDB_API_KEY = process.env.TMDB_API_KEY;

exports.getPopularMovies = async (req, res) => {
	try {
		const response = await axios.get(
			"https://api.themoviedb.org/3/movie/popular",
			{
				params: {
					api_key: TMDB_API_KEY,
					language: "en-US",
					page: 1,
				},
			}
		);

		const movies = response.data.results;
		res.status(200).json(movies);
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ message: "Error fetching popular movies from TMDb" });
	}
};

exports.getMovie = async (req, res) => {
	try {
		const movieId = req.params.movieId;

		let movie;
		if (movieId.length === 24) {
			movie = await Movie.findById(movieId);
		} else {
			movie = await Movie.findOne({ tmdbId: movieId }).populate({
				path: "comments",
				populate: { path: "user", select: "username profileImage" },
				options: { sort: { createdAt: -1 } },
			});
		}

		if (!movie) {
			const response = await axios.get(
				`https://api.themoviedb.org/3/movie/${movieId}`,
				{
					params: {
						api_key: TMDB_API_KEY,
						language: "en-US",
					},
				}
			);

			const movieData = response.data;
			const castResponse = await axios.get(
				`https://api.themoviedb.org/3/movie/${movieId}/credits`,
				{
					params: { api_key: TMDB_API_KEY, language: "en-US" },
				}
			);

			const actors = castResponse.data.cast
				.splice(0, 5)
				.map((actor) => actor.name);

			const director = castResponse.data.crew.find(
				(person) => person.job === "Director"
			);

			const directorName = director ? director.name : "Unknown";

			movie = await Movie.findOneAndUpdate(
				{ tmdbId: movieData.id },
				{
					tmdbId: movieData.id,
					title: movieData.title,
					releaseYear: parseInt(movieData.release_date.split("-")[0]),
					directedBy: directorName,
					runtime: movieData.runtime,
					genre: movieData.genres.map((genre) => genre.name),
					actors,
					posterUrl: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
				},
				{ new: true, upsert: true }
			);
		}

		res.status(200).json(movie);
	} catch (error) {
		if (error.code === 11000) {
			console.log(`Duplicate movie entry for tmdbId: ${req.params.movieId}`);
			const movie = await Movie.findOne({ tmdbId: req.params.movieId });
			res.status(200).json(movie);
		} else {
			console.error(error);
			res.status(500).json({ message: "Error fetching the movie from TMDb" });
		}
	}
};

exports.addToChecked = async (req, res) => {
	try {
		const userId = req.user.userId;
		const movieId = req.params.movieId;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		let movie = await Movie.findById(movieId);
		if (!movie) {
			return res.status(404).json({ message: "Movie not found in database" });
		}

		const isMovieChecked = user.checkedMovies.some(
			(checkedMovie) => checkedMovie.toString() === movieId
		);

		if (isMovieChecked) {
			return res
				.status(400)
				.json({ message: "Movie already added to Checked list" });
		}

		user.checkedMovies.push(movieId);
		await Movie.findByIdAndUpdate(movieId, {
			$inc: { checkedCount: 1 },
		});

		await user.save();

		await ActivityTracker.create({
			user: userId,
			activity: "checked",
			targetMovie: movie._id,
		});

		return res.status(200).json({ message: "Movie added to Checked list" });
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ message: "Error when adding movie to Checked list" });
	}
};

exports.removeFromChecked = async (req, res) => {
	try {
		const userId = req.user.userId;
		const movieId = req.params.movieId;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const isMovieChecked = user.checkedMovies.some(
			(checkedMovie) => checkedMovie.toString() === movieId
		);

		if (!isMovieChecked) {
			return res.status(400).json({ message: "Movie not in checked list" });
		}

		user.checkedMovies = user.checkedMovies.filter(
			(checkedMovie) => checkedMovie.toString() !== movieId
		);

		await user.save();

		await Movie.findByIdAndUpdate(movieId, {
			$inc: { checkedCount: -1 },
		});

		return res.status(204).json();
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ message: "Error when removing movie from checked list" });
	}
};

exports.addToFavorites = async (req, res) => {
	try {
		const userId = req.user.userId;
		const movieId = req.params.movieId;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		let movie = await Movie.findById(movieId);
		if (!movie) {
			return res.status(404).json({ message: "Movie not found in database" });
		}

		const isMovieFavorite = user.favoriteMovies.some(
			(favoriteMovie) => favoriteMovie.toString() === movieId
		);

		if (isMovieFavorite) {
			return res
				.status(400)
				.json({ message: "Movie already added to Favorite list" });
		}

		user.favoriteMovies.push(movieId);
		await Movie.findByIdAndUpdate(movieId, {
			$inc: { favoriteCount: 1 },
		});

		await user.save();

		await ActivityTracker.create({
			user: userId,
			activity: "favorite",
			targetMovie: movie._id,
		});

		return res.status(200).json({ message: "Movie added to Favorite list" });
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ message: "Error when adding movie to Favorite list" });
	}
};

exports.removeFromFavorites = async (req, res) => {
	try {
		const userId = req.user.userId;
		const movieId = req.params.movieId;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const isMovieFavorite = user.favoriteMovies.some(
			(favoriteMovie) => favoriteMovie.toString() === movieId
		);

		if (!isMovieFavorite) {
			return res.status(400).json({ message: "Movie not in Favorite list" });
		}

		user.favoriteMovies = user.favoriteMovies.filter(
			(favoriteMovie) => favoriteMovie.toString() !== movieId
		);

		await user.save();

		await Movie.findByIdAndUpdate(movieId, {
			$inc: { favoriteCount: -1 },
		});

		return res.status(204).json();
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ message: "Error when removing movie from Favorite list" });
	}
};
