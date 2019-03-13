var overlayerModule = (function () {
	var divId;
	var titleId;

	var abstractDivId;
	var abstractTextId;

	var upperPanelId;
	var infoDivId;

	var divWidthVw;
	var divHeightVh;

	var promptCallback = null;

	function promptUserCallback() {
		if(promptCallback) {
			const userInput = document.getElementById("promptTextBox").value;
			promptCallback(userInput);
			promptCallback = null;
			document.getElementById(divId).style.display = "none";	
		} else {
			document.getElementById(divId).style.display = "none";	
		}
	}

	var initializeModule = function(overlayDivId, upperPanelDivId, abstractDivIdInput) {
		divId = overlayDivId;
		titleId = divId + "-text";

		abstractDivId = abstractDivIdInput;
		abstractTextId = abstractDivId + "-text";
		console.log("abstractDivId: "+abstractDivId);

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

	var drawAbstractOverlay = function(x, y, abstract, journal, authors) {
		document.getElementById(abstractDivId).style.display = "block";

		var offsetWidth = document.getElementById(abstractDivId).offsetWidth;
		var offsetHeight = document.getElementById(abstractDivId).offsetHeight;

	    document.getElementById(abstractDivId).style.left = (x-offsetWidth-20)+"px"; //x
	    document.getElementById(abstractDivId).style.top = (y - (offsetHeight/2))+"px"; //y
	    document.getElementById(abstractTextId).innerHTML = "<b>Abstract</b><br>"+abstract+"<br><br><b>Journal</b><br>"+journal+"<br><br><b>Authors</b><br>"+authors;
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

	    document.getElementById("promptTextBox").value = "";//10.1103/physrevlett.98.010505
	    document.getElementById("promptTextBox").addEventListener("keydown", function(event) {
	    	const ENTER = 13;
			if (event.keyCode === ENTER) {
				event.preventDefault();
				document.getElementById("promptButton").click();
			}
		});
	}

	var informUser = function(text) {
		document.getElementById(divId).style.display = "block";

		var offsetHeight = document.getElementById(divId).offsetHeight;
		var offsetWidth = document.getElementById(divId).offsetWidth;

	    document.getElementById(divId).style.left = 500+"px"; //x
	    document.getElementById(divId).style.top = (500-offsetHeight)+"px"; //y

	    document.getElementById(titleId).innerHTML = text+'<br><button id="promptButton">OK</button>';
	    document.getElementById("promptButton").onclick = promptUserCallback;
	}

	var clearTitleOverlay = function() {
		document.getElementById(divId).style.display = "none";
	}

	var clearAbstractOverlay = function() {
		document.getElementById(abstractDivId).style.display = "none";
	}

	return {
		initializeModule: initializeModule,
		drawTitleOverlay: drawTitleOverlay,
		drawAbstractOverlay: drawAbstractOverlay,
		clearTitleOverlay: clearTitleOverlay,
		clearAbstractOverlay: clearAbstractOverlay,
		promptUser: promptUser,
		informUser: informUser
	}
})();