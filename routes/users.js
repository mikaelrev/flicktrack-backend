const express = require("express");
const router = express.Router();
const userController = require("../controllers/usersController");
const movieController = require("../controllers/movieController");
const listController = require("../controllers/listController");

router.get("/", userController.getAllUsers);

router.get("/:userId", userController.getUser);

router.get("/:userId/checked", userController.getUserCheckedMovies);
router.post(
	"/:userId/movies/:movieId/checked",
	movieController.addOrRemoveFromChecked
);

router.get("/:userId/favorites", userController.getUserFavoriteMovies);
router.post(
	"/:userId/movies/:movieId/favorites",
	movieController.addOrRemoveFromFavorites
);

router.get("/:userId/lists", listController.getAllUserLists);

router.post("/:userId/lists/", listController.createNewUserList);
router.post(
	"/:userId/lists/:listId/movies/:movieId",
	listController.addMovieToList
);
router.patch("/:userId/lists/:listId", listController.renameList);
router.delete("/:userId/lists/:listId", listController.deleteList);

router.delete(
	"/:userId/lists/:listId/movies/:movieId",
	listController.removeMovieFromList
);

module.exports = router;
