app.controller('AppCtrl', function($rootScope, $state, authService) {
  var vm = this;

  vm.user = null;

  vm.logout = authService.logout;

  init()
  function init(){
    bindLoginListeners();
    checkInitialLoggedIn();
  }

  function checkInitialLoggedIn(){
    authService.auth
      .$getCurrentUser()
      .then(function(user){
        if(user){
          $state.transitionTo('history')
        } else {
          $state.transitionTo('login')
        }
      })
  }

  function bindLoginListeners(){
    // Upon successful login, set the user object
    $rootScope.$on("$firebaseSimpleLogin:login", function(event, user) {
      vm.user = user;
      $state.transitionTo('history')
    });

    // Upon successful logout, reset the user object
    $rootScope.$on("$firebaseSimpleLogin:logout", function(event) {
      vm.user = null;

      window.cookies && window.cookies.clear(function() {
        console.log("Cookies cleared!");
      });

      $state.transitionTo('login')
    });

    // Log any login-related errors to the console
    $rootScope.$on("$firebaseSimpleLogin:error", function(event, error) {
      console.log("Error logging user in: ", error);
    });
  }
});
