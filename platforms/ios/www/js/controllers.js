angular.module('starter.controllers', [])
.controller('NavCtrl', function($rootScope, $scope, $state, $stateParams,$ionicSideMenuDelegate,$ionicPopup,ParseService,$ionicLoading) {

        $rootScope.alert = function(title, message){
            var alertPopup = $ionicPopup.alert({
                title: title,
                template: message
            });
            alertPopup.then(function(res) {
            });
        }
        $rootScope.back = function(){
            history.go(-1);
        }

        $rootScope.showLoading = function(message){
            $ionicLoading.show({
                template: message
            });
        }
        $rootScope.hideLoading = function(){
            $ionicLoading.hide();
        }

        $rootScope.goToBalanceOverview = function(){
            $state.go('tab.balance-overview');
        }

        $rootScope.goToBalanceGroup = function(){
            $state.go('tab.balance-group');
        }

        $rootScope.selectedGroup = undefined;

        $rootScope.openCurrencies = function(currentState, data){
            $rootScope.data = data;
            console.log("openCurrencies");
            $rootScope.currentState = currentState;
            $state.go('currencies');
        }

    })
.controller('BalanceOverviewCtrl', function($rootScope, $scope, $state,ParseService) {

        console.log("controller - BalanceOverviewCtrl start | selectedGroup ");
//        console.log("controller - BalanceOverviewCtrl start | rootScope user = "+$rootScope.user.get('username'));
        $rootScope.user = ParseService.getUser();
        $rootScope.user.get('default_currency').fetch();
        $scope.balance = {};
        $scope.balance.amount = 0;
        $scope.balance.currency = $rootScope.user.get('default_currency');
        $scope.loading = 'visible';

        $scope.loadOverview = function(){
            //Load Groups & Personal Accounts
            //Then calculate Total Balance
            var user = new SUser();
            $scope.loading = 'visible';
            user.getBalanceOverview($rootScope.user,function(bals){
                $scope.balancelist = bals;

                for (var i in bals){
                    if ($rootScope.user.get('default_currency').get('code')!=bals[i].get('currency').get('code')){

                        $scope.balance.amount += Number(bals[i].get('balance')) * getFXRate(bals[i].get('currency').get('code'),$rootScope.user.get('default_currency').get('code'));

                    }else{
                        $scope.balance.amount += Number(bals[i].get('balance'));
                    }

                    //for personal group set your friend user
                    if (bals[i].get('group')){
                        if (bals[i].get('group').get('ispersonal')==true){
                            if (bals[i].get('group').get('user1').id==$rootScope.user.id){
                                $scope.balancelist[i].set('frienduser',bals[i].get('group').get('user2'));
                            }else{
                                $scope.balancelist[i].set('frienduser',bals[i].get('group').get('user1'));
                            }
                            $scope.balancelist[i].set('balance',Number($scope.balancelist[i].get('balance'))*-1);
                        }
                    }

                }
                $scope.balancelistFiltered = $scope.balancelist;

                $scope.loading = 'hidden';
                $scope.$apply();
                $scope.$broadcast('scroll.refreshComplete');
            })
        }

        $scope.openBalance = function(balance){
            $rootScope.selectedGroup = balance.get('group');
            if (balance.get('group').get('ispersonal')!=true){
                //Group Account goes to BalanceGroup

                $rootScope.selectedFriend = undefined;
                $state.go('tab.balance-group');
            }else{

                //Personal Account will go to Transaction Detail i.e. BalanceDetail
//                $rootScope.selectedGroup = undefined;
                $rootScope.selectedFriend = balance.get('frienduser');
                $state.go('tab.balance-detail');
            }


        }
        $scope.sendPerson = function(user){
            $rootScope.selectedGroup = undefined;
            $rootScope.selectedFriend = user;
            $rootScope.inviteEmail = undefined;
            $state.go('tab.send-remote');
        }

        $scope.editGroup = function(group){
            console.log("Balance Overview Ctrl - editGroup");
            $rootScope.selectedGroup = group;
            $state.go('tab.setupgroup-edit');
        }

        $scope.searchFriend = function(searchtext){
            console.log("searchFriend");
            var result = [];
            for (var i in $scope.balancelist){
                if ($scope.balancelist[i].get('group').get('ispersonal')){
                    if ($scope.balancelist[i].get('frienduser').getUsername().toLowerCase().indexOf(searchtext.toLowerCase())!=-1){
                        result.push($scope.balancelist[i]);
                    }

                }else{
                    if ($scope.balancelist[i].get('group').get('group').toLowerCase().indexOf(searchtext.toLowerCase())!=-1){
                        result.push($scope.balancelist[i]);
                    }
                }
            }
            $scope.balancelistFiltered = result;

        }

        $scope.loadOverview();

})
.controller('BalanceDetailCtrl', function($rootScope, $scope,$state) {
        if (!$rootScope.selectedGroup){
            $state.go('tab.balance-overview');
        }
        console.log("controller - BalanceDetailCtrl start | selectedGroup ");
        $scope.balance = Parse.Object.extend("balance");
        $scope.transactions = [];
        $scope.loading = 'visible';
//        $scope.title = $rootScope.selectedGroup.get('group');
//        $scope.user = ParseService.getUser();


        //Load User Balance
        var user = new SUser();

        $scope.loading = 'visible';
        user.getBalanceByEmail($rootScope.selectedGroup,$rootScope.user, function(balance){
            $scope.balance = balance;
            console.log("controller balance - Balance = "+$scope.balance.get('balance'));
            $scope.$apply();
        })

        //Load recent transactions
        var tran = new Transaction();
        tran.getRelatedTran($rootScope.selectedGroup.id,$rootScope.user.get('email'), function(transactions){
            $scope.transactions = transactions;
            $scope.loading = 'hidden';
            $scope.$apply();


        })

        $scope.goToSend = function(){
            $rootScope.selectedGroup = undefined;
            $rootScope.inviteEmail = undefined;
            $state.go('tab.send-remote');
        }

})
.controller('BalanceGroupCtrl', function($rootScope, $scope, $state) {

        if (!$rootScope.selectedGroup){
            $state.go('tab.balance-overview');
        }
        $scope.loading = 'visible';
        //Load User Balance
        $scope.loadGroup = function(){
            $scope.loading = 'visible';
            var user = new SUser();
            user.getBalanceByEmail($rootScope.selectedGroup, $rootScope.user, function(balance){
                $scope.balance = balance;
                $scope.$apply();
            })

            //Load Friends Balance
            user.getBalanceByEmails($rootScope.selectedGroup,$rootScope.selectedGroup.get('friends'), function(balances){
                $scope.balances = balances;
                $scope.balancesFiltered = balances;

                $scope.loading = 'hidden';
                $scope.$apply();
            })
        }

        $scope.openTrans = function(bal){
            $state.go('tab.balance-detail');
        }
        $scope.goToSend = function(user){
            $rootScope.selectedFriend = user;
            $rootScope.inviteEmail = undefined;
            $state.go('tab.send-remote');
        }
        $scope.goToGroupEdit = function(group){
            $rootScope.selectedGroup = group;

            $state.go('tab.setupgroup-edit');
        }

        $scope.searchFriend = function(searchtext){
            console.log("searchFriend");
            var result = [];
            for (var i in $scope.balances){
                if ($scope.balances[i].get('user').getUsername().toLowerCase().indexOf(searchtext.toLowerCase())!=-1){
                    result.push($scope.balances[i]);
                }

            }
            $scope.balancesFiltered = result;

        }

        $scope.loadGroup();

})
.controller('SendCtrl', function($rootScope,$scope, $location, ParseService, Common, $state,$filter) {
        $rootScope.user.get('default_currency').fetch({
            success:function(r){
                $rootScope.$apply();
            }
        });


        $scope.sendamount = {};
        $scope.sendnote = {};
        $scope.sendform = {};

        $scope.selectGroup = function(sendform){
            console.log("SendCtrl - sendform :"+sendform);
            $scope.sendform = sendform;
            $state.go('tab.send-group');
        }
        $scope.clearGroup = function(){
            console.log("Clear Group");
            $rootScope.selectedGroup = undefined;
            $rootScope.selectedFriend = undefined;

        }
        $scope.selectUser = function(sendform){
            console.log("SendCtrl - sendform :"+sendform);
            $scope.sendform = sendform;
            $state.go('tab.send-selectuser');
        }

        var qrcode;
        $scope.initQRcode = function(){
            qrcode = new QRCode("qrcode", {
                text: "",
                width: 128,
                height: 128,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.L
            });
        }

        $scope.makeQRCode = function (sendform){
            if (!qrcode)
                $scope.initQRcode();

            var tranId = Common.getID();
            var email = $rootScope.user.get('email');
            var groupId = "";
            var groupname = "";
            var currencyId = "";

            if ($rootScope.selectedGroup){
                groupId = $rootScope.selectedGroup.id;
                groupname = $rootScope.selectedGroup.get('group');
            }

            if (sendform.amount){
                $rootScope.sendamount = sendform.amount;
            }
            if (sendform.note){
                $rootScope.sendnote = sendform.note;
            }

            if ($rootScope.selectedCurrency){
                currencyId = $rootScope.selectedCurrency.id;
            }else{
                currencyId = $rootScope.user.get('default_currency').id;
            }
            var sendString = tranId+"|"+ email +"|"+ $rootScope.sendamount +"|"+ $rootScope.sendnote +"|"+groupId+"|"+groupname + "|"+currencyId;
            console.log(sendString.toString());
            sendString = Common.encrypt(sendString.toString());

            qrcode.clear(); // clear the code.

            qrcode.makeCode(sendString.toString()); // make another code.
        }
        $scope.goToRemote = function(sendform){
            if (sendform.amount){
                $rootScope.sendamount = sendform.amount;
            }
            if (sendform.note){
                $rootScope.sendnote = sendform.note;
            }
            sendform.amount = $rootScope.sendamount;
            sendform.note = $rootScope.sendnote;
            console.log('sendamount' + $rootScope.sendamount );
            console.log('sendnote'+ $rootScope.sendnote );

            $state.go('tab.send-remote');
        }

        $scope.processSend = function(sendform){

            if($rootScope.inviteEmail){
                if(sendform.inviteEmail){
                    console.log("invite Email ", sendform.inviteEmail);
                    $rootScope.inviteEmail = sendform.inviteEmail;
                }

                $scope.createAccount($rootScope.inviteEmail,sendform);
            }else{
                console.log("SendForm amount ", sendform.amount);
                console.log("sendform note ", sendform.note);
                $scope.sendRemote(sendform);
            }
        }
        $scope.createAccount = function(email,sendform){

            var user = new SUser();
            user.createTempAccount(email, function(suser){
                if (suser.message){
                    $rootScope.alert("Create Account Failed",suser.message);
                    throw ("Create Account Failed");
                }
                $rootScope.selectedFriend = suser;
                console.log("Account Created User = " + suser.getUsername());
                //create account done
                //send email to reset password
                Parse.User.requestPasswordReset(email, {
                    success: function() {
                        // Password reset request was sent successfully
                        console.log("Password reset send to new user");
                    },
                    error: function(error) {
                        // Show the error message somewhere
                        $rootScope.alert("Error:  " , error.message);
                    }
                });
                //call sendRemote to save tran
                $scope.sendRemote(sendform);

                //Sign back into your own account using $rootScope.user
                Parse.User.become($rootScope.user.getSessionToken(), {
                          success:function(suser){
                          console.log('relogin done');
                      },error:function(error){
                        console.log(error.message);
                    }
                })

                //Now send an email to let user know, 1) there's an account with credit 2) another email to reset password
                $scope.sendEmailToNewUser(email, suser.getUsername(),$rootScope.user.getUsername());
            });
        }
        $scope.sendEmailToNewUser= function(email,username, from) {
            var body = "Dear new Settler, ";
            body += "<p><br>Congrats! Your friend <b>"+from+ "</b> paid you with Settle.</p>";
            body += "<p>Please download 'Settle' app from Apple Store or Google Play</p>";
            body += "<p>Your account name is <b>"+ username + "</b></p>";
            body += "<p>There's a separate email to set your password.</p>";
            body += "<p>Your truly, <br>The Settle Team</p>";

            if(window.plugins && window.plugins.emailComposer) {
                window.plugins.emailComposer.showEmailComposerWithCallback(function(result) {
                        console.log("Response -> " + result);
                    },
                    "[Settle] Your friend paid you with Settle  ", // Subject
                    body,                      // Body
                    [email],    // To
                    null,                    // CC
                    null,                    // BCC
                    true,                   // isHTML
                    null,                    // Attachments
                    null);                   // Attachment Data
            }
        }
        $scope.sendRemote = function(sendform){
            $rootScope.showLoading('Sending...');

            if(!$rootScope.selectedFriend){
                $rootScope.alert("No friend selected", "Please pick someone to pay");
                $rootScope.hideLoading();
                throw ("No friend selected");
            }

//            if (sendform.amount){
//                $rootScope.sendamount = sendform.amount;
//            }
//            if (sendform.note){
//                $rootScope.sendnote = sendform.note;
//            }

            var currencyId="";
            if ($rootScope.selectedCurrency){
                currencyId = $rootScope.selectedCurrency.id;
            }else{
                currencyId = $rootScope.user.get('default_currency').id;
            }

            console.log("amount"+$rootScope.sendamount )
            console.log("note"+ $rootScope.sendnote )
            if (sendform.sendamount){
                $rootScope.alert("Invalid amount","Please Enter Again");
                throw ("invalid amount");
            }

                var tranId = Common.getID();
                var location;
                if (!$rootScope.selectedGroup){
                    console.log("SendCtrl.sendRemote  Finding Person Group ");
                    var friendemails = [$scope.user.get('email'),$rootScope.selectedFriend.get('email')];
                    var friendnames = [$scope.user.get('username'),$rootScope.selectedFriend.get('username')];
                    var user = new SUser();
                    user.getPersonalListByEmails(friendemails, friendnames, function(friendlist){
                        console.log("SendCtrl.sendRemote "+ friendlist.id);
                        ParseService.recordQRCode(friendlist, tranId,currencyId,sendform.amount,$rootScope.user.get('email'),$rootScope.selectedFriend.get('email'),sendform.note,location , $scope.user,$rootScope.selectedFriend,function(r){

                            if (r.message){
                                $rootScope.alert('Error',r.message);
                                $rootScope.hideLoading();
                            }else{

                                $scope.remoteSendConfirmation(r);
                                $rootScope.hideLoading();
                            }

                        });
                    })
                }else{
                    ParseService.recordQRCode($rootScope.selectedGroup, tranId,currencyId,sendform.amount,$rootScope.user.get('email'),$rootScope.selectedFriend.get('email'),sendform.note,location, $scope.user,$rootScope.selectedFriend,function(r){

                        if (r.message){
                            $rootScope.hideLoading();
                            $rootScope.alert('Error',r.message);

                        }else{
                            $rootScope.hideLoading();
                            $scope.remoteSendConfirmation(r);

                        }
                    });

                }
            }

        $scope.remoteSendConfirmation = function(tran){
            var currencyCode="";
            if ($rootScope.selectedCurrency){
                currencyCode = $rootScope.selectedCurrency.get('code');
            }else{
                currencyCode = $rootScope.user.get('default_currency').get('code');
            }

            var amountFormatted = $filter('currency')(tran.get('amount'),currencyCode);
//                Number(tran.get('amount')).toLocaleString();
            $rootScope.alert('Sent Successful',amountFormatted + ' is sent to ' + tran.get('toname'));

            tran.get('touser').fetch({
                    success:function(r){
                        var message = tran.get('fromname') + " paid you " + amountFormatted;
                        if (tran.get('note')){
                            message += "\n ("+tran.get('note')+")";
                        }

                        sendPushMessage(message, tran.get('touser').id);
                    }
            });

        }


        $scope.goToQRCode = function(sendform){
            $state.go('tab.send');
        }

        $scope.sendPushMessage = function(){
            sendPushMessage();
        }

})
.controller('SendGroupCtrl', function($rootScope,$scope, $location, ParseService, $ionicPopup, $state) {

        $scope.loadGroup = function(){
            var user = new SUser();
            user.getFriendListAll(ParseService.getUser().get('email'), false, function(friendlists){
                console.log("SendGroupCtrl Ctrl - load Group Completed get Friendall");
                $scope.friendlists = friendlists;
                $scope.$apply();
                $rootScope.$broadcast('scroll.refreshComplete');

            })
        }

        $scope.clearSearch = function(search){
            console.log("clear");
            search = '';
//            document.getElementById('search_text').value = '';
        }

        $scope.addGroup = function (){
            $scope.data = {};
            var myPopup = $ionicPopup.show({
                template: '<input type="text" ng-model="data.group">',
                title: 'Add Group',
                subTitle: 'Please enter group name',
                scope: $scope,
                buttons: [
                    { text: 'Cancel' },
                    {
                        text: '<b>Save</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            if (!$scope.data.group) {
                                //don't allow the user to close unless he enters wifi password
                                e.preventDefault();
                            } else {
                                //Save new Friend list
                                var Friendlist = Parse.Object.extend("friendlist");
                                var fl = new Friendlist();
                                fl.set('group',$scope.data.group);
                                //fl.set('email',ParseService.getUser().get('email'));
                                fl.addUnique('friends',ParseService.getUser().get('email'));
                                fl.save(null,{
                                    success: function (result) {
                                        console.log("Add New Group Successfully");
                                        $scope.loadGroup();
                                    }, error: function (error) {
                                        alert("Error: " + error.code + " " + error.message);
                                    }
                                })
                            }
                        }
                    }
                ]
            });
        }

        $scope.selectGroup=function(group){
            $rootScope.selectedGroup = group;
            $rootScope.selectedFriend = undefined;
            $rootScope.inviteEmail = undefined;
            history.go(-1);
//            $state.go('tab.send');
        }
        $scope.loadGroup();
})

