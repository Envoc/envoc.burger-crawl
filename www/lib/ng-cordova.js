
angular.module('ngCordova', [
  'ngCordova.plugins'
]);
angular.module('ngCordova.plugins', []);

angular.module('ngCordova.plugins.appAvailability', [])

.factory('$cordovaAppAvailability', ['$q', function ($q) {

  return {
    check: function(urlScheme) {
      var q = $q.defer();

      appAvailability.check(urlScheme, function (result) {
        q.resolve(result);
      }, function (err) {
        q.reject(err);
      });

      return q.promise;
    }
  }
}]);angular.module('ngCordova.plugins.camera', [])

.factory('$cordovaCamera', ['$q', function($q) {

  return {
    getPicture: function(options) {
      var q = $q.defer();

      if(!navigator.camera) {
        q.resolve(null);
        return q.promise;
      }

      navigator.camera.getPicture(function(imageData) {
        q.resolve(imageData);
      }, function(err) {
        q.reject(err);
      }, options);

      return q.promise;
    },
    cleanup: function(options) {
      var q = $q.defer();

      navigator.camera.cleanup(function() {
        q.resolve(arguments);
      }, function(err) {
        q.reject(err);
      });

      return q.promise;
    }
    
  }
}]);
angular.module('ngCordova.plugins.device', [])

.factory('$cordovaDevice', [function () {

  return {
    getDevice: function () {
      return device;
    },

    getCordova: function () {
      return device.cordova;
    },

    getModel: function () {
      return device.model;
    },

    // Waraning: device.name is deprecated as of version 2.3.0. Use device.model instead.
    getName: function () {
      return device.name;
    },

    getPlatform: function () {
      return device.platform;
    },

    getUUID: function () {
      return device.uuid;
    },

    getVersion: function () {
      return device.version;
    }
  }
}]);
angular.module('ngCordova.plugins.geolocation', [])

.factory('$cordovaGeolocation', ['$q', function($q) {

  return {
    getCurrentPosition: function(options) {
      var q = $q.defer();

      navigator.geolocation.getCurrentPosition(function(result) {
        // Do any magic you need
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, options);

      return q.promise;
    },
    watchPosition: function(options) {
      var q = $q.defer();

      var watchId = navigator.geolocation.watchPosition(function(result) {
        // Do any magic you need
        q.notify(result);

      }, function(err) {
        q.reject(err);
      }, options);

      return {
        watchId: watchId,
        promise: q.promise
      }
    },

    clearWatch: function(watchID) {
      return navigator.geolocation.clearWatch(watchID);
    }
  }
}]);
angular.module('ngCordova.plugins.network', [])

.factory('$cordovaNetwork', [function () {

  return {

    getNetwork: function () {
      return navigator.connection.type;
    },

    isOnline: function () {
      var networkState = navigator.connection.type;
      return networkState !== Connection.UNKNOWN && networkState !== Connection.NONE;
    },

    isOffline: function () {
      var networkState = navigator.connection.type;
      return networkState === Connection.UNKNOWN || networkState === Connection.NONE;
    }
  }
}]);
angular.module('ngCordova.plugins.spinnerDialog', [])

.factory('$cordovaSpinnerDialog', [function() {

  return {
    show: function(title, message) {
	    return window.plugins.spinnerDialog.show(title, message);
    },
    hide: function() {
	    return window.plugins.spinnerDialog.hide();
    }
  }
  
}]);
