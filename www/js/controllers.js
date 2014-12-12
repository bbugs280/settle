angular.module('starter.controllers', [])
.controller('IntroCtrl', function($rootScope, $scope, $state,$ionicSlideBoxDelegate) {
        //Google Anaytics
        if (typeof analytics !== 'undefined') {
            analytics.trackView('Intro');
        }
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
        //Google Anaytics
        if (typeof analytics !== 'undefined') {
            analytics.trackView('Friends');
        }

        $scope.loadFriends = function(){
        console.log("loadFriends is called");
        $scope.loading = 'visible';
//            $scope.loading = "hidden";
        function onSuccess(contacts) {
            console.log('Contacts Found ' + contacts.length + ' contacts.');
            console.log("country Code = "+$rootScope.countryCode);
            //Construct phone array
            var phoneArray=[];
            for (var i=0;i<contacts.length;i++){
                if(contacts[i].phoneNumbers && contacts[i].phoneNumbers.length){
                    for (var j=0;j<contacts[i].phoneNumbers.length;j++){
                        var phone_no = contacts[i].phoneNumbers[j].value;

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

        $scope.loadGroup = function(){
            var user = new SUser();
            user.getFriendListAll($rootScope.user.id, false, function(groups){
                $rootScope.Groups = groups;
                $scope.GroupsFiltered = groups;
            });

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

        $scope.loadFriendsGroups = function(){
            $scope.loadFriends();
            $scope.loadGroup();
        }
        $rootScope.loadFriendsInit = function(){

            if (!$rootScope.Friends) {
                console.log("loadFriendsInit - load from parse");
                $scope.loadFriendsGroups();
            }else{
                console.log("loadFriendsInit - load from scope");
                $scope.FriendsFiltered = $rootScope.Friends;
                $scope.GroupsFiltered = $rootScope.Groups;
                $scope.loading = "hidden";
            }
        }

//        $scope.searchCancel = function(){
//            $scope.searchText = "";
//        }

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

        $scope.searchGroup = function(txt){
            console.log("searchGroup "+txt);
            var result = [];
            for (var i in $rootScope.Groups){
                if ($rootScope.Groups[i].get('group').toLowerCase().indexOf(txt.toLowerCase())!=-1){
                    console.log($rootScope.Groups[i].get('group'));
                    result.push($rootScope.Groups[i]);
                }
            }
            $scope.GroupsFiltered = result;
        }

        $scope.searchFriendGroup = function(txt){
            $scope.searchFriend(txt);
            $scope.searchGroup(txt);
        }

        $scope.goToFriends = function(){
            $state.go('tab.friends');
        }
        $scope.goToGroupEdit = function(group){
            $rootScope.selectedGroup = group;
            $state.go('tab.setupgroup-edit');
        }
        $scope.goToGroupDetail = function(group){
            console.log("goToGroupDetail");
            $rootScope.selectedGroup = group;

            $state.go('tab.friends-group');
        }
        $scope.loadGroupFriends = function(){
            var User = Parse.Object.extend("User");
            var query = new Parse.Query(User);
            query.containedIn('objectId', $rootScope.selectedGroup.get('friend_userid'));
            query.addAscending('username');
            query.find({
                success:function(users){
                    console.log("found user = "+users.length);

                    $scope.GroupFriends=users;
                    $scope.$apply();
                    $scope.loading = 'hidden';
                    $scope.$broadcast('scroll.refreshComplete');
                }, error:function(obj, error){
                    $scope.loading = 'hidden';
                    console.log("error "+ error.message);
                }
            });
        }

        $scope.goToAction = function(user){

            console.log("goToSend");
            $rootScope.selectedFriend = user;
            $rootScope.inviteEmail = undefined;
            $state.go('tab.send-remote');
            //if ($rootScope.addFriendToGroup){
            //
            //
            //}else{
            //    //Got to Default Send page if no action is selected e.g. $rootScope.addFriendToGroup
            //
            //}

        }
        $scope.addFriendToGroup = function(user){
            console.log("addFriendTogroup");
            $rootScope.selectedGroup.addUnique("friend_userid", user.id);

            $rootScope.selectedGroup.save(null, {
                success:function(r){
                    console.log("success addFriendTogroup");
                    //$rootScope.addFriendToGroup = undefined;
                    //$state.go('tab.setupgroup-edit');
                    $rootScope.getFriendsForSelectedGroup($rootScope.selectedGroup);
                    $rootScope.modalFriendSelect.hide();
                    $rootScope.$apply();
                    var msgToNewUser = "You have been added to "+$rootScope.selectedGroup.get('group');
                    var msgToGroup = user.getUsername() + " is added to "+ $rootScope.selectedGroup.get('group');
                    sendPushMessage(msgToNewUser, "P_"+user.id);
                    sendPushMessage(msgToGroup, "GRP_"+$rootScope.selectedGroup.id);

                }
            });
        }



        $scope.getInfo = function(user){

        }

        $ionicModal.fromTemplateUrl('templates/user-invite-pick.html',{
            scope:$scope
        }).then(function(modal) {
            $scope.modalPick = modal;
        });

        $ionicModal.fromTemplateUrl('templates/user-invite-options.html',{
            scope:$scope
        }).then(function(modal){
            $scope.modalOptions=modal;

        });
        $scope.showInviteOptions = function() {
            $scope.modalOptions.show();
        }

        $scope.hideInviteOptions = function() {
            $scope.modalOptions.hide();
        }

        $scope.inviteFromContacts = function(){
            navigator.contacts.pickContact(function(contact){
//                console.log('The following contact has been selected:' + JSON.stringify(contact));
                if (contact){
                    $scope.selectedContact = contact;
                    $scope.modalPick.show();
                }else{
                    $scope.modalPick.hide();
                }

                $scope.hideInviteOptions();
            },function(err){
                console.log('Error: ' + err);
                $scope.hideInviteOptions();
            });
        }
        $scope.inviteBySMS = function(phone){
            phone = formatE164($rootScope.countryCode, phone);
            console.log("phone no: "+phone);
            var messageInfo = {
                phoneNumber: phone,
                textMessage: inviteMessage
            };

            sms.sendMessage(messageInfo, function(message) {
                console.log("success: " + message);
                $scope.modelPick.hide();
            }, function(error) {
                console.log("code: " + error.code + ", message: " + error.message);
                $scope.modelPick.hide();
            });
        }

        $scope.inviteByEmail = function(email){
            if(window.plugins && window.plugins.emailComposer) {
                window.plugins.emailComposer.showEmailComposerWithCallback(function(result) {
                        console.log("Response -> " + result);
                    },
                    "Settle with SettleApp  ", // Subject
                    inviteEmailMessage,                      // Body
                    [email],    // To
                    null,                    // CC
                    null,                    // BCC
                    true,                   // isHTML
                    null,                    // Attachments
                    null);                   // Attachment Data
            }
        }

        //$rootScope.loadFriendsInit();
})
.controller('RequestsCtrl', function($rootScope, $scope, $state) {
        //Google Anaytics
        if (typeof analytics !== 'undefined') {
            analytics.trackView('Requests');
        }

        $scope.loading = "visible";
        $scope.loadRequests = function(){
            var Request = Parse.Object.extend("request");
//            var RequestDetail = Parse.Object.extend("request_detail");
            var query = new Parse.Query(Request);
            query.include('currency');
            query.include('group');
            query.equalTo('created_by',$rootScope.user);
            query.find({
                success:function(requests){
                    $rootScope.Requests = requests;
                    $scope.RequestsFiltered = requests;
                    $scope.loading = "hidden";
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.$apply();
                    $rootScope.$apply();
                }
            })
        }
        $scope.loadIncomingRequests = function(){
            var RequestDetail = Parse.Object.extend("request_detail");
            var Request = Parse.Object.extend("request");
            var queryIR = new Parse.Query(RequestDetail);
            var queryTranR = new Parse.Query(Request);
            var queryTranIR = new Parse.Query(RequestDetail);

            queryTranR.equalTo('created_by', $rootScope.user);
            queryTranIR.exists('tran');
            queryTranIR.matchesQuery('parent',queryTranR);

            queryIR.equalTo('user', $rootScope.user);
            queryIR.notEqualTo('balance', 0);

            var mainQuery = Parse.Query.or(queryIR, queryTranIR);
            mainQuery.include('parent');
            mainQuery.include('user');
            mainQuery.include('tran');
            mainQuery.include(['parent.created_by']);
            mainQuery.include(['parent.group']);
            mainQuery.include(['parent.currency']);
            mainQuery.descending('updatedAt');
            mainQuery.find({
                success:function(requestdetails){
                    $rootScope.badges.request = requestdetails.length;
                    $rootScope.IncomingRequests = requestdetails;
                    $scope.IncomingRequestsFiltered = requestdetails;
                    $scope.loading = "hidden";
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.$apply();
                    $rootScope.$apply();
                }
            })
        }
        $scope.loadBoth = function(){
            $scope.loadRequests();
            $scope.loadIncomingRequests();
        }
        $scope.addRequest = function(){
            $rootScope.selectedRequest=undefined;
            $state.go('tab.requests-detail');
        }

        $scope.searchRequest = function(txt){
            var result = [];
            for (var i in $rootScope.Requests){
                if ($rootScope.Requests[i].get('title').toLowerCase().indexOf(txt.toLowerCase())!=-1){
                    console.log($rootScope.Requests[i].get('title'));
                    result.push($rootScope.Requests[i]);
                }
            }
            $scope.RequestsFiltered = result;
        }
        $scope.searchIncomingRequest = function(txt){
            var result = [];
            for (var i in $rootScope.IncomingRequests){
                if ($rootScope.IncomingRequests[i].get('parent').get('title').toLowerCase().indexOf(txt.toLowerCase())!=-1){
                    console.log($rootScope.IncomingRequests[i].get('parent').get('title'));
                    result.push($rootScope.IncomingRequests[i]);
                }
            }
            $scope.IncomingRequestsFiltered = result;
        }

        $scope.searchBoth = function(txt){
            $scope.searchRequest(txt);
            $scope.searchIncomingRequest(txt);
        }
        $rootScope.loadRequestInit = function(){
            if (!$rootScope.Requests) {
                console.log("loadInit - load from parse");
                $rootScope.badges.request=0;
                $scope.loadBoth();
            }else{
                console.log("loadInit - load from scope");
                $scope.RequestsFiltered = $rootScope.Requests;
                $scope.IncomingRequestsFiltered = $rootScope.IncomingRequests;
                $scope.loading = "hidden";
            }
        }
        $scope.goToIncomingRequestDetail = function(irequest){
            //Payment
            if (irequest.get('parent').get('created_by').id == $rootScope.user.id){
                var tran = irequest.get('tran');
                tran.set('read',true);
                tran.save(null, {
                    success:function(t){
                        $rootScope.selectedIncomingPayment = irequest;
                        $state.go('tab.incomingpayment-detail');
                    }
                })
            }else{
                //Request
                irequest.set('read',true);
                irequest.save(null,{
                    success:function(i){
                        $rootScope.selectedIncomingRequest = i;
                        $state.go('tab.incomingrequest-detail');
                    }
                });
            }


        }
        $scope.goToRequestDetail = function(request){
            $rootScope.selectedRequest = request;
            $state.go('tab.requests-detail');
        }

})
.controller('RequestsDetailCtrl', function($rootScope, $scope, $state,$ionicModal,$filter){
        //Google Anaytics
        if (typeof analytics !== 'undefined') {
            analytics.trackView('Requests Detail');
        }

        $scope.data = {
            showDelete: false
        };
        $ionicModal.fromTemplateUrl('templates/select-currencies.html',{
            scope:$scope
        }).then(function(modal) {
            $scope.modalCurrencySelect = modal;
        });

        $ionicModal.fromTemplateUrl('templates/tab-friends-request-select.html',{
            scope:$scope
        }).then(function(modal) {
            $scope.modalFriendRequestSelect = modal;
        });
        $ionicModal.fromTemplateUrl('templates/select-place.html',{
            scope:$scope
        }).then(function(modal) {
            $scope.modalPlaceSelect = modal;
        });

        $scope.selectACurrency = function(curr){
            console.log("select currency");
            $rootScope.selectedRequest.set('currency', curr);
            $scope.modalCurrencySelect.hide();
        }

        $scope.selectGroup = function(){
            //$state.go('tab.send-group');
            $rootScope.modalGroupSelect.show();
        }

        $scope.clear = function(){
            $rootScope.selectedRequest.set('group', undefined);
        }

        $scope.loadRequestDetails=function(){
            var RequestDetail = Parse.Object.extend("request_detail");
            var query = new Parse.Query(RequestDetail);
            query.include('user');
            query.include('tran');
            query.equalTo('parent', $rootScope.selectedRequest);
            query.find({
                success:function(details){
                    console.log("loadRequestDetails count = "+details.length);
                    $scope.requestdetails=details;
                    for (var i in $scope.requestdetails){
                        $scope.requestdetails[i].amount = $scope.requestdetails[i].get('amount');
                        var paidAmount = 0;
                        var ownAmount = 0;
                        ownAmount = $scope.requestdetails[i].get('amount');
                        if ($scope.requestdetails[i].get('tran')){
                            paidAmount = $scope.requestdetails[i].get('tran').get('amount');
                        }
                        $scope.requestdetails[i].set('balance', ownAmount-paidAmount);
                    }
                    $scope.$apply();
                }
            });
        }

        $scope.calcTotalAmount = function(){
            var amount = 0;
            for (var i in $scope.requestdetails){
                amount += $scope.requestdetails[i].amount;
                var paidAmount = 0;
                var ownAmount = 0;
                ownAmount = $scope.requestdetails[i].amount;
                if ($scope.requestdetails[i].get('tran')){
                    paidAmount = $scope.requestdetails[i].get('tran').get('amount');
                }
                $scope.requestdetails[i].set('balance', ownAmount-paidAmount);
                $scope.$apply();
            }
            $rootScope.selectedRequest.amount = amount;
        }

        $scope.addFriendToRequest = function(user){
            console.log("addFriendToRequest");
            var RequestDetail = Parse.Object.extend("request_detail");
            var rd = new RequestDetail();
            rd.set('parent',$rootScope.selectedRequest);
            rd.set('user', user);
            $scope.requestdetails.push(rd);
            $scope.$apply();
            $scope.modalFriendRequestSelect.hide();

        }
        $scope.removeDetail = function(detail){

            $scope.requestdetails.splice($scope.requestdetails.indexOf(detail),1);

            if (detail.id){
                detail.destroy({
                    success:function(r){
                        $scope.$apply();
                    }
                });
            }

        }
        $scope.chaseDetail = function(detail){
            var msg = "Reminder: ";
            msg += " Please pay " + $rootScope.user.getUsername();
            msg += " "  + $filter('currency') (detail.get('amount'),$rootScope.selectedRequest.get('currency').get('code'));
            msg += " for " +$rootScope.selectedRequest.get('title');
            sendPushMessage(msg, "P_"+detail.get('user').id);
            $rootScope.alert("Reminder sent to "+detail.get('user').getUsername(),msg);
        }
        $scope.saveRequest = function(request){
            console.log("RequestDetail - saveRequest");
            $rootScope.showLoading('Saving');
            $rootScope.selectedRequest.set('title', request.title);
            $rootScope.selectedRequest.set('amount', request.amount);
            $rootScope.selectedRequest.set('note', request.note);
            //$rootScope.selectedRequest.set('currency', $rootScope.selectedCurrency);
//            $rootScope.selectedRequest.set('group', $rootScope.selectedGroup);
            $rootScope.selectedRequest.set('created_by', $rootScope.user);
            $rootScope.selectedRequest.save(null,{
                success:function (request){
                    console.log("Request saved");
                    $rootScope.selectedRequest = request;
                    if ($scope.requestdetails){
                        for (var i in $scope.requestdetails){
                            $scope.requestdetails[i].set('parent',request);

                            if (isNaN($scope.requestdetails[i].amount)){
                                    $rootScope.alert("Invalid Amount");
                                    throw ("invalid amount");
                            }
                            $scope.requestdetails[i].set('amount',$scope.requestdetails[i].amount);
                            $scope.requestdetails[i].save();
                            // send push
                            var msg = "Please pay " + $rootScope.user.getUsername();
                            msg += " " + $filter('currency')($scope.requestdetails[i].amount,$rootScope.selectedRequest.get('currency').get('code')) ;
                            msg += " for " + $rootScope.selectedRequest.get('title');
                            sendPushMessage(msg, "P_"+$scope.requestdetails[i].get('user').id);

                            $scope.$apply();
                            $rootScope.$apply();
                            $rootScope.hideLoading();

                            $state.go('tab.requests');
                        }
                    }



                },error:function(obj, error){
                    console.log('error '+error.message);
                    $rootScope.hideLoading();
                }
            })
        }

        $scope.selectedPlace = function(place){
            console.log("selectedPlace");
            $rootScope.selectedRequest.title = place.getElementsByTagName('name')[0].childNodes[0].nodeValue;
            $rootScope.selectedRequest.set('location_detail',place.getElementsByTagName('formatted_address')[0].childNodes[0].nodeValue);
            var point = new Parse.GeoPoint({
                latitude : Number(place.getElementsByTagName('lat')[0].childNodes[0].nodeValue),
                longitude : Number(place.getElementsByTagName('lng')[0].childNodes[0].nodeValue)
            })
            $rootScope.selectedRequest.set('location', point);

            $scope.modalPlaceSelect.hide();
        }

        $scope.init = function(){
            if (!$rootScope.selectedRequest){
                var Request = Parse.Object.extend("request");
                $rootScope.selectedRequest = new Request();
                $rootScope.selectedRequest.set('currency',$rootScope.user.get('default_currency'));
                if (!$scope.requestdetails){
                    console.log("$scope.requestdetails empty and it's init");
                    $scope.requestdetails = [];
                }
                console.log("create selectedRequest");
            }else{
                //Refresh Request object for Display
                $rootScope.selectedRequest.title = $rootScope.selectedRequest.get('title');
                $rootScope.selectedRequest.amount = $rootScope.selectedRequest.get('amount');
                $rootScope.selectedRequest.note = $rootScope.selectedRequest.get('note');
                if ($rootScope.selectedRequest.get('currency')){
                    $rootScope.selectedRequest.get('currency').fetch({
                        success:function(r){
                            $rootScope.$apply();
                        }
                    });
                }
                if ($rootScope.selectedRequest.get('group')){
                    $rootScope.selectedRequest.get('group').fetch({
                        success:function(r){
                            $rootScope.$apply();
                        }
                    });
                }

                $scope.loadRequestDetails();
            }

        }

        $scope.init();

})
    .controller('IncomingPaymentDetailCtrl', function($rootScope, $scope, $state,$ionicModal, ParseService, Common, $filter){

    })
.controller('IncomingRequestDetailCtrl', function($rootScope, $scope, $state,$ionicModal, ParseService, Common, $filter){
        //Google Anaytics
        if (typeof analytics !== 'undefined') {
            analytics.trackView('Incoming Request Detail');
        }

        $scope.payBack = function(irequest){
            //save tran
            $rootScope.showLoading("Processing");
            var tranId = Common.getID();
            var group = irequest.get('parent').get('group');
            var currencyId = irequest.get('parent').get('currency').id;
            var amount = Number(irequest.get('amount'));
            var fromuser = irequest.get('user');
            var touser = irequest.get('parent').get('created_by');
            var note = irequest.get('parent').get('note');
            var location = irequest.get('parent').get('location');
            var suser = irequest.get('user');
            var friend = irequest.get('parent').get('created_by');

            function processIncomingRequest(r){
                if (r.message){
                    $rootScope.alert('Error',r.message);
                    $rootScope.hideLoading();
                }else{
                    irequest.set('tran',r);
                    irequest.set('balance', Number(irequest.get('amount')-r.get('amount')));
                    irequest.save(null,{
                        success:function(incomingrequest){
                            $rootScope.selectedIncomingRequest=incomingrequest;
                            $rootScope.$apply();
                            $scope.remoteSendConfirmation(r);
                            $rootScope.hideLoading();
                            $state.go('tab.requests');

                        },error:function(obj, error){
                            $rootScope.alert("Error", error.message);
                            $rootScope.hideLoading();
                        }

                    });
                }
            }

            if (group){
                ParseService.recordQRCode(group, tranId,currencyId,amount,fromuser,touser,note,location , suser,friend,function(r){
                    //save irequest
                    processIncomingRequest(r);
                });
            }else{
                console.log("no group");
                var user = new SUser();
                var userIdArray = [user.id,friend.id];
                var friendemails = [user.get('email'),friend.get('email')];
                var friendnames = [user.get('username'),friend.get('username')];
                user.getPersonalListByEmails(userIdArray,friendemails, friendnames, function(friendlist){
                    ParseService.recordQRCode(friendlist, tranId,currencyId,amount,fromuser,touser,note,location , suser,friend,function(r){
                        //save irequest
                        processIncomingRequest(r);
                    });
                });
            }

        }
        $scope.remoteSendConfirmation = function(tran){
            var currencyCode=tran.get('currency').get('code');

            var amountFormatted = $filter('currency')(tran.get('amount'),currencyCode);
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

})
.controller('NavCtrl', function($rootScope, $scope, $state, $stateParams,$ionicSideMenuDelegate,$ionicPopup,ParseService,$ionicLoading,$ionicModal ) {

        $ionicModal.fromTemplateUrl('templates/select-group.html',{
            scope:$scope
        }).then(function(modal) {
            $rootScope.modalGroupSelect = modal;
        });

        $rootScope.badges = {
            request : 0
        };

        $scope.loadIncomingRequestsCount = function(){
            console.log("loadIncomingRequestsCount");
            var RequestDetail = Parse.Object.extend("request_detail");
            var query = new Parse.Query(RequestDetail);

            query.equalTo('user', Parse.User.current());
            query.notEqualTo('balance', 0);
            query.count({
                success:function(count){
                    console.log("loadIncomingRequestsCount = "+count);
                    $rootScope.badges.request = count;
                }
            })
        }

        $scope.loadIncomingRequestsCount();

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

        //$rootScope.openCurrencies = function(currentState, data){
        //    $rootScope.data = data;
        //    console.log("openCurrencies");
        //    //$rootScope.currentState = currentState;
        //    //$state.go('currencies');
        //
        //}

    })
.controller('BalanceOverviewCtrl', function($rootScope, $scope, $state,ParseService) {
        console.log("controller - BalanceOverviewCtrl start");
        //Google Anaytics
        if (typeof analytics !== 'undefined') {
            analytics.trackView('Balance Overview');
        }
        $rootScope.user = ParseService.getUser();
        $rootScope.intro = false;
        $scope.loading = 'visible';

        $scope.init = function(){
            //Check already run before
            if (!$rootScope.balancelist){
                    console.log("balance list is empty");
                    $rootScope.user = ParseService.getUser();
                    $rootScope.user.get('default_currency').fetch({
                        success:function(r){
                            $rootScope.$apply();
                            //$scope.init();
                            $scope.loadOverview();
                        }
                    });

            }else{
                console.log("balance list has content");
                $scope.balancelistFiltered = $scope.balancelist;
                $scope.loading = "hidden";
            }
        }

        $scope.init();

        $scope.loadOverview = function(){
            $rootScope.balance = {};
            $rootScope.balance.amount = 0;
            //Load Groups & Personal Accounts
            //Then calculate Total Balance

            var user = new SUser();
            $scope.loading = 'visible';

            user.getBalanceOverview($rootScope.user,function(bals){
                $rootScope.balance.amount = 0;
                $rootScope.balancelist = bals;
                console.log("loadOverview ", $rootScope.user.get('default_currency').get('code'));
                for (var i in bals){
                    if ($rootScope.user.get('default_currency').get('code')!=bals[i].get('currency').get('code')){

                        $rootScope.balance.amount += Number(bals[i].get('balance')) * getFXRate(bals[i].get('currency').get('code'),$rootScope.user.get('default_currency').get('code'));

                    }else{
                        $rootScope.balance.amount += Number(bals[i].get('balance'));
                    }

                    //for personal group set your friend user
                    if (bals[i].get('group')){
                        if (bals[i].get('group').get('ispersonal')==true){
                            if (bals[i].get('group').get('user1').id==$rootScope.user.id){
                                $rootScope.balancelist[i].set('frienduser',bals[i].get('group').get('user2'));
                            }else{
                                $rootScope.balancelist[i].set('frienduser',bals[i].get('group').get('user1'));
                            }
                            $rootScope.balancelist[i].set('balance',Number($rootScope.balancelist[i].get('balance')));
                        }
                    }

                }
                $scope.balancelistFiltered = $rootScope.balancelist;
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
        //Google Anaytics
        if (typeof analytics !== 'undefined') {
            analytics.trackView('Balance Detail');
        }
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
        //Google Anaytics
        if (typeof analytics !== 'undefined') {
            analytics.trackView('Balance Group');
        }
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
            $rootScope.selectedFriend = undefined;
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
.controller('SendCtrl', function($rootScope,$scope, $location, ParseService, Common, $state,$filter,$ionicModal) {
        //Google Anaytics
        if (typeof analytics !== 'undefined') {
            analytics.trackView('Send');
        }
        $rootScope.user.get('default_currency').fetch({
            success:function(r){
                $rootScope.$apply();
            }
        });
        $ionicModal.fromTemplateUrl('templates/select-currencies.html',{
            scope:$scope
        }).then(function(modal) {
            $scope.modalCurrencySelect = modal;
        });

        $scope.openCurrencies = function(){
            $scope.modalCurrencySelect.show();
        }

        $scope.selectACurrency = function(curr){
            console.log("select currency");
            $rootScope.selectedCurrency=curr;
            $scope.modalCurrencySelect.hide();
        }

        $scope.sendamount = {};
        $scope.sendnote = {};
        $scope.sendform = {};

        $scope.selectGroup = function(){
            console.log("selectgroup");
//            console.log("SendCtrl - sendform :"+sendform);
//            $scope.sendform = sendform;
//            $state.go('tab.send-group');
            $rootScope.modalGroupSelect.show();
        }
        $scope.clearGroup = function(){
            console.log("Clear Group");
            $rootScope.selectedGroup = undefined;
            $rootScope.selectedFriend = undefined;

        }
        $scope.selectUser = function(sendform){
            console.log("SendCtrl - sendform :"+sendform);
            $scope.sendform = sendform;
//            $state.go('tab.send-selectuser');
            $state.go('tab.friends');
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
        //Google Anaytics
        if (typeof analytics !== 'undefined') {
            analytics.trackView('Send - Group select');
        }
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

        $rootScope.addGroup = function (){
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
                                fl.set('admin',$rootScope.user);

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
            $rootScope.modalGroupSelect.hide();
        }

        $scope.selectedGroup=function(group){
            $rootScope.selectedGroup = group;
            if ($rootScope.selectedRequest){
                $rootScope.selectedRequest.set('group',group);
            }

            $rootScope.inviteEmail = undefined;

            $rootScope.modalGroupSelect.hide();
        }
        $scope.loadGroup();
})
.controller('SelectUserCtrl', function($rootScope,$scope, $location, ParseService, $ionicPopup, $state) {
//TODO to be demised
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
        //Google Anaytics
        if (typeof analytics !== 'undefined') {
            analytics.trackView('Receive QRCode');
        }
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
        //Google Anaytics
        if (typeof analytics !== 'undefined') {
            analytics.trackView('Signup');
        }
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
.controller('SetupCtrl', function($rootScope,$scope, $state, $location, $ionicPopup,ParseService,$ionicModal) {
        //Google Anaytics
        if (typeof analytics !== 'undefined') {
            analytics.trackView('Setup');
        }
        console.log("controller - SetupCtrl start");
        $rootScope.user = ParseService.getUser();
        //$scope.user = $rootScope.user;
        $scope.user.username =  $rootScope.user.getUsername();
        $scope.user.email =  $rootScope.user.getEmail();
        $scope.refreshUser = function(){
            if ($rootScope.user.get('default_currency')){
                $rootScope.user.get('default_currency').fetch({
                    success:function(curr){
                        $rootScope.$apply();
                        console.log("fetch default currency");
                    }
                });
            }

        }

        $ionicModal.fromTemplateUrl('templates/select-currencies.html',{
            scope:$scope
        }).then(function(modal) {
            $scope.modalCurrencySelect = modal;
        });

        $scope.openCurrencies = function(){
            $scope.modalCurrencySelect.show();
        }

        $scope.selectACurrency = function(curr){
            console.log("select currency");
            $rootScope.user.set('default_currency',curr);
            $scope.modalCurrencySelect.hide();
        }

        $scope.saveSetup = function(userp){
//            var user = ParseService.getUser();
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
            //$rootScope.user.set('default_currency',$rootScope.user.get('default_currency'));
            $rootScope.user.save(null,{
                success: function(user){
                    console.log("Setup saved!");
                    $rootScope.user = user;
                    $rootScope.hideLoading();
                },error:function(user, error){
                    $rootScope.hideLoading();
                    $rootScope.alert("Problem", error.message);
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
        //Google Anaytics
        if (typeof analytics !== 'undefined') {
            analytics.trackView('Currency Select');
        }
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

        $scope.loadCurrencies();
})
    .controller('PlaceCtrl', function($rootScope,$scope, $state) {
        console.log("Place Ctrl");
        //Google Anaytics
        if (typeof analytics !== 'undefined') {
            analytics.trackView('Place Search');
        }
        $scope.loadPlace = function(){
            $scope.Places = [];
        }

        $scope.searchPlace = function(txt){
            if (txt.length >1){
                $scope.Places = placeAPI(txt, $rootScope.countryName);
            }


        }
    })
.controller('SetupGroupCtrl', function($rootScope, $scope, $state, $stateParams,$ionicSideMenuDelegate,$ionicPopup,$ionicLoading,ParseService,$ionicModal) {
        //Google Anaytics
        if (typeof analytics !== 'undefined') {
            analytics.trackView('Group Setup');
        }
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
        $ionicModal.fromTemplateUrl('templates/tab-friends-select.html',{
            scope:$scope
        }).then(function(modal) {
            $rootScope.modalFriendSelect = modal;
        });

        $scope.addFriendToGroup = function(){
            $rootScope.modalFriendSelect.show();

        }

        $rootScope.getFriendsForSelectedGroup = function(selectedGroup){
            if (selectedGroup){
                var User = Parse.Object.extend("User");
                var query = new Parse.Query(User);
                query.containedIn('objectId',selectedGroup.get('friend_userid'));
                query.addAscending('username');
                query.find({
                    success:function(users){
                        //console.log("success = "+users.length);
                        $scope.friends = users;
                        $scope.$apply();
                    },error:function(obj, error){
                        console.log("error "+ error.message);
                    }
                });
            }

        }

        $scope.loadGroupSetup();
        $scope.getFriendsForSelectedGroup($rootScope.selectedGroup);
})
.controller('LoginCtrl', function( $rootScope,$scope, $state, $ionicPopup, $location, ParseService) {
        //Google Anaytics
        if (typeof analytics !== 'undefined') {
            analytics.trackView('Login');
        }
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
        //Google Anaytics
        if (typeof analytics !== 'undefined') {
            analytics.trackView('Verify by Phone');
        }
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
                            //Google Analytics
                            analytics.setUserId($rootScope.user.getUsername());
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