var logger = require("morgan");
const express = require("express");
var app = express();

app.use(logger("dev"));
app.use(express.json());

const port = process.env.PORT || 3000;

const authRouter = require("./routes/auth");
const moviesRouter = require("./routes/movies");
const userRouter = require("./routes/user");

app.use("/auth", authRouter);
app.use("/movies", moviesRouter);
app.use("/user", userRouter);

app.listen(port, () => console.log(`Server has started on port: ${port}`));
