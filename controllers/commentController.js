const Comment = require("../models/commentModel");
const Movie = require("../models/movieModel");

exports.addComment = async (req, res) => {
	try {
		const { movieId } = req.params;
		const { content } = req.body;
		const userId = req.user.userId;

		if (!content.trim()) {
			return res.status(400).json({ message: "Comment cannot be empty" });
		}

		const newComment = new Comment({
			content,
			movie: movieId,
			user: userId,
		});
		await newComment.save();

		await Movie.findByIdAndUpdate(movieId, {
			$push: { comments: newComment._id },
		});

		res.status(201).json(newComment);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error adding comment" });
	}
};
