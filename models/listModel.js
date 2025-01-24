const mongoose = require("mongoose");

const listSchema = new mongoose.Schema({
	name: { type: String, required: true },
	owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	movies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

const List = mongoose.model("List", listSchema);

module.exports = List;
