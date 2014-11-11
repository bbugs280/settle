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
        $rootScope.showMenu = function () {
            if (!$scope.friendlists)
                $rootScope.loadGroup();

            $ionicSideMenuDelegate.toggleLeft();
        };



        $rootScope.selectedGroup = undefined;
        $scope.setGroup = function (selectedGroup){


          $rootScope.selectedGroup = selectedGroup;

            $state.go($state.current, $stateParams, {
                location: false,
                reload: true,
                inherit: false,
                notify: true
            });

            $state.go('tab.send');
            $ionicSideMenuDelegate.toggleLeft();
        }
        $scope.setPersonal = function(){
            $rootScope.selectedGroup = undefined;
            $state.go('tab.send-remote');

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
                                        $rootScope.loadGroup();
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

        $scope.editGroup = function(friendlist){
            $scope.editGroup.group = friendlist.get('group');
            var editPopup = $ionicPopup.show({
                template: "<input type='text' ng-model='editGroup.group' value='{{editGroup.group}}'>",
                title: 'Rename Group',
                subTitle: '',
                scope: $scope,
                buttons: [
                    { text: 'Cancel' },
                    {
                        text: '<b>Rename</b>',
                        type: 'button-stable',
                        onTap: function(e) {

                            if (!$scope.editGroup.group) {
                                e.preventDefault();
                            } else {
                                friendlist.set('group',$scope.editGroup.group);
                                friendlist.save(null,{
                                    success: function (result) {
                                        $rootScope.loadGroup();
                                        $scope.$apply();
                                    }, error: function (error) {
                                        throw("Error: " + error.code + " " + error.message);
                                    }
                                });
                            }
                        }
                    }
                ]
            });
        }

        $scope.archGroup = function(friendlist){

            if (friendlist.get('hidden')==true){
                friendlist.set('hidden', false);
            }else{
                friendlist.set('hidden', true);
            }

            friendlist.save(null,{
                success: function (result) {
                    $rootScope.loadGroup();
                    $scope.$apply();
                }, error: function (error) {
                    throw("Error: " + error.code + " " + error.message);
                }
            })

        }

    })
.controller('BalanceOverviewCtrl', function($rootScope, $scope, $state,ParseService) {

        console.log("controller - BalanceOverviewCtrl start | selectedGroup ");
//        console.log("controller - BalanceOverviewCtrl start | rootScope user = "+$rootScope.user.get('username'));
        $scope.balance = 0;
        $scope.loading = 'visible';
        $rootScope.user = ParseService.getUser();
        //$scope.user = ParseService.getUser();


        $scope.loadOverview = function(){

            //Load Groups & Personal Accounts
            //Then calculate Total Balance
            var user = new SUser();
            $scope.loading = 'visible';
            user.getBalanceOverview($rootScope.user,function(bals){
                $scope.grouplist = bals;

                for (var i in bals){
                    $scope.balance = $scope.balance + Number(bals[i].get('balance'));

                    //for personal group set your friend user
                    if (bals[i].get('group')){
                        if (bals[i].get('group').get('ispersonal')==true){
                            if (bals[i].get('group').get('user1').id==$rootScope.user.id){
                                $scope.grouplist[i].set('frienduser',bals[i].get('group').get('user2'));
                            }else{
                                $scope.grouplist[i].set('frienduser',bals[i].get('group').get('user1'));
                            }
//                        console.log($scope.grouplist[i].get('frienduser').get('icon').url());
                        }
                    }

                }
                console.log($scope.balance);
                $scope.loading = 'hidden';
                $scope.$apply();
                $scope.$broadcast('scroll.refreshComplete');
            })
        }

        $scope.openBalance = function(balance){
            $rootScope.selectedGroup = balance.get('group');
            if (balance.get('group').get('ispersonal')!=true){
                //Group Account goes to BalanceGroup
                $state.go('tab.balance-group');
            }else{

                //Personal Account will go to Transaction Detail i.e. BalanceDetail
                $rootScope.selectedFriend = balance.get('frienduser');
                $state.go('tab.balance-detail');
            }


        }
        $scope.sendPerson = function(user){
            $rootScope.selectedGroup = undefined;
            $rootScope.selectedFriend = user;
            $state.go('tab.send-remote');
        }

        $scope.editGroup = function(group){
            console.log("Balance Overview Ctrl - editGroup");
            $rootScope.selectedGroup = group;
            $state.go('tab.setupgroup-edit');
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
        $scope.title = $rootScope.selectedGroup.get('group');
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

                $scope.loading = 'hidden';
                $scope.$apply();
            })
        }

        $scope.openTrans = function(bal){
            $state.go('tab.balance-detail');
        }
        $scope.goToSend = function(user){
            $rootScope.selectedFriend = user;
            $state.go('tab.send-remote');
        }
        $scope.goToGroupEdit = function(group){
            $rootScope.selectedGroup = group;
            $state.go('tab.setupgroup-edit');
        }
        $scope.loadGroup();

})
.controller('SendCtrl', function($rootScope,$scope, $location, ParseService, Common, $state, $ionicPopup) {

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
            var sendString = tranId+"|"+ email +"|"+ $rootScope.sendamount +"|"+ $rootScope.sendnote +"|"+groupId+"|"+groupname;
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
        $scope.sendRemote = function(sendform){
            $rootScope.showLoading('Sending...');
            if (sendform.amount){
                $rootScope.sendamount = sendform.amount;
            }
            if (sendform.note){
                $rootScope.sendnote = sendform.note;
            }
            console.log("amount"+$rootScope.sendamount )
            console.log("note"+ $rootScope.sendnote )
            if (!$rootScope.sendamount){
                alert("invalid amount");
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
                        ParseService.recordQRCode(friendlist, tranId,$rootScope.sendamount,$rootScope.user.get('email'),$rootScope.selectedFriend.get('email'),$rootScope.sendnote,location , $scope.user,$rootScope.selectedFriend,function(r){

                            if (r.message){
                                alert(r.message);
                                $rootScope.hideLoading();
                            }else{

                                $scope.remoteSendConfirmation(r);
                                $rootScope.hideLoading();
                            }

                        });
                    })
                }else{
                    ParseService.recordQRCode($rootScope.selectedGroup, tranId,$rootScope.sendamount,$rootScope.user.get('email'),$rootScope.selectedFriend.get('email'),$rootScope.sendnote,location, $scope.user,$rootScope.selectedFriend,function(r){

                        if (r.message){
                            alert(r.message);
                            $rootScope.hideLoading();
                        }else{

                            $scope.remoteSendConfirmation(r);
                            $rootScope.hideLoading();
                        }
                    });

                }
            }

        $scope.remoteSendConfirmation = function(tran){
            $rootScope.alert('Sent Successful','$'+tran.get('amount') + ' is sent to ' + tran.get('toname'));

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
            history.go(-1);
//            $state.go('tab.send');
        }
        $scope.loadGroup();
})

