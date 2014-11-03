angular.module('starter.controllers', [])
.controller('NavCtrl', function($rootScope, $scope, $state, $stateParams,$ionicSideMenuDelegate,$ionicPopup,ParseService) {

        $rootScope.showMenu = function () {
            if (!$scope.friendlists)
                $rootScope.loadGroup();

            $ionicSideMenuDelegate.toggleLeft();
        };

        $rootScope.warnNoGroup = function(){

            var alertPopup = $ionicPopup.alert({
                title: 'First Choose a Group',
                template: 'Or, Add a new Group on the left menu'
            });
            alertPopup.then(function(res) {
                console.log('Group will be selected: ' + res);
            });
            $rootScope.showMenu();
        }

        $scope.setGroup = function (groupname){
            $rootScope.selectedGroup = groupname;
            $state.transitionTo($state.current, $stateParams, {
                reload: true,
                inherit: false,
                notify: true
            });

            $ionicSideMenuDelegate.toggleLeft();
        }

        $scope.addGroup = function (){
            $scope.data = {};
            var myPopup = $ionicPopup.show({
                template: '<input type="text" ng-model="data.group">',
                title: 'Add Group',
                subTitle: 'Please enter group name',
                scope: $scope,
                buttons: [
                    { text: 'Cancel' },
                    {
                        text: '<b>Save</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            if (!$scope.data.group) {
                                //don't allow the user to close unless he enters wifi password
                                e.preventDefault();
                            } else {
                                //Save new Friend list
                                var Friendlist = Parse.Object.extend("friendlist");
                                var fl = new Friendlist();
                                fl.set('group',$scope.data.group);
                                fl.set('email',ParseService.getUser().get('email'));
                                fl.save(null,{
                                    success: function (result) {
                                        console.log("Add New Group Successfully");
                                        $rootScope.loadGroup();
                                    }, error: function (error) {
                                        alert("Error: " + error.code + " " + error.message);
                                    }
                                })
                            }
                        }
                    }
                ]
            });
        }

        $scope.editGroup = function(){

        }

        $rootScope.loadGroup = function(){
            var user = new SUser();
            user.getFriendListAll(ParseService.getUser().get('email'), function(friendlists){
                $scope.friendlists = friendlists;
                $scope.$apply();
                $scope.$broadcast('scroll.refreshComplete');
            })
        }


})
.controller('BalanceCtrl', function($rootScope, $scope, $location, ParseService) {

        console.log("controller - BalanceCtrl start | selectedGroup = "+$scope.selectedGroup);
        $scope.balance = Parse.Object.extend("balance");
        $scope.transactions = [];
        $scope.user = ParseService.getUser();


        //Load User Balance
        var user = new SUser();
        document.getElementById("tran_loading").style.visibility = 'visible';
        user.getBalanceByEmail($rootScope.selectedGroup,ParseService.getUser().get('email'), function(balance){
            $scope.balance = balance;
            console.log("controller balance - Balance = "+$scope.balance.get('balance'));
            $scope.$apply();
        })

        //Load recent transactions
        var tran = new Transaction();
        tran.getRelatedTran($rootScope.selectedGroup,ParseService.getUser().get('email'), function(transactions){
            $scope.transactions = transactions;
            $scope.$apply();
            document.getElementById("tran_loading").style.visibility = 'hidden';
        })

})

