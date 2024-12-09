const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: [true, "A user must have a username"],
		trim: true,
	},
	email: {
		type: String,
		required: [true, "A user must have an email"],
		unique: true,
		lowercase: true,
		validate: {
			validator: function (val) {
				return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(val);
			},
			message: "Please provide a valid email address",
		},
	},
	password: {
		type: String,
		required: [true, "A user must have a password"],
		minlength: 8,
	},
	bio: {
		type: String,
	},
	profilePicture: {
		type: String,
	},
	followers: [ObjectId],
	following: [ObjectId],
	createdLists: [ObjectId],
	checkedMovies: [ObjectId],
});

module.exports = mongoose.model("User", userSchema);
