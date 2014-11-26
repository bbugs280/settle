// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','starter.controllers', 'starter.services', 'ng-currency'])

.run(function($ionicPlatform,$rootScope,$state) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    console.log("ionicPlatform ready!!");
//    Parse.initialize("eMt8xkAjx5hcAWMmL8HlNIUq3J0VQH2gf8b0TC8G", "utWyZ9iKkrZtoi3N30etMGrChUrRG8wTNesAzOvZ");

      var appId ="eMt8xkAjx5hcAWMmL8HlNIUq3J0VQH2gf8b0TC8G";
      var clientKey = "tYR8nY2IyLBXNCHboJTLORSwHLZwjaCeYzGFHO9b";
      if(window.plugins){
          parsePlugin.initialize(appId, clientKey, function() {
              parsePlugin.getInstallationId(function(id){
                  console.log("ParsePlugin Init - Installation Id = "+ id);
                  //alert("ParsePlugin Init - Installation Id = "+ id);
              });

              registerPush();

              subscribe(Parse.User.current().id);
          }, function(e) {
              console.log('error');
          });

      }
//      clear cache
      var success = function(status) {
          console.log('Clean Cache Message: ' + status);
      }
      var error = function(status) {
          console.log('Clean Cache Error: ' + status);
      }
      if (window.cache){
          window.cache.clear( success, error );
      }

      //$rootScope.user = Parse.User.current();
//      if (!$rootScope.user){
          $rootScope.user = Parse.User.current();
          $rootScope.user.get('default_currency').fetch({
              success:function (r){
                  $rootScope.$apply();
              }
          });
//      }


    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
//    if (window.cordova && window.cordova.plugins.notification) {
//        cordova.plugins.notification.badge.configure({ autoClear: Boolean });
//    }

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


  });

  // Disable "Back" button on androids if user is on login screen
  //      $rootScope.$on('$locationChangeStart', function(e) {
  //          if( true ) {
  //              e.preventDefault();
  //              e.stopPropagation();
  //          }
  //      });

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

      .state('tab.balance-overview', {
          url:'/balance-overview',
          views:{
              'tab-balance':{
                  templateUrl: 'templates/tab-balance-overview.html',
                  controller: 'BalanceOverviewCtrl'
              }
          },
          data: {
              authenticate: true
          }
      })
      .state('tab.balance-group', {
          url:'/balance-group',
          views:{
              'tab-balance':{
                  templateUrl: 'templates/tab-balance-group.html',
                  controller: 'BalanceGroupCtrl'
              }
          },
          data: {
              authenticate: true,
              needgroup: true
          }
      })
    .state('tab.balance-detail', {
      url: '/balance-detail',
      views: {
        'tab-balance': {
          templateUrl: 'templates/tab-balance-detail.html',
          controller: 'BalanceDetailCtrl'
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
              authenticate: true
          }
    })
      .state('tab.send-remote', {
          url: '/send-remote',
          views: {
              'tab-send': {
                  templateUrl: 'templates/tab-send-remote.html',
                  controller: 'SendCtrl'
              }
          },
          data: {
              authenticate: true
          }
      })
    .state('tab.send-group', {
          url: '/send-group',
          views: {
              'tab-send': {
                  templateUrl: 'templates/tab-send-group.html',
                  controller: 'SendGroupCtrl'
              }
          },
          data: {
              authenticate: true
          }
    })
    .state('tab.send-selectuser', {
          url: '/send-selectuser',
          views: {
              'tab-send': {
                  templateUrl: 'templates/tab-send-selectuser.html',
                  controller: 'SelectUserCtrl'
              }
          },
          data: {
              authenticate: true
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
              authenticate: true
          }
     })
    .state('tab.setup', {
          url:'/setup',
          views:{
              'tab-setup':{
                  templateUrl: 'templates/setup.html',
                  controller: 'SetupCtrl'
              }
          },
          data: {
              authenticate: true
          }
     })
    .state('tab.setupuser', {
          url:'/user',
          views:{
              'tab-setup':{
                  templateUrl: 'templates/setup-user.html',
                  controller: 'SetupCtrl'
              }
          },
          data: {
              authenticate: true
          }
     })
      .state('currencies', {
          url:'/currencies',
          templateUrl: 'templates/setup-currencies.html',
          controller: 'SelectCurrencyCtrl',
//          views:{
//              'tab-setup':{
//                  templateUrl: 'templates/setup-currencies.html',
//                  controller: 'SelectCurrencyCtrl'
//              }
//          },
          data: {
              authenticate: false
          }
      })
    .state('tab.setupgroup', {
          url:'/group',
          views:{
              'tab-setup':{
                  templateUrl: 'templates/setup-group.html',
                  controller: 'SetupGroupCtrl'
              }
          },
          data: {
              authenticate: true
          }
     })
      .state('tab.setupgroup-edit', {
          url:'/group-edit',
          views:{
              'tab-setup':{
                  templateUrl: 'templates/setup-group-edit.html',
                  controller: 'SetupGroupCtrl'
              }
          },
          data: {
              authenticate: true
          }
      })
    .state('signup', {
          url:'/signup',
          templateUrl: 'templates/user-signup.html',
          controller: 'SignUpCtrl',
          data: {
              authenticate: false
          }
     })
    .state('login', {
          url:'/login',
          templateUrl: 'templates/user-login.html',
          controller: 'LoginCtrl',
          data: {
              authenticate: false
          }
    })
    .state('intro', {
          url: '/intro',
          templateUrl: "templates/intro.html",
          controller: 'IntroCtrl',
          data: {
              authenticate: false
          }
    })
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});

