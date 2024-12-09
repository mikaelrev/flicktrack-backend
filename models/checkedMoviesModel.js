const mongoose = require("mongoose");

const checkedMovieSchema = new mongoose.Schema({
	userID: ObjectId,
	MovieID: ObjectId,
	checkedDate: Date,
});

module.exports = mongoose.model("CheckedMovie", checkedMovieSchema);
