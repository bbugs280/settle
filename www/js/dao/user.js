
var SUser = Parse.User.extend({
    // Instance methods
    createTempAccount :function(email, currency, callback){
        var User = Parse.Object.extend("User");
        var user = new User();
        var query = new Parse.Query(User);
        var username = email.substring(0,email.indexOf('@'));
        query.equalTo('username',username);
        query.find({
            success:function(users){
                if (users.length!=0){
                    username += "1";
                }
                user.set('username',username);
                user.set('email',email);
                user.set('default_currency',currency);
                user.set('password','Abcd1234');

                user.signUp(null,{
                    success:function(suser){
                        callback(suser);
                    },error:function(error){
                        console.log("createTempAccount - Signup error:"+error.message);
                        callback(error);
                    }
                });

            },error:function(obj,error){
                console.log("createTempAccount - check existing user error ",error.message);
            }
        })

    },
    getUserById : function (id, callback) {
        var User = Parse.Object.extend("User");
        var query = new Parse.Query(User);
        query.include('default_currency');
        //query.equalTo("email", emailp);
        query.get(id,{
            success: function(result) {
                if (result) {
                    console.log(" getUserById - have result");
                    callback(result);
                } else {
                    console.log(" getUserById - no result");
                    callback(null);
                }
            },
            error: function (object, error) {
                throw("Error: " + error.code + " " + error.message);
            }
        });
    },
    //TODO to be remove after 1.1.6
    getUserByEmail : function (emailp, callback) {
    var User = Parse.Object.extend("User");
    var query = new Parse.Query(User);
    query.include('default_currency');
    query.equalTo("email", emailp);
    query.find({
        success: function(result) {
            console.log(" have result success ? " + result.length);
            if (result.length > 0) {

                //var r = new SUser();

                //
                //r.id = result[0].id;
                //
                //r.set({"username": result[0].get('username')});
                //r.set({"email": result[0].get('email')});
                //console.log("getUserByEmail -  this.username = " + r.get('username'));
                //console.log("getUserByEmail -  result[0].get(email) = " + result[0].get("email"));
                //callback(r);
                callback(result[0]);
            } else {
                callback(null);
            }
        },
        error: function (object, error) {
            throw("Error: " + error.code + " " + error.message);
        }
    });
    },
    getUserByEmailOrUsername : function (emailp, callback) {
        console.log("getUserByEmailOrUsername ", emailp);
        var User = Parse.Object.extend("User");
        var query2 = new Parse.Query(User);
        query2.startsWith('username', emailp);
        var query = new Parse.Query(User);
        query.equalTo("email", emailp);
        var mainQuery = Parse.Query.or(query, query2);
        mainQuery.first({
            success: function(result) {
                callback(result);

            },
            error: function (object, error) {
                throw("Error: " + error.code + " " + error.message);
            }
        });
    },
    getBalanceByGroupAndUser : function (group, user, callback) {
    console.log("getBalanceByGroupAndUser - start");
    var Balance = Parse.Object.extend("balance");
    var query = new Parse.Query(Balance);
    query.include('currency');
    query.equalTo("user", user);
    query.equalTo("group", group);
        query.find({
        success: function (result) {
            // The object was retrieved successfully.
            console.log("getBalanceByEmail -  have result success result.length = " + result.length);
            if (result.length > 0) {
                var r = new Balance();
                r = result[0];
                r.set('balance', r.get('credit') - r.get('debit'));
                //console.log("getBalanceByEmail - has balance and all set");
                callback(r);
            } else {
                console.log("getBalanceByEmail - no balance and creating new");
                var r = new Balance();
                r.set('user', user);
                //r.set('currency', {__type: "Pointer", className: "currencies", objectId: user.get('default_currency').id});
                console.log("getBalanceByEmail - no balance and creating new - setted currency properties");
                r.set('currency', user.get('default_currency'));

                r.set('group',group);
                r.set('credit',0);
                r.set('debit',0);
                r.set('balance',0);
                r.set('balance', r.get('credit')- r.get('debit'));
                r.get('currency').fetch({
                    success:function(curr){
                        console.log("currency : "+curr.code);
                        callback(r);
                    }

                });

            }

        },
        error: function (object, error) {

            throw("Error: " + error.code + " " + error.message);
        }
    });
},
    getBalanceByGroupAndUserIDs : function (group, useridArray, callback) {
        var Balance = Parse.Object.extend("balance");
        var User = Parse.Object.extend("User");
        var query = new Parse.Query(Balance);
        var innerQuery = new Parse.Query(User);
        innerQuery.containedIn("objectId", useridArray);
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
    getFriendListAll: function (userId, showHidden, callback) {
        var Friendlist = Parse.Object.extend("friendlist");

        var query = new Parse.Query(Friendlist);
        query.equalTo("friend_userid", userId);
        query.include('admin');
        query.notEqualTo("ispersonal",true);
        if (!showHidden){
            console.log("getFriendListAll showhidden is false");
            query.notEqualTo("hidden", true);
        }

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
    getFriendListForSub: function (userId, callback) {
        var Friendlist = Parse.Object.extend("friendlist");

        var query = new Parse.Query(Friendlist);
        query.equalTo("friend_userid", userId);
        query.notEqualTo("ispersonal",true);
        query.notEqualTo("hidden", true);
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
        queryBalance.include(['group.user1.default_currency']);
        queryBalance.include(['group.user2.default_currency']);


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
    //TODO name and email array to be removed after all user is upgraded to 1.1.6
    getPersonalListByEmails: function (userIdArray,emailArray, nameArray, callback) {
        var Friendlist = Parse.Object.extend("friendlist");

        var query = new Parse.Query(Friendlist);

        query.containsAll("friend_userid", userIdArray);
        query.equalTo("ispersonal", true);
        query.ascending('createdAt');
        console.log("getPersonalListByEmails prepared");

        query.first({
            success: function (friendlist) {
                // The object was retrieved successfully.
                //console.log("getPersonalListByEmails - success count " + friendlist.length);
                if (!friendlist){
                    var fl = new Friendlist();
                    fl.set('friends', emailArray);
                    fl.set('friend_userid', userIdArray);
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
                    callback(friendlist);
                }

            },
            error: function ( error) {
                throw("Error: " + error.code + " " + error.message);
            }
        });

    },
    findPersonalList: function (userId, callback) {
        var Friendlist = Parse.Object.extend("friendlist");

        var query = new Parse.Query(Friendlist);

        query.equalTo("friend_userid", userId);
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
    //TODO name and email array to be removed after all user is upgraded to 1.1.6
    addFriends : function (friendlist, useridArray, nameArray, friendemailArray, callback) {
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
            friendlist.addUnique('friend_userid', useridArray[i]);
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


