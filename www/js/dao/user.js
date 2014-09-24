function User(){
    Parse.initialize("eMt8xkAjx5hcAWMmL8HlNIUq3J0VQH2gf8b0TC8G", "utWyZ9iKkrZtoi3N30etMGrChUrRG8wTNesAzOvZ");
    this.objectId;
    this.username;
    this.email;
    this.credit;
    this.debit;
    this.balance;
    this.friends;
    this.createdAt;
    this.updatedAt;

    this.login = function (email, password, callback) {
        console.log("start login");
        Parse.User.logIn(email, password, {
            success: function (user) {
                console.log("service - sucess login : user JSON " + JSON.stringify(user));
                this.username = user.getUsername();
                this.email = user.getEmail();
                this.credit = user.get("credit");
                this.debit = user.get("debit");
                this.balance = user.get("balance");
                this.friends = user.get("friends");
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
    this.signUp = function(email, password, callback){
        var user = new Parse.User();
        user.set("username", email);
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



    this.save = function (callback){

        var User = Parse.Object.extend("User");
        var user = new User();
        user.set("username", this.username);
        user.set("password", this.password);
        user.set("email", this.email);
        user.set("credit", this.credit);
        user.set("debit", this.debit);
        user.set("balance", this.balance);
        user.set("friends", this.friends);

        user.save(null, {
            success: function (user) {

                callback(user);
            },
            error: function (user, error) {
                // Show the error message somewhere and let the user try again.

                alert("Error: " + error.code + " " + error.message);
            }
        });
    }
    this.getUser = function(email, callback){
        var User = Parse.Object.extend("User");
        var query = new Parse.Query(User);
        query.equalTo("email", email);
        query.find({
            success: function(result) {
                // The object was retrieved successfully.
                console.log("get User result " +JSON.stringify(result));
//                console.log("get User result "+result.get("username"));
                this.username=result.get("username");
                this.email=result.get("email");
                this.credit=result.get("credit");
                this.debit=result.get("debit");
                this.balance=result.get("balance");
                this.friends=result.get("friends");
                callback(user);
            },
            error: function(object, error) {
                // The object was not retrieved successfully.
                // error is a Parse.Error with an error code and message.
                alert("Error: " + error.code + " " + error.message);
            }
        });
    }

    this.getCurrentUser = function(){
        return Parse.User.current();
    }
    this.addFriend = function(email){
        this.friends.addUnique(email);
        this.save().then(function(result){
            console.log("Friend email added : "+JSON.stringify(this));
        })
    }
    this.updateBalance = function(transaction){

    }
    this.updateFriends =  function(transaction){

    }


}