.controller('SelectUserCtrl', function($rootScope,$scope, $location, ParseService, $ionicPopup, $state) {

        $scope.loadRelatedPersonalUsers = function(){
            var user = new SUser();
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
                console.log("SelectUserCtrl Ctrl - Related Friends = "+ fl.get('friendnames').length);
                //console.log("SelectUserCtrl Ctrl - Related Friends = "+ fl.get('friendnames'));
                $scope.$apply();

            })
        }

        $scope.loadGroupRelatedUsers = function(){

            var Friendlist = Parse.Object.extend("friendlist");
            var query = new Parse.Query(Friendlist);

            query.get($rootScope.selectedGroup.id,{
                success:function(group){
                    console.log(group.length);
                    $scope.relatedFriendList = group.get('friendnames');
                    $scope.$apply();
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
            console.log("selectFriend - username = " + username);
            var user = Parse.Object.extend('User');
            var query = new Parse.Query(user);
            query.equalTo('username',username);
            query.find({
                success:function(users){
                    if (users){
                        $rootScope.selectedFriend = users[0];
                    }else{
                        $rootScope.selectedFriend = undefined;
                    }

                    $rootScope.$apply();
//                    $state.go('tab.send');
                    history.go(-1);
                },error:function(obj, error){
                    console.err(error.message);
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
.controller('ReceiveCtrl', function($rootScope,$scope, $location, ParseService, Common,$ionicLoading) {
        console.log("Receive Ctrl start");
        $scope.user = ParseService.getUser();
        var location;

        ParseService.getLocation(function(r){
            location=r;
        });

        $scope.scan = function(){
            console.log("Receive Ctrl enter scan");
            document.getElementById("info").innerHTML="";

            $rootScope.showloading('Receving...');
            var scanner = cordova.require("cordova/plugin/BarcodeScanner");

            scanner.scan( function (result) {

                console.log("Scanner result: \n" +
                    "text: " + result.text + "\n" +
                    "format: " + result.format + "\n" +
                    "cancelled: " + result.cancelled + "\n");

                if (result.cancelled == 1){
                    $scope.hideloading();
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
                    $rootScope.hideloading();
//                    $scope.$apply();
                }else{

                    var tranId = res[0];
                    var from = res[1];
                    var amount = res[2];
                    var note=res[3];
                    var groupId=res[4];
                    var groupName=res[5];
                    var friendemail;
                    if (from == $scope.user.get('email')){
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
                                $scope.recordQRCode(friendlist, tranId,amount,from,$scope.user.get('email'),note,location, $scope.user,friend);
                            })
                        }else{
                            console.log("ReceiveCtrl.scan Group Found = "+ groupId);
                            var Friendlist = Parse.Object.extend("friendlist");
                            var queryFd = new Parse.Query(Friendlist);


                            console.log("ReceiveCtrl.scan before got group");

                            queryFd.get(groupId,{
                                success:function(grp){
                                    console.log("ReceiveCtrl.scan successfully got group");
                                    $scope.recordQRCode(grp, tranId,amount,from,$scope.user.get('email'),note,location, $scope.user,friend);
                                },error:function(obj, error){
                                    console.log("ReceiveCtrl.scan failed got group: "+ error.message);
//                                    throw (error.message);
                                }
                            })

                        }

                    })


                }
            }, function (error) {

                $rootScope.hideloading();
                console.log("Scanning failed: ", error);
            } );
        }

        $scope.recordQRCode = function(group, id,amount,from,youremail,note,location, user,friend){

            ParseService.recordQRCode(group,id,amount,from,youremail,note,location, user,friend, function(r){
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
                $rootScope.hideloading();

            });
        }
        $scope.scan();

})
.controller('SignUpCtrl', function($rootScope,$scope,$location,$state, $ionicPopup,ParseService) {
        // Called when the form is submitted
        console.log('Signup Ctrl');

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


            ParseService.signUp(userp.name, userp.email, userp.password, function(user) {
                // When service call is finished, navigate to items page
                $rootScope.alert('Congrats!',"You're now one of the 'setters'");

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
        $scope.openCurrencies = function(user){
            $state.go('tab.currencies');
        }
        $scope.selectCurrency = function(curr){
            $rootScope.user.set('default_currency',curr);
            $state.go('tab.setupuser');
        }
        $scope.loadCurrencies = function(){
            var Currencies = Parse.Object.extend('currencies');
            var query = new Parse.Query(Currencies);
            query.find({
                success:function(currencies){
                    $scope.currencies = currencies;
                    $scope.$apply();
                }
            })
        }
        $scope.openCamera = function(){
            var options =   {
                quality: 30,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: 0,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
                encodingType: 0     // 0=JPG 1=PNG
            }
            $rootScope.showLoading('Loading...')

            navigator.camera.getPicture(onSuccess,onFail,options);
        }
        var onSuccess = function(DATA_URL) {
            if (!Common.checkImageSize(DATA_URL.length)){
                $rootScope.alert('Image Too Large','Cannot exceed 1 MB');

                $rootScope.hideLoading();
                throw("Image Size Error");
            }

            console.log("success got pic");


            var file = new Parse.File("icon.jpg", {base64:DATA_URL});
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

        };
        var onFail = function(e) {
            console.log("On fail " + e);
            $rootScope.hideLoading();
        }

        $scope.logout = function(){
            ParseService.logout();
            $state.go('login');

        };

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
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: 0,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
                encodingType: 0     // 0=JPG 1=PNG
            }
            $scope.group = group;
            $rootScope.showLoading('Loading...');

            navigator.camera.getPicture(onSuccess,onFail,options);
        }
        var onSuccess = function(DATA_URL) {
            if (!Common.checkImageSize(DATA_URL.length)){
                $rootScope.alert('Image Too Large','Cannot exceed 1 MB');

                $rootScope.hideLoading();
                throw("Image Size Error");
            }
            console.log("success got pic");
            var file = new Parse.File("icon.jpg", {base64:DATA_URL});
            $scope.group.set('icon',file);
            $scope.group.save(null,{
                    success:function(group){
                        console.log("setup ctrl - friendlist/group updated with new icon");
                        $rootScope.selectedGroup=group;
                        $scope.$apply();

                        $rootScope.hideLoading();
                    },error:function(obj,error){
                        $rootScope.hideLoading();
                        throw (error.message);
                    }
                }
            );

        };
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
        $scope.back = function(){
            window.history.back();
            //$state.go('tab.setupgroup')
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
                $rootScope.$apply();

                $state.go('tab.balance-overview');
//                $rootScope.loadGroup();
                console.log("controller - redirected success login");
            });
        }

        if (ParseService.getUser()){
            $state.go('tab.balance-overview');
        }


});