app.controller('RatingCtrl', function($scope, autocompleteService) {
  var vm = this;

  // Logs a user in with inputted provider
  vm.searchPlaces = function(input) {
    autocompleteService.getQueryPredictions(input)
      .then(function(predictions){
        vm.predictions = predictions;
      }, handleError)
  };

  init();
  function init(){
    $scope.$watch(function(){
      return vm.searchQuery
    }, function(current){
      if(current){
        vm.searchPlaces(current);
      }
    })
  }

  function handleError(err){
    alert(err);
  }
});
