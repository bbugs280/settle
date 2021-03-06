angular.module('starter.services', [])

.factory('Common', function(){

        var secret_passphrase;

        Parse.Config.get().then(function(config) {
            console.log("Yay! Config was fetched from the server.");

            secret_passphrase = config.get("secret_passphrase");

        }, function(error) {
            console.log("Failed to fetch. Using Cached Config.");
            var config = Parse.Config.current();
            secret_passphrase = config.get("secret_passphrase");

        });

        var IMAGE_LIMIT = 3351782; //Around 1MB in size, this is Base64 Length
        return {
            getID: function () {
                return '_' + Math.random().toString(36).substr(2, 9);
            },
            encrypt : function(message){
                return CryptoJS.Rabbit.encrypt(message, secret_passphrase);
            },
            decrypt : function(encrypted){
                return CryptoJS.Rabbit.decrypt(encrypted, secret_passphrase).toString(CryptoJS.enc.Utf8);
            },
            checkImageSize: function(base64length){

                if (base64length > IMAGE_LIMIT){
                    return false;
                }else{
                    return true;
                }
            }

        }
})

.factory('ParseService', function(){
        // Initialize Parse API and objects.

//        Parse.initialize("eMt8xkAjx5hcAWMmL8HlNIUq3J0VQH2gf8b0TC8G", "utWyZ9iKkrZtoi3N30etMGrChUrRG8wTNesAzOvZ");

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

                              callback(error);
//                            alert("Error: " + error.message);
                          }
                      });
            },

            // Register a user
            signUp : function signUp(user, callback) {
//                var user = new SUser();
//                user.set("username", username);
//                user.set("password", password);
//                user.set("email", email);
                user.signUp(null, {
                    success: function (user) {
                        callback(user);
                    },
                    error: function (user, error) {
                        // Show the error message somewhere and let the user try again.
                        alert("Error: " + error.code + " " + error.message);
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

                 return Parse.User.current();
            },
//TODO remove user & friend params later
            recordQRCode : function recordQRCode(group, tranId, currencyId, amount, fromuser, touser, note, location, user, friend, callback){
                var tran = new Transaction();
                console.log("friend = "+friend.getUsername());
                console.log("user = "+user.getUsername());

                tran.set('group',group);
                tran.set('groupId',group.id);
                tran.set('tranId',tranId);
                tran.set('currency',{__type: "Pointer", className: "currencies", objectId: currencyId});
                tran.get('currency').fetch();
                tran.set('amount',Number(amount));
                tran.set('from',fromuser.get('email'));
                tran.set('to',touser.get('email'));
                tran.set('note',note);
                tran.set('location',location);
                tran.set('fromname',fromuser.get('username'));
                tran.set('toname',touser.get('username'));
                tran.set('fromuser',{__type: "Pointer", className: "User", objectId: fromuser.id});
                tran.set('touser',{__type: "Pointer", className: "User", objectId: touser.id});

                var currencyCode = tran.get('currency').code;
                tran.isTranIdExist(tranId, function(hasTranId){
                    if (hasTranId){
                        error_snd.play();
//                        throw ("Invalid QRCode!");
                        console.log("recordQRCode - InValid QRCode with TranID = " + tranId);
                        var error = new Error();
                        error.message = "Invalid QRCode";
                        callback(error);
                    }else{

                        //Save Transaction
                        tran.save(null,
                            {
                                success: function(tran){
                                    //Found out who is your friend
                                    console.log("recordQRCode - Saved Tran successfully with TranID = " + tran.get('tranId'));
                                    console.log("recordQRCode - after tran save ");

                                    //Google Anaytics
                                    if (typeof analytics !== 'undefined') {
                                        analytics.addTransactionItem(tran.get('tranId'), fromuser.id + "-" + touser.id, '', '', amount, 1, currencyCode);
                                    }
                                    //Update your Records e.g. Balance and Friend list

                                    var trancredit = tran.getYourCredit(user.id);
                                    var trandebit = tran.getYourDebit(user.id);
                                    // First update your own records
                                    //1. get Your Balance
                                    user.getBalanceByGroupAndUser(group,user,function(yourbal){

                                        //2. update Your Balance
//                                        yourbal.set('group', group);
//                                        yourbal.set('user', user);
                                        //Getting FX Rate
                                        var fromCurrency = tran.get('currency').get('code');
                                        var toCurrency = yourbal.get('currency').get('code');
                                        var toRate = 1;
                                        if (fromCurrency != toCurrency){
                                            toRate = Number(getFXRate(fromCurrency,toCurrency));
                                        }

                                        if (user.id == tran.get('fromuser').id){
                                            tran.set('from_rate', toRate);
                                        }else{
                                            tran.set('to_rate', toRate);
                                        }
                                        var yourcredit = (trancredit*toRate) + yourbal.get('credit');
                                        var yourdebit = (trandebit*toRate) + yourbal.get('debit');

                                        yourbal.set('credit', yourcredit);
                                        yourbal.set('debit', yourdebit);
        //                                yourbal.set('balance', yourcredit - yourdebit);
                                        user.updateBalance(yourbal,function(r){
                                            console.log("recordQRCode - your balance saved");

                                        });
                                        // 3. Update Group List with both friend and your email
                                        var userIdArray = [user.id,friend.id];
                                        var friendArray = [user.get('email'),friend.get('email')];
                                        var nameArray = [user.get('username'),friend.get('username')];
                                        //set frienduser and user
                                        group.set('user1',user);
                                        group.set('user2',{__type: "Pointer", className: "User", objectId: friend.id});

                                        user.addFriends(group, userIdArray, nameArray,friendArray, function(friends){
                                        //console.log("recordQRCode - your friendlist saved with friends no = "+friends.get('friends').length);
                                            console.log("recordQRCode - Your Balance and Friends are UP2Date!!!");
                                            //Update Tran with new rate
                                            tran.save(null, {
                                                success:function(r){
                                                    console.log("Tran is updated with Latest Rates");
                                                },error:function(obj,error){
                                                    console.log("Tran is updated with Latest Rates with Error", error.message);
                                                }
                                            });
                                        });

                                        //Now update your friend Records
                                        //1. get Friend Balance
                                        console.log("before Friend getBalanceByGroupAndUser friend"+friend.get('default_currency'));
                                        user.getBalanceByGroupAndUser(group,friend,function(friendbal){
                                            console.log("friend balance found and being updated");
                                            //console.log("Friend Group Found with Curr = "+friend.get('default_currency').get('code'));

                                            //Getting FX Rate
                                            var fromCurrency = tran.get('currency').get('code');
                                            var toCurrency = friendbal.get('currency').get('code');
                                            var toRate = 1;
                                            if (fromCurrency != toCurrency){
                                                toRate = Number(getFXRate(fromCurrency,toCurrency));
                                            }
                                            console.log("from currency ", fromCurrency);
                                            console.log("to currency ", toCurrency);
                                            console.log("to rate ", toRate);

                                            if (friend.id == tran.get('fromuser').id){
                                                tran.set('from_rate', toRate);
                                            }else{
                                                tran.set('to_rate', toRate);
                                            }
                                            //2. update Friend Balance
                                            //friendbal.set('group', group);
                                            //friendbal.set('user', {__type: "Pointer", className: "User", objectId: friend.id});

                                            var friendcredit = (trandebit*toRate) + friendbal.get('credit');
                                            var frienddebit = (trancredit*toRate) + friendbal.get('debit');
                                            friendbal.set('credit', friendcredit);
                                            friendbal.set('debit', frienddebit);
                                            //friendbal.set('balance', friendcredit - frienddebit);
                                            user.updateBalance(friendbal,function(r){
                                                console.log("recordQRCode - friend balance saved");
                                                //Play Sound
                                                if (window.navigator){
                                                    navigator.vibrate(1000);
                                                }
                                                success_snd.play();
                                                callback(tran);
                                                //Update Tran with new rate
                                                tran.save(null, {
                                                    success:function(r){
                                                        console.log("Tran is updated with Latest Rates");
                                                    },error:function(obj,error){
                                                        console.log("Tran is updated with Latest Rates with Error", error.message);
                                                    }
                                                });
                                            });
                                        });

                                    });


                            },error:function(object, error){
                                alert('Failed to create new object, with error code: ' + error.code + error.message + " tranId: "+ object.get('trandId'));
                                error_snd.play();
                                callback(error);
                            }

                    });
                    }
                 });
            },

            getLocation : function getLocation (callback){
                Parse.GeoPoint.current({
                    success: function (point) {
                        //use current location
                        console.log("location succes: "+ point);
                        callback(point);

                    },error: function (error){
                        console.log("location error : "+error.message);
                    }
                });
            }


        };

        // The factory function returns ParseService, which is injected into controllers.
        return ParseService;
    });

