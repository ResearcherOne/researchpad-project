const arxiv = require ("./001");

var search_query = {
    title: 'pen',
};

var globalResults = null;

arxiv.search(search_query, function (err, results) {
    console.log('Found ' + results.items.length + ' results out of ' + results.total);
    console.log(results.items[0].title);
    console.log(results.items[0].authors[0].name);
    globalResults = results;
});

const delayMs = 10000;
setTimeout(function(){
  console.log("Here are our precious results after 10 seconds: "+JSON.stringify(globalResults));
}, delayMs);
