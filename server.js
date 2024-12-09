var logger = require("morgan");
const express = require("express");
var app = express();

app.use(logger("dev"));
app.use(express.json());

const port = process.env.PORT || 3000;

const authRouter = require("./routes/auth");

app.use("/auth", authRouter);

app.listen(port, () => console.log(`Server has started on port: ${port}`));
