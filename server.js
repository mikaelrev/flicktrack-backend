var logger = require("morgan");
const express = require("express");
var app = express();

const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

app.use(logger("dev"));
app.use(express.json());

const cors = require("cors");
app.use(cors());

const DB = process.env.DATABASE.replace(
	"<PASSWORD>",
	process.env.DATABASE_PASSWORD
);

mongoose
	.connect(DB)
	.then(() => console.log("DB connection successful:"))
	.catch((err) => console.log("DB connection error:", err));

const port = process.env.PORT || 3000;

const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const moviesRouter = require("./routes/movies");
const listsRouter = require("./routes/lists");
const commentsRouter = require("./routes/comments");
const activitiesRouter = require("./routes/activities");

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/movies", moviesRouter);
app.use("/lists", listsRouter);
app.use("/comments", commentsRouter);
app.use("/activities", activitiesRouter);

app.listen(port, () => console.log(`Server has started on port: ${port}`));
