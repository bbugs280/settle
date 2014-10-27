
var SUser = Parse.User.extend({
    // Instance methods

    getUserByEmail : function (emailp, callback) {
    var User = Parse.Object.extend("User");
    var query = new Parse.Query(User);
    query.equalTo("email", emailp);
    query.find({
        success: function(result) {
            console.log(" have result success ? " + result.length);
            if (result.length > 0) {

                var r = new SUser();

                r.id = result[0].id;

                r.set({"username": result[0].get('username')});
                r.set({"email": result[0].get('email')});
                console.log("getUserByEmail -  this.username = " + r.get('username'));
                console.log("getUserByEmail -  result[0].get(email" + result[0].get("email"));
                console.log("getUserByEmail -  this.getEmail = " + r.get('email'));
                console.log("getUserByEmail -  this = " + r);

                callback(r);
            } else {
                callback(null);
            }
        },
        error: function (object, error) {
            throw("Error: " + error.code + " " + error.message);
        }
    });
    },
    getBalanceByEmail : function (emailp1, callback) {
    var Balance = Parse.Object.extend("balance");
    var query = new Parse.Query(Balance);
    var emailp = emailp1;
    var r = new Balance();
    console.log("getBalanceByEmail - begin call email = "+emailp);
    query.equalTo("email", emailp);
    query.find({
        success: function (result) {
            // The object was retrieved successfully.
            console.log("getBalanceByEmail -  have result success ? " + result.length);
            if (result.length > 0) {
                r = result[0];
                r.set('balance', r.get('credit')- r.get('debit'));

            } else {
                r.set('email', emailp);
                r.set('credit',0);
                r.set('debit',0);
                r.set('balance', r.get('credit')- r.get('debit'));

            }
            callback(r);
        },
        error: function (object, error) {

            throw("Error: " + error.code + " " + error.message);
        }
    });
},
    getBalanceByEmails : function (emailarray, callback) {
        var Balance = Parse.Object.extend("balance");
        var query = new Parse.Query(Balance);
        query.containedIn("email", emailarray);
        query.find({
            success: function (balances) {
                console.log("getBalanceByEmails -  have result success ? " + balances.length);
                callback(balances);
            },
            error: function ( error) {
                throw("Error: "  + error.message);
            }
        });
    },

    updateBalance : function (bal, callback) {

        var Balance = Parse.Object.extend("balance");
        if (!bal instanceof Balance){
            throw 'Parameter is wrong type';
        }

        bal.set('balance', Number(bal.get('credit')) - Number(bal.get('debit')));

        bal.save({
            success: function (result) {
                callback(result);
            }, error: function (error) {
                throw("Error: " + error.code + " " + error.message);
            }
        })



},
    getFriendList: function (email, callback) {
    var Friendlist = Parse.Object.extend("friendlist");
    var r = new Friendlist();
    var query = new Parse.Query(Friendlist);
    query.equalTo("email",email);
    console.log("getFriends - this.email ==" + email);
    query.find({
        success: function (result) {
            // The object was retrieved successfully.
            console.log("get friends - success count " + result.length);
            if (result.length > 0) {
                r = result[0];
                console.log("get friends -  have result friend == " + r.get('friends').length);
                callback(r);
            } else if (result.length == 0) {
                console.log("get friends -  NO  result friend ");
                r.set('email', email);
                callback(r);
            }

        },
        error: function (object, error) {
            throw("Error: " + error.code + " " + error.message);
        }
    });
},
    addFriend : function (friendlist, friendemail, callback) {
    var Friendlist = Parse.Object.extend("friendlist");

        if (!friendlist instanceof Friendlist){
            throw 'Parameter is wrong type';
        }

        if (friendlist.get('email')=="undefined"){
            throw 'friendlist has empty email';
        }

        friendlist.addUnique('friends', friendemail);
        friendlist.save(null, {
            success: function (result) {
                //refresh user object
//                this.friends = [];
//                for (var i = 0; i < friendlist.get('friends').length; i++) {
//                    this.friends[i] = friendlist.get('friends')[i];
//                }
                result.get('friends').sort();

                console.log("Friend List updated count" + result.get('friends').length)

                callback(result);
            }, error: function (error) {
                throw("Error: " + error.code + " " + error.message);
            }
        })


},

    // Instance properties go in an initialize method
    initialize: function (attrs, options) {
//        this.objectId='';
//        this.username='';
//        this.email='';
//        this.credit=Number(0);
//        this.debit=Number(0);
//        this.balanceId='';
//        this.balance=Number(0);
//        this.friendlistId='';
//        this.friends=[];
//        this.createdAt;
//        this.updatedAt;
    }
}, {
    // Class methods

});


