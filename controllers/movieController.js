const axios = require("axios");
const User = require("../models/userModel");
const Movie = require("../models/movieModel");

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
		const tmdbId = req.params.movieId;

		let movie = await Movie.findOne({ tmdbId });

		if (!movie) {
			const response = await axios.get(
				`https://api.themoviedb.org/3/movie/${tmdbId}`,
				{
					params: {
						api_key: TMDB_API_KEY,
						language: "en-US",
					},
				}
			);

			const movie = response.data;
			const castResponse = await axios.get(
				`https://api.themoviedb.org/3/movie/${tmdbId}/credits`,
				{
					params: { api_key: TMDB_API_KEY, language: "en-US" },
				}
			);

			const actors = castResponse.data.cast
				.splice(0, 5)
				.map((actor) => actor.name);

			movie = new Movie({
				tmdbId,
				title: movieData.title,
				releaseYear: parseInt(movieData.release_date.split("-")[0]),
				directedBy: movieData.director || "Unknown",
				runtime: movieData.runtime,
				genre: movieData.genres.map((genre) => genre.name),
				actors,
				posterUrl: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
			});

			await movie.save();
		}

		res.status(200).json(movie);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching the movie from TMDb" });
	}
};

exports.addOrRemoveFromChecked = async (req, res) => {
	try {
		const userId = req.params.userId;
		const tmdbId = req.params.movieId;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		let movie = await Movie.findOne({ tmdbId });

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

			movie = new Movie({
				tmdbId,
				title: movieData.title,
				releaseYear: parseInt(movieData.release_date.split("-")[0]),
				directedBy: movieData.director || "Unknown",
				runtime: movieData.runtime,
				genre: movieData.genres.map((genre) => genre.name),
				actors,
				posterUrl: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
			});

			await movie.save();
		}

		const isMovieChecked = user.checkedMovies.some(
			(checkedMovie) => checkedMovie.toString() === movie._id.toString()
		);

		if (isMovieChecked) {
			user.checkedMovies = user.checkedMovies.filter(
				(checkedMovie) => checkedMovie.toString() !== movie._id.toString()
			);

			await user.save();

			await Movie.findByIdAndUpdate(movie._id, {
				$inc: { checkedCount: -1 },
			});

			return res
				.status(200)
				.json({ message: "Movie removed from checked list" });
		} else {
			user.checkedMovies.push(movie._id);
			await Movie.findByIdAndUpdate(movie._id, {
				$inc: { checkedCount: 1 },
			});
			await user.save();

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
