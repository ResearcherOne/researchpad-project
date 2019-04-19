const express = require("express");
const config = require("./config.json");

const app = express();
const env = process.env.NODE_ENV || "development";
const env_config = config[env];

// Server routes
app.get("/updates/latest", latestUpdateRoute);

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
