// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform,$rootScope,$state,$ionicPopup) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
  // UI Router Authentication Check
  $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){

     if (toState.data.authenticate && !Parse.User.current()){
          // User isn’t authenticated
          $state.transitionTo("login");
          event.preventDefault();
     }


    if (Parse.User.current()){
        //Check If Group is selected
        if (toState.data.needgroup && $rootScope.selectedGroup == undefined){
//         console.log("selected group = "+$rootScope.selectedGroup);
            $rootScope.warnNoGroup();
        }
    }


  });

})


.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    // setup an abstract state for the tabs directive


    .state('tab', {
      url: '/tab',
      abstract: true,
      templateUrl: "templates/tabs.html"
    })

    // Each tab has its own nav history stack:
      .state('tab.balance', {
          url:'/balanceall',
          views:{
              'tab-balance':{
                  templateUrl: 'templates/tab-balance-all.html',
                  controller: 'BalanceAllCtrl'
              }
          },
          data: {
              authenticate: true,
              needgroup: true
          }
      })
    .state('tab.balancedetail', {
      url: '/balance',
      views: {
        'tab-balance': {
          templateUrl: 'templates/tab-balance.html',
          controller: 'BalanceCtrl'
        }
      },
      data: {
            authenticate: true,
          needgroup: true

        }
    })

    .state('tab.send', {
      url: '/send',
      views: {
        'tab-send': {
          templateUrl: 'templates/tab-send.html',
          controller: 'SendCtrl'
        }
      },
          data: {
              authenticate: true,
              needgroup: true
          }
    })
    .state('tab.receive', {
          url: '/receive',
          views: {
              'tab-receive': {
                  templateUrl: 'templates/tab-receive.html',
                  controller: 'ReceiveCtrl'
              }
          },
          data: {
              authenticate: true,
              needgroup: false
          }
     })
    .state('tab.setup', {
          url:'/setup',
          views:{
              'tab-setup':{
                  templateUrl: 'templates/user-setup.html',
                  controller: 'SetupCtrl'
              }
          },
          data: {
              authenticate: true,
              needgroup: false
          }
     })
    .state('signup', {
          url:'/signup',
          templateUrl: 'templates/user-signup.html',
          controller: 'SignUpCtrl',

          data: {
              authenticate: false,
              needgroup: false
          }
     })
    .state('login', {
          url:'/login',
          templateUrl: 'templates/user-login.html',
          controller: 'LoginCtrl',
          //views:{
          //    'login':{
          //
          //    }
          //},
          data: {
              authenticate: false,
              needgroup: false
          }
    })
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});

