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

            if ($scope.user.get('emailVerified')==false){
                alert("Please verify  your email, check your mailbox.");
                $location.path('tab/login');
            }
        } else {
            $location.path('tab/login');
        }

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
        })

})

.controller('SendCtrl', function($scope, $location, ParseService, Common) {
        //var currentUser = Parse.User.current();
        if (ParseService.getUser()) {
            // do stuff with the user
            console.log("LOADING Send PAGE: "+ParseService.getUser().getUsername());
            $scope.user = ParseService.getUser();
        } else {
            $location.path('tab/login');
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
            var sendString = Common.getID()+"|"+ParseService.getUser().getEmail() +"|"+ send.amount;
            console.log(sendString.toString());
            sendString = Common.encrypt(sendString.toString());

            qrcode.clear(); // clear the code.

            qrcode.makeCode(sendString.toString()); // make another code.
        }

})
.controller('ReceiveCtrl', function($scope, $location, ParseService, Common) {
        //var currentUser = Parse.User.current();
        if (ParseService.getUser()) {
            // do stuff with the user

            $scope.user = ParseService.getUser();
        } else {
            $location.path('tab/login');
        }

        var scanner = cordova.require("cordova/plugin/BarcodeScanner");

        scanner.scan( function (result) {

            console.log("Scanner result: \n" +
                "text: " + result.text + "\n" +
                "format: " + result.format + "\n" +
                "cancelled: " + result.cancelled + "\n");

            //Decrypt Result String
            var resultString = Common.decrypt(result.text);
            var res = resultString.split("|");
            var display = "";

            if (res.length==1){
                display = "This is NOT a 'Settle' QRCode!!"
            }else{
                var id = res[0];
                var from = res[1];
                var amount = res[2];
                var note="";
                //var location=ParseService.getLocation();
                var location;

                ParseService.recordQRCode(id,amount,from,$scope.user.getEmail(),note,location, function(r){
                    console.log("Controllers Receive - recordQRCode Successfully");
                    display = "<BR>Received :<b> $" + amount +"</b><br><br>" +
                        "From : <b>" + from +"</b>";
                });

            }

            document.getElementById("info").innerHTML = display;
            //console.log(result);
            /*
             if (args.format == "QR_CODE") {
             window.plugins.childBrowser.showWebPage(args.text, { showLocationBar: false });
             }
             */
        }, function (error) {
            console.log("Scanning failed: ", error);
        } );


})

.controller('SignUpCtrl', function($scope,$location, ParseService) {
        // Called when the form is submitted

        $scope.signUp = function(user) {

            if (user.password != user.con_password){ alert("invalid password");  return "Invalid Password"}

            ParseService.signUp(user.email, user.password, function(user) {
                // When service call is finished, navigate to items page
                alert("Account Signup Successful");
                $location.path('/tab/login');
            })
        };
})
.controller('SetupCtrl', function($scope, $location, ParseService) {

        console.log("controller - SetupCtrl start");
        if (ParseService.getUser()) {
            // do stuff with the user

            $scope.user = ParseService.getUser();

            if ($scope.user.get('emailVerified')==false){
                alert("Please verify  your email, check your mailbox.");
                $location.path('tab/login');
            }
        } else {
            $location.path('tab/login');
        }

        $scope.logout = function(){
            ParseService.logout();
            $location.path('/tab/login');
        };


})
.controller('LoginCtrl', function($scope, $location, ParseService) {

        $scope.goTosignUp = function(){
            $location.path('/tab/signup');
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

                $location.path('/tab/balance');
                console.log("controller - redirected success login");
            });
        }


});