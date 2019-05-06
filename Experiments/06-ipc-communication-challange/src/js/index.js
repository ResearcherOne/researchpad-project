const { ipcRenderer } = require('electron')

const updateCursorStatus = (x, y) => {
	var mousePos = {"x": x, "y": y};
	ipcRenderer.send('cursor-status-changed', JSON.stringify(mousePos));
	//ipcRenderer.send("YOYO");
}

function showCoords(event) {
	var x = event.clientX;
	var y = event.clientY;
	var coords = "( X coords: " + x + ", Y coords: " + y+ " )";
	document.getElementById("demo").innerHTML = coords;
	updateCursorStatus(x,y);
}