angular.module('starter.services', [])

.factory('Common', function(){

        var secret_passphrase = "pei kim donut";

        return {
            getID: function () {
                return '_' + Math.random().toString(36).substr(2, 9);
            },

            encrypt : function(message){
                return CryptoJS.AES.encrypt(message, secret_passphrase);
            },
            decrypt : function(encrypted){
                return CryptoJS.AES.decrypt(encrypted, secret_passphrase).toString(CryptoJS.enc.Utf8);
            }

        }
})

.factory('ParseService', function(){
        // Initialize Parse API and objects.

        Parse.initialize("eMt8xkAjx5hcAWMmL8HlNIUq3J0VQH2gf8b0TC8G", "utWyZ9iKkrZtoi3N30etMGrChUrRG8wTNesAzOvZ");

        // Cache current logged in user
        var loggedInUser;
        /**
         * ParseService Object
         * This is what is used by the controllers to save and retrieve data from Parse.com.
         * Moving all the Parse.com specific stuff into a service allows me to later swap it out
         * with another back-end service provider without modifying my controller much, if at all.
         */
        var ParseService = {
            name: "Parse",

            // Login a user

            login : function login(username, password, callback) {
                  var user = new User();
                  user.login(username, password, callback(user));

            },
            // Login a user using Facebook
//            FB_login : function FB_login(callback) {
//                Parse.FacebookUtils.logIn(null, {
//                    success: function(user) {
//                        if (!user.existed()) {
//                            alert("User signed up and logged in through Facebook!");
//                        } else {
//                            alert("User logged in through Facebook!");
//                        }
//                        loggedInUser = user;
//                        callback(user);
//                    },
//                    error: function(user, error) {
//                        alert("User cancelled the Facebook login or did not fully authorize.");
//                    }
//                });
//            },

            // Register a user
            signUp : function signUp(email, password, callback) {
                var user = new User();
                user.signUp(email,password,callback(user));
            },

            // Logout current user
            logout : function logout() {
                var user = new User();
                user.logout();
            },

            // Get current logged in user
            getUser : function getUser() {
                 var user = new User();
                 return user.getCurrentUser();
            },


            saveTransaction : function saveTransaction (id, amount, from, to, note, location){
                var transaction = Parse.Object.extend("transaction");
                var tran = new transaction();
                var Friend = Parse.Object.extend("User");
                var friend = new Friend();

                var friendemail="";

                tran.set("tranId", id);
                tran.set("amount", Number(amount));
                tran.set("from", from);
                tran.set("to", to);
                tran.set("note", note);
                tran.set("location", location);

                console.log("set all properties" + JSON.stringify(tran));
                if (tran.get('from')==this.getUser().get('email')){
                    friendemail = tran.get('to');
                }else{
                    friendemail = tran.get('from');
                }

                //Check if TranID already exist
                var query = new Parse.Query(transaction);
                query.equalTo("tranId", id);

                var friendQuery = new Parse.Query(Friend);
                friendQuery.equalTo("email",friendemail);

                friendQuery.find().then(function(result) {

                    friend = result;
                    console.log("Found friend! " + JSON.stringify(friend));
                    return friend;
                }).then(function(){
                    return query.find();
                }).then(function(results){
                    //Check if TranID already exist
                    if (results.length==0) {
                        //If not record found, save to server
                        return tran.save();
                    }else{
                        alert("Invalid QRCode");

                    }

                }).then(function(tran){
                    //If tran save successfully, update MY balance
                    console.log("Update My Balance");
                    var balances = Parse.User.current().get('balances');
                    var balance = new Parse.Object();
                    var credit = 0 ;
                    var debit = 0;
                    var balanceamount = 0;
                    console.log("After get Balances");

                    if (balances){
                        credit = balances[0].get('credit');
                        debit = balances[0].get('debit');
                        balanceamount = balances[0].get('amount');
                        console.log("has existing balance before save: "+balances[0]);

                    }
                    console.log("check tran! "+JSON.stringify(tran));
                    if (tran.get('from')==ParseService.getUser().get('email')){
                        debit = debit + amount;
                    }else{
                        credit = credit + amount;
                    }
                    balanceamount = credit - debit;
                    balance.set('amount', balanceamount);
                    balance.set('credit', credit);
                    balance.set('debit', debit);
                    //balances.addUnique(balance);
                    Parse.User.current().set('balance',balanceamount);
//                    Parse.User.current().addUnique('balances', balance);
                    console.log("balance before save: "+JSON.stringify(balance));
                    console.log("balance before save: "+balances);
                    Parse.User.current().save();
                    //If tran save successfully, update Friend balance
                    console.log("Update Friend Balance");
                    console.log("check friend! "+JSON.stringify(friend));
                    var friendbalances = friend.get('balances');
//                    var friendbalances = friend.getFriendBalances();
                    if (friendbalances){
                        var credit = balances[0].get('credit');
                        var debit = balances[0].get('debit');
                         balanceamount = balances[0].get('amount');

                        if (tran.get('from')==this.getUser().get('email')){
                            credit = credit + amount;
                        }else{
                            debit = debit + amount;
                        }
                        balanceamount = credit - debit;
                        friendbalances[0].set('amount', balanceamount);
                    }
                    friend.set('balances', balances);
                    return tran;
                }).then(function(tran){
                    //If update balance is ok, check if MY friend list is up2date.
                    //If update balance is ok, check if friend's friend list is up2date.
                    if (tran.get('from')==this.getUser().get('email')) {
                        ParseService.User.current().addUnique('friends', tran.get('to'));
                        friend.addUnique('friends', tran.get('from'));
                    }else{
                        ParseService.User.current().addUnique('friends', tran.get('from'));
                        friend.addUnique('friends', tran.get('to'));
                    }
                    console.log("User : "+JSON.stringify(ParseService.User.current()));
                    console.log("Friend : "+JSON.stringify(friend));
                    ParseService.User.current().save();
                    friend.save();
                }), function (error){
                    // Execute any logic that should take place if the save fails.
                    // error is a Parse.Error with an error code and message.
                    alert('Failed to Receive Amount, with error code: ' + error.message);
                };

            },

            getLocation : function getLocation (){
                Parse.GeoPoint.current({
                    success: function (point) {
                        //use current location
                        console.log("location"+point);
                        return point;

                    }
                });
            }
            ,

            getTranByFrom : function getTranByFrom(from,callback){
                var transaction = Parse.Object.extend("transaction");

                var query = new Parse.Query(transaction);
                query.equalTo("from", from);
                query.find({
                        success: function (results) {
                            console.log("# of rec in From: "+results.length);
                            callback(results);
                        },
                    error: function (error) {
                        alert("Error: " + error.code + " " + error.message);
                    }
                })
            }
            ,
            getTranByTo: function getTranByTo(to, callback){
                var transaction = Parse.Object.extend("transaction");

                var query = new Parse.Query(transaction);
                query.equalTo("to", to);
                query.find({
                    success: function (results) {
                        console.log("# of rec in To: "+results.length);
                        callback(results);
                    },
                    error: function (error) {
                        alert("Error: " + error.code + " " + error.message);
                    }
                })
            }
            ,
            calcBalance : function calcBalance (email,callback){
                var balance = {email:'',credit:0,debit:0,amount:0}; //properties are email, credit, debit, balance
                balance.email=email;

                ParseService.getTranByFrom(email, function(fromTrans){
                    for (var i = 0; i < fromTrans.length; i++) {

                        balance.credit=balance.credit+ fromTrans[i].get('amount');

                    }

                        ParseService.getTranByTo(email, function(toTrans){
                            for (var i = 0; i < toTrans.length; i++) {

                                balance.debit=balance.debit+toTrans[i].get('amount');
                            }

                            balance.amount = balance.credit - balance.debit;

                            callback(balance);

                        })
                })
            }
            ,
            getFriends: function getFriends(myemail,callback){
                var emailList=[];
                ParseService.getTranByFrom(myemail, function(fromTrans){
                    for (var i = 0; i < fromTrans.length; i++) {

                        emailList.push(fromTrans[i].get('to'));

                    }

                    ParseService.getTranByTo(myemail, function(toTrans){
                        for (var i = 0; i < toTrans.length; i++) {

                            emailList.push(fromTrans[i].get('from'));
                        }

                        console.log("email list : "+emailList);

                        callback(emailList);

                    })
                })
            }
            ,
            getFriendBalances : function getFriendBalances(friendEmails){

                for (var i = 0; i < friendEmails.length; i++) {
                    this.calcBalance(friendEmails[i], function(balance){
                        balances.push(balance);
                        console.log("Balances: "+ JSON.stringify(balances));

                    });
                }
                //callback(balances);
                return balances;
            }

        };

        // The factory function returns ParseService, which is injected into controllers.
        return ParseService;
    });

