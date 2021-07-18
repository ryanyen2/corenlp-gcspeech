const express = require("express");
// const path = require("path");
const logger = require("morgan");
const cors = require("cors");
const indexRouter = require("./routes/index");
const {startSocketIO} = require("./utils/ioSocket");
require('dotenv').config();

const app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, "../client/dist")))
app.use("/", indexRouter);

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});


// setup server
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`listening on ${HOST}:${PORT}`);
});

// start socket connection
startSocketIO(server);