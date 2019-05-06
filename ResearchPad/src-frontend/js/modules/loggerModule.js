var loggerModule = (function () {
	var errorArray = [];
	var pushErrorTimeout = null;
	var pushErrorTimeoutSec = 5;

	var error = function(type, msg) {
		msg = msg.replace(/\s+/g, '-').toLowerCase();
		errorArray.push(type+"-"+msg);
		if(pushErrorTimeout) {
			clearTimeout(pushErrorTimeout);
		}
		pushErrorTimeout = setTimeout(function(){
			console.log("error-bulk: "+JSON.stringify(errorArray));
			mixpanel.track("error-bulk", {"errors":errorArray});
			errorArray = [];
		}, pushErrorTimeoutSec*1000);
		
	}

	var log = function(type, msg, extraData) {
		msg = msg.replace(/\s+/g, '-').toLowerCase();
		console.log("system-log-"+type+": "+msg);
		if(extraData) {
			extraData.systemMessage = msg;
			mixpanel.track(type+"-"+msg, extraData);
		} else {
			mixpanel.track(type+"-"+msg);
		}
	}

	var initialize = function(hostname) {
		mixpanel.identify(hostname);
		mixpanel.people.set({
			"$hostname": hostname,    // only special properties need the $
			"$last_login": new Date(),         // properties can be dates...
		});

		/*
		mixpanel.people.set({
			"$email": "jsmith@example.com",    // only special properties need the $

			"$created": "2011-03-16 16:53:54",
			"$last_login": new Date(),         // properties can be dates...

			"credits": 150,                    // ...or numbers

			"gender": "Male"                    // feel free to define your own properties
		});
		*/
	}

	return {
		initialize:  initialize,
		log: log,
		error: error
	}
})();