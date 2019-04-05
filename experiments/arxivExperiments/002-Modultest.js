const arxiv = require ("./001");

var search_query = {
    title: 'pen',
};


var theResults;
var result;

result = arxiv.searchWithoutCallback(search_query)

const delayMs = 10000;
setTimeout(function(){
    console.log("Here are our precious results after 10 seconds: "+JSON.stringify(result.items));
}, delayMs);