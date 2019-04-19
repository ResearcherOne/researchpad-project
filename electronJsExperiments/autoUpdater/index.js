const express = require("express");
const config = require("./config.json");

const app = express();
const env = process.env.NODE_ENV || "development";
const env_config = config[env];

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
  console.log(req.data);

  res.send("darwin release route");
}

/**
 *
 */
function win32ReleaseRoute(req, res) {
  console.log(req.data);

  res.send("win32 release route");
}
