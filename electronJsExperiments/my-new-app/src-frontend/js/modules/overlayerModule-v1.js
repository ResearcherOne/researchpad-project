var overlayerModule = (function () {
	var divId;
	var titleId;

	var divWidthVw;
	var divHeightVh;

	var promptCallback = null;

	function promptUserCallback() {
		const userInput = document.getElementById("promptTextBox").value;
		promptCallback(userInput);
		promptCallback = null;
		document.getElementById(divId).style.display = "none";
	}

	var initializeModule = function(overlayDivId) {
		divId = overlayDivId;
		titleId = divId + "-text";

		divWidthVw = document.getElementById(divId).style.width;
		divHeightVh = document.getElementById(divId).style.height;
	}

	var drawTitleOverlay = function(x, y, text) {
		console.log("drawTitleOverlay: "+x +" "+y);
		document.getElementById(divId).style.display = "block";

		var offsetHeight = document.getElementById(divId).offsetHeight;
		var offsetWidth = document.getElementById(divId).offsetWidth;

	    document.getElementById(divId).style.left = x+"px"; //x
	    document.getElementById(divId).style.top = (y-offsetHeight)+"px"; //y
	    document.getElementById(titleId).innerHTML = text;
	}

	var promptUser = function(text, callback) {
		document.getElementById(divId).style.display = "block";

		var offsetHeight = document.getElementById(divId).offsetHeight;
		var offsetWidth = document.getElementById(divId).offsetWidth;

	    document.getElementById(divId).style.left = 500+"px"; //x
	    document.getElementById(divId).style.top = (500-offsetHeight)+"px"; //y

	    document.getElementById(titleId).innerHTML = text+'<br><input id="promptTextBox" type="text" placeholder="insert DOI here">' +
	    												'<button id="promptButton">Create Node</button>';
	    document.getElementById("promptButton").onclick = promptUserCallback;
	    promptCallback = callback;

	    document.getElementById("promptTextBox").addEventListener("keyup", function(event) {
			// Cancel the default action, if needed
			event.preventDefault();
			// Number 13 is the "Enter" key on the keyboard
			if (event.keyCode === 13) {
			// Trigger the button element with a click
			document.getElementById("promptButton").click();
			}
		});
	}

	var clearTitleOverlay = function() {
		document.getElementById(divId).style.display = "none";
	}

	return {
		initializeModule: initializeModule,
		drawTitleOverlay: drawTitleOverlay,
		clearTitleOverlay: clearTitleOverlay,
		promptUser: promptUser
	}
})();