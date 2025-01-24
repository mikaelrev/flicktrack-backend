const express = require("express");
const router = express.Router();

router.get("/", () => {
	console.log("Hello");
});

router.get("/:movieId", () => {
	console.log("This is the movie");
});

module.exports = router;
