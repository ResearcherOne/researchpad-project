function PhysicsAggregateModel(arxivMetadata, semanticScholarMetadata){
    this.arxivData = new ArxivData(arxivMetadata);
    this.semanticScholarData = new SemanticScholarData(semanticScholarMetadata);

    this.getArxivMetadata = function() {
        return this.arxivData.getFullMetadata();
    }

    this.getSearchBarEssential = function() {
        const title = this.arxivData.getTitle() || "No title";
        const year = this.arxivData.getYear() || "?";
        const citationCount = this.semanticScholarData.getCitationCount() || "?";
        const abstract = this.arxivData.getAbstract() || "No abstract";

        return {
            title: title,
            year: year,
            citationCount: citationCount,
            abstract: abstract
        }
	};
	this.getSearchBarExtra = function() {
        const abstractText = this.arxivData.getAbstract() || "No Abstract";
        const authors = this.arxivData.getAuthorList() || [];
        const journal = "No Journal";

        return {
            abstract: abstractText,
            authors: authors,
            journal: journal
        }
    };
    this.getNodeFullContentData  = function() {
        const title = this.arxivData.getTitle() || this.semanticScholarData.getTitle() || "No title";
        const year = this.arxivData.getYear() || this.semanticScholarData.getYear() || "?";
        const citationCount = this.semanticScholarData.getCitationCount() || "?";
        const abstract = this.arxivData.getAbstract() || "Abstract is not available.";
        const authors = this.arxivData.getAuthorList() || this.semanticScholarData.getAuthorList();
        const journal = "Journal name is not available.";
        const link = this.semanticScholarData.getUrl() || "";
        return {
            title: title,
            year: year,
            citationCount: citationCount,
            abstract: abstract,
            journal: journal,
            authors: authors,
            link: link
        }
    };
}