app.controller('HistoryCtrl', function($scope, $ionicScrollDelegate, newRatingsService) {
  var vm = this;
  vm.ratings = [];

  vm.calcCategoryScore = function(category) {
    var metrics = _.chain(category.sections).pluck('metrics').flatten();
    var max = metrics.reduce(getMax, 0).value();
    var total = metrics.reduce(getTotal, 0).value();
    
    return (total + '/' + max);
  }

  init();
  function init() {
    newRatingsService.getHistory($scope.user)
      .then(function(history) {
        vm.ratings = history;
      })
  }

  function getMax(c, m) { return c + m.scores[1].value; }
  function getTotal(c, m) { return c + m.value; }
});
