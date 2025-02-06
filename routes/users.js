const express = require("express");
const router = express.Router();
const userController = require("../controllers/usersController");
const movieController = require("../controllers/movieController");
const listController = require("../controllers/listController");
const { protect } = require("../middleware/protect");

router.get("/", userController.getAllUsers);

router.get("/:userId", userController.getUser);

router.get("/:userId/checked", userController.getUserCheckedMovies);
router.post(
	"/:userId/movies/:movieId/checked",
	protect,
	movieController.addOrRemoveFromChecked
);

router.get("/:userId/favorites", userController.getUserFavoriteMovies);
router.post(
	"/:userId/movies/:movieId/favorites",
	protect,
	movieController.addOrRemoveFromFavorites
);

router.get("/:userId/lists", listController.getAllUserLists);

router.post("/:userId/lists/", protect, listController.createNewUserList);
router.post(
	"/:userId/lists/:listId/movies/:movieId",
	protect,
	listController.addMovieToList
);
router.patch("/:userId/lists/:listId", protect, listController.renameList);
router.delete("/:userId/lists/:listId", protect, listController.deleteList);

router.delete(
	"/:userId/lists/:listId/movies/:movieId",
	protect,
	listController.removeMovieFromList
);

module.exports = router;
