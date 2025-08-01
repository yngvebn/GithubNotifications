"use strict";
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if(request['config']){
		 /*localStorage['_octopus_extension_3'] = JSON.stringify(request.config);*/
	  }
	 if(request['localStorage']){
	 	/*if(request['localStorage'] !== 'all'){
	 	sendResponse(JSON.parse(localStorage['_octopus_extension_3'])[request['localStorage']]);
	 	}
	 	else{
	 		sendResponse(JSON.parse(localStorage['_octopus_extension_3']));
	 	}*/
	 }
});

chrome.action.setBadgeText({text:"?"});
