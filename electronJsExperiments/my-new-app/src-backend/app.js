const { ipcMain } = require('electron');

const backendApi = {
	cursorStatusPostTopic: "/cursor-status-changed"
};

function initializeBackend() {
	console.log("Backend initialized.");

	ipcMain.on(backendApi.cursorStatusPostTopic, (event, status) => {
	  console.log(event);
	  console.log(status)
	  var cursorPos = JSON.parse(status);
	  console.log(cursorPos.x + ", " + cursorPos.y);
	});
}

module.exports = {
	initializeBackend: initializeBackend
}