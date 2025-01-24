const express = require("express");
const router = express.Router();

router.get("/", () => {
	console.log("Hello");
});

router.get("/:listId", () => {
	console.log("These are the lists");
});

module.exports = router;
