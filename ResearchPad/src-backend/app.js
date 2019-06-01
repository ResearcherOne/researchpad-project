var os = require("os");

var ipcRestModule = require("./ipc-rest");
var crossrefModule = require("./cross-reference");
var googleScholarModule = require("./google-scholar-scrapper");
var semanticScholarModule = require("./semantic-scholar");
var dataCleanerModule = require("./data-cleaner");
var arxivModule = require("./arxiv");

const backendApi = {
	getCrossrefMetaDataByDoi: "/get-crossref-metadata-by-doi",
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

	ipcRestModule.listen(backendApi.getCrossrefMetaDataByDoi, function(request, response) {
		const doi = request.doi;

		crossrefModule.fetchMetadataByDoi(doi, function(err, res) {
			if (!err) {
				response.send({ metadata: res });
			} else {
				response.error("OOps, unable to fetch metadata from crossref.");
			}
		});
	});

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
			googleScholarModule.getCitedbyOfArticle(citedByLink, function(err, result) {
				if (!err) {
					response.send({ resultList: result });
				} else {
					response.error("OOps, unable to fetch data from google scholar.");
				}
			});
		} else {
			response.error("Connection with Google Scholar is not ready yet.");
		}
	});

	ipcRestModule.listen(backendApi.getSemanticScholarData, function(request, response) {
		const fetchMethod = request.fetchMethod;
		const paperId = request.paperId;

		if (fetchMethod == "arxivId") {
			semanticScholarModule.getSemanticScholarDataViaArxivId(paperId, function(err, result) {
				if (!err) {
					response.send({ metadata: result });
				} else {
					response.error("OOps, unable to fetch data from semantic scholar");
				}
			});
		} else if (fetchMethod == "semanticId") {
			semanticScholarModule.getSemanticScholarDataViaId(paperId, function(err, result) {
				if (!err) {
					response.send({ metadata: result });
				} else {
					response.error("OOps, unable to fetch data from semantic scholar");
				}
			});
		} else {
			response.error("Unknown fetch method.");
		}
	});

	ipcRestModule.listen(backendApi.isChromiumReady, function(request, response) {
		response.send({ chorimumStatus: isChromiumReady });
	});
}

module.exports = {
	initializeBackend: initializeBackend
};
