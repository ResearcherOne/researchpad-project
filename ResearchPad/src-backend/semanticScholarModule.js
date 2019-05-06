
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


async function getStringifiedCitationsAndReferencesOfArxivPaper(arxivId){
    url = createUrlWithArxiv(arxivId);
    citationsAndReferences = [];
    results = await createResults(url).then((res) =>{
        citations = JSON.stringify(getCitations(res));
        references = JSON.stringify(getReferences(res));
        citationsAndReferences.push({citations,references});
    });
    return citationsAndReferences;
}
async function getSemanticScholarDataWithAuthorID(semanticScholarAuthorID){
    let url = createUrlWithSemanticAuthor(semanticScholarAuthorID);
    let results = await createResults(url);
    return results;
}

async function getSemanticScholarDataWithDOI(doi){
    let url = createUrlWithDOI(doi);
    let results = await createResults(url);
    return results;
}


async function createResults(url){
    semanticPage = await fetch(url)
        .then(res => res.json())
        .catch(err => { return err });
    return semanticPage;
}

function getCitations(semanticResults){
    return semanticResults.citations;
}

async function getCitationsAndReferencesOfArxivPaper(arxivId,callback){
    url = createUrlWithArxiv(arxivId);
    citationsAndReferences = [];
    results = await createResults(url).then((res) =>{
        let citations = getCitations(res);
        let references = getReferences(res);
        citationsAndReferences.push({citations,references});
    }).catch(err => callback(err,null));
    return citationsAndReferences;
}


function getReferences(semanticResults){
    return semanticResults.references;
}


async function getSemanticScholarDataViaId(semanticScholarPaperID, callback){
    let url = createUrlWithSemanticPaper(semanticScholarPaperID);
    let results = await createResults(url).then((res) => callback(null,res)).catch(err => callback(err,null));
    return results;
}


async function getSemanticScholarDataViaArxivId(id, callback){
    let url = createUrlWithArxiv(id);
    let results = await createResults(url).then((res) => callback(null,res)).catch(err => callback(err,null));
    return results;
}

module.exports = {

                    getCitationsAndReferencesOfArxivPaper : getCitationsAndReferencesOfArxivPaper,
                    getSemanticScholarDataViaId : getSemanticScholarDataViaId ,
                    getSemanticScholarDataViaArxivId : getSemanticScholarDataViaArxivId
};





/* Bir gün bu fonksiyonlar lazım olacak

function getArxivId(semanticResults){
    return semanticResult.arxivId;
}

function getAuthors(semanticResults){
    return semanticResult.authors;
}

function getCitationVelocity(semanticResults){
    return semanticResult.citationVelocity;
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
*/