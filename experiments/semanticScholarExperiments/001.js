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
    return "http://api.semanticscholar.org/v1/paper/"+id
        +"?include_unknown_references=true";
}

function createUrlWithSemanticAuthor(id){
    return "http://api.semanticscholar.org/v1/paper/"+id
        +"?include_unknown_references=true";
}


async function createResults(url){
    semanticPage = await fetch(url)
        .then(res => res.json())
        .catch(err => { throw err });
    console.log(semanticPage);
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
    return semanticResult.citations;
}

function getDOI(semanticResults){
    return semanticResult.doi;
}

function getInfluentialCitationCount(semanticResults){
    return semanticResult.influentialCitationCount;
}

function getSemanticPaperId(semanticResults){
    return semanticResult.paperId;
}

function getReferences(semanticResults){
    return semanticResult.references;
}

function getTitle(semanticResults){
    return semanticResult.title;
}

function getTopics(semanticResults){
    return semanticResult.topics;
}

function getUrl(semanticResults){
    return semanticResult.url;
}

function getVenue(semanticResults){
    return semanticResult.venue;
}

function getYear(semanticResults){
    return semanticResult.year;
}

function getInfluentialReferences(semanticResults){
    references = semanticResult.references;

    influentialReferences = []
    for (let reference in references){
        if(reference.isInfluential = true){
            influentialReferences.push(reference)
        }
    }

    return influentialReferences;
}

function getInfluentialCitations(semanticResults){
    citations = semanticResult.citations;

    influentialCitations = []
    for (let citation in citations){
        if(citation.isInfluential = true){
            influentialCitations.push(citation)
        }
    }

    return influentialCitations;
}

function getReferenceArxivId(reference){
    return reference.arxivId;
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
                    getReferenceYear : getReferenceYear
}



