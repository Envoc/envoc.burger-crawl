/// Author: Justin Obney
/// Desc: Envoc - Burger Crawl App

(function(){
'use strict';

var app = angular.module('envoc.burger-crawl', [
                         'ionic', 
                         'firebase',
                         'ngCordova.plugins.geolocation'
                        ]);

app.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
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
    .state('newRating', {
      url: '/new-rating',
      templateUrl: 'templates/new-rating.html'
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/');
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
  baseUrl: 'http://localhost:8000/'
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
      userService.getSession(user.uid)
        .then(function(session){
          vm.user = session;
          $state.transitionTo('home');
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
  var coords = {};

  $cordovaGeolocation.getCurrentPosition().then(function(position) {
    coords = position.coords;
  });

  // see: https://developers.google.com/maps/documentation/javascript/reference#QueryAutocompletionRequest
  self.getQueryPredictions = function(queryAutocompletionRequest) {
    var dfd = $q.defer();

    if(coords.latitude){
      queryAutocompletionRequest.location = new google.maps.LatLng(coords.latitude, coords.longitude);
      queryAutocompletionRequest.radius = 25
    }
    
    service.getQueryPredictions(queryAutocompletionRequest, function callback(predictions, status) {
      if (status != google.maps.places.PlacesServiceStatus.OK) {
        dfd.reject(status);
        return;
      }
      dfd.resolve(predictions);
    });

    return dfd.promise;
  }
}]);

app.service('autocompleteService', ["$q", "$cordovaGeolocation", function($q, $cordovaGeolocation) {
  var self = this;
  var service = new google.maps.places.AutocompleteService();
  var coords = {};

  $cordovaGeolocation.getCurrentPosition().then(function(position) {
    coords = position.coords;
  });

  // see: https://developers.google.com/maps/documentation/javascript/reference#QueryAutocompletionRequest
  self.getQueryPredictions = function(queryAutocompletionRequest) {
    var dfd = $q.defer();

    if(coords.latitude){
      queryAutocompletionRequest.location = new google.maps.LatLng(coords.latitude, coords.longitude);
      queryAutocompletionRequest.radius = 25
    }
    
    service.getQueryPredictions(queryAutocompletionRequest, function callback(predictions, status) {
      if (status != google.maps.places.PlacesServiceStatus.OK) {
        dfd.reject(status);
        return;
      }
      dfd.resolve(predictions);
    });

    return dfd.promise;
  }
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

app.controller('RatingCtrl', ["autocompleteService", function(autocompleteService) {
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
}]);

app.service('userService', ["$http", "serviceConfig", function($http, serviceConfig) {
  var self = this;

  this.getSession = function(uid) {
    var url = serviceConfig.baseUrl + 'api/authenticate';
    return $http.post(url, {uid: uid})
      .then(function(resp) {
        return resp.data; // user
      })
  };

}])

})();