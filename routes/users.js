const express = require("express");
const router = express.Router();
const userController = require("../controllers/usersController");

router.get("/", userController.getAllUsers);

router.get("/:userId", userController.getUser);

router.get("/:userId/checked", userController.getUserCheckedMovies);
router.get("/:userId/favorites", userController.getUserFavoriteMovies);

module.exports = router;
