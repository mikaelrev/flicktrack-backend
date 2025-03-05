const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/protect");
const commentController = require("../controllers/commentController");

router.post("/:movieId", protect, commentController.addComment);
router.delete("/:commentId", protect, commentController.deleteComment);

module.exports = router;
