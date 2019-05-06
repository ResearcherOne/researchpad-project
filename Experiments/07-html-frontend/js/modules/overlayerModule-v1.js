var overlayerModule = (function () {
	var divId;
	var titleId;

	var divWidthVw;
	var divHeightVh;

	var initializeModule = function(overlayDivId) {
		divId = overlayDivId;
		titleId = divId + "-text";

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

	var clearTitleOverlay = function() {
		document.getElementById(divId).style.display = "none";
	}

	return {
		initializeModule: initializeModule,
		drawTitleOverlay: drawTitleOverlay,
		clearTitleOverlay: clearTitleOverlay
	}
})();