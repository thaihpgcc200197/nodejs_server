//add library
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("colors");

const router = require("./app/routes");

const app = express();
const option_cors = {
  origin: "*",
  methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
  withCredentials: false,
  optionsSuccessStatus: 204,
};

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "DELETE, PUT, GET, POST");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(cors(option_cors));

//middleware to get post method value
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
const database = require("./config/database");
database.connect();

const morgan = require("morgan");
// HTTP logger
app.use(morgan("combined"));

// Rout init
app.use("/api", router);

// const IP = "10.0.0.136";
// const IP = "192.168.1.18";

// const PORT = "3000";
// app.listen(PORT, IP, () =>
//   console.log(
//     `Server started`.yellow + `\nListening request on ${IP}:${PORT} `.green
//   )
// );

const PORT = "3000";
app.listen(PORT, () =>
  console.log(`Server started`.yellow + `\nListening request on ${PORT} `.green)
);
