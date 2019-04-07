const arxiv = require ("./ArxivModule");

var search_query = {
    title: 'pen',
};


var theResults;
var result;

result = arxiv.search(search_query, function (err, results) {
    theResults = results;
});

