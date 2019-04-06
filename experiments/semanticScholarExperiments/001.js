const rp = require('request-promise');
const fetch = require('node-fetch')

function createUrlWithSemanticPaper(id){
    return "http://api.semanticscholar.org/v1/paper/"+id
        +"?include_unknown_references=true";
}

function createUrlWithDOI(doi){
    return "http://api.semanticscholar.org/v1/paper/"+doi
        +"?include_unknown_references=true";
}

function createUrlWithArxiv(id){
    return "http://api.semanticscholar.org/v1/paper/arXiv:"+id
        +"?include_unknown_references=true";
}

function createUrlWithSemanticAuthor(id){
    return "http://api.semanticscholar.org/v1/author/"+id
        +"?include_unknown_references=true";
}

async function createResults(url){
    semanticPage = await fetch(url)
        .then(res => res.json())
        .catch(err => { throw err });
    return semanticPage;
}

function getArxivId(semanticResults){
    return semanticResult.arxivId;
}

function getAuthors(semanticResults){
    return semanticResult.authors;
}

function getCitationVelocity(semanticResults){
    return semanticResult.citationVelocity;
}

function getCitations(semanticResults){
    return semanticResults.citations;
}

function getCitationsAndReferencesOfArxivPaper(arxivId){
    url = createUrlWithArxiv(arxivId);
    citationsAndReferences = [];
    results = createResults(url).then((res) =>{
        let citations = getCitations(res);
        let references = getReferences(res);
        citationsAndReferences.push({citations,references});
    });
    return citationsAndReferences;
}

function getStringifiedCitationsAndReferencesOfArxivPaper(arxivId){
    url = createUrlWithArxiv(arxivId);
    citationsAndReferences = [];
    results = createResults(url).then((res) =>{
        citations = JSON.stringify(getCitations(res));
        references = JSON.stringify(getReferences(res));
        citationsAndReferences.push({citations,references});
    });
    return citationsAndReferences;
}

function getDOI(semanticResults){
    return semanticResults.doi;
}

function getInfluentialCitationCount(semanticResults){
    return semanticResults.influentialCitationCount;
}

function getSemanticPaperId(semanticResults){
    return semanticResults.paperId;
}

function getReferences(semanticResults){
    return semanticResults.references;
}

function getTitle(semanticResults){
    return semanticResults.title;
}

function getTopics(semanticResults){
    return semanticResults.topics;
}

function getUrl(semanticResults){
    return semanticResults.url;
}

function getVenue(semanticResults){
    return semanticResults.venue;
}

function getYear(semanticResults){
    return semanticResults.year;
}

function getInfluentialReferences(semanticResults){
    references = semanticResults.references;

    influentialReferences = []
    for (let reference in references){
        if(reference.isInfluential = true){
            influentialReferences.push(reference)
        }
    }

    return influentialReferences;
}

function getInfluentialCitations(semanticResults){
    citations = semanticResults.citations;

    influentialCitations = []
    for (let citation in citations){
        if(citation.isInfluential = true){
            influentialCitations.push(citation)
        }
    }

    return influentialCitations;
}

function getReferenceArxivId(reference){
    return referenc
getCitationsAndReferencesOfArxivPaper("1701.01821");

e.arxivId;
}

function getReferenceAuthors(reference){
    return reference.authors;
}


function getReferenceDOI(reference){
    return reference.doi;
}


function getReferenceSemanticPaperId(reference){
    return reference.paperId;
}


function getReferenceTitle(reference){
    return reference.title;
}


function getReferenceUrl(reference){
    return reference.url;
}

function getReferenceVenue(reference){
    return reference.venue;
}

function getReferenceYear(reference){
    return reference.year;
}

function isThisReferenceInfluential(reference){
    return reference.isInfluential;
}

function isThisCitationInfluential(citation){
    return citation.isInfluential;
}

async function getSemanticScholarDataWithPaperID(semanticScholarPaperID){
    let url = createUrlWithSemanticPaper(semanticScholarPaperID);
    let results = await createResults(url);
    return results;
}

async function getSemanticScholarDataWithAuthorID(semanticScholarAuthorID){
    let url = createUrlWithSemanticAuthor(semanticScholarAuthorID);
    let results = await createResults(url);
    return results;
}


module.exports = {  getArxivId : getArxivId,
                    getAuthors : getAuthors,
                    getTitle   : getTitle,
                    getCitations : getCitations,
                    getCitationVelocity : getCitationVelocity,
                    getDOI : getDOI,
                    getInfluentialCitationCount: getInfluentialCitationCount,
                    getInfluentialCitations : getInfluentialCitations,
                    getInfluentialReferences: getInfluentialReferences,
                    getReferences: getReferences,
                    getSemanticPaperId : getSemanticPaperId,
                    getTopics: getTopics,
                    getUrl: getUrl,
                    getVenue: getVenue,
                    getYear : getYear,
                    isThisCitationInfluential : isThisCitationInfluential,
                    isThisReferenceInfluential : isThisReferenceInfluential,
                    getReferenceArxivId : getReferenceArxivId,
                    getReferenceAuthors : getReferenceAuthors,
                    getReferenceDOI : getReferenceDOI,
                    getReferenceSemanticPaperId : getReferenceSemanticPaperId,
                    getReferenceTitle : getReferenceTitle,
                    getReferenceUrl : getReferenceUrl,
                    getReferenceVenue : getReferenceVenue,
                    getReferenceYear : getReferenceYear,

                    getCitationsAndReferencesOfArxivPaper : getCitationsAndReferencesOfArxivPaper,
                    getStringifiedCitationsAndReferencesOfArxivPaper : getStringifiedCitationsAndReferencesOfArxivPaper

                    getSemanticScholarDataWithAuthorID : getSemanticScholarDataWithAuthorID,
                    getSemanticScholarDataWithPaperID : getSemanticScholarDataWithPaperID
}




