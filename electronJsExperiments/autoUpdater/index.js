const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const config = require("./config.json"); // Config file

const app = express();
const env = process.env.NODE_ENV || "development";
const env_config = config[env];

//const data = JSON.parse(fs.readFileSync("testdata.json"));

app.use(bodyParser.json());

// Darwin release routes
app.get("/updates/darwin/latest", latestUpdateDarwinRoute);
app.post("/release/darwin", darwinReleaseRoute);

// Windows release routes
app.get("/updates/win32/latest", latestUpdateWin32Route);
app.post("/release/win32", win32ReleaseRoute);

// Route not found
app.use(function(req, res) {
  res.status(404).send("404 path not found");
});

// Start server
app.listen(env_config.port, function() {
  console.log("Listening on Port: " + env_config.port);
});

//****************************************************
// Routing Functions for express
//****************************************************

/*
 */
function latestUpdateDarwinRoute(req, res) {
  const darwinReleasePath = env_config.release_dirs.darwin;
  const latestVersion = getLatestVersion(darwinReleasePath);
  const clientVersion = req.query.v;

  // Invalid query parameters
  if (!req.query.hasOwnProperty("v")) {
    return res.status(204).end();
  }

  // Check if version is already latest
  if (clientVersion === latestVersion) {
    return res.status(204).end();
  }

  // Send .zip release url from github to client
  res.json({
    url: getVersionUrl(darwinReleasePath, latestVersion)
  });
}

/* Function route that should be connected to a
 * GitHub webhook for "Releases" events only. This
 * can be setup under:
 *
 *    Repository->Settings->Webhooks->Add webhook
 *
 * Method will create a new vesion file with the
 * tag name given to the release version on GitHub. A
 * file will be created with the data from the webhook
 * event.
 */
function darwinReleaseRoute(req, res) {
  const eventType = "publish";
  const hookData = req.body;
  let versionTag = null;

  // Check if there is a valid event
  if (!req.hasOwnProperty("body") || !req.body.hasOwnProperty("action")) {
    return res.status(204).send("unknown webhook event");
  }

  // Check for invalid event action
  if (hookData.action !== eventType) {
    return res
      .status(204)
      .send("ignored webhook event action " + hookData.action);
  }

  console.log(hookData.release);

  res.send("darwin version " + versionTag + " saved as latest");
}

/*
 */
function latestUpdateWin32Route(req, res) {
  // Nothing for now
  res.status(204).end();
}

/*
 */
function win32ReleaseRoute(req, res) {
  // Nothing for now
  res.send("win32 release route");
}

//****************************************************
// Util Functions
//****************************************************

/* Function that supports grabbing the latest version
 * file from a given directory. Only supports version
 * numbering following the format xxxx.xxxx.xxxx
 *
 * All directory names are filtered out to only return
 * version file names.
 */
function getLatestVersion(releasePath) {
  const dir = path.join(__dirname, releasePath);

  // Only grabs version files
  const versionFiles = fs
    .readdirSync(dir)
    .filter(file => {
      const filePath = path.join(dir, file);
      return !fs.statSync(filePath).isDirectory();
    })
    .sort()
    .reverse();

  return versionFiles[0];
}

/* Function that reads a version release file and
 * returns the .zip file url of the given release
 * repository on GitHub.
 */
function getVersionUrl(releasePath, version) {
  const versionFile = path.join(__dirname, releasePath, version);
  const versionData = JSON.parse(fs.readFileSync(versionFile));

  return versionData.zip_url;
}

/*
 */
function createVersion(releasePath, githubInfo) {}
