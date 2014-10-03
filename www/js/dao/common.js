
var Common = (function () {
    // private static

    // constructor
    var cls = function () {

        // private
        var objectId='';

        // public (this instance only)

        this.getObjectId = function(){return objectId;};


        this.setBalanceId = function (value){
            if (typeof value != 'string')
                throw 'balanceId must be a string';
            balanceId = value;
        }


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
        }

    }

    return cls;
})();


