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