
var User = (function () {
    // private static

    // constructor
    var cls = function () {
        Parse.initialize("eMt8xkAjx5hcAWMmL8HlNIUq3J0VQH2gf8b0TC8G", "utWyZ9iKkrZtoi3N30etMGrChUrRG8wTNesAzOvZ");
        // private
        var objectId='';
        var username='';
        var email='';
        var credit;
        var debit;
        var balanceId='';
        var balance;
        var friendlistId='';
        var friends=[];
        var createdAt;
        var updatedAt;
        // public (this instance only)

        this.getObjectId = function(){return objectId;};
        this.getUsername = function(){return username;};
        this.getEmail = function(){return email;};
        this.getCredit = function(){return credit;};
        this.getDebit = function(){return debit;};
        this.getBalanceId = function(){return balanceId;};
        this.getBalance  = function(){return (credit-debit);};
        this.getFriendlistId  = function(){return friendlistId;};
        this.getFriends = function(){return friends;};
        this.getCreatedAt  = function(){return createdAt;};
        this.getUpdatedAt = function(){return updatedAt;};

        this.setBalanceId = function (value){
            if (typeof value != 'string')
                throw 'balanceId must be a string';
            balanceId = value;
        }
        this.setDebit = function (value){
            if (typeof value != 'number')
                throw 'debit must be a number';
            debit = value;
        }
        this.setCredit = function (value){
            console.log("setCredit value = "+value);
            if (typeof value != 'number')
                throw 'credit must be a number';
            credit = value;
        }
        this.setEmail =  function(value){
            if (typeof value != 'string')
                throw 'email must be a string';
            if (value.length < 6 || value.length > 30)
                throw 'email must be 6-30 characters long.';
            email = value;
        };

    };

    // public static
//    cls.get_nextId = function () {
//        return nextId;
//    };

    // public (shared across instances)
    cls.prototype = {
        login: function (loginemail, password, callback) {
            console.log("start login");
            Parse.User.logIn(loginemail, password, {
                success: function (result) {
                    console.log("service - sucess login : user JSON " + JSON.stringify(result));
                    username = result.getUsername();
                    email = result.getEmail();
                    console.log("login - successful checking callback is passed " + typeof callback);
                    if (typeof callback === 'function') {
                        //TODO load friends and balance?
                        console.log("login - successful using callback with result "+ result.getUsername());
                        callback(result);
                    }

                }, error: function (result, error) {
                    throw("Error: " + error.message);
                    //callback(error);
                }
            });
        },
        logout: function () {
            Parse.User.logOut();
        },
        signUp: function (username, signupemail, password, callback) {
            var user = new Parse.User();
            user.set("username", username);
            user.set("password", password);
            user.set("email", signupemail);
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
        getUserByEmail: function (emailp, callback) {
            var User = Parse.Object.extend("User");
            var query = new Parse.Query(User);
            query.equalTo("email", emailp);
            query.find({
                success: function (result) {
                    // The object was retrieved successfully.
                    console.log(" have result success ? " + result.length);
                    if (result.length > 0) {

                        objectId = result[0].id;
                        username = result[0].get('username');
                        email = result[0].get("email");

                        callback(this);
                    } else {
                        callback(null);
                    }

                },
                error: function (object, error) {

                    throw("Error: " + error.code + " " + error.message);
                }
            });
        },
        getBalanceByEmail: function (emailp, callback) {
            var Balance = Parse.Object.extend("balance");
            var query = new Parse.Query(Balance);
            query.equalTo("email", emailp);
            query.find({
                success: function (result) {
                    // The object was retrieved successfully.
                    console.log(" have result success ? " + result.length);
                    if (result.length > 0) {

                        balanceId = result[0].id;
//                        email = emailp;
                        credit = result[0].get("credit");
                        debit = result[0].get("debit");
                        balance = credit - debit;

                        console.log(" have result success recal balance" + balance);
                        console.log(" have result success credit" + credit);
                        console.log(" have result success debit" + debit);
                    } else {
//                        email = emailp;
                        credit = 0;
                        debit = 0;
                        balance = credit - debit;

                        console.log(" no balance set to zeros ");

                    }
                    callback(credit,debit,balance);
                },
                error: function (object, error) {

                    throw("Error: " + error.code + " " + error.message);
                }
            });
        },
        updateBalance: function (callback) {
//            var credit = credit;
            var emailp = this.getEmail();
            console.log("Start Update Balance" + this.getEmail());
            console.log("Start Update Balance credit " + credit);
            console.log("Start Update Balance debit " + this.getDebit());
//TODO why this.* doesn't work?
            this.getBalanceByEmail(emailp, function (result) {
                console.log("Get Updated Balance See if Balance existed | balance ID== " + result.balanceId);
                console.log("get Update Balance" + emailp);
                console.log("get Update Balance credit " + credit);
                console.log("get Update Balance debit " + debit);
                var Balance = Parse.Object.extend("balance");
                var pbalance = new Balance();
                pbalance.id = balanceId;
                pbalance.set('email', emailp);
                pbalance.set('credit', credit);
                pbalance.set('debit', debit);

                pbalance.set('balance', credit- debit);

                console.log("Balance: " + JSON.stringify(pbalance));
                balance = credit- debit;
                pbalance.save(null, {
                    success: function (result) {
                        callback(credit,debit,balance);
                    }, error: function (error) {
                        throw("Error: " + error.code + " " + error.message);
                    }
                })
            })

        },

        getCurrentUser: function () {
            return Parse.User.current();

        },

        getFriendList: function (callback) {
            var Friendlist = Parse.Object.extend("friendlist");
            var query = new Parse.Query(Friendlist);
            query.equalTo("email",email);
            console.log("getFriends - this.email ==" + email);
            query.find({
                success: function (result) {
                    // The object was retrieved successfully.
                    console.log("get friends - success count " + result.length);
                    if (result.length > 0) {
                        friendlistId = result[0].id;
                        friends = result[0].get('friends');

                        console.log("get friends -  have result friend == " + friends.length);
                        callback(result[0]);
                    } else if (result.length == 0) {
                        console.log("get friends -  NO  result friend ");
                        callback(null);
                    }

                },
                error: function (object, error) {
                    throw("Error: " + error.code + " " + error.message);
                }
            });
        },
        addFriend: function (friendemail, callback) {
            var Friendlist = Parse.Object.extend("friendlist");
            var friendlist = new Friendlist();
//        this.email = email;
            //get Friends from db
            console.log("addFriend - this.email BEFORE ==" + email);
            this.getFriendList(function (result) {
                console.log("addFriend - this.email AFTER==" + email);

                if (result == null) {
                    friendlist = new Friendlist();
                    console.log("addFriend - Not found result in DB");
                } else {
                    friendlist = result;
                    console.log("addFriend - this.friendListId ==" + friendlistId);
                    console.log("addFriend - found result " + JSON.stringify(friendlist));
                }
                friendlist.addUnique('friends', friendemail);

                if (typeof friendlistId!="undefined"){
                    friendlist.id = friendlistId;
                }

                friendlist.set('email', email);
                friendlist.save(null, {
                    success: function (result) {
                        //refresh user object
                        this.friends = [];
                        for (var i = 0; i < friendlist.get('friends').length; i++) {
                            this.friends[i] = friendlist.get('friends')[i];
                        }
                        this.friends.sort();

                        console.log("Friend List updated count" + friends.length)

                        callback(friends);
                    }, error: function (error) {
                        throw("Error: " + error.code + " " + error.message);
                    }
                })

            })


        }
    }

    return cls;
})();


