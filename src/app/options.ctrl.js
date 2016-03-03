function Options($timeout){
	var vm = this;
	vm.displayMessage = false;
	vm.config = {
		username: '',
		token: ''
	}

	vm.save = function(){
		chrome.runtime.sendMessage({ config: vm.config }, function(response){ 
			$timeout(function(){
				vm.displayMessage = true;
			})

			$timeout(function(){
				vm.displayMessage = false;
			}, 3000);
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

Options.$inject = ['$timeout'];

angular.module('app').controller('Options', Options);