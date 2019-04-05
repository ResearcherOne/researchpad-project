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

function getArxivId(semanticResult){
    return semanticResult.arxivId;
}

function getAuthors(semanticResult){
    return semanticResult.authors;
}

function getCitationVelocity(semanticResult){
    return semanticResult.citationVelocity;
}

function getCitations(semanticResult){
    return semanticResult.citations;
}

function getDOI(semanticResult){
    return semanticResult.doi;
}

function getInfluentialCitationCount(semanticResult){
    return semanticResult.influentialCitationCount;
}

function getSemanticPaperId(semanticResult){
    return semanticResult.paperId;
}

function getReferences(semanticResults){
    return semanticResult.references;
}

function getTitle(semanticResult){
    return semanticResult.title;
}

function getTopics(semanticResult){
    return semanticResult.topics;
}

function getUrl(semanticResult){
    return semanticResult.url;
}

function getVenue(semanticResult){
    return semanticResult.venue;
}

function getYear(semanticResult){
    return semanticResult.year;
}

function getInfluentialReferences(semanticResult){
    references = semanticResult.references;

    influentialReferences = []
    for (let reference in references){
        if(reference.isInfluential = true){
            influentialReferences.push(reference)
        }
    }

    return influentialReferences;
}

function getInfluentialCitations(semanticResult){
    citations = semanticResult.citations;

    influentialCitations = []
    for (let citation in citations){
        if(citation.isInfluential = true){
            influentialCitations.push(citation)
        }
    }

    return influentialCitations;
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
                    isThisReferenceInfluential : isThisReferenceInfluential}