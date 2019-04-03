const arxiv = require ("./001");

var search_query = {
    title: 'pen',
};


var theResults;
var result;
result = function (){ arxiv.search(search_query, function (err, results) {
    console.log('Found ' + results.items.length + ' results out of ' + results.total);
    console.log(results.items[0].title);
    console.log(results.items[0].authors[0].name);
    theResults = results;
})};

result().then(console.log(theResults));