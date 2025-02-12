const express = require("express");
const router = express.Router();
const userController = require("../controllers/usersController");
const movieController = require("../controllers/movieController");
const listController = require("../controllers/listController");
const { protect } = require("../middleware/protect");

router.get("/", userController.getAllUsers);

router.get("/:userId", userController.getUser);

router.get("/:userId/checked", userController.getUserCheckedMovies);
router.post("/movies/:movieId/checked", protect, movieController.addToChecked);
router.delete(
	"/movies/:movieId/checked",
	protect,
	movieController.removeFromChecked
);

router.get("/:userId/favorites", userController.getUserFavoriteMovies);
router.post(
	"/movies/:movieId/favorites",
	protect,
	movieController.addToFavorites
);
router.delete(
	"/movies/:movieId/favorites",
	protect,
	movieController.removeFromFavorites
);

router.get("/:userId/lists", listController.getAllUserLists);

router.post("/lists/", protect, listController.createNewUserList);
router.post(
	"/lists/:listId/movies/:movieId",
	protect,
	listController.addMovieToList
);
router.patch("/lists/:listId", protect, listController.renameList);
router.delete("/lists/:listId", protect, listController.deleteList);

router.delete(
	"/lists/:listId/movies/:movieId",
	protect,
	listController.removeMovieFromList
);

module.exports = router;
