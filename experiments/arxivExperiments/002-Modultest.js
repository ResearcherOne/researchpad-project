const arxiv = require ("arxiv");

var search_query = {
    title: 'pen',
};

async function seeResults(search_query) {

    var results = await arxiv.search(search_query, async function (err, results) {
        console.log('Found ' + results.items.length + ' results out of ' + results.total);
        if (results.items.length > 0) {
            return results;
        } else {
            return 'Found ' + results.items.length + ' results out of ' + results.total
        }
    })
    return results;
}


var results = seeResults(search_query).then(console.log("penis"));