.controller('BalanceAllCtrl', function($scope, $location, ParseService) {
//        if (ParseService.getUser()) {
//            // do stuff with the user
//            console.log("LOADING BalanceDetailCtrl PAGE: "+ParseService.getUser().get('email'));
//            $scope.user = ParseService.getUser();
//        } else {
//            $location.path('tab/login');
//            $route.refresh();
//        }
        //Load User Balance
        var user = new SUser();
        user.getBalanceByEmail($scope.selectedGroup, ParseService.getUser().get('email'), function(balance){
            $scope.balance = balance;
            $scope.$apply();
        })

        //Load Friends Balance
        user.getFriendList($scope.selectedGroup,ParseService.getUser().get('email'),function(friendlist){
            console.log("BalanceDetailCtrl got Friend list = ");
            user.getBalanceByEmails($scope.selectedGroup,friendlist.get('friends'), function(balances){
                $scope.balances = balances;
                $scope.$apply();
                document.getElementById("tran_loading").style.visibility = 'hidden';
            })
        })

})
.controller('SendCtrl', function($rootScope,$scope, $location, ParseService, Common) {



        var qrcode = new QRCode("qrcode", {
            text: "",
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.L
        });

        $scope.makeQRCode = function (send){

            if (!$rootScope.selectedGroup){
                $rootScope.warnNoGroup();
                throw "No Group Error";
            }


            var sendString = Common.getID()+"|"+ParseService.getUser().get('email') +"|"+ send.amount+"|"+ send.note +"|"+$rootScope.selectedGroup;
            console.log(sendString.toString());
            sendString = Common.encrypt(sendString.toString());


            qrcode.clear(); // clear the code.

            qrcode.makeCode(sendString.toString()); // make another code.
        }

})
.controller('ReceiveCtrl', function($scope, $location, ParseService, Common) {
        console.log("Receive Ctrl start");
        $scope.user = ParseService.getUser();
        var location;
//        var options = {
//            // https://github.com/christocracy/cordova-plugin-background-geolocation#config
//        };

        // `configure` calls `start` internally
//        $cordovaBackgroundGeolocation.configure(options).then(function (loc) {
//            location = loc;
//            console.log(location);
//
//        }, function (err) {
//            console.error(err);
//        });

//        $scope.stopBackgroundGeolocation = function () {
//            $cordovaBackgroundGeolocation.stop();
//        };
        $scope.showloading = function(){
            document.getElementById("scan_loading").style.visibility = 'visible';
        }

        $scope.hideloading = function(){
            document.getElementById("scan_loading").style.visibility = 'hidden';
        }


        ParseService.getLocation(function(r){
            location=r;
        });

        $scope.scan = function(){
            console.log("Receive Ctrl enter scan");
            document.getElementById("info").innerHTML="";

            $scope.showloading();
            var scanner = cordova.require("cordova/plugin/BarcodeScanner");

            scanner.scan( function (result) {

                console.log("Scanner result: \n" +
                    "text: " + result.text + "\n" +
                    "format: " + result.format + "\n" +
                    "cancelled: " + result.cancelled + "\n");

                if (result.cancelled == 1){
                    $scope.hideloading();
                    throw "Scanning Canceled";
                }

                //Decrypt Result String
                var resultString = Common.decrypt(result.text);
                var res = resultString.split("|");
                var display = "";

                if (res.length==1){
                    display = "This is NOT a 'Settle' QRCode! <BR><BR> Or, <BR><BR>you haven't scan a QRCode at all."
                    document.getElementById("info").innerHTML = display;
                    $scope.hideloading();
                }else{

                    var id = res[0];
                    var from = res[1];
                    var amount = res[2];
                    var note=res[3];
                    var group=res[4];
                    var friendemail;
                    if (from == $scope.user.get('email')){
                        friendemail = to;
                    }else{
                        friendemail = from;
                    }
                    var user = new SUser();
                    user.getUserByEmail(friendemail, function(friend){
                        ParseService.recordQRCode(group, id,amount,from,$scope.user.get('email'),note,location, $scope.user,friend, function(r){
                            //console.log("Controllers Receive - recordQRCode Successfully Return message = "+r.message);
                            if (r.message== undefined){
                                console.log("Controllers Receive - recordQRCode Successfully");

                                display = "<BR>Received : $" + amount +"<br><br>" +
                                    "Group : " + group +"<BR><BR>"+
                                    "From : " + from +"<BR><BR>"
                                    +"Note : "+note;
                                document.getElementById("info").innerHTML = display;
                            }else{
                                console.log("Controllers Receive - recordQRCode Failed");
                                display = "<BR><b> " + r.message +"</b>";
                                document.getElementById("info").innerHTML = display;
                            }
                            $scope.hideloading();

                        });
                    })


                }
            }, function (error) {

                $scope.hideloading();
                console.log("Scanning failed: ", error);
            } );
        }

        $scope.scan();

})

