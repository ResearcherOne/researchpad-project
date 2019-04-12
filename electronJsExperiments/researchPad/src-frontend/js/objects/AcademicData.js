function AcademicData(platform, metadata){
	this.platform = platform;
	this.metadata = metadata;
	
	this.getPlatform = function() {
		return this.platform;
	}
	this.getFullMetadata = function() {
		return this.metadata
	};
	this.getSearchBarEssentialGoogle = function() {
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
	this.getSearchBarExtraGoogle = function() {
		const abstractText = this.metadata.abstract || "No Abstract";
		const authors = this.metadata.authors || [];
		const journal = this.metadata.journal || "No Journal";

		return {
			abstract: abstractText,
			authors: authors,
			journal: journal
		}
	}
	this.getSearchBarEssentialArxiv = function() {
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
	this.getSearchBarExtraArxiv = function() {
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
}