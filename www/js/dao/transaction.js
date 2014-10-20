var Transaction = Parse.Object.extend("transaction",{

        //TODO query function to get all related transactions
        getRelatedTran : function(email, callback){
            var fromQuery = new Parse.Query("transaction");
            fromQuery.equalTo("from", email);

            var toQuery = new Parse.Query("transaction");
            toQuery.equalTo("to", email);

            var mainQuery = Parse.Query.or(fromQuery, toQuery);
            mainQuery.find({
                success: function(results) {
                    // results contains a list of players that either have won a lot of games or won only a few games.
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

 // Instance properties go in an initialize method
    initialize : function (attrs, options) {
//        this.objectId='';
    }
},
{
    // Class methods

});





