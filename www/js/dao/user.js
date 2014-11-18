
var SUser = Parse.User.extend({
    // Instance methods
    createTempAccount :function(email, callback){
        var User = Parse.Object.extend("User");
        var user = new User();
        user.set('username',email.substring(0,email.indexOf('@')));
        user.set('email',email);
        user.set('password','Abcd1234');


        user.signUp(null,{
            success:function(suser){
                callback(suser);
            },error:function(error){
                console.log("error:"+error.message);
                callback(error);
            }
        });

    },
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
                console.log("getUserByEmail -  result[0].get(email) = " + result[0].get("email"));
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
    getBalanceByEmail : function (group, user, callback) {

    var Balance = Parse.Object.extend("balance");
    var query = new Parse.Query(Balance);
    query.include('currency');
    query.equalTo("user", user);
    query.equalTo("group", group);
    console.log("getBalanceByEmail ", user.get('default_currency').get('code'));
    var r = new Balance();

        query.find({
        success: function (result) {
            // The object was retrieved successfully.
            console.log("getBalanceByEmail -  have result success result.length = " + result.length);
            if (result.length > 0) {
                r = result[0];
                r.set('balance', r.get('credit') - r.get('debit'));
                //console.log("getBalanceByEmail - has balance and all set");
            } else {
                r.set('user', user);
                //r.set('currency', {__type: "Pointer", className: "currencies", objectId: user.get('default_currency').id});
                r.set('currency', user.get('default_currency'));
                r.set('group',group);
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
    getBalanceByEmails : function (group, emailarray, callback) {
        var Balance = Parse.Object.extend("balance");
        var User = Parse.Object.extend("User");
        var query = new Parse.Query(Balance);
        var innerQuery = new Parse.Query(User);
        innerQuery.containedIn("email", emailarray);
        query.include('user');
        query.include('currency');
//        query.containedIn("email", emailarray);
        query.equalTo("group", group);
        query.matchesQuery('user',innerQuery);
        query.addAscending("balance");
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
    getFriendList: function (groupId, callback) {
    var Friendlist = Parse.Object.extend("friendlist");
    var r = new Friendlist();
    var query = new Parse.Query(Friendlist);
//    query.equalTo("email",email);
    query.equalTo("objectId",groupId);
    query.equalTo("ispersonal",false);

    query.find({
        success: function (result) {
            // The object was retrieved successfully.

            console.log("getFriendList - success count " + result.length);

            if (result.length > 0) {
                r = result[0];

                callback(r);
            } else if (result.length == 0) {
                console.log("getFriendList -  NO  result friend ");
                //r.set('email', email);
                //r.set('groupId', groupId);

                callback(r);
            }

        },
        error: function (object, error) {
            throw("Error: " + error.code + " " + error.message);
        }
    });

},
    getFriendListAll: function (email, showHidden, callback) {
        var Friendlist = Parse.Object.extend("friendlist");

        var query = new Parse.Query(Friendlist);
        query.equalTo("friends", email);
        query.notEqualTo("ispersonal",true);
        if (!showHidden){
            console.log("getFriendListAll showhidden is false");
            query.notEqualTo("hidden", true);
        }
        console.log("getFriends - this.email ==" + email);
        query.addAscending('group');
        query.find({
            success: function (result) {
                // The object was retrieved successfully.
                console.log("getFriendListAll - success count " + result.length);
                callback(result);
            },
            error: function (object, error) {
                throw("Error: " + error.code + " " + error.message);
            }
        });

    },
    getBalanceOverview: function (user, callback) {

        var Balance = Parse.Object.extend("balance");
        var queryBalance = new Parse.Query(Balance);

        queryBalance.include('user');
        queryBalance.include('group');
        queryBalance.include('currency');
        queryBalance.include(['group.user1']);
        queryBalance.include(['group.user2']);


        queryBalance.equalTo('user',user);
        queryBalance.addDescending("updatedAt");
        queryBalance.find({
            success: function (result) {
                // The object was retrieved successfully.
                console.log("getFriendListAllForOverview - success count " + result.length);
                callback(result);
            },
            error: function (object, error) {
                throw("Error: " + error.code + " " + error.message);
            }
        });

    },
    getPersonalListByEmails: function (emailArray, nameArray, callback) {
        var Friendlist = Parse.Object.extend("friendlist");

        var query = new Parse.Query(Friendlist);

        query.containsAll("friends", emailArray);
        query.equalTo("ispersonal", true);

        console.log("getPersonalListByEmails prepared");
        query.find({
            success: function (friendlist) {
                // The object was retrieved successfully.
                console.log("getPersonalListByEmails - success count " + friendlist.length);
                if (friendlist.length == 0){
                    var fl = new Friendlist();
                    fl.set('friends', emailArray);
                    fl.set('username1',nameArray[0]);
                    fl.set('username2',nameArray[1]);
                    fl.set('friendnames', nameArray);
                    fl.set('ispersonal', true);
                    fl.save(null,{
                       success: function(result){
                           callback(result);
                       },error:function(error){
                            throw error.message;
                        }
                    });
                }else{
                    callback(friendlist[0]);
                }

            },
            error: function ( error) {
                throw("Error: " + error.code + " " + error.message);
            }
        });

    },
    findPersonalList: function (email, callback) {
        var Friendlist = Parse.Object.extend("friendlist");

        var query = new Parse.Query(Friendlist);

        query.equalTo("friends", email);
        query.equalTo("ispersonal", true);
        console.log("findPersonalList prepared");
        query.find({
            success: function (friendlist) {
                // The object was retrieved successfully.
                console.log("findPersonalList - success count " + friendlist.length);

                    callback(friendlist);

            },
            error: function ( error) {
                throw("Error: " + error.code + " " + error.message);
            }
        });

    },
    addFriends : function (friendlist, nameArray, friendemailArray, callback) {
    var Friendlist = Parse.Object.extend("friendlist");

        if (!friendlist instanceof Friendlist){
            throw 'Parameter is wrong type';
        }

//        if (friendlist.get('email')=="undefined"){
//            throw 'friendlist has empty email';
//        }
        console.log("addFriends - addUnique email count = "+friendemailArray.length);
//        for (var i= 0;i< friendemailArray.length;i++) {
        for (var i in friendemailArray){
            console.log("addFriends - addUnique email = "+friendemailArray[i]);
            friendlist.addUnique('friends', friendemailArray[i]);
            friendlist.addUnique('friendnames', nameArray[i]);
        }

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


