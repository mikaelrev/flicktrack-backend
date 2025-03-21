const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	profileImage: { type: String, default: null },
	bio: { type: String, default: null },
	quote: { type: String, default: null },
	following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
	followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
	lists: [{ type: mongoose.Schema.Types.ObjectId, ref: "List" }],
	checkedMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
	favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
	comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
