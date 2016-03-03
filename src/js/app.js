angular.module('app', ['ngAnimate']);



function MainController($q, $scope, $timeout, $window, $http, PullRequest){
	var vm = this;
	vm.count = 0;

	vm.data = {
		pullRequests:[],
		grouped: []
	}

	vm.openPull = function(pull){
		if(!chrome || !chrome.tabs){
			$window.location = pull.url;
		}
		else{
			chrome.tabs.create({url: pull.url });
		}
		
	}

	function reGroup(){
		if(!vm.data.pullRequests) return;
			var grouped = _.chain(vm.data.pullRequests)
					.groupBy(function(p){
						return p.repository.name;
					}).value();
			vm.data.grouped = grouped;
	}

	$scope.$watch(function(){
		return vm.data.pullRequests;	
	}, function(){
		reGroup();
	}, true)

	vm.config = {
		ok: false,
		username: '',
		token: ''
	}

	var currentTimeout;

	function restore_options() {
		return $q(function(resolve, reject){
			try{
		var config = JSON.parse(localStorage["_github_pullrequests"]);
				  if (!config) {
				    reject();
				  }
				  vm.config.username = config.username;
				  vm.config.token = config.token;
				  vm.config.ok = true;
				  resolve(vm.config);
				  }
				  catch (err){
				  	reject();
				  }
		});
		  
	}
	function init(){
		restore_options().then(getGithubData, githubDataFailed);
	}
	init();
    
	function githubDataFailed(){
		vm.config.ok = false;
			if(!chrome || !chrome.browserAction) return;
			
			chrome.browserAction.setBadgeText({text: "?"});
			
	}

	function getGithubData(config){

		var url = 'https://api.github.com/search/issues?q=assignee:'+config.username+'+state:open+type:pr';
	 	$http.defaults.headers.common.Authorization = 'TOKEN '+config.token;
		$http.get(url).then(function(response){
			count = response.data.total_count;
			if(!chrome || !chrome.browserAction){
				vm.count = count;
			}
			else{
                var countText = count > 0 ? count.toString() : "";
				chrome.browserAction.setBadgeText({text: countText });
                var color ="#4CAF50";
                if(countText < 4) color = "#4CAF50";
                if(countText >= 4) color = "#FF9800";
                if(countText >= 9) color = "#F44336";
                chrome.browserAction.setBadgeBackgroundColor({ color: color });
			}

			vm.data.pullRequests = response.data.items.map(PullRequest.load)
										
			
		});	
		if(currentTimeout){
			$timeout.cancel(currentTimeout);
		}
		currentTimeout = $timeout(function(){
			getGithubData(vm.config)
		}, 1 * 60000);
	}

	if(chrome && chrome.runtime && chrome.runtime.onMessage){
		chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
			if(request['config']){
				 localStorage['_github_pullrequests'] = JSON.stringify(request.config);
				 $timeout(function(){
				 	init();
				});
			}
		});
	}
}


MainController.$inject =['$q', '$scope', '$timeout', '$window', '$http', 'PullRequest'];


angular.module('app').controller('Main', MainController);


if(chrome && chrome.runtime && chrome.runtime.onMessage){

	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if(request['config']){
		 localStorage['_github_pullrequests'] = JSON.stringify(request.config);
	}
	 
	chrome.browserAction.setBadgeText({text:"?"});
	});
}
function Options($http, $timeout){
	var vm = this;
	vm.displayMessage = false;
	vm.config = {
		username: '',
		token: ''
	}

	vm.save = function(){
        $http.defaults.headers.common.Authorization = 'TOKEN '+ vm.config.token;
        $http.get("https://api.github.com/user").then(function(response){
          vm.config.username = response.data.login;
          chrome.runtime.sendMessage({ config: vm.config }, function(response){ 
			$timeout(function(){
				vm.displayMessage = true;
			})

			$timeout(function(){
				vm.displayMessage = false;
			}, 3000);
		});  
        });
		
	}

	// Restores select box state to saved value from localStorage.
	function restore_options() {
		try{
	  	var config = JSON.parse(localStorage["_github_pullrequests"]);
		  if (!config) {
		    return;
		  }
		  vm.config.username = config.username;
		  vm.config.token = config.token;
	  }
	  catch (err){

	  }
	  
	}
	restore_options();
}

Options.$inject = ['$http', '$timeout'];

angular.module('app').controller('Options', Options);
function PullRequestFactory($http){
	function PullRequest(data){
		var self = this;
		self.title = '';
		self.number = 0;
		self.createdAt = '';
		self.url = '';
		self.repository = {
			id: '',
			name: ''
		}
		self.openedBy = {
			name: '',
			avatar: ''
		}
		$http.get(data.pull_request.url).then(function(response){
			var data = response.data;
			self.title = data.title;
			self.repository.name = data.head.repo.name;
			self.repository.id = data.head.repo.id;
			self.openedBy.name = data.user.login;
			self.openedBy.avatar = data.user.avatar_url;
			self.number = "#"+data.number;
			self.url = data.html_url;

			var now = moment();
			var then = moment(data.created_at);

			self.createdAt = moment.duration(now.diff(then)).humanize()+" ago";
		});
	}

	PullRequest.load = function(data){
		return new PullRequest(data);
	}

	return PullRequest;
}

PullRequestFactory.$inject = ['$http'];

angular.module('app').factory('PullRequest', PullRequestFactory);
function Repositories(){
	return {
		
	}
}

angular.module('app').factory('Repositories', Repositories);