app.controller('RatingCtrl', function($scope, $timeout, $ionicScrollDelegate, $ionicLoading,
  $ionicPopup, $state, categoryService, newRatingsService) {
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
        description: vm.place.name
      }
    };

    newRatingsService.submitRating(rating)
      .then(function() {
        $ionicLoading.hide();
        var successPopup = $ionicPopup.alert({
          title: 'Rating saved!',
          template: 'You can view it in history'
        });
        successPopup.then(function(res) {
          $state.transitionTo('home');
        });
      });
  }

  vm.setMetricInitValue = function(metric) {
    metric.value = Math.ceil(metric.scores[1].value / 2)
  }

  init();

  function init() {
    $timeout($ionicScrollDelegate.scrollTop, 50);

    $scope.$watch(function() {
      return vm.categories
    }, function(current) {
      vm.ratingComplete = areAllMetricsSet(current)
    }, true)
  }

  function areAllMetricsSet(categories) {
    var options = _.chain(categories).map(function(cat) {
      return cat.sections
    }).flatten().map(function(section) {
      return section.metrics
    }).flatten().pluck('value');

    return (options.value().length != options.reject(removeDefined).value().length);

    function removeDefined(val) {
      return val === undefined
    }
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
    console.log(err);
  }
});

app.service('newRatingsService', function($http, serviceConfig, keenService) {
  var self = this;

  self.place = null;

  self.setPlace = function(place) {
    self.place = place;
  };

  self.getHistory = function(user) {
    var url = serviceConfig.baseUrl + 'api/myRatings/';
    return $http.post(url, {
      uid: user.id
    }).then(function(resp) {
      return resp.data
    });
  }

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

    function getMax(c, m) {
      return c + m.scores[1].value;
    }

    function getTotal(c, m) {
      return c + m.value;
    }

    var calcCategoryScore = function(category) {
      var metrics = _.chain(category.sections).pluck('metrics').flatten();
      var max = metrics.reduce(getMax, 0).value();
      var total = metrics.reduce(getTotal, 0).value();

      return {
        total: total,
        max: max,
        percent: parseFloat((total / max).toFixed(3))
      };
    }

    var keenRating = {
      user: rating.user,
      place: rating.place,
      keen: {
        timestamp: new Date().toISOString()
      }
    };

    _.forEach(rating.categories, function(cat) {
      keenRating[cat.name] = calcCategoryScore(cat)
    })

    keenService.client.addEvent("ratings", keenRating);

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
