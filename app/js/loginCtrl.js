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

app.controller('RatingCtrl', function(autocompleteService) {
  var vm = this;

  // Logs a user in with inputted provider
  vm.searchPlaces = function(input) {
    var query = {input: input};
    autocompleteService.getQueryPredictions(query)
      .then(function(predictions){
        vm.predictions = predictions;
      }, handleError)
  };

  function handleError(err){
    alert(err);
  }
});
