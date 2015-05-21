
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:

var twilio = require('twilio')('AC10c255c149d5fc1d56da52209d50a3b1', 'Enter Token');

Parse.Cloud.define("sendVerificationCode", function(request, response) {
  var verificationCode = Math.floor(Math.random()*999999);
  Parse.Cloud.useMasterKey();
  //Check if user exists by phone
  var User = Parse.Object.extend("User");

  var query = new Parse.Query(User);
  query.equalTo("phone_number",request.params.phone_number);
  query.first({
      success:function(r){
          if (r){
              //user already exist
              console.log("sendVerificationCode - User exist");

              r.set("verify_code", verificationCode);
              r.set("password", String(verificationCode));
              r.save(null,{
                  success:function(result){
                      console.log("sendVerificationCode - User Saved");
                      sendSMSCode(request.params.phone_number,verificationCode, response);
                  },error:function(obj,error){
                      console.log(" error = "+error.message);
                      response.error(error);
                  }
              });

          }else{
              //user not found
              //create signup user
              console.log("sendVerificationCode - User not found");
              var user = new User();
              getDefaultCurrency(request.params.locale, function(curr){
                  user.set("username", request.params.phone_number);
                  user.set("phone_number", request.params.phone_number);
                  user.set("verify_code", verificationCode);
                  user.set("password", String(verificationCode));
                  user.set("default_currency", curr);
                  user.signUp(null, {
                      success:function(result){
                          console.log("sendVerificationCode - New User SignUp");
                          sendSMSCode(request.params.phone_number,verificationCode, response);
                      },error:function(obj,error){
                          console.log(" error = "+error.message);
                          response.error(error);
                      }
                  });
              })


          }
      },error:function(e){
          console.log("sendVerificationCode - error = " + e.message);
      }
  });
});

function sendSMSCode(phoneNumber, verificationCode, response){
    twilio.sendSms({
        From: "+12015966766",
        To: phoneNumber,
        Body: "Settle verification code is " + verificationCode + "."
    }, function(err, responseData) {
        if (err) {
            console.log(" error = "+err.message);
            response.error(err);
        } else {
            console.log("send message to "+phoneNumber);
            response.success("Success");
        }
    });
}

function getDefaultCurrency(locale, callback){
//    var installation = Parse.Installation.current();
    var Currency = Parse.Object.extend("currencies");
    var query = new Parse.Query(Currency);
//    var currentTimeZone = installation.get('timeZone');
    console.log("Locales = "+ locale);
    query.equalTo("locale", locale);
    query.first({
        success:function(result){
            console.log("getDefaultCurrency - success result  = "+result);
            if (result){
                console.log("getDefaultCurrency - has currency");
                callback(result);
            }else{
                //If cannot guess default use USD
                console.log("getDefaultCurrency - no currency found using USD");
                query.get('6RvwpF8uN9',{
                    success:function(r){
                        console.log("getDefaultCurrency - return curr = "+ r.get('code'));
                        callback(r);
                    }
                });

            }
        },error:function(obj,error){
            console.log(" error = "+error.message);
        }
    })

}

//Parse.Cloud.define("verifyPhoneNumber", function(request, response) {
//  var user = Parse.User.current();
//  var verificationCode = user.get("verify_code");
//  if (verificationCode == request.params.phoneVerificationCode) {
//    user.set("phone_number", request.params.phoneNumber);
//    user.save();
//    response.success("Success");
//  } else {
//    response.error("Invalid verification code.");
//  }
//});

//Parse.Cloud.job("groupMigration", function(request, status) {
//
////    Parse.Cloud.useMasterKey();
//    var counter = 0;
//    // Query for all users
//    var FriendList = Parse.Object.extend("friendlist");
//    var query = new Parse.Query(FriendList);
//    query.equalTo('friend_userid',undefined);
//    query.each(function(fl) {
//        // Update Column "friend_userid" with "friends"
//        for (var i in fl.get('friends')){
//
//        }
//        user.set("plan", request.params.plan);
//        if (counter % 100 === 0) {
//            // Set the  job's progress status
//            status.message(counter + " users processed.");
//        }
//        counter += 1;
//        return fl.save();
//    }).then(function() {
//        // Set the job's success status
//        status.success("Migration completed successfully.");
//    }, function(error) {
//        // Set the job's error status
//        status.error("Uh oh, something went wrong." + error.message);
//    });
//});