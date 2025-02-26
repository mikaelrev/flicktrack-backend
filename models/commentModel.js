const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
	content: { type: String, required: true },
	likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
	dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
	movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
	user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
