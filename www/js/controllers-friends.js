angular.module('starter.controllers-friends', [])
.controller('FriendsCtrl', function($rootScope, $scope, $state, $ionicModal,ParseService) {
        console.log("FriendsCtrl");
        //Google Anaytics
        if (typeof analytics !== 'undefined') {
            analytics.trackView('Friends');
        }
        $rootScope.user = ParseService.getUser();
        $rootScope.intro = false;


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

        $scope.whatsapp = function(phone){
            var formattedPhone = formatLocal($rootScope.countryCode,phone);
            formattedPhone = formattedPhone.replace(' ','');
            console.log("whatsapp "+formattedPhone);
            if (window.navigator && window.navigator.contacts){
                var options      = new ContactFindOptions();
                options.filter   = formattedPhone;
                options.multiple = false;
                options.desiredFields = [navigator.contacts.fieldType.phoneNumbers];

                var fields       = [navigator.contacts.fieldType.phoneNumbers];
                navigator.contacts.find(fields, function(contacts){
                    console.log("contacts "+contacts.length);
                    if (contacts.length!=0){
                        whatsappSendMessage(contacts[0].id,"");

                    }else{
                        $rootScope.alert("Opps!", "Sorry! Can't find Whatsapp contact with this phone no.");
                    }
                }, function(error){
                    console.log(error.message);
                }, options);
            }
        }
        $scope.loadGroup = function(){
            var user = new SUser();
            user.getFriendListAll($rootScope.user.id, false, function(groups){
                $rootScope.Groups = groups;
                $scope.GroupsFiltered = groups;
                $scope.loadGroupsBalance();
                $rootScope.$apply();
                $scope.$apply();
                $scope.loadFriends();

            });
        }
        $scope.loadGroupsBalance = function(){
            if ($rootScope.Groups){
                updateGroupUserBalance($rootScope.Groups, $rootScope.user, function(groups){
//                    $scope.GroupsFiltered = groups;
//                    $rootScope.Groups = groups;
                    $rootScope.$apply();
                    $scope.$apply();
                });
            }
        }
        $scope.loadFromParse = function(phoneArray){
            //Now get user from Parse using Array
            $scope.loading = 'visible';
            loadFriendsFromParse(phoneArray, function(users){
                $rootScope.Friends=users;
                $scope.FriendsFiltered=users;
                updateFriendsBalance($rootScope.user, $rootScope.Friends, function(users){
                    $scope.$apply();
                });
                $scope.loading = 'hidden';
                $scope.$broadcast('scroll.refreshComplete');
            })
        }

        $scope.loadFriendsGroups = function(){
//            $scope.loadFriends();
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
        $rootScope.addRequestFromFriend = function(){

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

        $rootScope.goToRequestGroupDetail = function(group){
            console.log("goToGroupDetail");
            $rootScope.selectedGroup = group;
            $rootScope.selectedRequest.set('group', group);
            $state.go('tab.friends-request-group');
        }

        $scope.loadGroupFriends = function(){
            console.log("loadGroupFriends selectedGroup " + $rootScope.selectedGroup.get('group'));
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
                    //update Friends Balance here
                    updateGroupFriendsBalance($rootScope.selectedGroup, $scope.GroupFriends, function(users){
                        $scope.$apply();
                        $rootScope.$apply();
                    });

                }, error:function(obj, error){
                    $scope.loading = 'hidden';
                    console.log("error "+ error.message);
                }
            });
        }


        $scope.goToWhatsapp = function(user){
            whatsappSendMessage(user.get('phone_number'), "");
        }
        $scope.goToPay = function(user){
            console.log("goToPay");
            $rootScope.selectedFriend = user;
            $rootScope.selectedGroup = undefined;
            $rootScope.inviteEmail = undefined;
            $scope.hideClickOptions();
            $state.go('tab.send-remote');

        }
        $scope.goToPayGroup = function(user){
            console.log("goToPayGroup");
            $rootScope.selectedFriend = user;
            $rootScope.inviteEmail = undefined;
            $scope.hideGroupClickOptions();
            $state.go('tab.send-remote');


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

        //Model for Friend Group page
        $ionicModal.fromTemplateUrl('templates/tab-friends-group-click-options.html',{
            scope:$scope
        }).then(function(modal){
            $scope.modalGroupClickOptions=modal;
        });
        $scope.showGroupClickOptions = function(group,friend){
            $rootScope.selectedFriend = friend;
            $rootScope.selectedGroup = group;
            $scope.modalGroupClickOptions.show();
        }
        $scope.hideGroupClickOptions = function() {
            $scope.modalGroupClickOptions.hide();
        }

        $scope.addRequestGroup = function(group, friend){
            var Request = Parse.Object.extend("request");
            var RequestDetail = Parse.Object.extend("request_detail");
            $rootScope.selectedRequest= new Request();
            $rootScope.selectedRequest.set('currency',$rootScope.user.get('default_currency'));
            $rootScope.selectedRequest.get('currency').fetch();
            $rootScope.selectedRequestDetail = new RequestDetail();
            $rootScope.selectedRequestDetail.set('parent',$rootScope.selectedRequest);
            $rootScope.selectedRequest.set('group',group);
            $rootScope.selectedRequestDetail.set('user', friend);
            $rootScope.Requests=[];
            $rootScope.requestdetails=[];
            $rootScope.requestdetails.push($rootScope.selectedRequestDetail);
            $state.go('tab.requests-detail-friend-detail');
            $scope.hideGroupClickOptions();
        }
        //Modal for Friend page
        $ionicModal.fromTemplateUrl('templates/tab-friends-click-options.html',{
            scope:$scope
        }).then(function(modal){
            $scope.modalClickOptions=modal;
        });
        $scope.showClickOptions = function(friend){
            $rootScope.selectedFriend = friend;
            $scope.modalClickOptions.show();
        }
        $scope.hideClickOptions = function() {
            $scope.modalClickOptions.hide();
        }

        $scope.addRequest = function(friend){
            var Request = Parse.Object.extend("request");
            var RequestDetail = Parse.Object.extend("request_detail");
            $rootScope.selectedRequest= new Request();
            $rootScope.selectedRequest.set('currency',$rootScope.user.get('default_currency'));
            $rootScope.selectedRequest.get('currency').fetch();
            $rootScope.selectedRequestDetail = new RequestDetail();
            $rootScope.selectedRequestDetail.set('parent',$rootScope.selectedRequest);
//            $rootScope.selectedRequest.set('group',group);
            $rootScope.selectedRequestDetail.set('user', friend);
            $rootScope.Requests=[];
            $rootScope.requestdetails=[];
            $rootScope.requestdetails.push($rootScope.selectedRequestDetail);
            $state.go('tab.requests-detail-friend-detail');
            $scope.hideClickOptions();
        }


        $scope.showInviteOptions = function() {
            $scope.modalOptions.show();
        }

        $scope.hideInviteOptions = function() {
            $scope.modalOptions.hide();
        }

        $scope.inviteByWhatsapp = function(){
            openWhatsappWithMsg(inviteMessage);
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

        $ionicModal.fromTemplateUrl('templates/model-settle.html',{
            scope:$scope
        }).then(function(modal){
            $scope.modalSettle=modal;
        });

        $scope.goToSettle = function(friend){

        }

        $scope.goToSettleGroup = function(friend){
            $scope.modalSettle.show();
        }
        //$rootScope.loadFriendsInit();

});
