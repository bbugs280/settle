angular.module('starter.controllers', [])
.controller('IntroCtrl', function($rootScope, $scope, $state,$ionicSlideBoxDelegate) {
        $rootScope.intro = true;


        $scope.startApp = function() {
            // Set a flag that we finished the tutorial
            window.localStorage['didTutorial'] = true;
            $state.go('tab.balance-overview');
        };

        $scope.next = function() {
            $ionicSlideBoxDelegate.next();
        };
        $scope.previous = function() {
            $ionicSlideBoxDelegate.previous();
        };
        $scope.slideChanged = function(index) {
            $scope.slideIndex = index;
        };
})
.controller('FriendsCtrl', function($rootScope, $scope, $state, $ionicModal) {
        //$scope.Friends;
        //$scope.FriendsFiltered;

        $scope.loadFriends = function(){
        console.log("loadFriends is called");
            $scope.loading = 'visible';
        function onSuccess(contacts) {
            console.log('Contacts Found ' + contacts.length + ' contacts.');
            console.log("country Code = "+$rootScope.countryCode);
            //Construct phone array
            var phoneArray=[];
            for (var i=0;i<contacts.length;i++){
                if(contacts[i].phoneNumbers && contacts[i].phoneNumbers.length){
                    for (var j=0;j<contacts[i].phoneNumbers.length;j++){
                        var phone_no = contacts[i].phoneNumbers[j].value;
//                            phone = phone.replace(/\s+/g, '');
//                            phone = phone.replace(/[-&\/\\#,()$~%.'":*?<>{}]/g, '');
                            phone_no=cleanPhone(phone_no);

                            if (isValidNumber(phone_no,$rootScope.countryCode)){
                                phone_no=formatE164($rootScope.countryCode,phone_no);
                                //console.log("valid = " +phone_no);
                                phoneArray.push(phone_no);
                            }
                    }
                }
            }

            $scope.loadFromParse(phoneArray);
        }

        function onError(contactError) {
            console.log('load Contact from phone error! ');
            $scope.$broadcast('scroll.refreshComplete');
        }


        // find all contacts with values in Phone Numbers
        if (window.navigator && window.navigator.contacts){
            var options      = new ContactFindOptions();
            options.filter   = "";
            options.multiple = true;
            options.desiredFields = [navigator.contacts.fieldType.phoneNumbers];

            var fields       = [navigator.contacts.fieldType.phoneNumbers];
            navigator.contacts.find(fields, onSuccess, onError, options);
        }
    }

        $scope.loadFromParse = function(phoneArray){
            //Now get user from Parse using Array
            $scope.loading = 'visible';
            console.log("phoneArray ="+ phoneArray.length);
            var User = Parse.Object.extend("User");
            var query = new Parse.Query(User);
            query.containedIn('phone_number', phoneArray);
            query.addAscending('username');
            query.find({
                success:function(users){
                    console.log("found user = "+users.length);
                    $rootScope.Friends=users;
                    $scope.FriendsFiltered=users;
                    $scope.$apply();
                    $scope.loading = 'hidden';
                    $scope.$broadcast('scroll.refreshComplete');
                }, error:function(obj, error){
                    $scope.loading = 'hidden';
                    console.log("error "+ error.message);
                }
            });
        }

        $scope.loadInit = function(){

            if (!$rootScope.Friends) {

                $scope.loadFriends();
            }else{
                $scope.FriendsFiltered = $rootScope.Friends;
            }
        }
        $scope.searchFriend = function(txt){
            console.log("searchFriend "+txt);
            var result = [];
            for (var i in $rootScope.Friends){
                if ($rootScope.Friends[i].getUsername().toLowerCase().indexOf(txt.toLowerCase())!=-1){
                    console.log($rootScope.Friends[i].getUsername());
                    result.push($rootScope.Friends[i]);
                }
            }
            $scope.FriendsFiltered = result;
        }

        $scope.goToSend = function(user){
            console.log("goToSend");
            $rootScope.selectedFriend = user;
            $rootScope.inviteEmail = undefined;
            $state.go('tab.send-remote');
        }
        $scope.getInfo = function(user){

        }

        $ionicModal.fromTemplateUrl('templates/user-invite-options.html',{
            scope:$scope
        }).then(function(modal){
            $scope.modal=modal;

        });
        $scope.showInviteOptions = function() {
            $scope.modal.show();
        }

        $scope.hideInviteOptions = function() {
            $scope.modal.hide();
        }

        $scope.inviteBySMS = function(){
            navigator.contacts.pickContact(function(contact){
                console.log('The following contact has been selected:' + JSON.stringify(contact));
                //var messageInfo = {
                //    phoneNumber: contact.phoneNumber[0].value,
                //    textMessage: "This is a test message"
                //};

                //sms.sendMessage(messageInfo, function(message) {
                //    console.log("success: " + message);
                //}, function(error) {
                //    console.log("code: " + error.code + ", message: " + error.message);
                //});
                $scope.hideInviteOptions();
            },function(err){
                console.log('Error: ' + err);
                $scope.hideInviteOptions();
            });
        }
        $scope.loadInit();
})
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
        $rootScope.goToIntro = function(){
            $state.go('intro');
        }
        $rootScope.showLoading = function(message){
            $ionicLoading.show({
                template: message
            });
        }


        $rootScope.goToUserSetup = function(){
            $state.go('tab.setupuser');
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
        $rootScope.intro = false;
        console.log("controller - BalanceOverviewCtrl start");
        $scope.balance = {};
        $scope.balance.amount = 0;
        $scope.loading = 'visible';
//        console.log("controller - BalanceOverviewCtrl start | rootScope user = "+$rootScope.user.get('username'));
        $rootScope.user = ParseService.getUser();
        console.log($rootScope.user.getUsername());
        $rootScope.user.get('default_currency').fetch({
            success:function(r){
                $rootScope.$apply();
                $scope.loadOverview();

            }
        });


        $scope.loadOverview = function(){
            //Load Groups & Personal Accounts
            //Then calculate Total Balance
            var user = new SUser();
            $scope.loading = 'visible';

            user.getBalanceOverview($rootScope.user,function(bals){
                $scope.balance.amount = 0;
                $scope.balancelist = bals;
                console.log("loadOverview ", $rootScope.user.get('default_currency').get('code'));
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
                            $scope.balancelist[i].set('balance',Number($scope.balancelist[i].get('balance')));
                        }
                    }

                }
                $scope.balancelistFiltered = $scope.balancelist;
                $scope.$broadcast('scroll.refreshComplete');
                $scope.loading = 'hidden';
                $scope.$apply();

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
        $scope.loadTrans = function(){
            $scope.loading = 'visible';
            user.getBalanceByGroupAndUser($rootScope.selectedGroup,$rootScope.user, function(balance){
                $scope.balance = balance;
                console.log("controller balance - Balance = "+$scope.balance.get('balance'));
                $scope.$apply();
            })

            //Load recent transactions
            var tran = new Transaction();
            tran.getRelatedTran($rootScope.selectedGroup.id,$rootScope.user, function(transactions){
                $scope.transactions = transactions;
                $scope.loading = 'hidden';
                $scope.$broadcast('scroll.refreshComplete');
                $scope.$apply();

            })
        }

        $scope.loadTrans();

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
            user.getBalanceByGroupAndUser($rootScope.selectedGroup, $rootScope.user, function(balance){
                $scope.balance = balance;
                $scope.$apply();
            })

            //Load Friends Balance
            user.getBalanceByGroupAndUserIDs($rootScope.selectedGroup,$rootScope.selectedGroup.get('friend_userid'), function(balances){
                $scope.balances = balances;
                $scope.balancesFiltered = balances;
                $scope.$broadcast('scroll.refreshComplete');
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
            var fromUserId = $rootScope.user.id;

            if ($rootScope.selectedGroup){
                groupId = $rootScope.selectedGroup.id;
                groupname = $rootScope.selectedGroup.get('group');
            }

            if (isNaN(sendform.amount)){
                $rootScope.alert("Invalid Amount");
                throw ("invalid amount");
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
            var sendString = tranId+"|"+ email +"|"+ $rootScope.sendamount +"|"+ $rootScope.sendnote +"|"+groupId+"|"+groupname + "|"+currencyId+"|"+fromUserId;
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

                    console.log("invite Email sendform.inviteEmail= ", sendform.inviteEmail);
                    console.log("invite Email $rootScope.inviteEmail= ", $rootScope.inviteEmail);
                    if (sendform.inviteEmail.$error.email){
                        $rootScope.alert('Invalid email', 'Please check the email');
                        throw ("Invalid Email Invite");
                    }
                    $rootScope.inviteEmail = sendform.inviteEmail;
                }

                $scope.createAccount($rootScope.inviteEmail,sendform);
            }else{

                if(isNaN(sendform.amount)){
                    $rootScope.alert("Invalid amount");
                    throw ("invalid amount");
                }
                console.log("SendForm amount ", sendform.amount);
                console.log("sendform note ", sendform.note);
                $scope.sendRemote(sendform);
            }
        }
        $scope.createAccount = function(email,sendform){

            var user = new SUser();
            user.createTempAccount(email, $rootScope.user.get('default_currency'), function(suser){
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
            body += "<p><br>Hi! I have just paid you with Settle.";
            body += "<img src='https://yeungvincent.files.wordpress.com/2014/11/icon.png' width='100' style='border-radius:10px;text-align: center'></p>";
            body += "<p>Please download from Apple Store [<a href='http://goo.gl/FQyHHq'>download</a>]</p>";
            body += "<p>Or Google Play [<a href='http://goo.gl/nQtLFL'>download</a>] </p>";
            body += "<p>Your account name is <b>"+ username + "</b></p>";
            body += "<p>There's a separate email to set your password.</p>";
            body += "<p>Your truly, ";

            console.log(body);
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
                    var userIdArray = [$scope.user.id,$rootScope.selectedFriend.id];
                    var friendemails = [$scope.user.get('email'),$rootScope.selectedFriend.get('email')];
                    var friendnames = [$scope.user.get('username'),$rootScope.selectedFriend.get('username')];
                    var user = new SUser();
                    user.getPersonalListByEmails(userIdArray,friendemails, friendnames, function(friendlist){
                        console.log("SendCtrl.sendRemote "+ friendlist.id);
                        ParseService.recordQRCode(friendlist, tranId,currencyId,sendform.amount,$rootScope.user,$rootScope.selectedFriend,sendform.note,location , $scope.user,$rootScope.selectedFriend,function(r){

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
                    ParseService.recordQRCode($rootScope.selectedGroup, tranId,currencyId,sendform.amount,$rootScope.user,$rootScope.selectedFriend,sendform.note,location, $scope.user,$rootScope.selectedFriend,function(r){

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

                        sendPushMessage(message, "P_"+tran.get('touser').id);
                    }
            });

        }

        $scope.cancelInvite = function(){
            $rootScope.inviteEmail = undefined;

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
            user.getFriendListAll(ParseService.getUser().id, false, function(friendlists){
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

                                fl.addUnique('friends',ParseService.getUser().get('email'));
                                fl.addUnique('friendnames',ParseService.getUser().get('username'));
                                fl.addUnique('friend_userid',ParseService.getUser().id);
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

        $scope.editGroup = function(group){
            $rootScope.selectedGroup = group;
            $state.go('tab.setupgroup-edit');
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
            //$rootScope.showLoading("Loading...");
            user.findPersonalList($rootScope.user.id, function(friendlists){
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
                //console.log("SelectUserCtrl Ctrl - Related Friends = "+ fl.get('friendnames').length);
                //console.log("SelectUserCtrl Ctrl - Related Friends = "+ fl.get('friendnames'));
                //$rootScope.hideLoading();
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
            //$rootScope.showLoading("Loading...");
            var Friendlist = Parse.Object.extend("friendlist");
            var query = new Parse.Query(Friendlist);

            query.get($rootScope.selectedGroup.id,{
                success:function(group){
                    console.log(group.length);
                    $scope.relatedFriendList = group.get('friendnames');
                    $scope.relatedFriendListFiltered = group.get('friendnames');
                    $scope.$apply();
                    //$rootScope.hideLoading();
                },error:function(error){
                    console.log(error.message);
                    //$rootScope.hideLoading();
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
            user.getUserByEmailOrUsername(email, function(ruser){

                //If user by email, if found call $scope.selectFriend()
                if (ruser){
                    console.log("findOrInvite user = "+ruser.get('username'));
                    $scope.selectFriend(ruser.get('username'));
                }else{
                    console.log("findOrInvite user not found");
                    //if (InviteForm.input.$error.email){
                    //    $rootScope.alert('Invalid email', 'Please check the email');
                    //    throw ("Invalid Email Invite");
                    //}
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
                    var fromUserId=res[7];
                    console.log(currencyId);
                    var friendemail = from;


                    var user = new SUser();

                    user.getUserById(fromUserId, function(friend){
                        //If Group Id is Empty, then it's Personal/Direct Transfer
                        //1. Find Personal Group Or create one
                        console.log("ReceiveCtrl.scan  groupId = "+ groupId);
                        if (groupId==''){
                            console.log("ReceiveCtrl.scan  Finding Person Group groupId = "+ groupId);
                            var userIdArray = [$scope.user.id,friend.id];
                            var friendemails = [$scope.user.get('email'),friendemail];
                            var friendnames = [$scope.user.get('username'),friend.get('username')];

                            user.getPersonalListByEmails(userIdArray,friendemails, friendnames, function(friendlist){
                                console.log("ReceiveCtrl.scan "+ friendlist.id);
                                $scope.recordQRCode(friendlist, tranId,currencyId, amount,friend,$scope.user,note,location, $scope.user,friend);
                            });
                        }else{
                            console.log("ReceiveCtrl.scan Group Found = "+ groupId);
                            var Friendlist = Parse.Object.extend("friendlist");
                            var queryFd = new Parse.Query(Friendlist);


                            console.log("ReceiveCtrl.scan before got group");

                            queryFd.get(groupId,{
                                success:function(grp){
                                    console.log("ReceiveCtrl.scan successfully got group");
                                    $scope.recordQRCode(grp, tranId,currencyId,amount,friend,$scope.user,note,location, $scope.user,friend);
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

        $scope.recordQRCode = function(group, id,currencyId,amount,fromuser,touser,note,location, user,friend){

            ParseService.recordQRCode(group,id,currencyId,amount,fromuser,touser,note,location, user,friend, function(r){

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

                    display+="From : " + fromuser.get('username') +"<BR><BR>";

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
.controller('SetupCtrl', function($rootScope,$scope, $state, $location, $ionicPopup,ParseService) {

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
//            if (!checkPassStrength(userp.password) == 'good' || !checkPassStrength(userp.password) == 'strong'){
////                alert("Please Enter Password with At least 6 character with one upper case and numeric ");
//                $rootScope.alert('Weak Password', 'Please Enter Password with At least 6 character with one upper case and numeric')
//
//                throw("Weak Password");
//            }
//
//            if (userp.password!=userp.con_password){
//                $rootScope.alert('Password Mismatch','Please check and confirm your password')
//                throw("Invalid Password");
//            }
//            user.set('password',userp.password);
            $rootScope.user.set('username',userp.username);
            $rootScope.user.set('email',userp.email);
            $rootScope.user.set('default_currency',$rootScope.user.get('default_currency'));
            $rootScope.user.save(null,{
                success: function(user){
                    console.log("Setup saved!");
                    $rootScope.user = user;
                    $rootScope.hideLoading();
                },error:function(user, error){
                    $rootScope.hideLoading();
                    $rootScope.alert("Problem", error.message);
//                    alert(error.message);
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
            console.log("logout is called");
            if (window.plugins) {
                //parsePlugin.unsubscribe($rootScope.user.id, function (msg) {
                //    console.log("unsubscribed success");
                //    console.log('unsubscribe'+ msg);
                //    ParseService.logout();
                //    $state.go('login');
                //}, function (e) {
                //    console.log("unsubscribed failed");
                //    conlog.log('error'+ e.message);
                //    ParseService.logout();
                //    $state.go('login');
                //
                //});
                unsubscribeAll(function(s){
                    ParseService.logout();
                    $state.go('verifyByPhone');
//                    $state.go('login');
                })

            }else{
                console.log("no plugin");
                ParseService.logout();
                $state.go('login');
            }



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
.controller('SetupGroupCtrl', function($rootScope, $scope, $state, $stateParams,$ionicSideMenuDelegate,$ionicPopup,$ionicLoading,ParseService) {

        $scope.loadGroupSetup = function(){
            var user = new SUser();
            user.getFriendListAll(ParseService.getUser().id, true, function(friendlists){
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
                            var msg="";
                            msg = $rootScope.selectedGroup.get('group') ;
                            msg += " has a new look! ";
                            msg += $rootScope.user.get('username') + " changed the icon.";
                            sendPushMessage(msg, "GRP_"+$rootScope.selectedGroup.id);


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
            var oldGroupName = $rootScope.selectedGroup.get('group');
            if(group)
                $rootScope.selectedGroup.set('group', group.name);
                $rootScope.selectedGroup.save(null,{
                success:function(group){
                    console.log("SetupGroupEditCtrl - saveGroup done");
                    $rootScope.hideLoading();
                    $scope.back();
                    var msg = "";
                    msg = oldGroupName ;
                    msg += " is updated! ";
                    msg += $rootScope.user.get('username') + " changed its name to ";
                    msg += group.get('group');
                    sendPushMessage(msg, "GRP_"+$rootScope.selectedGroup.id);

                },error:function(obj,error){
                    $rootScope.hideLoading();
                    alert (error.message);
                }
            })
        }

        $scope.archGroup = function(group){

        }

        $scope.editGroup = function(group){
            console.log("editGroup");
            $rootScope.selectedGroup = group;
            $state.go('tab.setupgroup-edit');
        }
        $scope.loadGroupSetup();
})
.controller('LoginCtrl', function( $rootScope,$scope, $state, $ionicPopup, $location, ParseService) {

        if(window.localStorage['didTutorial'] !== "true") {
            $state.go('intro');
            return;
        }

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
                    throw ("Login Error", user.message);
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
                    subscribe("P_"+user.id);
                    subscribeAllGroups(user.id);
                }

                $state.go('tab.balance-overview');
//                $rootScope.loadGroup();
                console.log("controller - redirected success login");
            });
        }

        if (ParseService.getUser()){
            $state.go('tab.balance-overview');
        }


})
    .controller('VerifyCtrl', function( $rootScope,$scope, $state, $ionicSlideBoxDelegate,ParseService) {
        $rootScope.intro = true;
        $scope.sendButtonDisabled = false;
        $scope.loading = "hidden";
        $ionicSlideBoxDelegate.enableSlide(false);

        //Check if user have seen intro
        if(window.localStorage['didTutorial'] !== "true") {
            $state.go('intro');
            return;
        }
        //Check if user already logIn
        if (ParseService.getUser()){
            $state.go('tab.balance-overview');
        }else{
            if (!window.navigator) {
                $state.go('login');
            }
        }

        $scope.verifyByPhone = function(form){
            $scope.sendButtonDisabled = true;
            $scope.loading = "visible";
//            var install = Parse.Installation.current();
//            var timeZone = install.get("timeZone");
            $scope.phone_number = form.phone_number;
            navigator.globalization.getLocaleName(function(localeName){
                var countryCode = localeName.value.substring(localeName.value.length - 2, localeName.value.length).toUpperCase();
                console.log("country code = " + countryCode);
                $rootScope.countryCode = countryCode;
                if (!isValidNumber(form.phone_number,countryCode)){
                    $rootScope.alert("Invalid Phone Number", "Please check and try again");
                    $scope.sendButtonDisabled = false;
                    $scope.loading = "hidden";
                    throw ("invalid phone number");

                }
                Parse.Cloud.run('sendVerificationCode', { phone_number: form.phone_number, locale: localeName.value}, {
                    success: function(r) {
                        console.log("sendVerificationCode successful");

                        $ionicSlideBoxDelegate.next();
                        $scope.loading = "hidden";
                        $scope.sendButtonDisabled = false;
                    },
                    error: function(error) {
                        console.log("sendVerificationCode error = "+error.message);
                        $scope.sendButtonDisabled = false;
                        $scope.loading = "hidden";
                    }
                });
            }, function(error){
                console.log("getLocaleName error = "+error.message);
                $scope.sendButtonDisabled = false;
                $scope.loading = "hidden";
            });

        }

        $scope.checkPhoneNumber = function(form){
            form.phone_number=formatE164($rootScope.countryCode,form.phone_number);
        }

        $scope.sendVerifyCode = function (form){
            var User = Parse.Object.extend("User");
            var query = new Parse.Query(User);
            query.equalTo("phone_number",$scope.phone_number);
            query.first({
                success:function(user){
                    user.set('password',form.verifycode);
                    user.logIn({
                        success:function(r){
                            console.log("login successful");
                            $rootScope.user = r;
                            if (r.getUsername()== r.get('phone_number')){
                                $ionicSlideBoxDelegate.next();
                            }else{
                                $state.go('tab.balance-overview');
                            }
                        },error:function(obj, error){
                            console.log("login failed: invalid verification code");
                            $rootScope.alert("Invalid verification code","please try again");
                            $ionicSlideBoxDelegate.previous();
                        }
                    });
                },error:function(obj, error){
                    console.log(error.message);
                }
            });
        }

        $scope.updateUser = function(form){
            $rootScope.user.set('username',form.username);
            $rootScope.user.set('email',form.email);
            $rootScope.user.save(null,{
                success:function(r){
                    $state.go('tab.balance-overview');
                },error:function(obj, error){
                    console.log("updateUser failed error = "+error.message);
                    $rootScope.alert("Problem", error.message);
                }
            })
        }
        $scope.next = function() {
            $ionicSlideBoxDelegate.next();
        };
        $scope.previous = function() {
            $ionicSlideBoxDelegate.previous();
        };
        $scope.slideChanged = function(index) {
            $scope.slideIndex = index;
            // Update Page is not allowed when user is not verified
            if (index == 2){
                if (!ParseService.getUser()){
                    $scope.previous();
                }
            }

        };
    }
);