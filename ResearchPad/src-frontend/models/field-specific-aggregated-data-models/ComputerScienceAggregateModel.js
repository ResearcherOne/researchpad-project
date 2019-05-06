function ComputerScienceAggregateModel(googleScholarMetadata) {
	this.googleScholarData = googleScholarMetadata;

	this.getTitle = function() {
		return this.googleScholarData.title;
	};
	this.getFullMetadata = function() {
		//Temp. function.
		return this.googleScholarData;
	};
	this.getSearchBarEssential = function() {
		const title = this.googleScholarData.title || "No title";
		const year = this.googleScholarData.year || "?";
		const citationCount = this.googleScholarData.citedByCount || "?";
		const abstract = this.googleScholarData.abstract || "No abstract";

		return {
			title: title,
			year: year,
			citationCount: citationCount,
			abstract: abstract
		};
	};
	this.getSearchBarExtra = function() {
		const abstractText = this.googleScholarData.abstract || "No Abstract";
		const authors = this.googleScholarData.authors || [];
		const journal = this.googleScholarData.journal || "No Journal";

		return {
			abstract: abstractText,
			authors: authors,
			journal: journal
		};
	};
	this.getNodeFullContentData = function() {
		const title = this.googleScholarData.title || "No title";
		const year = this.googleScholarData.year || "No year";
		const citationCount = this.googleScholarData.citedByCount || "No citation.";
		const abstract = this.googleScholarData.abstract || "No abstract";
		const journal = this.googleScholarData.journal || "No journal";
		const authors = this.googleScholarData.authors || "No author";
		const link = this.googleScholarData.link || "";
		return {
			title: title,
			year: year,
			citationCount: citationCount,
			abstract: abstract,
			journal: journal,
			authors: authors,
			link: link
		};
	};
}