.controller('SignUpCtrl', function($scope,$location,$state, $ionicPopup,ParseService) {
        // Called when the form is submitted
        console.log('Signup Ctrl');
        $scope.signUp = function(userp) {
            console.log(scorePassword(userp.password));
            if (scorePassword(userp.password) < 30){
//                alert("Please Enter Password with At least 6 character with one upper case and numeric ");
                var alertPopup = $ionicPopup.alert({
                    title: 'Weak Password',
                    template: 'Please Enter Password with At least 6 character with one upper case and numeric'
                });
                alertPopup.then(function(res) {

                });
                throw("Weak Password");
            }

            if (userp.password!=userp.con_password){
                var alertPopup = $ionicPopup.alert({
                    title: 'Password Problem',
                    template: 'Confirm Password does not match'
                });
                alertPopup.then(function(res) {

                });
                throw("Invalid Password");
            }


            ParseService.signUp(userp.name, userp.email, userp.password, function(user) {
                // When service call is finished, navigate to items page
//                alert("Account Signup Successful");
                var alertPopup = $ionicPopup.alert({
                    title: 'Account Setup Successful',
                    template: 'Please login'
                });
                alertPopup.then(function(res) {
//                    console.log('Group will be selected: ' + res);
                });

                $state.transitionTo('tab.login', '', {
                    reload: true,
                    inherit: false,
                    notify: true
                });
            })
        };
})
.controller('SetupCtrl', function($rootScope,$scope, $state, $location, $ionicPopup,ParseService) {

        console.log("controller - SetupCtrl start");

        $scope.user = ParseService.getUser();
        $scope.saveSetup = function(userp){
            var user = ParseService.getUser();

            if (checkPassStrength(userp.password) == 'good' || checkPassStrength(userp.password) == 'strong'){
//                alert("Please Enter Password with At least 6 character with one upper case and numeric ");
                var alertPopup = $ionicPopup.alert({
                    title: 'Weak Password',
                    template: 'Please Enter Password with At least 6 character with one upper case and numeric'
                });
                alertPopup.then(function(res) {
                    throw("Weak Password");
                });

            }

            if (userp.password!=userp.con_password){
                alert("Invalid Password");
                throw("Invalid Password");
            }
            user.set('password',userp.password);
            user.save(null,{
                success: function(user){
                    alert("Setup saved!");

                },error:function(user, error){
                    alert(error.message);
                }
            })

        }

        $scope.logout = function(){
            ParseService.logout();
            $state.transitionTo('tab.balanceall', '', {
                reload: true,
                inherit: false,
                notify: true
            });

        };


})
.controller('LoginCtrl', function( $rootScope,$scope, $state, $ionicPopup, $location, ParseService) {

        $scope.goTosignUp = function(){
            $location.path('/tab/signup');
//            $route.refresh();
        }

        $scope.forgotPassword = function(){
            // An elaborate, custom popup
            $scope.resetpassword = {};


            var passwordPopup = $ionicPopup.show({
                template: '<input type="email" ng-model="resetpassword.email">',
                title: 'Enter your email',
                subTitle: 'An email will be sent to reset your password',
                scope: $scope,
                buttons: [
                    { text: 'Cancel' },
                    {
                        text: '<b>Reset</b>',
                        type: 'button-stable',
                        onTap: function(e) {

                            if (!$scope.resetpassword.email) {
                                e.preventDefault();

                            } else {
                                Parse.User.requestPasswordReset($scope.resetpassword.email, {
                                    success: function() {
                                        // Password reset request was sent successfully
                                        alert("Please check your email, and reset your password")
                                    },
                                    error: function(error) {
                                        // Show the error message somewhere
                                        alert("Error:  " + error.message);
                                    }
                                });
//                                return $scope.resetpassword.email;
                            }
                        }
                    }
                ]
            });


        }

        $scope.login = function (user){

            ParseService.login(user.username, user.password, function(user){
            console.log("controller - success login");
                $rootScope.user = user;
                $rootScope.$apply();

//                $route.refresh();
                $state.transitionTo('tab.balanceall', '', {
                    reload: true,
                    inherit: false,
                    notify: true
                });
                $rootScope.loadGroup();
                console.log("controller - redirected success login");
            });
        }


});