function SemanticScholarData(metadata){
    AcademicData.call(this, metadata);
    
    this.getCitationCount = function() {
        if(this.metadata == null || this.metadata.citations == null) return null;
        return this.metadata.citations.length;
    }
    this.getUrl = function() {
        if(this.metadata == null) return null;
        return this.metadata.url;
    }
    this.getTitle = function() {
        if(this.metadata == null) return null;
        return this.metadata.title;
    }
    this.getYear = function() {
        if(this.metadata == null) return null;
        return this.metadata.year.toString();
    }
    this.getAuthorList = function() {
		if(this.metadata == null) return null;
		var authorList = [];
		this.metadata.authors.forEach(function(authorObj){
			if(authorObj.name) {
				authorList.push(authorObj.name);
			}
        });
        return authorList;
    }
    this.getCitations = function() {
        if(this.metadata == null) return null;
        return this.metadata.citations;
    }
    this.getReferences = function() {
        if(this.metadata == null) return null;
        return this.metadata.references;
    }
    this.getPaperId = function() {
        if(this.metadata == null) return null;
        return this.metadata.paperId;
    }
    
    SemanticScholarData.prototype = Object.create(AcademicData.prototype);
	Object.defineProperty(SemanticScholarData.prototype, 'constructor', { 
	    value: ArxivData, 
	    enumerable: false, // so that it does not appear in 'for in' loop
	    writable: true
	});
}
/* Unused Metadata Parts
{
    arxivId: "",
    authors: [
        {
            authorId	"3272922"
            name	"György Buzsáki"
            url	"https://www.semanticscholar.org/author/3272922"
        }
    ],
    citationVelocity: 294,
    doi	"10.1038/nrn3241"
    influentialCitationCount	103
    paperId	"931d6b6ee097eab80b8f89a313c8d3a6d5443cb2"
    venue:	"NeuroImage"

    citations: [
        {
            arxivId: "",
            authors: [],
            doi: "",
            isInfluential: false,
            paperId	"52b67cc87f2b14efa070c5f487ccb9088fc1219b"
            title:	"Hyperedge bundling: A pr…e connectivity analyses"
            url:	"https://www.semanticscho…a070c5f487ccb9088fc1219b"
            venue:	"NeuroImage"
            year:	2018
        }
    ],
    references: [
        {
            arxivId: "",
            authors: [],
            doi: "",
            isInfluential: false,
            paperId	"52b67cc87f2b14efa070c5f487ccb9088fc1219b"
            title:	"Hyperedge bundling: A pr…e connectivity analyses"
            url:	"https://www.semanticscho…a070c5f487ccb9088fc1219b"
            venue:	"NeuroImage"
            year:	2018
        }
    ],
}
*/