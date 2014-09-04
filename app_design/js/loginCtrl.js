app.controller('LoginCtrl', function($firebaseSimpleLogin, baseRef, authService) {
  var vm = this;

  // Create a Firebase Simple Login object
  vm.auth = $firebaseSimpleLogin(baseRef);

  // Logs a user in with inputted provider
  vm.login = function(provider) {
    authService.login(provider);
  };

  // Logs a user out
  vm.logout = function() {
    authService.logout();
  };
});
