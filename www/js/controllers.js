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

        //setting spinner
        var opts = {
            lines: 13, // The number of lines to draw
            length: 15, // The length of each line
            width: 6, // The line thickness
            radius: 10, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#000', // #rgb or #rrggbb or array of colors
            speed: 1, // Rounds per second
            trail: 60, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            top: '50%', // Top position relative to parent
            left: '50%' // Left position relative to parent
        };
        var target = document.getElementById('spinner');
        var spinner = new Spinner(opts).spin(target);

        //Load User Balance
        var user = new SUser();

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
            spinner.stop();
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
            var sendString = Common.getID()+"|"+ParseService.getUser().get('email') +"|"+ send.amount;
            console.log(sendString.toString());
            sendString = Common.encrypt(sendString.toString());

            qrcode.clear(); // clear the code.

            qrcode.makeCode(sendString.toString()); // make another code.
        }

})
.controller('ReceiveCtrl', function($scope, $location, ParseService, Common) {
        if (ParseService.getUser()) {
            // do stuff with the user
            $scope.user = ParseService.getUser();
        } else {
            $location.path('tab/login');
            $route.refresh();
        }
        //setting spinner
        var opts = {
            lines: 13, // The number of lines to draw
            length: 15, // The length of each line
            width: 6, // The line thickness
            radius: 10, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#000', // #rgb or #rrggbb or array of colors
            speed: 1, // Rounds per second
            trail: 60, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            top: '30%', // Top position relative to parent
            left: '50%' // Left position relative to parent
        };
        var target = document.getElementById('info');
        var spinner = new Spinner(opts).spin(target);

        var location;
        ParseService.getLocation(function(r){
            location=r;
        });


        $scope.scan = function(){
            document.getElementById("info").innerHTML="";
            spinner.spin(target);
            var scanner = cordova.require("cordova/plugin/BarcodeScanner");
            scanner.scan( function (result) {

                console.log("Scanner result: \n" +
                    "text: " + result.text + "\n" +
                    "format: " + result.format + "\n" +
                    "cancelled: " + result.cancelled + "\n");

                if (result.cancelled == 1){
                    spinner.stop();
                    throw "Scanning Canceled";
                }

                //Decrypt Result String
                var resultString = Common.decrypt(result.text);
                var res = resultString.split("|");
                var display = "";

                if (res.length==1){
                    display = "This is NOT a 'Settle' QRCode! <BR><BR> Or, <BR><BR>you haven't scan a QRCode at all."
                    document.getElementById("info").innerHTML = display;
                    spinner.stop();
                }else{
                    var id = res[0];
                    var from = res[1];
                    var amount = res[2];
                    var note="";


                    ParseService.recordQRCode(id,amount,from,$scope.user.get('email'),note,location, $scope.user,function(r){
                        console.log("Controllers Receive - recordQRCode Successfully Return message = "+r.message);
                        if (r.message== undefined){
                            console.log("Controllers Receive - recordQRCode Successfully");
                            display = "<BR>Received :<b> $" + amount +"</b><br><br>" +
                                "From : <b>" + from +"</b>";
                            document.getElementById("info").innerHTML = display;
                        }else{
                            console.log("Controllers Receive - recordQRCode Failed");
                            display = "<BR><b> " + r.message +"</b>";
                            document.getElementById("info").innerHTML = display;
                        }

                        spinner.stop();

                    });

                }
            }, function (error) {
                spinner.stop();
                console.log("Scanning failed: ", error);
            } );
        }

        $scope.scan();

        $scope.rescan = function(){
            console.log("Receive page reloading");
//            $location.path('/tab/receive');
//            $route.reload();
            $scope.scan();
            console.log("Receive page reloaded");
        }
})

.controller('SignUpCtrl', function($scope,$location, ParseService) {
        // Called when the form is submitted

        $scope.signUp = function(userp) {
            alert(userp.password);
            alert(userp.email);
            alert(userp.password_strength);
            if (userp.password_strength == 'weak' || userp.password_strength == undefined){
                alert("Please Enter Password with At least one upper case and numeric ");
                throw("Weak Password");
            }

            if (userp.password!=userp.con_password){
                alert("Invalid Password");
                throw("Invalid Password");
            }


            ParseService.signUp(userp.email, userp.password, function(user) {
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
            alert(userp.email);
            alert(userp.password);

            alert(userp.password_strength);
            if (userp.password_strength == 'weak' || userp.password_strength == undefined){
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
.controller('LoginCtrl', function($scope, $location, ParseService) {

        $scope.goTosignUp = function(){
            $location.path('/tab/signup');
//            $route.refresh();
        }

        $scope.forgotPassword = function(user){

            Parse.User.requestPasswordReset(user.email, {
                success: function() {
                    // Password reset request was sent successfully
                    alert("Please check your email, and reset your password")
                },
                error: function(error) {
                    // Show the error message somewhere
                    alert("Error: " + error.code + " " + error.message);
                }
            });
        }
        $scope.login = function (user){

            ParseService.login(user.email, user.password, function(user){
            console.log("controller - success login");
                $scope.user = user;
                $scope.$apply();
                $location.path('/tab/balance');
                $route.refresh();
                console.log("controller - redirected success login");
            });
        }


});