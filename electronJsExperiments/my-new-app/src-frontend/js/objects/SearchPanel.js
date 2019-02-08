function SearchPanel(searchPanelDivId){
	this.searchPanelDivId = searchPanelDivId;

	firstDivInSearchPanel = document.getElementById(this.searchPanelDivId).getElementsByTagName('div')[0]
	secondDivInSearchPanel = document.getElementById(this.searchPanelDivId).getElementsByTagName('div')[1];

	this.textBox = firstDivInSearchPanel.getElementsByTagName('input')[0];
	this.searchButton = firstDivInSearchPanel.getElementsByTagName('button')[0];

	this.resultsDiv = secondDivInSearchPanel;

	var searchRequestReceivedCallback;

	var searchButtonPressedCallback = function() {
		const userInput = firstDivInSearchPanel.getElementsByTagName('input')[0].value;
		searchRequestReceivedCallback(userInput);
		firstDivInSearchPanel.getElementsByTagName('input')[0].value = "";
	}

	this.searchButton.addEventListener("click", searchButtonPressedCallback);

	this.addResultElement = function(paperTitle) {
		console.log("PAPER TITLE: "+paperTitle);
		var newDiv = document.createElement("div");
		var p = document.createElement("p");
		p.textContent = paperTitle;
		
		p.className = "unselectable";
		newDiv.appendChild(p);

		this.resultsDiv.appendChild(newDiv);
	}

	this.clearResults = function() {
		this.resultsDiv.innerHTML = "";
	}

	this.setSearchRequestReceivedCallback = function(callback) {
		searchRequestReceivedCallback = callback;
	}
}