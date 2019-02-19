var os = require("os");

var ipcRestModule = require(__dirname+'/ipcRestModule');
var crossrefModule = require(__dirname+'/crossrefModule');
var googleScholarModule = require(__dirname+'/googleScholarScrapperModule');

const backendApi = {
	getCrossrefMetaDataByDoi: "/get-crossref-metadata-by-doi",
	getHostname: "/get-hostname",
	searchGoogleScholar: "/search-google-scholar",
	getCitedByFromGoogleScholar: "/get-citedby-google-scholar"
};

const listenRenderer = "listen-renderer";
const responseRenderer = "response-to-renderer";

const isHeadlessChrome = true;
const isDevtools = false;

var isScrapperReady = false;

function initializeBackend() {
	//console.log("Backend initialized.");

	googleScholarModule.initializeModule(isHeadlessChrome, isDevtools, function(err, res){
		if(res) {
			isScrapperReady = true;
		} else {
			isScrapperReady = false;
		}
	});
	ipcRestModule.initialize(listenRenderer, responseRenderer);

	ipcRestModule.listen(backendApi.getCrossrefMetaDataByDoi, function(request, response){
		const doi = request.doi;

		crossrefModule.fetchMetadataByDoi(doi, function(err, res) {
			if(!err) {
				response.send({"metadata": res});
			} else {
				response.error("OOps, unable to fetch metadata from crossref.");
			}
		});
	});

	ipcRestModule.listen(backendApi.getHostname, function(request, response){
		const computerName = os.hostname();
		
		response.send({"hostname": computerName});
	});

	ipcRestModule.listen(backendApi.searchGoogleScholar, function(request, response){
		const searchText = request.searchText;

		if(isScrapperReady) {
			googleScholarModule.searchGoogleScholar(searchText, function(err, result){
				if(!err) {
					response.send({"resultList": result});
				} else {
					response.error("OOps, unable to fetch data from google scholar.");
				}
			});
		} else {
			response.error("Connection with Google Scholar is not ready yet.");
		}
	});

	ipcRestModule.listen(backendApi.getCitedByFromGoogleScholar, function(request, response){
		const citedByLink = request.citedByLink;

		if(isScrapperReady) {
			googleScholarModule.getCitedbyOfArticle(citedByLink, function(err, result){
				if(!err) {
					response.send({"resultList": result});
				} else {
					response.error("OOps, unable to fetch data from google scholar.");
				}
			});
		} else {
			response.error("Connection with Google Scholar is not ready yet.");
		}
	});
}

module.exports = {
	initializeBackend: initializeBackend
}