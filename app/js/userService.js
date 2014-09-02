app.service('userService', function($http, serviceConfig) {
  var self = this;

  this.getSession = function(userInfo) {
    var url = serviceConfig.baseUrl + 'api/authenticate';
    return $http.post(url, userInfo)
      .then(function(resp) {
        return resp.data; // user
      }, function(resp){
        console.log('error', resp);
      })
  };

})
