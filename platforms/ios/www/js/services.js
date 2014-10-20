angular.module('starter.services', [])

.factory('Common', function(){

        var secret_passphrase = "pei-kim-donut";

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
//                  var user = new SUser();
                  Parse.User.logIn(username, password,
                      {
                          success : function(user){
                              callback(user);
                          },
                            error : function (user, error){
                            alert("Error: " + error.message);
                          }
                      });
            },

            // Register a user
            signUp : function signUp(email, password, callback) {
                var user = new SUser();
                user.set("username", email);
                user.set("password", password);
                user.set("email", email);
                user.signUp(null, {
                    success: function (user) {
                        callback(user);
                    },
                    error: function (user, error) {
                        // Show the error message somewhere and let the user try again.
                        throw("Error: " + error.code + " " + error.message);
                    }
                });
            },

            // Logout current user
            logout : function logout() {
//                var user = new SUser();
//                user.logOut();
                Parse.User.logOut();
            },

            // Get current logged in user
            getUser : function getUser() {
//                 var user = new SUser();
                 return Parse.User.current();
            },

            recordQRCode : function recordQRCode(tranId, amount, from, to, note, location, user, callback){
                var tran = new Transaction();

                tran.set('tranId',tranId);
                tran.set('amount',amount);
                tran.set('from',from);
                tran.set('to',to);
                tran.set('note',note);
                tran.set('location',location);

                console.log("recordQRCode - before tran save ");

                tran.isTranIdExist(tranId, function(hasTranId){
                    if (hasTranId){
                        alert("Invalid QRCode!");
                    }else{
                        //Save Transaction
                        console.log("recordQRCode - Valid QRCode");
                        tran.save(null,
                            {
                                success: function(tran){
                                    //Found out who is your friend
                                    console.log("recordQRCode - after tran save - User Email = "+user.get('email'));

                                    var friendEmail = tran.getFriendEmail(user.getEmail());
                                    console.log("recordQRCode - get friend email "+ friendEmail);
                                    //Update your Records e.g. Balance and Friend list

                                    var trancredit = tran.getYourCredit(user.get('email'));
                                    var trandebit = tran.getYourDebit(user.get('email'));
                                    // First update your own records
                                    //1. get Your Balance
                                    user.getBalanceByEmail(user.get('email'),function(yourbal){
                                        var yourcredit = trancredit + yourbal.get('credit');
                                        var yourdebit = trandebit + yourbal.get('debit');
                                        //2. update Your Balance
                                        yourbal.set('credit', yourcredit);
                                        yourbal.set('debit', yourdebit);
        //                                yourbal.set('balance', yourcredit - yourdebit);
                                        user.updateBalance(yourbal,function(r){
                                            console.log("recordQRCode - your balance saved");
                                            // 3. Add friend
                                            user.getFriendList(user.get('email'), function(friendlist){
                                                console.log("recordQRCode - your friendlist found");
                                                user.addFriend(friendlist, friendEmail, function(friends){
                                                    console.log("recordQRCode - your friendlist saved with friends no = "+friends.get('friends').length);
                                                    console.log("recordQRCode - Your Balance and Friends are UP2Date!!!");
                                                    //Now update your friend Records
                                                    //1. get Friend Balance
                                                    user.getBalanceByEmail(friendEmail,function(friendbal){
                                                        var friendcredit = trandebit + friendbal.get('credit');
                                                        var frienddebit = trancredit + friendbal.get('debit');
                                                        //2. update Friend Balance
                                                        friendbal.set('credit', friendcredit);
                                                        friendbal.set('debit', frienddebit);
                                                        //                                friendbal.set('balance', friendcredit - frienddebit);
                                                        user.updateBalance(friendbal,function(r){
                                                            console.log("recordQRCode - friend balance saved");
                                                            console.log("recordQRCode - friend before get friendlist email = "+friendEmail);
                                                            // 3. Add friend
                                                            user.getFriendList(friendEmail, function(friendfriendlist){
                                                                console.log("recordQRCode - friend friendlist found");
                                                                user.addFriend(friendfriendlist, user.get('email'), function(friends){
                                                                    console.log("recordQRCode - friend's friendlist saved with friends no = "+friends.get('friends').length);
                                                                    console.log("recordQRCode - Friend's Balance and Friends are UP2Date!!!");
                                                                    callback(tran);
                                                                });
                                                            });

                                                        })
                                                    });

                                                });
                                            });

                                        })
                                    })


                            },error:function(error){
                                alert('Failed to create new object, with error code: ' + error.message);
                                callback(null);
                            }

                    });
                    }
                 });
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


        };

        // The factory function returns ParseService, which is injected into controllers.
        return ParseService;
    });

