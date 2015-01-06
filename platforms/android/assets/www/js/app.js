// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','ionic.rating','starter.controllers', 'starter.services', 'ng-currency'])

.run(function($ionicPlatform,$rootScope,$state) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    console.log("ionicPlatform ready!!");

    Parse.initialize("eMt8xkAjx5hcAWMmL8HlNIUq3J0VQH2gf8b0TC8G", "utWyZ9iKkrZtoi3N30etMGrChUrRG8wTNesAzOvZ");
      console.log("device:",ionic.Platform.device());
      console.log("plaform:",ionic.Platform.platform());
      console.log("version:",ionic.Platform.version());
      var appId ="eMt8xkAjx5hcAWMmL8HlNIUq3J0VQH2gf8b0TC8G";
      var clientKey = "tYR8nY2IyLBXNCHboJTLORSwHLZwjaCeYzGFHO9b";
      if(window.plugins){
          parsePlugin.initialize(appId, clientKey, function() {
              parsePlugin.getInstallationId(function(id){
                  console.log("ParsePlugin Init - Installation Id = "+ id);
                  //alert("ParsePlugin Init - Installation Id = "+ id);
              });

              registerPush();

              subscribe("P_"+Parse.User.current().id);
              subscribeAllGroups(Parse.User.current().id);
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
      if (window.navigator && window.navigator.globalization){
          console.log("getting Locale on app load");
          navigator.globalization.getLocaleName(function(localeName) {
              var countryCode = localeName.value.substring(localeName.value.length - 2, localeName.value.length).toUpperCase();

              $rootScope.countryCode = countryCode;
              $rootScope.countryName = countryCodeToName(countryCode);
              console.log("country code = " + countryCode);
              console.log("country Name = " + $rootScope.countryName);
              $rootScope.$apply();
          },function(error){
              console.log(error.message);
          });
      }
      //$rootScope.user = Parse.User.current();
//      if (!$rootScope.user){
          $rootScope.user = Parse.User.current();

          $rootScope.user.get('default_currency').fetch({
              success:function (r){
                  console.log("default currency loaded");
                  //$rootScope.loadFriendsInit();
                  $rootScope.$apply();

              }
          });
//      }

//Google Anaytics
      if (typeof analytics !== 'undefined'){
          console.log("Google Analytics starts");
          analytics.startTrackerWithId('UA-41925733-2');
          if ($rootScope.user){
              analytics.setUserId($rootScope.user.getUsername());
          }
      }

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
          $state.go("verifyByPhone");
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
    .service('ScrollRender', function() {
        this.render = function(content) {
            return (function(global) {

                var docStyle = document.documentElement.style;

                var engine;
                if (global.opera && Object.prototype.toString.call(opera) === '[object Opera]') {
                    engine = 'presto';
                } else if ('MozAppearance' in docStyle) {
                    engine = 'gecko';
                } else if ('WebkitAppearance' in docStyle) {
                    engine = 'webkit';
                } else if (typeof navigator.cpuClass === 'string') {
                    engine = 'trident';
                }

                var vendorPrefix = {
                    trident: 'ms',
                    gecko: 'Moz',
                    webkit: 'Webkit',
                    presto: 'O'
                }[engine];

                var helperElem = document.createElement("div");
                var undef;

                var perspectiveProperty = vendorPrefix + "Perspective";
                var transformProperty = vendorPrefix + "Transform";

                if (helperElem.style[perspectiveProperty] !== undef) {

                    return function(left, top, zoom) {
                        content.style[transformProperty] = 'translate3d(' + (-left) + 'px,' + (-top) + 'px,0) scale(' + zoom + ')';
                    };

                } else if (helperElem.style[transformProperty] !== undef) {

                    return function(left, top, zoom) {
                        content.style[transformProperty] = 'translate(' + (-left) + 'px,' + (-top) + 'px) scale(' + zoom + ')';
                    };

                } else {

                    return function(left, top, zoom) {
                        content.style.marginLeft = left ? (-left / zoom) + 'px' : '';
                        content.style.marginTop = top ? (-top / zoom) + 'px' : '';
                        content.style.zoom = zoom || '';
                    };

                }
            })(this);
        };

    })

    .directive('zoomable', function(ScrollRender) {
        return {
            link: function(scope, element, attrs) {
                element.bind('load', function() {
                    // Intialize layout
                    var container = document.getElementById("container");
                    var content = document.getElementById("content");
                    var clientWidth = 0;
                    var clientHeight = 0;

                    // Initialize scroller
                    var scroller = new Scroller(ScrollRender.render(content), {
                        scrollingX: true,
                        scrollingY: true,
                        animating: true,
                        bouncing: true,
                        locking: true,
                        zooming: true,
                        minZoom: 0.5,
                        maxZoom: 2
                    });

                    // Initialize scrolling rect
                    var rect = container.getBoundingClientRect();
                    scroller.setPosition(rect.left + container.clientLeft, rect.top + container.clientTop);

                    var image = document.getElementById('image-scrollable');
                    var contentWidth = image.width;
                    var contentHeight = image.height;

                    // Reflow handling
                    var reflow = function() {
                        clientWidth = container.clientWidth;
                        clientHeight = container.clientHeight;
                        scroller.setDimensions(clientWidth, clientHeight, contentWidth, contentHeight);
                    };


                    window.addEventListener("resize", reflow, false);
                    reflow();

                    if ('ontouchstart' in window) {

                        container.addEventListener("touchstart", function(e) {
                            // Don't react if initial down happens on a form element
                            if (e.touches[0] && e.touches[0].target && e.touches[0].target.tagName.match(/input|textarea|select/i)) {
                                return;
                            }

                            scroller.doTouchStart(e.touches, e.timeStamp);
                            e.preventDefault();
                        }, false);

                        document.addEventListener("touchmove", function(e) {
                            scroller.doTouchMove(e.touches, e.timeStamp, e.scale);
                        }, false);

                        document.addEventListener("touchend", function(e) {
                            scroller.doTouchEnd(e.timeStamp);
                        }, false);

                        document.addEventListener("touchcancel", function(e) {
                            scroller.doTouchEnd(e.timeStamp);
                        }, false);

                    } else {

                        var mousedown = false;

                        container.addEventListener("mousedown", function(e) {
                            if (e.target.tagName.match(/input|textarea|select/i)) {
                                return;
                            }

                            scroller.doTouchStart([{
                                pageX: e.pageX,
                                pageY: e.pageY
                            }], e.timeStamp);

                            mousedown = true;
                        }, false);

                        document.addEventListener("mousemove", function(e) {
                            if (!mousedown) {
                                return;
                            }

                            scroller.doTouchMove([{
                                pageX: e.pageX,
                                pageY: e.pageY
                            }], e.timeStamp);

                            mousedown = true;
                        }, false);

                        document.addEventListener("mouseup", function(e) {
                            if (!mousedown) {
                                return;
                            }

                            scroller.doTouchEnd(e.timeStamp);

                            mousedown = false;
                        }, false);

                        container.addEventListener(navigator.userAgent.indexOf("Firefox") > -1 ? "DOMMouseScroll" : "mousewheel", function(e) {
                            scroller.doMouseZoom(e.detail ? (e.detail * -120) : e.wheelDelta, e.timeStamp, e.pageX, e.pageY);
                        }, false);
                    }
                });
            }
        };
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
      .state('tab.friends', {
          url:'/friends',
          views:{
              'tab-friends':{
                  templateUrl: 'templates/tab-friends.html',
                  controller: 'FriendsCtrl'
              }
          },
          data: {
              authenticate: true
          }
      })
      .state('tab.friends-group', {
          url:'/friends-group',
          views:{
              'tab-friends':{
                  templateUrl: 'templates/tab-friends-group.html',
                  controller: 'FriendsCtrl'
              }
          },
          data: {
              authenticate: true
          }
      })
      .state('tab.friends-request', {
          url:'/friends-request',
          views:{
              'tab-requests':{
                  templateUrl: 'templates/tab-friends-request.html',
                  controller: 'FriendsCtrl'
              }
          },
          data: {
              authenticate: true
          }
      })
      .state('tab.friends-request-group', {
          url:'/friends-request-group',
          views:{
              'tab-requests':{
                  templateUrl: 'templates/tab-friends-request-group.html',
                  controller: 'FriendsCtrl'
              }
          },
          data: {
              authenticate: true
          }
      })

      .state('tab.friends-select', {
          url:'/friends-select/:fromState',
          views:{
              'tab-friends':{
                  templateUrl: 'templates/tab-friends-select.html',
                  controller: 'FriendsCtrl'
              }
          },
          data: {
              authenticate: true
          }
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
    .state('tab.requests', {
          url: '/requests',
          views: {
              'tab-requests': {
                  templateUrl: 'templates/tab-requests.html',
                  controller: 'RequestsCtrl'
              }
          },
          data: {
              authenticate: true
          }
    })
    .state('tab.requests-detail', {
          url: '/requests-detail',
          views: {
              'tab-requests': {
                  templateUrl: 'templates/tab-requests-detail.html',
                  controller: 'RequestsDetailCtrl'
              }
          },
          data: {
              authenticate: true
          }
    })
      .state('tab.requests-detail-friend-detail', {
          url: '/requests-detail-friend-detail',
          views: {
              'tab-requests': {
                  templateUrl: 'templates/tab-requests-detail-friend-detail.html',
                  controller: 'RequestsDetailCtrl'
              }
          },
          data: {
              authenticate: true
          }
      })
      .state('tab.requests-comments', {
          url: '/requests-comments',
          views: {
              'tab-requests': {
                  templateUrl: 'templates/tab-request-comments.html',
                  controller: 'RequestsDetailCtrl'
              }
          },
          data: {
              authenticate: true
          }
      })
    .state('tab.incomingrequest-detail', {
          url: '/incomingrequest-detail',
          views: {
              'tab-requests': {
                  templateUrl: 'templates/tab-incomingrequest-detail.html',
                  controller: 'RequestsDetailCtrl'
              }
          },
          data: {
              authenticate: true
          }
    })
      .state('tab.payment-detail', {
          url: '/payment-detail',
          views: {
              'tab-requests': {
                  templateUrl: 'templates/tab-payment-detail.html'
//                  ,
//                  controller: 'PaymentDetailCtrl'
              }
          },
          data: {
              authenticate: true
          }
      })
    .state('tab.send', {
      url: '/send',
      views: {
        'tab-friends': {
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
              'tab-friends': {
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
              'tab-setup': {
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

    .state('tab.setupgroup', {
          url:'/group',
          views:{
              'tab-setup':{
                  templateUrl: 'templates/setup-group.html',
                  controller: 'SendGroupCtrl'
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
      .state('verifyByPhone', {
          url:'/verify',
          templateUrl: 'templates/user-verify-phone.html',
          controller: 'VerifyCtrl',
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
  $urlRouterProvider.otherwise('/verify');

});

