const { ipcRenderer } = require("electron");

var ipcRestRenderer = (function() {
	var waitingResponseList = {};

	var g_listenResponsesTopic;
	var g_sendRequestsTopic;

	var hashStr = function(str) {
		var hash = 0;
		if (str.length == 0) {
			return hash;
		}
		for (var i = 0; i < str.length; i++) {
			var char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // Convert to 32bit integer
		}
		return hash;
	};

	var sendEncapsulatedIpcMessage = function(id, url, obj) {
		const encapsulatedObject = {
			id: id,
			url: url,
			obj: obj
		};
		ipcRenderer.send(g_sendRequestsTopic, JSON.stringify(encapsulatedObject));
	};

	var parseIncomingIpcMessages = function(event, message) {
		const encapsulatedObject = JSON.parse(message);
		const messageId = encapsulatedObject.id;
		const messageUrl = encapsulatedObject.url;
		const responseObj = encapsulatedObject.obj;
		const isErrorOccured = encapsulatedObject.err;

		if (!isErrorOccured) {
			if (messageId && messageUrl && responseObj) {
				if (waitingResponseList[messageId]) {
					waitingResponseList[messageId](null, responseObj);
					delete waitingResponseList[messageId];
				} else {
					console.log("Callback not registered for ID " + messageId);
				}
			} else {
				console.log("Invalid message received.");
			}
		} else {
			waitingResponseList[messageId]({ msg: responseObj.msg }, null);
			delete waitingResponseList[messageId];
		}
	};

	var initialize = function(sendRequestsTopic, listenResponsesTopic) {
		g_sendRequestsTopic = sendRequestsTopic;
		g_listenResponsesTopic = listenResponsesTopic;

		ipcRenderer.on(g_listenResponsesTopic, parseIncomingIpcMessages);
	};

	var request = function(url, objToSend, callback) {
		//callback(responseObj)
		const randomNum = Math.floor(Math.random() * 10000);
		const generatedMessageId = hashStr(url + randomNum);

		sendEncapsulatedIpcMessage(generatedMessageId, url, objToSend);

		waitingResponseList[generatedMessageId] = callback;
	};

	return {
		initialize: initialize,
		request: request
	};
})();
