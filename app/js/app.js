  // Ionic Starter App

  // angular.module is a global place for creating, registering and retrieving Angular modules
  // 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
  // the 2nd parameter is an array of 'requires'
  var app = angular.module('envoc.burger-crawl', ['ionic']);

  app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('index', {
      url: '/',
      templateUrl: 'templates/home.html'
    })
    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html'
    })
    .state('history', {
      url: '/history',
      templateUrl: 'templates/history.html'
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
      if(window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if(window.StatusBar) {
        // Set the statusbar to use the default style, tweak this to
        // remove the status bar on iOS or change it to use white instead of dark colors.
        StatusBar.styleDefault();
      }
    });
  });