.controller('SelectUserCtrl', function($rootScope,$scope, $location, ParseService, $ionicPopup, $state) {

        $scope.loadRelatedPersonalUsers = function(){
            var user = new SUser();
            $rootScope.showLoading("Loading...");
            user.findPersonalList($rootScope.user.get('email'), function(friendlists){
                console.log("SelectUserCtrl Ctrl - load Group Completed get Friendall ");

                var Friendlist = Parse.Object.extend("friendlist");
                var fl = new Friendlist();
                var relatedFriends = [];
                for (i in friendlists){
                    for (j in friendlists[i].get('friendnames')){
                        if ($rootScope.user.get('username')!=friendlists[i].get('friendnames')[j] && friendlists[i].get('friendnames')[j]!=null)
                            fl.addUnique('friendnames',friendlists[i].get('friendnames')[j]);
                    }
                }
                $scope.relatedFriendList = fl.get('friendnames');
                $scope.relatedFriendListFiltered = fl.get('friendnames');
                console.log("SelectUserCtrl Ctrl - Related Friends = "+ fl.get('friendnames').length);
                //console.log("SelectUserCtrl Ctrl - Related Friends = "+ fl.get('friendnames'));
                $rootScope.hideLoading();
                $scope.$apply();

            })
        }

        $scope.searchFriend = function(searchtext){
            console.log("searchFriend");
            $scope.relatedFriendListFiltered = $scope.relatedFriendList.filter(function(val,index,array){
                return (val.toLowerCase().indexOf(searchtext.toLowerCase())!=-1);
            })
        }
        $scope.loadGroupRelatedUsers = function(){
            $rootScope.showLoading("Loading...");
            var Friendlist = Parse.Object.extend("friendlist");
            var query = new Parse.Query(Friendlist);

            query.get($rootScope.selectedGroup.id,{
                success:function(group){
                    console.log(group.length);
                    $scope.relatedFriendList = group.get('friendnames');
                    $scope.relatedFriendListFiltered = group.get('friendnames');
                    $scope.$apply();
                    $rootScope.hideLoading();
                },error:function(error){
                    console.log(error.message);
                    $rootScope.hideLoading();
                }
            })
        }
        $scope.loadFriends = function(){
            if ($rootScope.selectedGroup){
                $scope.loadGroupRelatedUsers();
            }else{
                $scope.loadRelatedPersonalUsers();
            }
            $rootScope.$broadcast('scroll.refreshComplete');
        }
        $scope.loadFriends();

        $scope.selectFriend=function(username){
            $rootScope.showLoading("Loading...")
            console.log("selectFriend - username = " + username);
            var user = Parse.Object.extend('User');
            var query = new Parse.Query(user);
            query.include('default_currency');
            query.equalTo('username',username);
            query.find({
                success:function(users){
                    if (users){
                        $rootScope.selectedFriend = users[0];
                    }else{
                        $rootScope.selectedFriend = undefined;
                    }

                    $rootScope.$apply();
                    $rootScope.hideLoading();
//                    $state.go('tab.send');
                    history.go(-1);
                },error:function(obj, error){
                    console.err(error.message);
                    $rootScope.hideLoading();
                    history.go(-1);

                }
            })

        }

        $scope.findOrInvite = function(email,InviteForm){
            console.log("findOrInvite email = "+email);
            var user = new SUser();
            user.getUserByEmail(email, function(ruser){

                //If user by email, if found call $scope.selectFriend()
                if (ruser){
                    console.log("findOrInvite user = "+ruser.get('username'));
                    $scope.selectFriend(ruser.get('username'));
                }else{
                    console.log("findOrInvite user not found");
                    if (InviteForm.input.$error.email){
                        $rootScope.alert('Invalid email', 'Please check the email');
                        throw ("Invalid Email Invite");
                    }
                    $rootScope.inviteEmail=email;
                    $rootScope.alert("Not a 'Settler' yet","We will create an account to make payment. An email will be sent to notify your friend to claim the amount");
                    $state.go('tab.send-remote');
                    $rootScope.$apply();

                    //If not found, create a balance, and transaction
                    //Then send email to ask user to signup

                }
            })

        }


    })
