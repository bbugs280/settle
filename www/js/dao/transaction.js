var Transaction = Parse.Object.extend("transaction",{

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





