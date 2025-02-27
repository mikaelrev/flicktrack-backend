const express = require("express");
const router = express.Router();
const activityTrackerController = require("../controllers/activityTrackerController");

router.get("/", activityTrackerController.getAllActivities);

module.exports = router;
