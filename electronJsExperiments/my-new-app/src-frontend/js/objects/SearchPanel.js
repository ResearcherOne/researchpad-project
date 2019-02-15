function SearchPanel(searchPanelDivId){
	this.searchPanelDivId = searchPanelDivId;

	var searchPanelShadowDivId = this.searchPanelDivId+"-shadow";
	var firstDivInSearchPanel = document.getElementById(this.searchPanelDivId).getElementsByTagName('div')[0]
	var secondDivInSearchPanel = document.getElementById(this.searchPanelDivId).getElementsByTagName('div')[1];

	this.textBox = firstDivInSearchPanel.getElementsByTagName('input')[0];
	this.searchButton = firstDivInSearchPanel.getElementsByTagName('button')[0];

	this.resultsDiv = secondDivInSearchPanel;

	this.isSearchDisabled = false;

	var searchRequestReceivedCallback;

	var searchButtonPressedCallback = function() {
		const userInput = firstDivInSearchPanel.getElementsByTagName('input')[0].value;
		if(userInput.length > 0) {
	 		searchRequestReceivedCallback(userInput);
			firstDivInSearchPanel.getElementsByTagName('input')[0].value = "";
			firstDivInSearchPanel.getElementsByTagName('button')[0].disabled = true;
			document.getElementById(searchPanelShadowDivId).style.display = "flex";
		} else {
			//no input.
		}
	}

	this.searchButton.addEventListener("click", searchButtonPressedCallback);

	this.textBox.addEventListener("keydown", function(event) {
		const ENTER = 13;
		if (event.keyCode === ENTER && !this.isSearchDisabled) {
			event.preventDefault();
			searchButtonPressedCallback();
		}
	});

	this.addResultElement = function(tagNo, paperTitle) {
		var newDiv = document.createElement("div");
		newDiv.setAttribute("tagNo", tagNo);
		var p = document.createElement("p");
		p.setAttribute("tagNo", tagNo);
		p.textContent = paperTitle;
		
		//p.className = "unselectable";
		newDiv.appendChild(p);

		this.resultsDiv.appendChild(newDiv);
	}

	this.clearResults = function() {
		this.resultsDiv.innerHTML = "";
	}

	this.enableNextSearch = function() {
		this.searchButton.disabled = false;
		this.isSearchDisabled = false;
		document.getElementById(searchPanelShadowDivId).style.display = "none";
	}

	this.setSearchRequestReceivedCallback = function(callback) {
		searchRequestReceivedCallback = callback;
	}
}