const { app, BrowserWindow, autoUpdater, ipcMain } = require("electron");
const os = require("os");

const backend = require("./src-backend/app.js");
const package = require("./package.json");

const appVersion = package.version;
const platform = os.platform();
const env = process.env.NODE_ENV || "production";
const updateServerHost =
  "ec2-54-70-142-30.us-west-2.compute.amazonaws.com:3000"; //"localhost:3000"; // Domain name of update server

const { app, BrowserWindow, ipcMain } = require("electron");
const backend = require("./src-backend/app.js");

let updateFeed = null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

// Get links for build releases
if (env === "production") {
  updateFeed =
    platform === "darwin"
      ? `http://${updateServerHost}/updates/darwin/latest`
      : null;
}

// Setup autoUpdater with feed link
if (updateFeed !== null) {
  autoUpdater.setFeedURL(updateFeed + "?v=" + appVersion);
  autoUpdater.checkForUpdates();
}

// Added live reload for development
require("electron-reload")(__dirname);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    resizable: false
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/src-frontend/index.html`);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

backend.initializeBackend();
//console.log("User Data: "+app.getPath("userData"))

console.log("App path: " + app.getAppPath());
