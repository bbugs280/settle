
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:

var twilio = require('twilio')('AC10c255c149d5fc1d56da52209d50a3b1', '7bc027121a25874b06748aa7dff29a7');


Parse.Cloud.define("sendVerificationCode", function(request, response) {
  var verificationCode = Math.floor(Math.random()*999999);
  var user = Parse.User.current();
  //Check if user exists by phone
  var User = Parse.Object.extend("User");

  var query = new Parse.Query(User);
  query.equalTo("phone_number",request.params.phone_number);
  query.first({
    
  });


  user.set("phone_number", request.params.phone_number);
  user.set("verify_code", verificationCode);
  //user.set("username", request.params.phoneNumber);
  user.set("password", verificationCode);
  user.save();

  twilio.sendSms({
    From: "+12015966766",
    To: request.params.phoneNumber,
    Body: "Your verification code is " + verificationCode + "."
  }, function(err, responseData) {
    if (err) {
      response.error(err);
    } else {
      response.success("Success");
    }
  });
});

Parse.Cloud.define("verifyPhoneNumber", function(request, response) {
  var user = Parse.User.current();
  var verificationCode = user.get("verify_code");
  if (verificationCode == request.params.phoneVerificationCode) {
    user.set("phone_number", request.params.phoneNumber);
    user.save();
    response.success("Success");
  } else {
    response.error("Invalid verification code.");
  }
});
