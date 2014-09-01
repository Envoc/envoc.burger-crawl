var app = angular.module('envoc.burger-crawl', [
                         'ionic', 
                         'firebase',
                         'ngCordova.plugins.geolocation'
                        ]);

app.config(function($stateProvider, $urlRouterProvider) {
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
});

app.run(function($ionicPlatform) {
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
});

app.constant('baseRef', new Firebase("https://envoc-burger-crawl.firebaseio.com/"));

app.constant('serviceConfig', {
  baseUrl: 'http://localhost:8000/'
});
