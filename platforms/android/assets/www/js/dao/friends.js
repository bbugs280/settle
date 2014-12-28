/**
 * Created by vincent on 25/12/14.
 */

function loadFriendsFromParse(phoneArray, callback){
    //Now get user from Parse using Array
    console.log("phoneArray ="+ phoneArray.length);
    var User = Parse.Object.extend("User");
    var query = new Parse.Query(User);
    query.containedIn('phone_number', phoneArray);
    query.addAscending('username');
    query.find({
        success:function(users){
            console.log("found user = "+users.length);
            callback(users);
        }, error:function(obj, error){
            console.log("error "+ error.message);
        }
    });
}

function updateGroupUserBalance(groups, user, callback){
    var Balance = Parse.Object.extend("balance");
    var queryBalance = new Parse.Query(Balance);
    queryBalance.include('currency');
    queryBalance.include('group');
    queryBalance.containedIn('group', groups);
    queryBalance.equalTo('user', user);

    queryBalance.find({
        success:function(bal){
            console.log("updateGroupUserBalance length "+ bal.length);
            if (bal){
                for (var i in bal){
                    for (var j in groups){
                        if (bal[i].get('group').id == groups[j].id){
                            groups[j].balance = bal[i].get('balance');
                            groups[j].currencyCode = bal[i].get('currency').get('code');
                        }
                    }
                }
            }
            callback(groups);
        }
    });
}

function updateGroupFriendsBalance(group, users, callback){
    var Balance = Parse.Object.extend("balance");
    var queryBalance = new Parse.Query(Balance);
    queryBalance.include('currency');
    //queryBalance.include('group');
    if (group){
        queryBalance.equalTo('group', group);
    }
    queryBalance.containedIn('user', users);

    queryBalance.find({
        success:function(bal){
            console.log("updateGroupFriendsBalance length "+ bal.length);
            if (bal){
                for (var i in bal){
                    for (var j in users){
                        if (bal[i].get('user').id == users[j].id){
                            users[j].balance = bal[i].get('balance');
                            users[j].currencyCode = bal[i].get('currency').get('code');

                        }
                    }
                }
            }
            callback(users);
        }
    });
}

function updateFriendsBalance(you, users, callback){
    var FriendList = Parse.Object.extend("friendlist");
    var Balance = Parse.Object.extend("balance");
    var queryGroup = new Parse.Query(FriendList);
    var queryBalance = new Parse.Query(Balance);

    queryGroup.equalTo('friend_userid',you.id);
    queryGroup.equalTo('ispersonal',true);
    queryBalance.include('currency');
    //queryBalance.include('group');

    queryBalance.containedIn('user', users);
    queryBalance.matchesQuery('group',queryGroup);
    queryBalance.find({
        success:function(bal){
            console.log("updateGroupFriendsBalance length "+ bal.length);
            if (bal){
                for (var i in bal){
                    for (var j in users){
                        if (bal[i].get('user').id == users[j].id){
                            users[j].balance = bal[i].get('balance');
                            users[j].currencyCode = bal[i].get('currency').get('code');

                        }
                    }
                }
            }
            callback(users);
        }
    });
}
