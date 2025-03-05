const User = require("../models/userModel");
const Comment = require("../models/commentModel");
const Movie = require("../models/movieModel");
const ActivityTracker = require("../models/activityTrackerModel");

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

		await User.findByIdAndUpdate(userId, {
			$push: { comments: newComment._id },
		});

		await ActivityTracker.create({
			user: userId,
			activity: "commented",
			targetMovie: movieId,
			comment: newComment._id,
		});

		res.status(201).json(newComment);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error adding comment" });
	}
};

exports.deleteComment = async (req, res) => {
	try {
		const { commentId } = req.params;
		const userId = req.user.userId;

		if (!commentId || !userId) {
			return res.status(400).json({ message: "Comment or user ID missing" });
		}

		const comment = await Comment.findById(commentId);

		if (!comment) {
			return res.status(404).json({ message: "Comment not found" });
		}

		if (comment.user.toString() !== userId) {
			return res
				.status(403)
				.json({ message: "Unauthorized to delete this comment" });
		}

		await comment.deleteOne();

		await Movie.findByIdAndUpdate(comment.movie, {
			$pull: { comments: commentId },
		});

		await User.findByIdAndUpdate(userId, {
			$pull: { comments: commentId },
		});

		await ActivityTracker.findOneAndDelete({
			comment: commentId,
		});

		res.status(204).json();
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error adding comment" });
	}
};
