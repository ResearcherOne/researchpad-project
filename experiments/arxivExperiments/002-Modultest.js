const arxiv = require ("./001");

var search_query = {
    title: 'pen',
};


var theResults;
var result = arxiv.search(search_query, function(err, results) {
  console.log("Birkan")
}).then((value)=>{theResults=value.items}).then(console.log(theResults));