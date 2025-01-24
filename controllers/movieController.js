const axios = require("axios");
const User = require("../models/userModel");

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
		const id = req.params.movieId;
		const response = await axios.get(
			`https://api.themoviedb.org/3/movie/${id}`,
			{
				params: {
					api_key: TMDB_API_KEY,
					language: "en-US",
				},
			}
		);

		const movie = response.data;
		res.status(200).json(movie);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching the movie from TMDb" });
	}
};

exports.addOrRemoveFromChecked = async (req, res) => {
	try {
		const userId = req.user._id;
		const movieId = req.params.movieId;

		const user = await User.findById(userId);

		const isMovieChecked = user.checkedMovies.includes(movieId);

		if (isMovieChecked) {
			await User.findByIdAndUpdate(
				userId,
				{ $pull: { checkedMovies: movieId } },
				{ new: true }
			);
			return res
				.status(200)
				.json({ message: "Movie removed from checked list" });
		} else {
			await User.findByIdAndUpdate(
				userId,
				{ $push: { checkedMovies: movieId } },
				{ new: true }
			);
			return res.status(200).json({ message: "Movie added to checked list" });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: "Error when adding or removing the movie from the checked list",
		});
	}
};

exports.addOrRemoveFromFavorites = async (req, res) => {
	try {
		const userId = req.user._id;
		const movieId = req.params.movieId;

		const user = await User.findById(userId);

		const isMovieFavorited = user.favoriteMovies.includes(movieId);

		if (isMovieFavorited) {
			await User.findByIdAndUpdate(
				userId,
				{ $pull: { favoriteMovies: movieId } },
				{ new: true }
			);
			return res.status(200).json({ message: "Movie removed from favorites" });
		} else {
			await User.findByIdAndUpdate(
				userId,
				{ $push: { favoriteMovies: movieId } },
				{ new: true }
			);
			return res.status(200).json({ message: "Movie added to favorites" });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: "Error when adding or removing the movie from favorites",
		});
	}
};
