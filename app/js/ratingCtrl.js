app.controller('RatingCtrl', function($scope, autocompleteService, categoryService) {
  var vm = this;

  // Logs a user in with inputted provider
  vm.searchPlaces = function(input) {
    autocompleteService.getQueryPredictions(input)
      .then(function(predictions){
        vm.predictions = predictions;
      }, handleError)
  };

  vm.categories = categoryService.categories;

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
})
.service('categoryService', function($http){
  var self = this;
  
  self.categories = [];

  init();
  function init(){
    $http.get('data/category-data.json').then(function(resp){
      angular.copy(resp.data.categories, self.categories);
    });
  }
})
