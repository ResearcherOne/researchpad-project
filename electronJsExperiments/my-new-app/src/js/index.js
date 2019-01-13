const { ipcRenderer } = require('electron')

const backendApi = {
	cursorStatusPostTopic: "/cursor-status-changed"
};

const updateCursorStatus = (x, y) => {
	var mousePos = {"x": x, "y": y};
	ipcRenderer.send(backendApi.cursorStatusPostTopic, JSON.stringify(mousePos));
}

function showCoords(event) {
	var x = event.clientX;
	var y = event.clientY;
	var coords = "( X coords: " + x + ", Y coords: " + y+ " )";
	document.getElementById("demo").innerHTML = coords;
	updateCursorStatus(x,y);
}