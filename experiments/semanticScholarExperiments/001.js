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


function createOptions(url){
    return {
        method: 'POST',
        uri: url,
        json: true
    }
}

let url = "http://api.semanticscholar.org/v1/paper/10.1038/nrn3241"
let options = createOptions("http://api.semanticscholar.org/v1/paper/10.1038/nrn3241")

semanticPage = fetch(url)
                    .then(res => res.json())
                    .then((out) => {
                        console.log('Checkout this JSON! ', out);
                    })
                    .catch(err => { throw err });

