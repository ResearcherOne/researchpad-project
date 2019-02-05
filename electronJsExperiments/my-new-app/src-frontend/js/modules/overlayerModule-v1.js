var overlayerModule = (function () {
	var divId;
	var titleId;

	var upperPanelId;
	var infoDivId;

	var divWidthVw;
	var divHeightVh;

	var displayInfoTimeout;

	var promptCallback = null;

	function promptUserCallback() {
		const userInput = document.getElementById("promptTextBox").value;
		promptCallback(userInput);
		promptCallback = null;
		document.getElementById(divId).style.display = "none";
	}

	var initializeModule = function(overlayDivId, upperPanelDivId) {
		divId = overlayDivId;
		titleId = divId + "-text";

		upperPanelId = upperPanelDivId;
		infoDivId = upperPanelId + "-info-div";

		divWidthVw = document.getElementById(divId).style.width;
		divHeightVh = document.getElementById(divId).style.height;
	}

	var drawTitleOverlay = function(x, y, text) {
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

	    document.getElementById("promptTextBox").value = "10.1103/physrevlett.98.010505";
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

	var displayInfo = function(text) {
		const durationSec = 5;

		document.getElementById(infoDivId).innerHTML = text;
		if(displayInfoTimeout) {
			clearTimeout(displayInfoTimeout);
		}

		displayInfoTimeout = setTimeout(function(){
			document.getElementById(infoDivId).innerHTML = "";
		}, durationSec*1000);
	}

	var clearTitleOverlay = function() {
		document.getElementById(divId).style.display = "none";
	}

	return {
		initializeModule: initializeModule,
		drawTitleOverlay: drawTitleOverlay,
		clearTitleOverlay: clearTitleOverlay,
		promptUser: promptUser,
		displayInfo: displayInfo
	}
})();