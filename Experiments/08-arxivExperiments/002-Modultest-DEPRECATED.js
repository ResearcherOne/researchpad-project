const arxiv = require ("./ArxivModule");


search_query = "neural networks"

var theResults;
var result;

result = arxiv.search(search_query, function (err, results) {
    theResults = results;
});

