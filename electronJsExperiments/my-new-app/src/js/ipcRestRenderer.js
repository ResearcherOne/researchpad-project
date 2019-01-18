const { ipcRenderer } = require('electron');

var ipcRestRenderer = (function () {
	var waitingResponseList = {};

	var g_listenResponsesTopic;
	var g_sendRequestsTopic;

	var sendEncapsulatedIpcMessage = function(id, url, obj) {
		const encapsulatedObject = {
			"id": id,
			"url": url,
			"obj": obj
		};
		ipcRenderer.send(g_sendRequestsTopic, JSON.stringify(encapsulatedObject));
	}

	var parseIncomingIpcMessages = function(event, message) {
		const encapsulatedObject = JSON.parse(message);
		const messageId = encapsulatedObject.id;
		const messageUrl = encapsulatedObject.url;
		const responseObj = encapsulatedObject.obj;

		if(messageId && messageUrl && responseObj) {
			if(waitingResponseList[messageId]) {
				waitingResponseList[messageId](responseObj);
				delete waitingResponseList[messageId];
			} else {
				console.log("Callback not registered for ID "+messageId)
			}
		} else {
			console.log("Invalid message received.")
		}
	}

	var initialize = function(sendRequestsTopic, listenResponsesTopic) {
		g_sendRequestsTopic = sendRequestsTopic;
		g_listenResponsesTopic = listenResponsesTopic;

		ipcRenderer.on(g_listenResponsesTopic, parseIncomingIpcMessages);
	};

	var request = function(url, objToSend, callback) { //callback(responseObj)
		//const generatedMessageId = hash(objToSend);
		const generatedMessageId = Math.floor(Math.random() * 99999999);

		sendEncapsulatedIpcMessage(generatedMessageId, url, objToSend);

		waitingResponseList[generatedMessageId] = callback;
	};

	return {
		initialize:  initialize,
		request: request
	}
})();