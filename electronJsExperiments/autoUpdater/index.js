const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const config = require("./config.json");

const app = express();
const env = process.env.NODE_ENV || "development";
const env_config = config[env];

app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: true}));

// Server routes
app.get("/updates/latest", latestUpdateRoute);
app.post("/release/darwin", darwinReleaseRoute);
app.post("/release/win32", win32ReleaseRoute);
app.use(function(req, res) {
  res.status(404).send("404 path not found");
});

// Start server
app.listen(env_config.port, function() {
  console.log("Listening on Port: " + env_config.port);
});

/**
 *
 */
function latestUpdateRoute(req, res) {
  console.log(req.query.v);

  res.json({
    url: ""
  });
}

/**
 *
 */
function darwinReleaseRoute(req, res) {
  fs.writeFileSync("testdata.json", JSON.stringify(req.body))
  res.send("darwin release route");
}

/**
 *
 */
function win32ReleaseRoute(req, res) {

  res.send("win32 release route");
}
