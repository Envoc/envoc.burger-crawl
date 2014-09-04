app.service('autocompleteService', function($q, $cordovaGeolocation) {
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
});
