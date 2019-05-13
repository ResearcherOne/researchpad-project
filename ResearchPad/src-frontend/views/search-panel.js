function SearchPanel(searchPanelDivId) {
	let searchPanelShadowDivId = searchPanelDivId + "-shadow";
	let firstDivInSearchPanel = document
		.getElementById(searchPanelDivId)
		.getElementsByTagName("div")[0];
	let secondDivInSearchPanel = document
		.getElementById(searchPanelDivId)
		.getElementsByTagName("div")[1];
	let searchRequestReceivedCallback;

	this.searchPanelDivId = searchPanelDivId;
	this.searchTitle = firstDivInSearchPanel.getElementsByTagName("p")[0];
	this.textBox = firstDivInSearchPanel.getElementsByTagName("input")[0];
	this.searchButton = firstDivInSearchPanel.getElementsByTagName("button")[0];
	this.resultsDiv = secondDivInSearchPanel;
	this.isSearchDisabled = false;

	let searchButtonPressedCallback = function() {
		let userInput = firstDivInSearchPanel.getElementsByTagName("input")[0]
			.value;

		// Search only if search box has value
		if (userInput.length > 0) {
			searchRequestReceivedCallback(userInput);

			firstDivInSearchPanel.getElementsByTagName("button")[0].disabled = true;
			document.getElementById(searchPanelShadowDivId).style.display = "flex";
		}
	};

	this.searchButton.addEventListener("click", searchButtonPressedCallback);
	this.textBox.addEventListener("keydown", function(event) {
		const ENTER = 13;
		if (event.keyCode === ENTER && !this.isSearchDisabled) {
			event.preventDefault();
			searchButtonPressedCallback();
		}
	});

	this.addResultElement = function(
		tagNo,
		paperTitle,
		citationCount,
		year,
		abstract,
		mouseEnterCallback,
		mouseLeaveCallback
	) {
		var newDiv = document.createElement("div");
		newDiv.setAttribute("tagNo", tagNo);
		var p = document.createElement("p");
		p.setAttribute("tagNo", tagNo);
		p.textContent = paperTitle;
		newDiv.appendChild(p);

		var citationAndYearDiv = document.createElement("div");
		citationAndYearDiv.setAttribute("tagNo", tagNo);
		var p2 = document.createElement("p");
		p2.setAttribute("tagNo", tagNo);
		p2.textContent = "Citation: " + citationCount + " Year: " + year; //+" \nAbstract: "+abstract;
		citationAndYearDiv.appendChild(p2);

		newDiv.appendChild(citationAndYearDiv);

		newDiv.addEventListener("mouseenter", mouseEnterCallback);
		newDiv.addEventListener("mouseleave", mouseLeaveCallback);

		this.resultsDiv.appendChild(newDiv);
	};

	this.clearResults = function() {
		this.resultsDiv.innerHTML = "";
	};

	this.enableNextSearch = function() {
		this.searchButton.disabled = false;
		this.isSearchDisabled = false;
		document.getElementById(searchPanelShadowDivId).style.display = "none";
	};

	this.setSearchRequestReceivedCallback = function(callback) {
		searchRequestReceivedCallback = callback;
	};

	this.setColorOfSearchResultElement = function(tagNo, color) {
		var elements = this.resultsDiv.querySelectorAll('[tagNo="' + tagNo + '"]');
		elements.forEach(function(element) {
			element.style.color = color;
		});
	};
	this.setSearchPanelTitle = function(text) {
		this.searchTitle.innerHTML = text;
	};
}
