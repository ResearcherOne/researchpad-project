const request = require('request-promise');


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

function getResults(url){
    let options;
    options = createOptions(url)
    request(options)
        .then(function (response) {
            return response;
            // Request was successful, use the response object at will
        })
        .catch(function (err) {
            return err;
            // Something bad happened, handle the error
        })
}

function createOptions(url){
    return {
        method: 'POST',
        uri: url,
        json: true
    }


}



getResults("https://api.semanticscholar.org/v1/paper/10.1038/nrn3241")
    .then((value)=>{console.log(value)});