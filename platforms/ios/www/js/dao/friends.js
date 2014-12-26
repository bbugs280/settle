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
                        groups[j].balance = {
                            amount:0,
                            currencyCode: ''
                        }
                        if (bal[i].get('group').id == groups[j].id){
                            groups[j].balance.amount = bal[i].get('balance');
                            groups[j].balance.currencyCode = bal[i].get('currency').get('code');
                        }
                    }
                }
            }
            callback(bal);
        }
    });
}

function updateGroupFriendsBalance(group, users, callback){
    var Balance = Parse.Object.extend("balance");
    var queryBalance = new Parse.Query(Balance);
    queryBalance.include('currency');
    //queryBalance.include('group');
    queryBalance.equalTo('group', group);
    queryBalance.containedIn('user', users);

    queryBalance.find({
        success:function(bal){
            console.log("updateGroupFriendsBalance length "+ bal.length);
            if (bal){
                for (var i in bal){
                    for (var j in users){
                        users[j].balance = {
                            amount:0,
                            currencyCode: ''
                        }
                        if (bal[i].get('user').id == users[j].id){
                            users[j].balance.amount = bal[i].get('balance');
                            users[j].balance.currencyCode = bal[i].get('currency').get('code');
                            console.log("amount "+users[j].balance.amount);
                        }
                    }
                }
            }
            callback(bal);
        }
    });
}


function loadRelatedUserBalance(group, user, callback){
    var Balance = Parse.Object.extend("balance");
    var FriendList = Parse.Object.extend("friendlist");
    var queryBalance = new Parse.Query(Balance);
    var queryGroup = new Parse.Query(FriendList);

    queryBalance.matchesQuery('group',queryGroup);
}