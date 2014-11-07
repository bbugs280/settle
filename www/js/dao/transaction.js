var Transaction = Parse.Object.extend("transaction",{

        //TODO query function to get all related transactions
        getRelatedTran : function(groupId, email, callback){
            var fromQuery = new Parse.Query("transaction");
            fromQuery.equalTo("from", email);

            var toQuery = new Parse.Query("transaction");
            toQuery.equalTo("to", email);

            var mainQuery = Parse.Query.or(fromQuery, toQuery);
            mainQuery.equalTo("groupId", groupId);
            mainQuery.addDescending("createdAt");
            mainQuery.limit(5);
            mainQuery.find({
                success: function(results) {
                    console.log("Transaction - getRelatedTran Returned No of records = "+results.length);

                    callback(results);
                },
                error: function(error) {
                    // There was an error.
                    alert("Error: " + error.code + " " + error.message);
                }
            });

        },
        isTranIdExist : function (tranId, callback){
            var transaction = Parse.Object.extend("transaction");
            var query = new Parse.Query(transaction);
            query.equalTo("tranId", tranId);
            query.find({
                success: function (results) {
                    if (results.length > 0){
                        callback(true);
                    }else{
                        callback(false);
                    }
                },
                error: function (result, error) {
                    // Show the error message somewhere and let the user try again.
                    alert("Error: " + error.code + " " + error.message);
                }
            })
        },
        getFriendEmail : function (youremail){
            console.log("getFriendEmail - arg email = "+ youremail);
            console.log("getFriendEmail - from email = "+ this.get('from'));
            console.log("getFriendEmail - to email = "+ this.get('to'));
            if (this.get('from')==youremail){
                console.log("return getFriendEmail - to email = "+ this.get('to'));
                return this.get('to');
            }else{
                console.log("return getFriendEmail - to email = "+ this.get('from'));
                return this.get('from');
            }
        },
        getFriendName : function (yourname){
            console.log("getFriendEmail - arg email = "+ youremail);
            console.log("getFriendEmail - from email = "+ this.get('from'));
            console.log("getFriendEmail - to email = "+ this.get('to'));
            if (this.get('fromname')==yourname){
                console.log("return getFriendEmail - to email = "+ this.get('to'));
                return this.get('toname');
            }else{
                console.log("return getFriendEmail - to email = "+ this.get('from'));
                return this.get('fromname');
            }
        },
        getYourCredit : function (youremail){
            if (this.get('from')==youremail){
                return 0;

            }else{
                return this.get('amount');

            }
        },
        getYourDebit : function (youremail){
            if (this.get('from')==youremail){
                return this.get('amount');

            }else{
                return 0;

            }
        },
        getFriendName : function (){

            var user = new SUser();
            user.getUserByEmail(this.getFriendEmail, function(frienduser){
                this.set('friendname', frienduser.get('username'));
            })
        },

 // Instance properties go in an initialize method
    initialize : function (attrs, options) {
//        this.friendname='';
//        this.getFriendName();
    }
},
{
    // Class methods

});





