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


function loadRelatedGroupUserBalance(group, user, balance){
    var Balance = Parse.Object.extend("balance");
    var queryBalance = new Parse.Query(Balance);
    queryBalance.include('currency');
    queryBalance.include('group');
    queryBalance.equalTo('group', group);
    queryBalance.equalTo('user', user);
    queryBalance.first({
        success:function(bal){
            console.log("bal "+ bal.get('group').get('group'));
            console.log("bal "+ bal.get('balance'));
//            callback(bal);
            balance.amount = bal.get('balance');
            balance.currencyCode = bal.get('currency').get('code');

            console.log("ammount =  "+ balance.amount);
            console.log("currencyCode =  "+ balance.currencyCode);

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