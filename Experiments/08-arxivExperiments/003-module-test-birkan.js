const arxiv = require ("./ArxivModule");


var globalResults = null;

arxiv.search("federated testbed", function (err, results) {
    //console.log('Found ' + results.items.length + ' results out of ' + results.total);
    //console.log(results.items[0].title);
    console.log(results.items);
    globalResults = results;
});

const delayMs = 10000;
/*setTimeout(function(){
  console.log("Here are our precious results after 10 seconds: "+JSON.stringify(globalResults.items));
}, delayMs);*/