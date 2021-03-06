var os = require("os");

var ipcRestModule = require(__dirname + "/ipcRestModule");
var crossrefModule = require(__dirname + "/crossrefModule");
var googleScholarModule = require(__dirname + "/googleScholarScrapperModule");
var semanticScholarModule = require(__dirname + "/semanticScholarModule");
var dataCleanerModule = require(__dirname + "/dataCleanerModule");
var arxivModule = require(__dirname + "/arxivModule");

if (typeof localStorage === "undefined" || localStorage === null) {
	var LocalStorage = require("node-localstorage").LocalStorage;
	localStorage = new LocalStorage(__dirname);
}

const backendApi = {
	//getCrossrefMetaDataByDoi: "/get-crossref-metadata-by-doi",
	getHostname: "/get-hostname",
	searchGoogleScholar: "/search-google-scholar",
	searchArxiv: "/search-arxiv",
	getCitedByFromGoogleScholar: "/get-citedby-google-scholar",
	getSemanticScholarData: "/get-semantic-scholar",
	isChromiumReady: "/get-chromium-status"
};

const listenRenderer = "listen-renderer";
const responseRenderer = "response-to-renderer";

const isHeadlessChrome = true;
const isDevtools = false;

var isChromiumReady = false;

function initializeBackend() {
	// console.log("Dirname: " + __dirname);
	console.log("Backend initialized");

	googleScholarModule.initializeModule(isHeadlessChrome, isDevtools, function(err, res) {
		if (res) {
			isChromiumReady = true;
			console.log("Scrapper Ready");
		} else {
			isChromiumReady = false;
			console.log("Unable to initialize scrapper: " + err);
		}
	});
	ipcRestModule.initialize(listenRenderer, responseRenderer);

	/*
	ipcRestModule.listen(backendApi.getCrossrefMetaDataByDoi, function(
		request,
		response
	) {
		const doi = request.doi;

		crossrefModule.fetchMetadataByDoi(doi, function(err, res) {
			if (!err) {
				response.send({ metadata: res });
			} else {
				response.error("OOps, unable to fetch metadata from crossref.");
			}
		});
	});
	*/

	ipcRestModule.listen(backendApi.getHostname, function(request, response) {
		const computerName = os.hostname();

		response.send({ hostname: computerName });
	});

	ipcRestModule.listen(backendApi.searchGoogleScholar, function(request, response) {
		const searchText = request.searchText;

		if (isChromiumReady) {
			googleScholarModule.searchGoogleScholar(searchText, function(err, result) {
				if (!err) {
					dataCleanerModule.cleanGoogleResultList(result);
					response.send({ resultList: result });
				} else {
					response.error("OOps, unable to fetch data from google scholar.");
				}
			});
		} else {
			response.error("Connection with Google Scholar is not ready yet.");
		}
	});

	ipcRestModule.listen(backendApi.searchArxiv, function(request, response) {
		const searchText = request.searchText;
		const trimmedText = searchText.trim();

		arxivModule.search(trimmedText, function(err, result) {
			if (!err) {
				//dataCleanerModule.cleanGoogleResultList(result);
				response.send({ resultList: result.items });
			} else {
				response.error("OOps, unable to fetch data from arxiv.");
			}
		});
	});

	ipcRestModule.listen(backendApi.getCitedByFromGoogleScholar, function(request, response) {
		const citedByLink = request.citedByLink;

		if (isChromiumReady) {
			var cachedResult;
			if (citedByLink) cachedResult = JSON.parse(localStorage.getItem(citedByLink));

			if (!cachedResult) {
				googleScholarModule.getCitedbyOfArticle(citedByLink, function(err, result) {
					if (!err) {
						localStorage.setItem(citedByLink, JSON.stringify(result));
						response.send({ resultList: result });
					} else {
						response.error("OOps, unable to fetch data from google scholar.");
					}
				});
			} else {
				console.log("Cached response sent.");
				response.send({ resultList: cachedResult });
			}
		} else {
			response.error("Connection with Google Scholar is not ready yet.");
		}
	});

	ipcRestModule.listen(backendApi.getSemanticScholarData, function(request, response) {
		const fetchMethod = request.fetchMethod;
		const paperId = request.paperId;

		var cachedResult;
		if (paperId) cachedResult = JSON.parse(localStorage.getItem(paperId));

		if (!cachedResult) {
			if (fetchMethod == "arxivId") {
				semanticScholarModule.getSemanticScholarDataViaArxivId(paperId, function(err, result) {
					if (!err) {
						localStorage.setItem(paperId, JSON.stringify(result));
						response.send({ metadata: result });
					} else {
						response.error("OOps, unable to fetch data from semantic scholar");
					}
				});
			} else if (fetchMethod == "semanticId") {
				semanticScholarModule.getSemanticScholarDataViaId(paperId, function(err, result) {
					if (!err) {
						localStorage.setItem(paperId, JSON.stringify(result));
						response.send({ metadata: result });
					} else {
						response.error("OOps, unable to fetch data from semantic scholar");
					}
				});
			} else {
				response.error("Unknown fetch method.");
			}
		} else {
			console.log("Cached semantic scholar data sent.");
			response.send({ metadata: cachedResult });
		}
	});

	ipcRestModule.listen(backendApi.isChromiumReady, function(request, response) {
		response.send({ chorimumStatus: isChromiumReady });
	});
}

module.exports = {
	initializeBackend: initializeBackend
};
