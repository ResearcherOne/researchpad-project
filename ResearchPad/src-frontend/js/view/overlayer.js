var overlayerModule = (function() {
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
		if (promptCallback) {
			const userInput = document.getElementById("promptTextBox").value;
			promptCallback(userInput);
			promptCallback = null;
			document.getElementById(divId).style.display = "none";
		} else {
			document.getElementById(divId).style.display = "none";
		}
	}

	var initializeModule = function(
		overlayDivId,
		upperPanelDivId,
		abstractDivIdInput
	) {
		divId = overlayDivId;
		titleId = divId + "-text";

		abstractDivId = abstractDivIdInput;
		abstractTextId = abstractDivId + "-text";

		upperPanelId = upperPanelDivId;
		infoDivId = upperPanelId + "-info-div";

		divWidthVw = document.getElementById(divId).style.width;
		divHeightVh = document.getElementById(divId).style.height;
	};

	var drawTitleOverlay = function(
		x,
		y,
		title,
		authors,
		year,
		journal,
		citationCount
	) {
		document.getElementById(divId).style.display = "block";

		var offsetHeight = document.getElementById(divId).offsetHeight;
		var offsetWidth = document.getElementById(divId).offsetWidth;

		document.getElementById(divId).style.left = x + "px"; //x.
		document.getElementById(divId).style.top = y - offsetHeight + "px"; //y
		//document.getElementById(titleId).innerHTML = title+"<br><br>"+"Authors: "+authors+"<br>"+"Year: "+year+"<br>"+"Journal: "+journal+"<br>"+"Citation: "+citationCount;
		document.getElementById(titleId).innerHTML =
			title + "<br><br>" + "Citation: " + citationCount + " Year: " + year;
	};

	/**
	 * Method to display the abstract overlay when a user hovers over
	 * an item in the search content
	 */
	var drawAbstractOverlay = function(x, y, abstract, journal, authors) {
		const overlayMargin = 1; // In vw/vh
		const yBottomMax = window.innerHeight;
		const yTopMax = 0;

		var overlay = document.getElementById(abstractDivId);
		var overlayText = document.getElementById(abstractTextId);

		// Add information to overlay text
		overlayText.innerHTML =
			"<span><b>Abstract</b><br>" +
			abstract +
			"<br><br><b>Journal</b><br>" +
			journal +
			"<br><br><b>Authors</b><br>" +
			authors +
			"</span>";

		// Display overlay to screen
		overlay.style.display = "flex";
		overlay.style.right = 20 + overlayMargin + "vw";
		overlay.style.top = y - overlay.offsetHeight / 2 + "px";

		// Handle overflow on bottom
		var overlayRect = overlay.getBoundingClientRect();
		if (overlayRect.bottom > yBottomMax) {
			overlay.style.top = "auto";
			overlay.style.bottom = overlayMargin + "vh";
		}

		// Handle overflow on top
		if (overlayRect.top < yTopMax) {
			overlay.style.top = overlayMargin + "vh";
		}
	};

	var promptUser = function(text, callback) {
		document.getElementById(divId).style.display = "block";

		var offsetHeight = document.getElementById(divId).offsetHeight;
		var offsetWidth = document.getElementById(divId).offsetWidth;

		document.getElementById(divId).style.left = 500 + "px"; //x
		document.getElementById(divId).style.top = 500 - offsetHeight + "px"; //y

		document.getElementById(titleId).innerHTML =
			text +
			'<br><input id="promptTextBox" type="text" placeholder="insert DOI here">' +
			'<button id="promptButton">Create Node</button>';
		document.getElementById("promptButton").onclick = promptUserCallback;
		promptCallback = callback;

		document.getElementById("promptTextBox").value = ""; //10.1103/physrevlett.98.010505
		document
			.getElementById("promptTextBox")
			.addEventListener("keydown", function(event) {
				const ENTER = 13;
				if (event.keyCode === ENTER) {
					event.preventDefault();
					document.getElementById("promptButton").click();
				}
			});
	};

	var informUser = function(text) {
		document.getElementById(divId).style.display = "block";

		var offsetHeight = document.getElementById(divId).offsetHeight;
		var offsetWidth = document.getElementById(divId).offsetWidth;

		document.getElementById(divId).style.left = 500 + "px"; //x
		document.getElementById(divId).style.top = 500 - offsetHeight + "px"; //y

		document.getElementById(titleId).innerHTML =
			text + '<br><button id="promptButton">OK</button>';
		document.getElementById("promptButton").onclick = promptUserCallback;
	};

	var clearTitleOverlay = function() {
		document.getElementById(divId).style.display = "none";
	};

	var clearAbstractOverlay = function() {
		document.getElementById(abstractDivId).style.display = "none";
	};

	return {
		initializeModule: initializeModule,
		drawTitleOverlay: drawTitleOverlay,
		drawAbstractOverlay: drawAbstractOverlay,
		clearTitleOverlay: clearTitleOverlay,
		clearAbstractOverlay: clearAbstractOverlay,
		promptUser: promptUser,
		informUser: informUser
	};
})();
