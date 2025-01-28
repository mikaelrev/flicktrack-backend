const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
	tmdbId: { type: String, unique: true, required: true },
	title: { type: String, required: true },
	releaseYear: { type: Number, required: true },
	directedBy: { type: String },
	runtime: { type: Number },
	genre: [{ type: String }],
	actors: [{ type: String }],
	posterUrl: { type: String },
	checkedCount: { type: Number, default: 0 },
	favoriteCount: { type: Number, default: 0 },
});

const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
