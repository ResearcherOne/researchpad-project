const { app, BrowserWindow } = require("electron");
const { autoUpdater } = require("electron-updater");
const backend = require("./src-backend/app.js");

const env = process.env.NODE_ENV || "production";
let mainWindow;

/* Application event emitters */
app.on("ready", () => {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
    autoUpdater.checkForUpdatesAndNotify();
  }
});

/* Initialize backend application */
backend.initializeBackend();

//-----------------------------------------------------
// Function Definitions
//-----------------------------------------------------

/**
 * Create main window function for
 * electron application
 */
function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // Show main html page
  mainWindow.loadURL(`file://${__dirname}/src-frontend/index.html`);

  // Some development options
  if (env === "development") {
    require("electron-reload")(__dirname);
    mainWindow.webContents.openDevTools();
  }

  // On close event
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
