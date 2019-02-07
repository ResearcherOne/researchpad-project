function SearchPanel(searchPanelDivId){
	this.searchPanelDivId = searchPanelDivId;

	firstDivInSearchPanel = document.getElementById(this.searchPanelDivId).getElementsByTagName('div')[0]
	secondDivInSearchPanel = document.getElementById(this.searchPanelDivId).getElementsByTagName('div')[1];

	this.textBox = firstDivInSearchPanel.getElementsByTagName('input')[0];
	this.searchButton = firstDivInSearchPanel.getElementsByTagName('button')[0];

	this.resultsDiv = secondDivInSearchPanel;

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
}