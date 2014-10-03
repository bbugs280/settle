function User(){
    Parse.initialize("eMt8xkAjx5hcAWMmL8HlNIUq3J0VQH2gf8b0TC8G", "utWyZ9iKkrZtoi3N30etMGrChUrRG8wTNesAzOvZ");
    this.objectId;
    this.username;
    this.email;
    this.credit;
    this.debit;
    this.balanceId;
    this.balance;
    this.friendlistId;
    this.friends=[];
    this.createdAt;
    this.updatedAt;
    this.parseObject;

    this.login = function (email, password, callback) {
        console.log("start login");
        Parse.User.logIn(email, password, {
            success: function (user) {
                console.log("service - sucess login : user JSON " + JSON.stringify(user));
                this.username = user.getUsername();
                this.email = user.getEmail();
//                this.credit = user.get("credit");
//                this.debit = user.get("debit");
//                this.balance = user.get("balance");
//                this.friends = user.get("friends");
                if (typeof callback === 'function' ){

                    callback(this);
                }

            }, error: function (user, error) {
                alert("Error: " + error.message);
                //callback(error);
            }
        });
    }
    this.logout = function (){
        Parse.User.logOut();

    }
    this.signUp = function(username,email, password, callback){
        var user = new Parse.User();
        user.set("username", username);
        user.set("password", password);
        user.set("email", email);

        user.signUp(null, {
            success: function (user) {
                // Hooray! Let them use the app now.
                callback(user);
            },
            error: function (user, error) {
                // Show the error message somewhere and let the user try again.
                alert("Error: " + error.code + " " + error.message);
            }
        });
    }



//    this.save = function (callback){
//        var User = Parse.Object.extend("User");
//        var user = new User();
//
//        this.getUserByEmail(this.email, function(result){
//            this.parseObject.set("username", this.username);
////            this.parseObject.set("password", this.password);
//            this.parseObject.set("email", this.email);
//            this.parseObject.set("credit", Number(this.credit));
//            this.parseObject.set("debit", Number(this.debit));
//            this.parseObject.set("balance", Number(this.balance));
//            this.parseObject.set("friends", this.friends);
//            this.parseObject.save(null, {
//                success: function (result2) {
//                    callback(result2);
//                },
//                error: function (result2, error) {
//                    // Show the error message somewhere and let the user try again.
//                    alert("Error: " + error.code + " " + error.message);
//                }
//            });
////            if (result!=null){
////
////                user.set("objectId", this.parseObject.id);
////            }else{
////                user.set("username", this.username);
////                user.set("password", this.password);
////                user.set("email", this.email);
////
////            }
////            user.set("credit", Number(this.credit));
////            user.set("debit", Number(this.debit));
////            user.set("balance", Number(this.balance));
////            user.set("friends", this.friends);
////
////            user.save(null, {
////                success: function (result2) {
////                    callback(result2);
////                },
////                error: function (result2, error) {
////                    // Show the error message somewhere and let the user try again.
////                    alert("Error: " + error.code + " " + error.message);
////                }
////            });
//        })
//
//    }
    this.getUserByEmail = function(email, callback){
        var User = Parse.Object.extend("User");
        var query = new Parse.Query(User);
        query.equalTo("email", email);
        query.find({
            success: function(result) {
                // The object was retrieved successfully.
                console.log(" have result success ? "+result.length);
                if (result.length>0){

                    this.objectId=result[0].id;
                    this.username=result[0].getUsername();
                    this.email=result[0].get("email");
//                    this.password=result[0].get('password');

                    //Get Balance
//                    this.getBalanceByEmail(this.email, function(result2){
////                        this.credit=result[0].get("credit");
////                        this.debit=result[0].get("debit");
////                        this.balance=result[0].get("balance");
//                        callback(this);
//                    });
                    callback(this);
                }else{
                    callback(null);
                }

            },
            error: function(object, error) {
                // The object was not retrieved successfully.
                // error is a Parse.Error with an error code and message.
                alert("Error: " + error.code + " " + error.message);
            }
        });
    }

    this.getBalanceByEmail = function(email, callback){
        var Balance = Parse.Object.extend("balance");
        var query = new Parse.Query(Balance);
        query.equalTo("email", email);
        query.find({
            success: function(result) {
                // The object was retrieved successfully.
                console.log(" have result success ? "+result.length);
                if (result.length>0){

                    this.balanceId=result[0].id;
                    this.email = email;
                    this.credit=result[0].get("credit");
                    this.debit=result[0].get("debit");
//                    this.balance=result[0].get("balance");
                    this.balance = this.credit-this.debit;

                    console.log(" have result success recal balance"+this.balance);
                    console.log(" have result success username"+this.username);
                    console.log(" have result success email"+this.email);
                }else{
//                    this.balanceId=undefined;
                    this.email = email;
                    this.credit=0;
                    this.debit=0;
                    this.balance = this.credit-this.debit;
                    console.log(" no balance set to zeros ");

                }
                callback(this);
            },
            error: function(object, error) {
                // The object was not retrieved successfully.
                // error is a Parse.Error with an error code and message.
                alert("Error: " + error.code + " " + error.message);
            }
        });
    }

    this.updateBalance = function(callback){

        var Balance = Parse.Object.extend("balance");
        var balance = new Balance();
        var credit = this.credit;
        var debit = this.debit;
        console.log("Start Update Balance"+this.email);
        console.log("Start Update Balance credit "+credit);
        console.log("Start Update Balance debit "+debit);

        this.getBalanceByEmail(this.email, function(result){
            console.log("Get Updated Balance See if Balance existed | balance ID== "+result.balanceId);
            console.log("Get Updated Balance See if Balance existed | email== "+this.email);
            console.log("Get Updated Balance See if Balance existed | credit== "+credit);
            console.log("Get Updated Balance See if Balance existed | debit== "+debit);

            balance.id = this.balanceId;
            balance.set('email', this.email);
            balance.set('credit',credit);
            balance.set('debit',debit);


            balance.set('balance',this.credit-this.debit);

            console.log("Balance: "+JSON.stringify(balance));
            this.balance = this.credit-this.debit;

            balance.save(null,{
                success: function(result){

                    callback(this);
                },error: function(error){
                    alert("Error: " + error.code + " " + error.message);
                }
            })
        })

    }

    this.getCurrentUser = function(){
        this.parseObject = Parse.User.current();
        return this.parseObject
    }

    this.getFriends = function(callback){
        var Friendlist = Parse.Object.extend("friendlist");
        var query = new Parse.Query(Friendlist);
        query.equalTo("email", this.email);
        console.log("getFriends - this.email =="+this.email);
        query.find({
            success: function(result) {
                // The object was retrieved successfully.
                console.log("get friends - success count "+result.length);
                if (result.length>0){
//TODO no entered there?
                    this.friendlistId=result[0].id;
                    this.friends = result[0].get('friends');

                    console.log("get friends -  have result friend == "+this.friends.length);
                    callback(result[0]);
                }else if (result.length==0){
                    console.log("get friends -  NO  result friend ");
                    callback(null);
                }

            },
            error: function(object, error) {
                // The object was not retrieved successfully.
                // error is a Parse.Error with an error code and message.
                alert("Error: " + error.code + " " + error.message);
            }
        });
    }

    this.addFriend = function(friendemail,callback){
        var Friendlist = Parse.Object.extend("friendlist");
        var friendlist = new Friendlist();
//        this.email = email;
        //get Friends from db
        console.log("addFriend - this.email BEFORE =="+this.email);
        this.getFriends(function(result){
            console.log("addFriend - this.email AFTER=="+this.email);
            //TODO why is this email not set properly
            console.log("addFriend - this.friendListId =="+this.friendlistId);
            if (result==null){
                friendlist = new Friendlist();
                console.log("addFriend - Not found result in DB");
            }else{
                friendlist = result;
                console.log("addFriend - found result "+ JSON.stringify(friendlist));
            }
            friendlist.addUnique('friends', friendemail);


            friendlist.id = this.friendlistId;
            friendlist.set('email', this.email);
            friendlist.save(null,{
                success : function(result){
                    //refresh user object
                    this.friends=[];
                    for (var i=0;i<friendlist.get('friends').length;i++){
                        this.friends[i]=friendlist.get('friends')[i];
                    }
                    this.friends.sort();
                    console.log("Friend List updated "+this.friends)
                    callback(this.friends);
                },error : function(error){
                    alert("Error: " + error.code + " " + error.message);
                }
            })

        })

    }



    this.updateFriendList =  function(){
//        this.friends.addUnique(email);
    }

    // Login a user using Facebook
//            FB_login : function FB_login(callback) {
//                Parse.FacebookUtils.logIn(null, {
//                    success: function(user) {
//                        if (!user.existed()) {
//                            alert("User signed up and logged in through Facebook!");
//                        } else {
//                            alert("User logged in through Facebook!");
//                        }
//                        loggedInUser = user;
//                        callback(user);
//                    },
//                    error: function(user, error) {
//                        alert("User cancelled the Facebook login or did not fully authorize.");
//                    }
//                });
//            },

}