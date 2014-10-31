angular.module('starter.controllers', [])

.controller('BalanceCtrl', function($scope, $location, ParseService) {

        console.log("controller - BalanceCtrl start");

        $scope.balance = Parse.Object.extend("balance");
        $scope.transactions = [];
        //var currentUser = Parse.User.current();
        if (ParseService.getUser()) {
            // do stuff with the user
            console.log("LOADING BALANCE PAGE: "+ParseService.getUser().get('username'));
            $scope.user = ParseService.getUser();

            if ($scope.user.get('emailVerified')==false
                //Temp for bypass Email Verification
                 && $scope.user.get('username').indexOf('test')!=0
                ){
                alert("Please verify  your email, check your mailbox.");
                $location.path('tab/login');
                $route.refresh();
            }
        } else {
            $location.path('tab/login');
            $route.refresh();
        }

        //Load User Balance
        var user = new SUser();
        document.getElementById("tran_loading").style.visibility = 'visible';
        user.getBalanceByEmail(ParseService.getUser().get('email'), function(balance){
            $scope.balance = balance;
//            console.log("controller balance - Balance = "+$scope.balance.get('balance'));
            $scope.$apply();
        })

        //Load recent transactions
        var tran = new Transaction();
        tran.getRelatedTran(ParseService.getUser().get('email'), function(transactions){
            $scope.transactions = transactions;
            $scope.$apply();
            document.getElementById("tran_loading").style.visibility = 'hidden';
        })

})

