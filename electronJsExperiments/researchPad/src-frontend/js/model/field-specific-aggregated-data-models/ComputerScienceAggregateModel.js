function ComputerScienceAggregateModel(googleScholarData){
    this.googleScholarData = googleScholarData;

    this.getSearchBarEssential = function() {
		const title = this.metadata.title || "No title";
		const year = this.metadata.year || "?";
		const citationCount = this.metadata.citedByCount || "?";
		const abstract = this.metadata.abstract || "No abstract";
		
		return {
			title: title,
			year: year,
			citationCount: citationCount,
			abstract: abstract
		}
	};
	this.getSearchBarExtra = function() {
		const abstractText = this.metadata.abstract || "No Abstract";
		const authors = this.metadata.authors || [];
		const journal = this.metadata.journal || "No Journal";

		return {
			abstract: abstractText,
			authors: authors,
			journal: journal
		}
	}
    this.getNodeFullContentData  = function() {
    };
}