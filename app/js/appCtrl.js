app.controller('AppCtrl', function($rootScope, $state, authService, userService) {
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
});
