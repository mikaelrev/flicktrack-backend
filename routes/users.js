const express = require("express");
const router = express.Router();
const userController = require("../controllers/usersController");
const movieController = require("../controllers/movieController");

router.get("/", userController.getAllUsers);

router.get("/:userId", userController.getUser);

router.get("/:userId/checked", userController.getUserCheckedMovies);
router.get("/:userId/favorites", userController.getUserFavoriteMovies);

router.post(
	"/:userId/movies/:movieId/checked",
	movieController.addOrRemoveFromChecked
);

module.exports = router;
