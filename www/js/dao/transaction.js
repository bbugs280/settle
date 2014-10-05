function Transaction(){
    Parse.initialize("eMt8xkAjx5hcAWMmL8HlNIUq3J0VQH2gf8b0TC8G", "utWyZ9iKkrZtoi3N30etMGrChUrRG8wTNesAzOvZ");
    this.transaction = Parse.Object.extend("transaction");
    this.objectId;
    this.tranId;
    this.from;
    this.to;
    this.amount;
    this.location;
    this.createdAt;
    this.updatedAt;

    this.save = function (callback) {

        var tran = new this.transaction();

        tran.set("tranId", this.tranId);
        tran.set("amount", Number(this.amount));
        tran.set("from", this.from);
        tran.set("to", this.to);
        tran.set("note", this.note);
        tran.set("location", this.location);

        tran.save(null, {
            success: function (result) {
                callback(result);
            },
            error: function (result, error) {
                // Show the error message somewhere and let the user try again.
                alert("Error: " + error.code + " " + error.message);
            }
        });
    }



    this.isTranIdExist = function (tranId, callback){
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
    }



    this.getFriendEmail = function (youremail){
        console.log("getFriendEmail - arg email = "+ youremail);
        console.log("getFriendEmail - from email = "+ this.from);
        console.log("getFriendEmail - to email = "+ this.to);
        if (this.from==youremail){
            console.log("return getFriendEmail - to email = "+ this.to);
            return this.to;
        }else{
            console.log("return getFriendEmail - to email = "+ this.from);
            return this.from;
        }
    }

    this.getYourCredit = function (youremail){
        if (this.from==youremail){
            return 0;

        }else{
            return this.amount;

        }
    }
    this.getYourDebit = function (youremail){
        if (this.from==youremail){
            return this.amount;

        }else{
            return 0;

        }
    }

}