.controller('ReceiveCtrl', function($rootScope,$scope, $location, ParseService, Common) {
        console.log("Receive Ctrl start");
        $scope.user = ParseService.getUser();
        var location;

//        ParseService.getLocation(function(r){
//            location=r;
//        });

        $scope.scan = function(){
            console.log("Receive Ctrl enter scan");
            document.getElementById("info").innerHTML="";

            $rootScope.showLoading('Receving...');
            var scanner = cordova.require("cordova/plugin/BarcodeScanner");

            scanner.scan( function (result) {

                console.log("Scanner result: \n" +
                    "text: " + result.text + "\n" +
                    "format: " + result.format + "\n" +
                    "cancelled: " + result.cancelled + "\n");

                if (result.cancelled == 1){
                    $rootScope.hideLoading();
                    throw "Scanning Canceled";
                }

                //Decrypt Result String
                var resultString = Common.decrypt(result.text);
                var res = resultString.split("|");
                var display = "";

                if (res.length==1){
                    display = "This is NOT a 'Settle' QRCode! <BR><BR> Or, <BR><BR>you haven't scan a QRCode at all."
                    document.getElementById("info").innerHTML = display;
//                    $scope.scanresult.message = "This is NOT a 'Settle' QRCode! <BR><BR> Or, <BR><BR>you haven't scan a QRCode at all.";
                    $rootScope.hideLoading();
//                    $scope.$apply();
                }else{

                    var tranId = res[0];
                    var from = res[1];
                    var amount = res[2];
                    var note=res[3];
                    var groupId=res[4];
                    var groupName=res[5];
                    var currencyId=res[6];
                    console.log(currencyId);
                    var friendemail;


                    if (from == $rootScope.user.get('email')){
                        friendemail = to;
                    }else{
                        friendemail = from;
                    }

                    var user = new SUser();

                    user.getUserByEmail(friendemail, function(friend){
                        //If Group Id is Empty, then it's Personal/Direct Transfer
                        //1. Find Personal Group Or create one
                        console.log("ReceiveCtrl.scan  groupId = "+ groupId);
                        if (groupId==''){
                            console.log("ReceiveCtrl.scan  Finding Person Group groupId = "+ groupId);
                            var friendemails = [$scope.user.get('email'),friendemail];
                            var friendnames = [$scope.user.get('username'),friend.get('username')];

                            user.getPersonalListByEmails(friendemails, friendnames, function(friendlist){
                                console.log("ReceiveCtrl.scan "+ friendlist.id);
                                $scope.recordQRCode(friendlist, tranId,currencyId, amount,from,$scope.user.get('email'),note,location, $scope.user,friend);
                            })
                        }else{
                            console.log("ReceiveCtrl.scan Group Found = "+ groupId);
                            var Friendlist = Parse.Object.extend("friendlist");
                            var queryFd = new Parse.Query(Friendlist);


                            console.log("ReceiveCtrl.scan before got group");

                            queryFd.get(groupId,{
                                success:function(grp){
                                    console.log("ReceiveCtrl.scan successfully got group");
                                    $scope.recordQRCode(grp, tranId,currencyId,amount,from,$scope.user.get('email'),note,location, $scope.user,friend);
                                },error:function(obj, error){
                                    console.log("ReceiveCtrl.scan failed got group: "+ error.message);
//                                    throw (error.message);
                                }
                            })

                        }

                    })


                }
            }, function (error) {

                $rootScope.hideLoading();
                console.log("Scanning failed: ", error);
            } );
        }

        $scope.recordQRCode = function(group, id,currencyId,amount,from,youremail,note,location, user,friend){

            ParseService.recordQRCode(group,id,currencyId,amount,from,youremail,note,location, user,friend, function(r){
                //console.log("Controllers Receive - recordQRCode Successfully Return message = "+r.message);
                if (r.message== undefined){
                    console.log("Controllers Receive - recordQRCode Successfully");
//                                $scope.scanresult.group = group;
//                                $scope.scanresult.from = from;
//                                $scope.scanresult.amount = Number(amount);
//                                $scope.scanresult.note = note;
//                                $scope.$apply();

                    display = "<BR>Received : $" + amount +"<br><br>";

                    if (group.get('group')!=undefined){
                        display+="Group : " + group.get('group') +"<BR><BR>";
                    }

                    display+="From : " + from +"<BR><BR>";

                    if (note!='undefined'){
                        display+="Note : "+note;
                    }

                    document.getElementById("info").innerHTML = display;

                }else{
                    console.log("Controllers Receive - recordQRCode Failed");
//                                $scope.scanresult.message = r.message;
//                                $scope.$apply();
                    display = "<BR><b> " + r.message +"</b>";
                    document.getElementById("info").innerHTML = display;

                }
                $rootScope.hideLoading();

            });
        }
        $scope.scan();

})
.controller('SignUpCtrl', function($rootScope,$scope,$location,$state, $ionicPopup,ParseService) {
        // Called when the form is submitted
        console.log('Signup Ctrl');

        if ($rootScope.signupUser){
            console.log("setup signup user ", $rootScope.signupUser.username);
            $scope.user = $rootScope.signupUser;
        }

        $scope.goTologin = function(){
            $state.go('login');
        };

        $scope.signUp = function(userp) {
            console.log(scorePassword(userp.password));
            if (!checkPassStrength(userp.password) == 'good' || !checkPassStrength(userp.password) == 'strong'){
//                alert("Please Enter Password with At least 6 character with one upper case and numeric ");
                $rootScope.alert('Weak Password','Please Enter Password with At least 6 character with one upper case and numeric')

            }

            if (userp.password!=userp.con_password){
                $rootScope.alert('Password Problem','Confirm Password does not match')

                throw("Invalid Password");
            }

            if (userp.default_currency==undefined){
                $rootScope.alert('No Default Currency','Please pick one, if the currency is not found. Do let us know.');

                throw("No Default Currency");
            }
            if (userp.password!=userp.con_password){
                $rootScope.alert('Password Problem','Confirm Password does not match')

                throw("Invalid Password");
            }

            var user = new SUser();

                user.set("username", userp.name);
                user.set("password", userp.password);
                user.set("email", userp.email);

                user.set('default_currency',{__type: "Pointer", className: "currencies", objectId: userp.default_currency.id});

            ParseService.signUp(user, function(user) {
                // When service call is finished, navigate to items page
                $rootScope.alert('Congrats!',"You're now a 'Setters'");

                $rootScope.user = user;
                $state.go('tab.balance-overview');
            })
        };
})
.controller('SetupCtrl', function($rootScope,$scope, $state, $location, $ionicPopup,ParseService,$ionicLoading,Common) {

        console.log("controller - SetupCtrl start");

        $scope.user = ParseService.getUser();
        $scope.refreshUser = function(){
            if ($scope.user.get('default_currency')){
                $scope.user.get('default_currency').fetch({
                    success:function(curr){
                        $scope.$apply();
                        console.log("fetch default currency");
                    }
                });
            }

        }

        $scope.saveSetup = function(userp){
            var user = ParseService.getUser();
            $rootScope.showLoading('Saving...');


            if (!checkPassStrength(userp.password) == 'good' || !checkPassStrength(userp.password) == 'strong'){
//                alert("Please Enter Password with At least 6 character with one upper case and numeric ");
                $rootScope.alert('Weak Password', 'Please Enter Password with At least 6 character with one upper case and numeric')

                throw("Weak Password");
            }

            if (userp.password!=userp.con_password){
                $rootScope.alert('Password Mismatch','Please check and confirm your password')
                throw("Invalid Password");
            }
            user.set('password',userp.password);
            user.set('default_currency',$rootScope.user.get('default_currency'));
            user.save(null,{
                success: function(user){
                    console.log("Setup saved!");
                    $rootScope.hideLoading();
                },error:function(user, error){
                    $rootScope.hideLoading();
                    alert(error.message);
                }
            })

        }


        $scope.openCamera = function(){
            var options =   {
                quality: 30,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: 0,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
                encodingType: 0     // 0=JPG 1=PNG
            }
            $rootScope.showLoading('Loading...')

            navigator.camera.getPicture(onSuccess,onFail,options);
        }
        var onSuccess = function(FILE_URI) {

//            if (!Common.checkImageSize(DATA_URL.length)){
//                $rootScope.alert('Image Too Large','Cannot exceed 1 MB');
//
//                $rootScope.hideLoading();
//                throw("Image Size Error");
//            }
            resizeImage(FILE_URI, function(data){
                console.log("success got pic");

                var file = new Parse.File("icon.jpg", {base64:data});
//            var file = new Parse.File("icon.jpg", img);
                $rootScope.user.set('icon',file);
                $rootScope.user.save(null,{
                        success:function(user){
                            console.log("setup ctrl - user updated with new icon");
                            $rootScope.$apply();
                            $state.go('tab.setupuser');
                            $rootScope.hideLoading();
                        },error:function(obj,error){
                            $rootScope.hideLoading();
                            throw (error.message);
                        }
                    }
                );
            });

        };
        var onFail = function(e) {
            console.log("On fail " + e);
            $rootScope.hideLoading();
        }

        $scope.logout = function(){
            ParseService.logout();
            $state.go('login');

        };
        //To make sure default currency is displayed
        $scope.refreshUser();

})
.controller('SelectCurrencyCtrl', function($rootScope,$scope, $state) {

        $scope.loadCurrencies = function(){
            var Currencies = Parse.Object.extend('currencies');
            var query = new Parse.Query(Currencies);
            query.equalTo('enabled',true);
            query.find({
                success:function(currencies){
                    $scope.currencies = currencies;
                    $scope.$apply();
                }
            })
        }

        $scope.selectCurrency = function(curr){


            switch($rootScope.currentState) {
                case 'tab.send':
                    $rootScope.selectedCurrency=curr;
                    $state.go('tab.send');
                    break;
                case 'tab.send-remote':
                    $rootScope.selectedCurrency=curr;
                    $state.go('tab.send-remote');
                    break;
                case 'signup':

                    $rootScope.signupUser = $rootScope.data;
                    $rootScope.signupUser.default_currency=curr;

                    $state.go('signup');
                    break;
                case 'tab.setupuser':
                    $rootScope.user.set('default_currency',curr);
                    $state.go('tab.setupuser');
                    break;
                default:
                    $state.go('tab.setupuser');
            }
            $rootScope.currentState = "";
        }
        $scope.loadCurrencies();
})
.controller('SetupGroupCtrl', function($rootScope, $scope, $state, $stateParams,$ionicSideMenuDelegate,$ionicPopup,$ionicLoading,ParseService,Common) {

        //if (!$rootScope.selectedGroup){
        //    $state.go('tab.balance-overview');
        //}
        $scope.loadGroupSetup = function(){
            var user = new SUser();
            user.getFriendListAll(ParseService.getUser().get('email'), true, function(friendlists){
                $scope.friendlistsSetup = friendlists;
                $scope.$broadcast('scroll.refreshComplete');
                $scope.$apply();
            })
        }

        $scope.openCamera = function(group){
            var options =   {
                quality: 30,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: 0,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
                encodingType: 0     // 0=JPG 1=PNG
            }
            $scope.group = group;
            $rootScope.showLoading('Loading...');

            navigator.camera.getPicture(onSuccess,onFail,options);
        }
        var onSuccess = function(FILE_URI) {
//            if (!Common.checkImageSize(DATA_URL.length)){
//                $rootScope.alert('Image Too Large','Cannot exceed 1 MB');
//
//                $rootScope.hideLoading();
//                throw("Image Size Error");
//            }

            resizeImage(FILE_URI, function(data){
                console.log("success got pic");
                var file = new Parse.File("icon.jpg", {base64:data});
                console.log("before group save");
                $rootScope.selectedGroup.set('icon',file);

                $rootScope.selectedGroup.save(null,{
                        success:function(group){
                            console.log("setup ctrl - friendlist/group updated with new icon");
                            $rootScope.hideLoading();
//                            $rootScope.selectedGroup=group;
                            $scope.$apply();


                        },error:function(obj,error){
                            $rootScope.hideLoading();
                            throw (error.message);
                        }
                    });
            });


        }
        var onFail = function(e) {
            console.log("On fail " + e);
            $rootScope.hideLoading();
        }
        $scope.saveGroup = function(group){
            $rootScope.showLoading('Saving...');

            if(group)
                $rootScope.selectedGroup.set('group', group.name);
            $rootScope.selectedGroup.save(null,{
                success:function(group){
                    console.log("SetupGroupEditCtrl - saveGroup done");
                    $rootScope.hideLoading();
                    $scope.back();

                },error:function(obj,error){
                    $rootScope.hideLoading();
                    alert (error.message);
                }
            })
        }
        $scope.editGroup = function(group){
            $rootScope.selectedGroup = group;
            $state.go('tab.setupgroup-edit');
        }
        $scope.loadGroupSetup();
})
.controller('LoginCtrl', function( $rootScope,$scope, $state, $ionicPopup, $location, ParseService) {

        $scope.goTosignUp = function(){
            //$location.path('/tab/signup');
//            $route.refresh();
            $state.transitionTo('signup', '', {
                reload: true,
                inherit: false,
                notify: true
            });
        }

        $scope.forgotPassword = function(){
            // An elaborate, custom popup
            $scope.resetpassword = {};


            var passwordPopup = $ionicPopup.show({
                template: '<input type="email" ng-model="resetpassword.email">',
                title: 'Enter your email',
                subTitle: 'An email will be sent to reset your password',
                scope: $scope,
                buttons: [
                    { text: 'Cancel' },
                    {
                        text: '<b>Reset</b>',
                        type: 'button-stable',
                        onTap: function(e) {

                            if (!$scope.resetpassword.email) {
                                e.preventDefault();

                            } else {
                                Parse.User.requestPasswordReset($scope.resetpassword.email, {
                                    success: function() {
                                        // Password reset request was sent successfully
                                        alert("Please check your email, and reset your password")
                                    },
                                    error: function(error) {
                                        // Show the error message somewhere
                                        alert("Error:  " + error.message);
                                    }
                                });
//                                return $scope.resetpassword.email;
                            }
                        }
                    }
                ]
            });


        }

        $scope.login = function (user){

            ParseService.login(user.username, user.password, function(user){

                if(user.message){
                    $rootScope.alert('Login Error', user.message);

                }


            console.log("controller - success login");
                $rootScope.user = user;
                if ($rootScope.user.get('default_currency')){
                    $rootScope.user.get('default_currency').fetch({
                        success:function(r){
                            $rootScope.$apply();
                            console.log("fetch default currency");
                        }
                    });
                }
                $rootScope.$apply();

                if (window.plugins && window.plugins.pushNotification){
                    subscribe(user.id);
                }

                $state.go('tab.balance-overview');
//                $rootScope.loadGroup();
                console.log("controller - redirected success login");
            });
        }

        if (ParseService.getUser()){
            $state.go('tab.balance-overview');
        }


});