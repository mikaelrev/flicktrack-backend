const mongoose = require("mongoose");

const checkedMoviesSchema = new mongoose.Schema({
	userID: ObjectId,
	MovieID: ObjectId,
	checkedDate: Date,
});

module.exports = mongoose.model("CheckedMovies", checkedMoviesSchema);
