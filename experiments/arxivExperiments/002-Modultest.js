const arxiv = require ("./001");

var search_query = {
    title: 'pen',
};


var theResults;
var result;

result = arxiv.search(search_query, function (err, results) {
    theResults = results;
});

