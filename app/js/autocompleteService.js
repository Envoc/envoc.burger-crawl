app.service('autocompleteService', function($q, $cordovaGeolocation) {
  var self = this;
  var service = new google.maps.places.AutocompleteService();
  var coords = {};

  $cordovaGeolocation.getCurrentPosition().then(function(position) {
    coords = position.coords;
  });

  // see: https://developers.google.com/maps/documentation/javascript/reference#QueryAutocompletionRequest
  self.getQueryPredictions = function(query) {
    var dfd = $q.defer();

    var queryAutocompletionRequest = {
      input: query
    }

    if(coords.latitude){
      queryAutocompletionRequest.location = new google.maps.LatLng(coords.latitude, coords.longitude);
      queryAutocompletionRequest.radius = 25;
      queryAutocompletionRequest.types = ['establishment'];
      queryAutocompletionRequest.componentRestrictions = {
        country: 'us'
      }
    }
    
    service.getPlacePredictions(queryAutocompletionRequest, function callback(predictions, status) {
      if (status != google.maps.places.PlacesServiceStatus.OK) {
        dfd.reject(status);
        return;
      }
      dfd.resolve(predictions);
    });

    return dfd.promise;
  }
});
