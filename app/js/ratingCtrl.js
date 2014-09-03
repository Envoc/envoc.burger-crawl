app.controller('RatingCtrl', function($scope, $timeout, $ionicScrollDelegate, $ionicLoading, 
               $state, categoryService, newRatingsService) {
  var vm = this;
  vm.categories = categoryService.categories;
  vm.place = newRatingsService.place;

  vm.submitRating = function(user) {
    $ionicLoading.show({
      template: 'Saving...'
    });

    var rating = {
      user: user,
      categories: angular.copy(vm.categories),
      place: {
        placeId: vm.place.place_id,
        description: vm.place.description
      }
    };

    newRatingsService.submitRating(rating)
      .then(function(){
        $ionicLoading.hide();
        $state.transitionTo('home');
      });
  }

  init();

  function init() {
    $timeout($ionicScrollDelegate.scrollTop, 50);

    $scope.$watch(function() {
      return vm.categories
    }, function(current) {
      var options = _.chain($scope.ratingCtrl.categories).map(function(cat) {
        return cat.sections
      }).flatten().map(function(section) {
        return section.metrics
      }).flatten().pluck('value');

      vm.ratingComplete = (options.value().length != options.reject(removeDefined).value().length);

      function removeDefined(val) {
        return val == undefined
      }
    }, true)
  }
});

app.controller('RatingSetupCtrl', function($scope, $state, autocompleteService, newRatingsService, categoryService) {
  var vm = this;

  // Logs a user in with inputted provider
  vm.searchPlaces = function(input) {
    autocompleteService.getQueryPredictions(input)
      .then(function(predictions) {
        vm.predictions = predictions;
      }, handleError)
  };

  vm.selectPlace = function(place) {
    newRatingsService.setPlace(place);
    $state.go('rating-categories');
  }

  init();

  function init() {
    categoryService.refresh();

    $scope.$watch(function() {
      return vm.searchQuery
    }, function(current) {
      if (current) {
        vm.searchPlaces(current);
      }
    })
  }

  function handleError(err) {
    alert(err);
  }
});

app.service('newRatingsService', function($http, serviceConfig, keenService) {
  var self = this;

  self.place = null;

  self.setPlace = function(place) {
    self.place = place;
  };

  self.submitRating = function(rating) {
    var url = serviceConfig.baseUrl + 'api/submitRating';

    return $http.post(url, {
        rating: rating
      })
      .then(function(resp) {
        makeKeenScore(rating)
        return resp.data; // user
      }, function(resp) {
        console.log('error', resp);
      })
  }

  function makeKeenScore(rating) {
    var metrics = [];

    _.forEach(rating.categories, function(category) {
      _.forEach(category.sections, function(section) {
        _.forEach(section.metrics, function(metric) {
          keenService.client.addEvent("ratings", {
            category: category.name,
            section: section.sectionName,
            metric: metric.name,
            value: metric.value,
            user: rating.user,
            place: rating.place,
            keen: {
              timestamp: new Date().toISOString()
            }
          });
        })
      })
    })

    return metrics
  }
});

app.service('categoryService', function($http) {
  var self = this;

  self.categories = [];

  self.refresh = function() {
    $http.get('data/category-data.json').then(function(resp) {
      angular.copy(resp.data.categories, self.categories);
    });
  }

  init();

  function init() {
    self.refresh()
  }
});

app.service('keenService', function() {
  this.client = new Keen({
    projectId: "540665ebbcb79c3b2f000007",
    writeKey: "0f68819b3cd2ae770e21ba2e0c0e0c4d91a9a15a68e523623540b02b39498bdd2f0107b30ef121e34f5bfddda1284f354ca265aed8a4dcd3321a49a58cb35171ba633eb88311b02070a3ba0efac719d6cb463fd274defe3e3144fa6c87c1b66372d3096acb53ffdb26166640fd796395",
    readKey: "37df3ad3000b9b18f88f50ad2b58f2242b887dec116d9b09cc0c0157dc35547fd91e2be57339362a7bf7d4c99440b80ad0737c955324849e404fd7610a0d60dfce8b235096af562c6b45fb9c57f2a238d18667138a44dbd87cddadef4e27a44bc3e61fc8ab440a10d7ee009898ec2726"
  });
});
