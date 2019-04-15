function ArxivData(metadata){
    AcademicData.call(this, metadata);

	this.getSearchBarEssential = function() {
		const extractedYear = new Date(this.metadata.published).getFullYear();

		const title = this.metadata.title || "No title";
		const year = extractedYear || "?";
		const citationCount = this.metadata.citedByCount || "?";
		const abstract = this.metadata.summary || "No abstract";
		
		return {
			title: title,
			year: year,
			citationCount: citationCount,
			abstract: abstract
		}
	};
	this.getSearchBarExtra = function() {
		const authorList = [];
		this.metadata.authors.forEach(function(authorObj){
			if(authorObj.name) {
				authorList.push(authorObj.name);
			}
		});

		const abstractText = this.metadata.summary || "No Abstract";
		const authors = authorList || [];
		const journal = this.metadata.journal || "No Journal";

		return {
			abstract: abstractText,
			authors: authors,
			journal: journal
		}
    }
    
    ArxivData.prototype = Object.create(AcademicData.prototype);
	Object.defineProperty(ArxivData.prototype, 'constructor', { 
	    value: ArxivData, 
	    enumerable: false, // so that it does not appear in 'for in' loop
	    writable: true
	});
}