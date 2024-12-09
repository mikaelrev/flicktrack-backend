const mongoose = require("mongoose");

const movieListModel = new mongoose.Schema({
	userID: ObjectId,
	title: String,
	description: String,
	movies: [ObjectId],
	likes: [ObjectId],
	comments: [
		{
			userID: ObjectId,
			text: String,
			createdAt: Date,
		},
	],
});

module.exports = mongoose.model("MovieList", movieListModel);
