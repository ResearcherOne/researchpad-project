// Generated by CoffeeScript 1.10.0
var coerceEntry, coerceQuery, coerceQueryKey, coerceQueryValue, key_map, makeUrl, request, search, unique, xml2js;

request = require('request');
xml2js = require('xml2js');
const saver = require("file-saver");
const fetch = require("node-fetch")
const fs = require('fs');
const download = require('download');


function searchQueryCreator(query){
    let newQuery = query.split(" ")
    let new_Query =""
    for(let i = 0 ; i < newQuery.length ; i++)
    {
        if( i < newQuery.length-1)
            new_Query += newQuery[i] + "+AND+"
        else
            new_Query += newQuery[i]
    }
    return { q: new_Query}
}

makeUrl = function(query, max_results, sort_by) {
    if (max_results == null) {
        max_results = 10;
    }
    if (sort_by == null) {
        sort_by = 'submittedDate';
    }
    return "http://export.arxiv.org/api/query?sortBy=" + sort_by + "&max_results=" + max_results + "&search_query=" + query;
};

key_map = {
    author: 'au',
    q: 'all',
    title: 'ti',
    category: 'cat',
    id : 'id'
};

coerceQueryKey = function(key) {
    return key_map[key] || key;
};

coerceQueryValue = function(key, value) {
    var matched;
    if (key === 'au') {
        if (matched = value.match(/^(\w+).* (\w+)$/)) {
            return matched[2] + '_' + matched[1][0];
        } else {
            return value;
        }
    } else {
        return value;
    }
};

coerceQuery = function(query) {
    var k, querys, v;
    querys = [];
    for (k in query) {
        v = query[k];
        k = coerceQueryKey(k);
        v = coerceQueryValue(k, v);
        querys.push([k, v].join(':'));
    }
    return querys.join('+AND+');
};

unique = function(a, k) {
    var a_, i, j, known, len;
    a_ = [];
    known = {};
    for (j = 0, len = a.length; j < len; j++) {
        i = a[j];
        if (!known[i[k]]) {
            known[i[k]] = true;
            a_.push(i);
        }
    }
    return a_;
};

coerceEntry = function(entry) {
    return {
        id: entry.id[0],
        updated: new Date(entry.updated[0]),
        published: new Date(entry.published[0]),
        title: entry.title[0].trim().replace(/\s+/g, ' '),
        summary: entry.summary[0].trim().replace(/\s+/g, ' '),
        links: entry.link.map(function(link) {
            return {
                href: link['$']['href'],
                title: link['$']['title']
            };
        }),
        authors: unique(entry.author.map(function(author) {
            return {
                name: author['name'][0]
            };
        }), 'name'),
        categories: entry.category.map(function(category) {
            return category['$']['term'];
        })
    };
};




async function search (query, cb) {
    let search_query = await searchQueryCreator(query);
    return request.get(makeUrl(coerceQuery(search_query)), function(err, resp, data) {
        return  xml2js.parseString(data, function(err, parsed) {
            var items, ref, ref1, total;
            if (err != null) {
                return cb(err);
            } else {
                items = parsed != null ? (ref = parsed.feed) != null ? (ref1 = ref.entry) != null ? ref1.map(coerceEntry) : void 0 : void 0 : void 0;
                items || (items = []);
                total = Number(parsed.feed['opensearch:totalResults'][0]['_']);
                total || (total = 0);
                return cb(err, {
                    items: items,
                    total: total
                });
            }
        });
    });
};


function createResultItems(searchResult){
    return searchResult.items;
}

function getID(resultItem){
    return resultItem[0];
}

function getLastUpdatedDate(resultItem){
    return resultItem[1];
}

function getPublishingDate(resultItem){
    return resultItem[2];
}

function getTitle(resultItem){
    return resultItem[3];
}

function getSummary(resultItem){
    return resultItem[4];
}

function getAuthors(resultItem){
    return resultItem[5];
}

function getCategories(resultItem){
    return resultItem[6];
}

function createPDFDownloadLink(arxivID) {
    return "https://arxiv.org/pdf/"+arxivID;
}

async function downloadArxivPDF(arxivID,saveFolderPath,fileName) {
    let url = await createPDFDownloadLink(arxivID);
    let filePath = saveFolderPath+"/"+fileName+".pdf"
    download(url).then(data => {
        fs.writeFileSync(filePath, data);
    });
}



module.exports = {
    search : search,
    downloadArxivPDF : downloadArxivPDF,
};


//Sample download : downloadArxivPDFWith("1904.02161", "/home/pc","mahmutTuncer")

