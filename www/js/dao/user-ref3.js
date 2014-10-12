
var SUser = (function () {
    // private static

    // constructor
    var cls = function () {
        Parse.initialize("eMt8xkAjx5hcAWMmL8HlNIUq3J0VQH2gf8b0TC8G", "utWyZ9iKkrZtoi3N30etMGrChUrRG8wTNesAzOvZ");
        // private
        var objectId='';
        var username='';
        var youremail='';
        var credit=Number(0);
        var debit=Number(0);
        var balanceId='';
        var balance=Number(0);
        var friendlistId='';
        var friends=[];
        var createdAt;
        var updatedAt;
        // public (this instance only)

        this.getObjectId = function(){return objectId;};
        this.getUsername = function(){return username;};
        this.getEmail = function(){
            console.log("SUser - getEmail = "+youremail);
            return youremail;};
        this.getCredit = function(){return credit;};
        this.getDebit = function(){return debit;};
        this.getBalanceId = function(){return balanceId;};
        this.getBalance  = function(){return (credit-debit);};
        this.getFriendlistId  = function(){return friendlistId;};
        this.getFriends = function(){return friends;};
        this.getCreatedAt  = function(){return createdAt;};
        this.getUpdatedAt = function(){return updatedAt;};

        this.setObjectId = function (value){
            if (typeof value != 'string')
                throw 'objectId must be a string';
            balanceId = value;
        }
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
        this.setUsername =  function(value){
            if (typeof value != 'string')
                throw 'username must be a string';
            username = value;
        }
        this.setEmail =  function(value){
            console.log("setEmail value = "+value);
            if (typeof value != 'string')
                throw 'email must be a string';
            if (value.length < 6 || value.length > 30)
                throw 'email must be 6-30 characters long.';
            youremail = value;
        }

        this.login = function (loginemail, password, callback) {
            console.log("start login");
            Parse.User.logIn(loginemail, password, {
                success: function (result) {
                    console.log("service - sucess login : user JSON " + JSON.stringify(result));
                    username = result.getUsername();
                    youremail = result.getEmail();
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
        }

        this.logout= function () {
            Parse.User.logOut();
        }
        this.signUp = function (username, signupemail, password, callback) {
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
        }
        this.getUserByEmail = function (emailp, callback) {
            var User = Parse.Object.extend("User");
            var query = new Parse.Query(User);
            query.equalTo("email", emailp);
            query.find({
                success: this.onGetUserByEmailSuccess(result) ,
                error: function (object, error) {
                    throw("Error: " + error.code + " " + error.message);
                }
            });
        }

        this.onGetUserByEmailSuccess = function(result){
// The object was retrieved successfully.
            console.log(" have result success ? " + result.length);
            if (result.length > 0) {

                objectId = result[0].id;
                username = result[0].get('username');
                youremail = result[0].get("email");

                console.log("getUserByEmail -  this.username = "+username);
                console.log("getUserByEmail -  result[0].get(email"+result[0].get("email"));
                console.log("getUserByEmail -  this.getEmail = "+this.getEmail());

                callback(this);
            } else {
                callback(null);
            }
        }


            this.getBalanceByEmail = function (emailp1, callback) {
                var Balance = Parse.Object.extend("balance");
                var query = new Parse.Query(Balance);
                var emailp = emailp1;
                console.log("getBalanceByEmail - begin call email = "+emailp);
                query.equalTo("email", emailp);
                query.find({
                    success: function (result) {
                        // The object was retrieved successfully.
                        console.log("getBalanceByEmail -  have result success ? " + result.length);
                        if (result.length > 0) {

                            balanceId = result[0].id;
                            youremail = emailp;
                            credit = result[0].get("credit");
                            debit = result[0].get("debit");
                            balance = credit - debit;

                            console.log("getBalanceByEmail -  have result success email" + youremail);
                            console.log("getBalanceByEmail -  have result success recal balance" + balance);
                            console.log("getBalanceByEmail -  have result success credit" + credit);
                            console.log("getBalanceByEmail -  have result success debit" + debit);
                        } else {
                            youremail = emailp;
                            credit = 0;
                            debit = 0;
                            balance = credit - debit;

                            console.log("getBalanceByEmail -  no balance set to zeros ");
                            console.log("getBalanceByEmail -  no balance set to zeros email = " + youremail);

                        }
                        callback(credit,debit,balance,this.balanceId);
                    },
                    error: function (object, error) {

                        throw("Error: " + error.code + " " + error.message);
                    }
                });
            }

            this.updateBalance= function (callback) {
//            var credit = credit;
                var emailp = this.getEmail();
                var credit = this.getCredit();
                var debit = this.getDebit();

                //TODO balanceID is empty all the time
                console.log("updateBalance - Start Update Balance email =" + emailp);
                console.log("updateBalance - Start Update Balance credit =" + credit);
                console.log("updateBalance - Start Update Balance debit =" + debit);
//TODO why this.* doesn't work?
                this.getBalanceByEmail(emailp, function (creditp,debitp,balancep, balanceId) {
//                console.log("Get Updated Balance See if Balance existed | balance ID== " + result.balanceId);
                    console.log("updateBalance - get Update Balance email =" + emailp);
                    console.log("updateBalance - get Update Balance credit =" + credit);
                    console.log("updateBalance - get Update Balance debit =" + debit);
                    console.log("updateBalance - get Update Balance ID =" + balanceId);
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

            }

            this.getCurrentUser= function () {
                return Parse.User.current();

            }
            this.getFriendList= function (callback) {
                var Friendlist = Parse.Object.extend("friendlist");
                var query = new Parse.Query(Friendlist);
                query.equalTo("email",youremail);
                console.log("getFriends - this.email ==" + youremail);
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
            }

            this.addFriend= function (friendemail, callback) {
                var Friendlist = Parse.Object.extend("friendlist");
                var friendlist = new Friendlist();
//        this.email = email;
                //get Friends from db
                console.log("addFriend - this.email BEFORE ==" + youremail);
                this.getFriendList(function (result) {
                    console.log("addFriend - this.email AFTER==" + youremail);

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

                    friendlist.set('email', youremail);
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


    };

    // public static
//    cls.get_nextId = function () {
//        return nextId;
//    };

    // public (shared across instances)
    cls.prototype = {

    }

    return cls;
})();


