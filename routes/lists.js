const express = require("express");
const router = express.Router();
const listController = require("../controllers/listController");

router.get("/", listController.getAllLists);

router.get("/:listId", listController.getSingleList);

module.exports = router;
