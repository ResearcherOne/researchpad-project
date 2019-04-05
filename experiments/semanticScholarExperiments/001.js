const rp = require('request-promise');

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


function createOptions(url){
    return {
        method: 'POST',
        uri: url,
        json: true
    }
}


rp(options).then(function(response){

}).catch(function(err){

})

