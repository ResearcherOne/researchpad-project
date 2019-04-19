const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const config = require("./config.json"); // Config file

const app = express();
const env = process.env.NODE_ENV || "development";
const env_config = config[env];

// Middlewares
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

/* Function route that will return the url of the latest
 * software release from github. This url will point to
 * a .zip file download
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
  return res.json({
    url: getVersionUrl(darwinReleasePath, latestVersion)
  });
}

/* Function route that should be connected to a
 * GitHub webhook for darwin "Releases" events only. This
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
  const darwinReleaseBranch = env_config.release_branches.darwin;
  const darwinReleasePath = env_config.release_dirs.darwin;
  const eventType = "published";
  const hookData = req.body;

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

  // Create version file and do validation
  let info = createVersion(darwinReleasePath, hookData);
  if (
    !validVersionName(info.version) &&
    info.from_branch === darwinReleaseBranch
  ) {
    deleteVersion(darwinReleasePath, info.version);
    return res.status(204).send("invalid tag name " + info.version);
  }

  return res.send("darwin version " + info.version + " saved as latest");
}

/* TODO: Windows latest release path
 */
function latestUpdateWin32Route(req, res) {
  // Nothing for now
  return res.status(204).end();
}

/* TODO: Windows release webhook path
 */
function win32ReleaseRoute(req, res) {
  // Nothing for now
  return res.send("win32 release route");
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

/* Function to create a version file that will have
 * the name of the release version. Some useful information
 * about the release event is stored in the file in a json
 * object.
 *
 * If directory does not exist, it will be created
 * recursively
 */
function createVersion(releasePath, info) {
  const version = info.release.tag_name;
  const file = path.join(__dirname, releasePath, version);
  const versionData = {
    version: version,
    release_name: info.release.name,
    created_at: info.release.created_at,
    from_branch: info.release.target_commitish,
    github_page: info.release.html_url,
    description: info.release.body,
    sender_name: info.sender.login,
    sender_page: info.sender.url,
    zip_url: info.release.zipball_url,
    repo: info.repository.full_name
  };

  // write data to version file
  try {
    let data = JSON.stringify(versionData, null, "\t");

    // Create directory if it doesn't exist
    if (!fs.existsSync(releasePath)) {
      fs.mkdirSync(releasePath, { recursive: true });
    }
    fs.writeFileSync(file, data);
  } catch (err) {
    //TODO: logging
  }

  return versionData;
}

/* Basic version number naming check to ensure the
 * version number is in the format xxxx.xxxx.xxxx
 *
 * Checks for 3 numbers split by two periods
 */
function validVersionName(version) {
  const split = version.split(".");

  // Check length and if each part is a number
  if (split.length != 3) return false;
  for (let num of split) {
    if (isNaN(Number(num))) {
      return false;
    }
  }

  return true;
}

/* Function that will delete a version file
 */
function deleteVersion(releasePath, version) {
  const file = path.join(__dirname, releasePath, version);

  try {
    fs.unlinkSync(file);
  } catch (err) {
    //TODO: Add logging
  }
}