.controller('BalanceAllCtrl', function($scope, $location, ParseService) {
        if (ParseService.getUser()) {
            // do stuff with the user
            console.log("LOADING BalanceDetailCtrl PAGE: "+ParseService.getUser().get('email'));
            $scope.user = ParseService.getUser();
        } else {
            $location.path('tab/login');
            $route.refresh();
        }
        //Load User Balance
        var user = new SUser();
        user.getBalanceByEmail(ParseService.getUser().get('email'), function(balance){
            $scope.balance = balance;
            $scope.$apply();
        })

        //Load Friends Balance
        user.getFriendList(ParseService.getUser().get('email'),function(friendlist){
            console.log("BalanceDetailCtrl got Friend list = "+friendlist.get('friends').length);
            user.getBalanceByEmails(friendlist.get('friends'), function(balances){
                $scope.balances = balances;
                $scope.$apply();
                document.getElementById("tran_loading").style.visibility = 'hidden';
            })
        })

})
.controller('SendCtrl', function($scope, $location, ParseService, Common) {
        //var currentUser = Parse.User.current();
        if (ParseService.getUser()) {
            // do stuff with the user
            console.log("LOADING Send PAGE: "+ParseService.getUser().get('email'));
            $scope.user = ParseService.getUser();
        } else {
            $location.path('tab/login');
            $route.refresh();
        }
        var qrcode = new QRCode("qrcode", {
            text: "",
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        $scope.makeQRCode = function (send){
            var sendString = Common.getID()+"|"+ParseService.getUser().get('email') +"|"+ send.amount+"|"+ send.note +"";
            console.log(sendString.toString());
            sendString = Common.encrypt(sendString.toString());

            qrcode.clear(); // clear the code.

            qrcode.makeCode(sendString.toString()); // make another code.
        }

})
.controller('ReceiveCtrl', function($scope, $location, ParseService, Common) {
        console.log("Receive Ctrl start");
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

        if (ParseService.getUser()) {
            // do stuff with the user
            console.log("Receive Ctrl logged in ");
            $scope.user = ParseService.getUser();
        } else {
            $location.path('tab/login');
            $route.refresh();
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


                    ParseService.recordQRCode(id,amount,from,$scope.user.get('email'),note,location, $scope.user,function(r){
                        //console.log("Controllers Receive - recordQRCode Successfully Return message = "+r.message);
                        if (r.message== undefined){
                            console.log("Controllers Receive - recordQRCode Successfully");

                            display = "<BR>Received : $" + amount +"<br><br>" +
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

                }
            }, function (error) {

                $scope.hideloading();
                console.log("Scanning failed: ", error);
            } );
        }

        $scope.scan();

})

.controller('SignUpCtrl', function($scope,$location, ParseService) {
        // Called when the form is submitted

        $scope.signUp = function(userp) {

            if (scorePassword(userp.password) <= 60){
                alert("Please Enter Password with At least one upper case and numeric ");
                throw("Weak Password");
            }

            if (userp.password!=userp.con_password){
                alert("Invalid Password");
                throw("Invalid Password");
            }


            ParseService.signUp(userp.name, userp.email, userp.password, function(user) {
                // When service call is finished, navigate to items page
                alert("Account Signup Successful");
                $location.path('/tab/login');
                $route.refresh();
            })
        };
})
.controller('SetupCtrl', function($scope, $location, ParseService) {

        console.log("controller - SetupCtrl start");
        if (ParseService.getUser()) {
            $scope.user = ParseService.getUser();
            console.log("setup user = "+$scope.user.get('email'));
            $scope.$apply();
            if ($scope.user.get('emailVerified')==false
                //Temp for bypass Email Verification
                && $scope.user.get('username').indexOf('test')!=0
                ){
                alert("Please verify  your email, check your mailbox.");
                $location.path('tab/login');
                $route.refresh();
            }
        } else {
            $location.path('tab/login');
//            $route.refresh();
        }

        $scope.saveSetup = function(userp){
            var user = ParseService.getUser();

            if (scorePassword(userp.password) <= 60){
                alert("Please Enter Password with At least one upper case and numeric ");
                throw("Weak Password");
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
            $location.path('/tab/login');

        };


})
.controller('LoginCtrl', function($scope, $ionicPopup, $location, ParseService) {

        $scope.goTosignUp = function(){
            $location.path('/tab/signup');
//            $route.refresh();
        }

        $scope.forgotPassword = function(){
            // An elaborate, custom popup
            //$scope.forgotpassword.email = "";

            //var myPopup=$ionicPopup.prompt({
            //    title: 'Reset Password',
            //    template: 'Enter your email',
            //    inputType: 'text',
            //    inputPlaceholder: 'Email'
            //}).then(function(email) {
            //    console.log(email);
            //                        Parse.User.requestPasswordReset(email, {
            //                            success: function() {
            //                                // Password reset request was sent successfully
            //                                alert("Please check your email, and reset your password")
            //                            },
            //                            error: function(error) {
            //                                // Show the error message somewhere
            //                                alert("Error: " + error.code + " " + error.message);
            //                            }
            //                        });
            //});


            var passwordPopup = $ionicPopup.show({
                template: '<input type="email" ng-model="forgotpassword.email">',
                title: 'Enter your email',
                subTitle: 'An email will be sent to reset your password',
                scope: $scope,
                buttons: [
                    { text: 'Cancel' },
                    {
                        text: '<b>Reset</b>',
                        type: 'button-stable',
                        onTap: function(e) {
                            alert(e);
                            alert($scope.forgotpassword.email);
                            //alert($scope.userp.email);
                            if (!$scope.forgotpassword.email) {
                                Parse.User.requestPasswordReset(forgotpassword.email, {
                                    success: function() {
                                        // Password reset request was sent successfully
                                        alert("Please check your email, and reset your password")
                                    },
                                    error: function(error) {
                                        // Show the error message somewhere
                                        alert("Error: " + error.code + " " + error.message);
                                    }
                                });
                            } else {
                                return $scope.forgotpassword.email;
                            }
                        }
                    },
                ]
            });


        }

        $scope.login = function (user){

            ParseService.login(user.username, user.password, function(user){
            console.log("controller - success login");
                $scope.user = user;
                $scope.$apply();
                $location.path('/tab/balance');
                $route.refresh();
                console.log("controller - redirected success login");
            });
        }


});