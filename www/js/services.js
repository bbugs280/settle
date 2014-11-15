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
//                 var user = new SUser();
                 return Parse.User.current();
            },

            recordQRCode : function recordQRCode(group, tranId, currencyId, amount, from, to, note, location, user, friend, callback){
                var tran = new Transaction();
                tran.set('group',group);
                tran.set('groupId',group.id);
                tran.set('tranId',tranId);
                tran.set('currency',{__type: "Pointer", className: "currencies", objectId: currencyId});
                tran.set('amount',Number(amount));
                tran.set('from',from);
                tran.set('to',to);
                tran.set('note',note);
                tran.set('location',location);

                if (from==user.get('email')){
                    tran.set('fromname',user.get('username'));
                    tran.set('toname',friend.get('username'));
                    tran.set('fromuser',{__type: "Pointer", className: "User", objectId: user.id});
                    tran.set('touser',{__type: "Pointer", className: "User", objectId: friend.id});
                }else{
                    tran.set('fromname',friend.get('username'));
                    tran.set('toname',user.get('username'));
                    tran.set('fromuser',{__type: "Pointer", className: "User", objectId: friend.id});
                    tran.set('touser',{__type: "Pointer", className: "User", objectId: user.id});
                }

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
                        console.log("recordQRCode - Valid QRCode with TranID = " + tran.get('tranId'));
                        console.log("recordQRCode - before tran save : " + tran.get('tranId') +" | "+ tran.get('amount') +" | "+ tran.get('from') +" | "+ tran.get('to') +" | "+ tran.get('note') +" | "+ user.get('email'));
                        tran.save(null,
                            {
                                success: function(tran){
                                    //Found out who is your friend
                                    console.log("recordQRCode - Saved Tran successfully with TranID = " + tran.get('tranId'));
                                    console.log("recordQRCode - after tran save ");

                                    var friendEmail = tran.getFriendEmail(user.getEmail());
                                    var friendName = tran.getFriendName(user.get('username'));
//                                    console.log("recordQRCode - get friend email "+ friendEmail);
                                    //Update your Records e.g. Balance and Friend list

                                    var trancredit = tran.getYourCredit(user.get('email'));
                                    var trandebit = tran.getYourDebit(user.get('email'));
                                    // First update your own records
                                    //1. get Your Balance
                                    user.getBalanceByEmail(group,user,function(yourbal){
                                        var yourcredit = trancredit + yourbal.get('credit');
                                        var yourdebit = trandebit + yourbal.get('debit');
                                        //2. update Your Balance
                                        yourbal.set('group', group);
                                        yourbal.set('user', user);
                                        yourbal.set('credit', yourcredit);
                                        yourbal.set('debit', yourdebit);
        //                                yourbal.set('balance', yourcredit - yourdebit);
                                        user.updateBalance(yourbal,function(r){
                                            console.log("recordQRCode - your balance saved");

                                        })
                                        // 3. Update Group List with both friend and your email
                                        var friendArray = [user.get('email'),friendEmail];
                                        var nameArray = [user.get('username'),friendName];
                                        //set frienduser and user
                                        group.set('user1',user);
                                        group.set('user2',{__type: "Pointer", className: "User", objectId: friend.id});

                                        user.addFriends(group, nameArray,friendArray, function(friends){
//                                                console.log("recordQRCode - your friendlist saved with friends no = "+friends.get('friends').length);
                                            console.log("recordQRCode - Your Balance and Friends are UP2Date!!!");

                                        });
//
//                                        user.getFriendList(groupId, function(friendlist){
//                                            console.log("recordQRCode - your friendlist found");
//                                            var friendArray = [user.get('email'),friendEmail];
//                                            var nameArray = [user.get('username'),friendName];
//                                            //set frienduser and user
//                                            friendlist.set('user1',user);
//                                            friendlist.set('user2',{__type: "Pointer", className: "User", objectId: friend.id});
//
//                                            user.addFriends(friendlist, nameArray,friendArray, function(friends){
////                                                console.log("recordQRCode - your friendlist saved with friends no = "+friends.get('friends').length);
//                                                console.log("recordQRCode - Your Balance and Friends are UP2Date!!!");
//
//                                            });
//                                        });

                                        //Now update your friend Records
                                        //1. get Friend Balance
                                        user.getBalanceByEmail(group,friend,function(friendbal){
                                            var friendcredit = trandebit + friendbal.get('credit');
                                            var frienddebit = trancredit + friendbal.get('debit');
                                            //2. update Friend Balance
                                            friendbal.set('group', group);
                                            friendbal.set('user', {__type: "Pointer", className: "User", objectId: friend.id});
                                            friendbal.set('credit', friendcredit);
                                            friendbal.set('debit', frienddebit);
                                            //friendbal.set('balance', friendcredit - frienddebit);
                                            user.updateBalance(friendbal,function(r){
                                                console.log("recordQRCode - friend balance saved");
                                                //Play Sound
                                                success_snd.play();
                                                callback(tran);
                                            })
                                        });

                                        // 3. Add friend
//                                        user.getFriendList(group, friendEmail, function(friendfriendlist){
//                                            console.log("recordQRCode - friend friendlist found");
//                                            user.addFriend(friendfriendlist, user.get('email'), function(friends){
//
//                                                console.log("recordQRCode - Friend's Balance and Friends are UP2Date!!!");
//
//                                                callback(tran);
//
//                                            });
//                                        });
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

