/// Author: Justin Obney
/// Desc: Envoc - Burger Crawl App

(function(){
'use strict';

var app = angular.module('envoc.burger-crawl', [
  'ionic',
  'firebase',
  'ngCordova.plugins.geolocation',
  'nouislider'
]);

app.config(["$stateProvider", "$urlRouterProvider", "$httpProvider", "$sceDelegateProvider", function($stateProvider, $urlRouterProvider, $httpProvider, 
           $sceDelegateProvider) {
  $stateProvider
    .state('index', {
      url: '/',
      templateUrl: 'templates/index.html'
    })
    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html'
    })
    .state('home', {
      url: '/home',
      templateUrl: 'templates/home.html'
    })
    .state('rating', {
      url: '/new-rating',
      templateUrl: 'templates/rating-setup.html'
    })
    .state('rating-categories', {
      url: '/categories',
      templateUrl: 'templates/new-rating.html'
    })
    .state('my-ratings', {
      url: '/my-ratings',
      templateUrl: 'templates/my-ratings.html'
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/');

  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];

  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    'http://node.justinobney.com/**'
  ]);
}]);

app.run(["$ionicPlatform", function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // Set the statusbar to use the default style, tweak this to
      // remove the status bar on iOS or change it to use white instead of dark colors.
      StatusBar.styleDefault();
    }
  });
}]);

app.constant('baseRef', new Firebase("https://envoc-burger-crawl.firebaseio.com/"));

app.constant('serviceConfig', {
  baseUrl: 'http://node.justinobney.com/'
  //baseUrl: 'http://localhost:8000/'
});

app.controller('AppCtrl', ["$rootScope", "$state", "authService", "userService", function($rootScope, $state, authService, userService) {
  var vm = this;

  vm.user = null;
  vm.checkingAuth = true;

  vm.logout = authService.logout;

  init()
  function init(){
    bindLoginListeners();
  }

  function bindLoginListeners(){
    // Upon successful login, set the user object
    $rootScope.$on("$firebaseSimpleLogin:login", function(event, user) {
      userService.getSession(user)
        .then(function(session){
          $rootScope.user = vm.user = session;
          $state.transitionTo('home');
        }, function(resp){
          console.log(resp);
        })
    });

    // Upon successful logout, reset the user object
    $rootScope.$on("$firebaseSimpleLogin:logout", function(event) {
      vm.user = null;

      window.cookies && window.cookies.clear(function() {
        console.log("Cookies cleared!");
      });

      $state.transitionTo('index')
      vm.checkingAuth = false;
    });

    // Log any login-related errors to the console
    $rootScope.$on("$firebaseSimpleLogin:error", function(event, error) {
      console.log("Error logging user in: ", error);
    });
  }
}]);

app.service('authService', ["$firebaseSimpleLogin", "baseRef", function($firebaseSimpleLogin, baseRef) {
  var self = this;

  self.auth = $firebaseSimpleLogin(baseRef);

  this.login = function(provider) {
    self.auth.$login(provider);
  };

  // Logs a user out
  this.logout = function() {
    self.auth.$logout();
  };
}]);

app.service('autocompleteService', ["$q", "$cordovaGeolocation", function($q, $cordovaGeolocation) {
  var self = this;
  var service = new google.maps.places.AutocompleteService();
  var placeService = new google.maps.places.PlacesService($('<div />')[0]);
  var coords = {};

  $cordovaGeolocation.getCurrentPosition().then(function(position) {
    coords = position.coords;
  });

  // see: https://developers.google.com/maps/documentation/javascript/reference#QueryAutocompletionRequest
  self.getQueryPredictions = function(query) {
    var dfd = $q.defer();

    var queryAutocompletionRequest = {
      query: query
    }

    if(coords.latitude){
      queryAutocompletionRequest.location = new google.maps.LatLng(coords.latitude, coords.longitude);
      queryAutocompletionRequest.radius = 25;
      queryAutocompletionRequest.types = ['food'];
      queryAutocompletionRequest.componentRestrictions = {
        country: 'us'
      }
    }
    
    placeService.textSearch(queryAutocompletionRequest, function callback(predictions, status) {
      if (status != google.maps.places.PlacesServiceStatus.OK) {
        dfd.reject(status);
        return;
      }
      dfd.resolve(predictions);
    });

    return dfd.promise;
  }

  self.getDetails = function(request, callback){
    placeService.getDetails(request, callback);
  }
}]);

app.controller('HistoryCtrl', ["$scope", "$ionicScrollDelegate", "newRatingsService", function($scope, $ionicScrollDelegate, newRatingsService) {
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
}]);

app.controller('HistoryCtrl', ["$scope", "$ionicScrollDelegate", "newRatingsService", function($scope, $ionicScrollDelegate, newRatingsService) {
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
}]);

app.controller('LoginCtrl', ["$firebaseSimpleLogin", "baseRef", "authService", function($firebaseSimpleLogin, baseRef, authService) {
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
}]);

app.controller('RatingCtrl', ["$scope", "$timeout", "$ionicScrollDelegate", "$ionicLoading", "$ionicPopup", "$state", "categoryService", "newRatingsService", function($scope, $timeout, $ionicScrollDelegate, $ionicLoading,
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
}]);

app.controller('RatingSetupCtrl', ["$scope", "$state", "autocompleteService", "newRatingsService", "categoryService", function($scope, $state, autocompleteService, newRatingsService, categoryService) {
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
}]);

app.service('newRatingsService', ["$http", "serviceConfig", "keenService", function($http, serviceConfig, keenService) {
  var self = this;

  self.place = null;

  self.setPlace = function(place) {
    self.place = place;
  };

<<<<<<< HEAD
  self.getHistory = function(user){
    var url = serviceConfig.baseUrl + 'api/myRatings/';
    return $http.post(url, {uid: user.id}).then(function(resp){
=======
  self.getHistory = function(user) {
    var url = serviceConfig.baseUrl + 'api/myRatings/';
    return $http.post(url, {
      uid: user.id
    }).then(function(resp) {
>>>>>>> 36f0dc6219d2aa6c6ac02b3dfe1ca3cc94257ee7
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
}]);

app.service('categoryService', ["$http", function($http) {
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
}]);

app.service('keenService', function() {
  this.client = new Keen({
    projectId: "540665ebbcb79c3b2f000007",
    writeKey: "0f68819b3cd2ae770e21ba2e0c0e0c4d91a9a15a68e523623540b02b39498bdd2f0107b30ef121e34f5bfddda1284f354ca265aed8a4dcd3321a49a58cb35171ba633eb88311b02070a3ba0efac719d6cb463fd274defe3e3144fa6c87c1b66372d3096acb53ffdb26166640fd796395",
    readKey: "37df3ad3000b9b18f88f50ad2b58f2242b887dec116d9b09cc0c0157dc35547fd91e2be57339362a7bf7d4c99440b80ad0737c955324849e404fd7610a0d60dfce8b235096af562c6b45fb9c57f2a238d18667138a44dbd87cddadef4e27a44bc3e61fc8ab440a10d7ee009898ec2726"
  });
});

app.service('userService', ["$http", "serviceConfig", function($http, serviceConfig) {
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

}])

})();