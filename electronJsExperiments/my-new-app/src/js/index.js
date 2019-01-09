const { ipcRenderer } = require('electron')

const updateCursorStatus = (x, y) => {
	ipcRenderer.send('cursor-status-changed', x+" "+y);
}

function showCoords(event) {
	var x = event.clientX;
	var y = event.clientY;
	var coords = "( X coords: " + x + ", Y coords: " + y+ " )";
	document.getElementById("demo").innerHTML = coords;
	updateCursorStatus(x,y);
}