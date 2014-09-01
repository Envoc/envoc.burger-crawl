app.service('userService', function($http, serviceConfig) {
  var self = this;

  this.getSession = function(uid) {
    var url = serviceConfig.baseUrl + 'api/authenticate';
    return $http.post(url, {uid: uid})
      .then(function(resp) {
        return resp.data; // user
      })
  };

})
