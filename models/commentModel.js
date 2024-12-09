const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
	userID: ObjectId,
	TargetID: ObjectId,
	text: String,
	createdAt: Date,
});

module.exports = mongoose.model("Comment", commentSchema);
