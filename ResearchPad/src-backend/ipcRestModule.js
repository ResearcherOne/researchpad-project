const { ipcMain } = require("electron");

var g_sendResponseTopic = "";

var urlList = {};

var response = function(sendResponseTopic, messageId, messageUrl, ipcEvent) {
	this.responseTopic = sendResponseTopic;
	this.id = messageId;
	this.url = messageUrl;
	this.ipcEvent = ipcEvent;
};

response.prototype.send = function(responseObj) {
	const encapsulatedObject = {
		id: this.id,
		url: this.url,
		obj: responseObj,
		err: false
	};
	this.ipcEvent.sender.send(
		this.responseTopic,
		JSON.stringify(encapsulatedObject)
	);
};

response.prototype.error = function(errorMessage) {
	const encapsulatedObject = {
		id: this.id,
		url: this.url,
		obj: { msg: errorMessage },
		err: true
	};
	this.ipcEvent.sender.send(
		this.responseTopic,
		JSON.stringify(encapsulatedObject)
	);
};

function parseIncomingIpcMessages(event, message) {
	const encapsulatedObject = JSON.parse(message);
	const messageId = encapsulatedObject.id;
	const messageUrl = encapsulatedObject.url;
	const requestObj = encapsulatedObject.obj;

	if (messageId && messageUrl && requestObj) {
		if (urlList[messageUrl]) {
			const request = requestObj;
			var responseObj = new response(
				g_sendResponseTopic,
				messageId,
				messageUrl,
				event
			);

			urlList[messageUrl](request, responseObj);
		}
	} else {
		console.log("Invalid message received.");
	}
}

module.exports = {
	//initializeModule with either main or renderer, initialize ipcMain or renderer here.
	initialize: function(listenRequestsTopic, sendResponseTopic) {
		g_sendResponseTopic = sendResponseTopic;

		ipcMain.on(listenRequestsTopic, parseIncomingIpcMessages);
	},

	listen: function(url, callback) {
		//callback(requestObj)
		urlList[url] = callback;
	},

	stopListening: function(url) {
		if (urlList[url]) delete urlList[url];
	}
};
