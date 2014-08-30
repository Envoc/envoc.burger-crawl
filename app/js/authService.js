app.service('authService', function($firebaseSimpleLogin, baseRef) {
  var self = this;

  self.auth = $firebaseSimpleLogin(baseRef);

  this.login = function(provider) {
    self.auth.$login(provider);
  };

  // Logs a user out
  this.logout = function() {
    self.auth.$logout();
  };
})
