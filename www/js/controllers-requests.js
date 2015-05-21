angular.module('starter.controllers-requests', [])
.controller('RequestsCtrl', function($rootScope, $scope, $state,ParseService) {
        //Google Anaytics
        if (typeof analytics !== 'undefined') {
            analytics.trackView('Requests');
        }
        $rootScope.user = ParseService.getUser();
        $rootScope.intro = false;
        $scope.loading = "visible";
        $rootScope.loadRequests = function(){
            console.log("loadRequests");
            loadRequests($rootScope.user, function(requests){
                $rootScope.Requests = requests;
                for (var i in $rootScope.Requests){
                    getUnreadCommentCount($rootScope.Requests[i], $rootScope.user, function(c){
                        $scope.RequestsFiltered=$rootScope.Requests;
                        $scope.loading = "hidden";
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.$apply();
                        $rootScope.$apply();
                    });
                }
                $scope.$broadcast('scroll.refreshComplete');
//                $scope.RequestsFiltered = requests;
//                $scope.loading = "hidden";
//                $scope.$broadcast('scroll.refreshComplete');
//                $scope.$apply();
//                $rootScope.$apply();
            });
        }
        $scope.loadIncomingRequests = function(){
            loadIncomingRequests($rootScope.user,function(requestdetails){
                $rootScope.badges.request = requestdetails.length;
                $rootScope.IncomingRequests = requestdetails;
                for (var i in $rootScope.IncomingRequests){
                    getUnreadCommentCount($rootScope.IncomingRequests[i], $rootScope.user, function(c){
//                        $scope.IncomingRequestsFiltered.push($rootScope.IncomingRequests[i]);
                        $scope.IncomingRequestsFiltered=$rootScope.IncomingRequests;
                        $scope.loading = "hidden";
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.$apply();
                        $rootScope.$apply();
                    });
                }
                $scope.$broadcast('scroll.refreshComplete');
//                $scope.IncomingRequestsFiltered = $rootScope.IncomingRequests;
//                $scope.loading = "hidden";
//                $scope.$broadcast('scroll.refreshComplete');
//                $scope.$apply();
//                $rootScope.$apply();
            });

        }

        $scope.archiveRecordCount = 3;
        $scope.archiveRecordToSkip = 0;
        $scope.archiveStillHaveRecord = true;
        $rootScope.ArchiveRequests=[];
        $scope.loadArchive = function(){
            console.log("$scope.archiveRecordToSkip = "+$scope.archiveRecordToSkip);
            if (!$rootScope.ArchiveRequests)
               $rootScope.ArchiveRequests=[];

            loadArchive($rootScope.user, $rootScope.ArchiveRequests,$scope.archiveRecordCount, $scope.archiveRecordToSkip, function(requests){
//                $rootScope.ArchiveRequests = requests;
                if (requests){
                    $scope.ArchiveRequestsFiltered = $rootScope.ArchiveRequests;
                    $scope.archiveRecordToSkip += requests.length;
                    if (requests.length<$scope.archiveRecordCount){
                        $scope.archiveStillHaveRecord = false;
                    }
                }else{

                    $scope.archiveStillHaveRecord = false;
                }
                for (var i in $rootScope.ArchiveRequests){
                    getUnreadCommentCount($rootScope.ArchiveRequests[i], $rootScope.user, function(c){
//                        $scope.ArchiveRequestsFiltered=$rootScope.ArchiveRequests;
                        $scope.loading = "hidden";
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                        $scope.$apply();
                        $rootScope.$apply();
                    });
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
//                $scope.loading = "hidden";
//                $scope.$broadcast('scroll.infiniteScrollComplete');
//                $scope.$apply();
//                $rootScope.$apply();
            });

        }
        $scope.loadBoth = function(){
            $rootScope.loadRequests();
            $scope.loadIncomingRequests();
//            $scope.loadArchive();
        }
        $scope.loadRequestRefresh = function(){
            $rootScope.loadRequests();
            $scope.loadIncomingRequests();

        }
        $scope.addRequest = function(){
            $rootScope.selectedRequest=undefined;
            $state.go('tab.requests-detail');
        }



        $scope.searchRequest = function(txt){
            var result = [];
            for (var i in $rootScope.Requests){
                if ($rootScope.Requests[i].title.toLowerCase().indexOf(txt.toLowerCase())!=-1||
                    $rootScope.Requests[i].user.toLowerCase().indexOf(txt.toLowerCase())!=-1 ||
                    $rootScope.Requests[i].groupName.toLowerCase().indexOf(txt.toLowerCase())!=-1 ){

                    result.push($rootScope.Requests[i]);
                }
            }
            $scope.RequestsFiltered = result;
        }
        $scope.searchIncomingRequest = function(txt){
            var result = [];
            for (var i in $rootScope.IncomingRequests){
                if ($rootScope.IncomingRequests[i].title.toLowerCase().indexOf(txt.toLowerCase())!=-1 ||
                    $rootScope.IncomingRequests[i].user.toLowerCase().indexOf(txt.toLowerCase())!=-1 ||
                    $rootScope.IncomingRequests[i].groupName.toLowerCase().indexOf(txt.toLowerCase())!=-1 ){

                    result.push($rootScope.IncomingRequests[i]);
                }
            }
            $scope.IncomingRequestsFiltered = result;
        }
        $scope.searchArchive = function(txt){

            var result = [];
            for (var i in $rootScope.ArchiveRequests){
                console.log("searchArchive" + $rootScope.ArchiveRequests[i].title);
                console.log("searchArchive" + $rootScope.ArchiveRequests[i].groupName);
                if ($rootScope.ArchiveRequests[i].title.toLowerCase().indexOf(txt.toLowerCase())!=-1||
                    $rootScope.ArchiveRequests[i].user.toLowerCase().indexOf(txt.toLowerCase())!=-1 ||
                    $rootScope.ArchiveRequests[i].groupName.toLowerCase().indexOf(txt.toLowerCase())!=-1 ){

                    result.push($rootScope.ArchiveRequests[i]);
                }
            }
            $scope.ArchiveRequestsFiltered = result;
        }

        $scope.searchBoth = function(txt){
            $scope.searchRequest(txt);
            $scope.searchIncomingRequest(txt);
            $scope.searchArchive(txt);
        }
        $rootScope.loadRequestInit = function(){
            $rootScope.ArchiveRequests=[];
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
        $scope.goToArchDetail=function(request){

            $rootScope.selectedRequest = request.get('parent');
            getAverageRating($rootScope.selectedRequest, function(avgRating){
                $rootScope.selectedRequest.avgrate = avgRating;
                $rootScope.$apply();
            });

            if (request.isPayment){
                console.log("isPayment");
                $rootScope.selectedIncomingPayment = request;
                $state.go('tab.payment-detail');
            }

            if (request.isRequest){
                console.log("isRequest");
                if (request.isOutgoing){
                    $rootScope.selectedRequest = request.get('parent');
                    $state.go('tab.requests-detail');
                }
                if (request.isIncoming){

                    $rootScope.selectedIncomingRequest = request;
                    $state.go('tab.incomingrequest-detail');
                }
            }
        }
        $scope.goToIncomingRequestDetail = function(irequest){
            $rootScope.selectedRequest = irequest.get('parent');
            getAverageRating($rootScope.selectedRequest, function(avgRating){
                $rootScope.selectedRequest.avgrate = avgRating;
                $rootScope.$apply();
            });
            //Payment
            if (irequest.isPayment){
                var tran = irequest.get('tran');
                tran.set('read',true);
                tran.save(null, {
                    success:function(t){
                        console.log("read updated");
                    }
                });
                $rootScope.selectedIncomingPayment = irequest;
                $state.go('tab.payment-detail');
            }else{
                //Request
                irequest.set('read',true);
                irequest.save(null,{
                    success:function(i){
                        console.log("read updated");
                    }
                });
                $rootScope.selectedIncomingRequest = irequest;
                $state.go('tab.incomingrequest-detail');
            }


        }
        $scope.goToRequestDetail = function(requestdetail){
            $rootScope.selectedRequest = requestdetail.get('parent');
            console.log("goToRequestDetail requestdetail.commentUnreadCount= "+requestdetail.commentUnreadCount);
            $rootScope.selectedRequest.commentUnreadCount = requestdetail.commentUnreadCount;
            getAverageRating($rootScope.selectedRequest, function(avgRating){
                $rootScope.selectedRequest.avgrate = avgRating;
                $rootScope.$apply();
            });
            //If payment
            if (requestdetail.isPayment){
                $rootScope.selectedIncomingPayment = requestdetail;
                $state.go('tab.payment-detail');
            }else{
                $rootScope.selectedRequest = requestdetail.get('parent');
                $state.go('tab.requests-detail');
            }

        }

})
.controller('RequestsDetailCtrl', function($rootScope, $scope, $state,$ionicModal,$filter,Common, ParseService){
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

        $ionicModal.fromTemplateUrl('templates/select-place.html',{
            scope:$scope
        }).then(function(modal) {
            $scope.modalPlaceSelect = modal;
        });

        $scope.openPlaceSearch = function(searchText){
            console.log("openPlaceSearch "+ searchText);
            //$rootScope.placeSearhInitText = searchText;
            $rootScope.loadPlace(searchText);
            $scope.modalPlaceSelect.show();
        }

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
        $scope.goToRequestFriendDetail = function(requestdetail){
            $rootScope.selectedRequestDetail = requestdetail;
            $state.go('tab.requests-detail-friend-detail');
        }

        $rootScope.addFriendToRequestDetail = function(user){
            console.log("addFriendToRequestDetail");
            var RequestDetail = Parse.Object.extend("request_detail");

            $rootScope.selectedRequestDetail = new RequestDetail();
            $rootScope.selectedRequestDetail.set('parent',$rootScope.selectedRequest);
            $rootScope.selectedRequestDetail.set('user',user);
//            $scope.requestdetails.push($rootScope.selectedRequestDetail);
//            $scope.$apply();
            $state.go('tab.requests-detail-friend-detail');


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
                    $rootScope.requestdetails=details;
                    for (var i in $scope.requestdetails){
                        $rootScope.requestdetails[i].amount = $rootScope.requestdetails[i].get('amount');
                        var paidAmount = 0;
                        var ownAmount = 0;
                        ownAmount = $rootScope.requestdetails[i].get('amount');
                        if ($rootScope.requestdetails[i].get('tran')){
                            paidAmount = $rootScope.requestdetails[i].get('tran').get('amount');
                        }
                        $rootScope.requestdetails[i].set('balance', ownAmount-paidAmount);
                    }

                    $rootScope.$apply();
                    $rootScope.hideLoading();
                }
            });
        }
        $scope.clearLocationDetail = function(){
            $rootScope.selectedRequest.set('location_detail',undefined);
        }

        $scope.calcTotalAmount = function(){
            console.log("calcTotalAmount "+$rootScope.requestdetails.length);
            var amount = 0;
            for (var i in $rootScope.requestdetails){
                console.log("calcTotalAmount "+$rootScope.requestdetails[i].get('user').getUsername());
                amount += $rootScope.requestdetails[i].amount;
                var paidAmount = 0;
                var ownAmount = 0;
                ownAmount = $rootScope.requestdetails[i].amount;
                if ($rootScope.requestdetails[i].get('tran')){
                    paidAmount = $rootScope.requestdetails[i].get('tran').get('amount');
                }
                $rootScope.requestdetails[i].set('balance', ownAmount-paidAmount);

            }
            console.log("calcTotalAmount "+amount);
            $rootScope.selectedRequest.amount = amount;
            $rootScope.selectedRequest.set('amount', amount);

        }

        $rootScope.addFriendToRequest = function(user){
            console.log("addFriendToRequest");
            var RequestDetail = Parse.Object.extend("request_detail");
            var rd = new RequestDetail();
            rd.set('parent',$rootScope.selectedRequest);
            rd.set('user', user);
            $rootScope.requestdetails.push(rd);
            $rootScope.$apply();
            $scope.modalFriendRequestSelect.hide();

        }
        $scope.removeRequestDetail = function(detail){
            console.log("removeRequestDetail");
            console.log("removeRequestDetail detail" + detail.get('user').getUsername());
            console.log("removeRequestDetail requestdetails = "+$rootScope.requestdetails.length);

            $rootScope.requestdetails.splice($rootScope.requestdetails.indexOf(detail),1);

            console.log("removeRequestDetail splice");
            if (detail.id){
                detail.destroy({
                    success:function(r){
                        console.log("removeRequestDetail destroyed");
                        $scope.calcTotalAmount();
                        $rootScope.$apply();
                        $state.go('tab.requests-detail');
                    }
                });
            }else{
                $state.go('tab.requests-detail');
            }
        }
        //$scope.openPhotoNote = function(imageSrc){
        //    var fileTransfer = new FileTransfer();
        //    var uri = encodeURI(imageSrc);
        //    var filename = uri.substring(uri.lastIndexOf("/"),uri.length);
        //    var fileURL = "cdvfile://localhost/persistent/photo.jpg";
        //    fileTransfer.download(
        //        uri,
        //        fileURL,
        //        function(entry) {
        //            console.log("download complete: " + entry.toURL());
        //            FullScreenImage.showImageURL("Documents/photo.jpg");
        //        },
        //        function(error) {
        //            console.log("download error source " + error.source);
        //            console.log("download error target " + error.target);
        //            console.log("upload error code" + error.code);
        //        }
        //
        //    );
        //
        //}

        $scope.selectRequestUser = function(){
            console.log("selectRequestUser ");
            console.log("selectRequestUser $rootScope.selectedRequest.title = " + $rootScope.selectedRequest.title);

            if ($rootScope.selectedRequest.title)
                $rootScope.selectedRequest.set('title', $rootScope.selectedRequest.title);

            if ($rootScope.selectedRequest.note)
                $rootScope.selectedRequest.set('note', $rootScope.selectedRequest.note);

            if ($rootScope.selectedRequest.get('group')){
                $rootScope.goToRequestGroupDetail($rootScope.selectedRequest.get('group'));
//                $state.go('tab.friends-request-group');
            }else{
                $state.go('tab.friends-request');
            }

        }

        $rootScope.chaseDetail = function(detail){
            var msg = "Reminder: ";
            msg += " Please pay " + $rootScope.user.getUsername();
            msg += " "  + $filter('currency') (detail.get('amount'),$rootScope.selectedRequest.get('currency').get('code'));
            msg += " for " +$rootScope.selectedRequest.get('title');
            sendPushMessage(msg, "P_"+detail.get('user').id);
            $rootScope.alert("Reminder sent to "+detail.get('user').getUsername(),msg);
        }
        $scope.saveRequestDetail = function(detail){
            console.log("saveRequestDetail");
            $scope.RequestDetailSaving = true;
            $rootScope.selectedRequest.set('created_by', $rootScope.user);
            $rootScope.selectedRequest.save(null,{
                success:function(r){
                    console.log("saveRequestDetail saved Request");
                    detail.set('amount',detail.amount);
                    detail.save(null, {
                        success:function(d){
                            console.log("saveRequestDetail saved detail");
                            if (!$scope.requestdetails){
                                $scope.requestdetails=[];
                            }
                            if ($rootScope.requestdetails.indexOf(detail)==-1){
                                $scope.requestdetails.push(detail);
                            }

                            $scope.calcTotalAmount();
                            $scope.RequestDetailSaving = false;
                            $state.go('tab.requests-detail');
                        }
                    })
                },error:function(obj,error){
                    $scope.RequestDetailSaving = false;
                    console.log(error.message);
                }
            })
        }
        $scope.saveRequest = function(request){
            console.log("RequestDetail - saveRequest");
            console.log($rootScope.Requests.indexOf(request));
            $scope.RequestDetailSaving = true;
            $rootScope.showLoading('Saving');
            $rootScope.selectedRequest.set('title', request.title);
            $rootScope.selectedRequest.set('amount', request.amount);
            $rootScope.selectedRequest.set('note', request.note);
            //$rootScope.selectedRequest.set('currency', $rootScope.selectedCurrency);
//            $rootScope.selectedRequest.set('group', $rootScope.selectedGroup);
            $rootScope.selectedRequest.set('created_by', $rootScope.user);
            $scope.calcTotalAmount();
            $rootScope.selectedRequest.save(null,{
                success:function (request){
                    console.log("Request saved");
                    $rootScope.selectedRequest = request;
                    if ($rootScope.requestdetails){
                        for (var i in $rootScope.requestdetails){
                            $rootScope.requestdetails[i].set('parent',request);

                            if (isNaN($rootScope.requestdetails[i].amount)){
                                $rootScope.alert("Invalid Amount");
                                    throw ("invalid amount");
                            }
                            $rootScope.requestdetails[i].set('amount',$rootScope.requestdetails[i].amount);
                            $rootScope.requestdetails[i].save();
                            // send push if outstanding payment
                            if ($rootScope.requestdetails[i].get('balance')!=0){
                                var msg = "Please pay " + $rootScope.user.getUsername();
                                msg += " " + $filter('currency')($rootScope.requestdetails[i].amount,$rootScope.selectedRequest.get('currency').get('code')) ;
                                msg += " for " + $rootScope.selectedRequest.get('title');
                                sendPushMessage(msg, "P_"+$rootScope.requestdetails[i].get('user').id);
                            }

                        }

                    }

                    $scope.RequestDetailSaving = false;
                    $rootScope.hideLoading();
//                    setTimeout($rootScope.loadRequests(),1000);

//                    $scope.loadBoth();
                    $rootScope.$apply();
//                    $rootScope.loadRequestInit();
                    $state.go('tab.requests');

                },error:function(obj, error){
                    console.log('error '+error.message);
                    $rootScope.hideLoading();
                }
            })
        }

        $scope.selectedPlace = function(place){
            console.log("selectedPlace");
            $rootScope.selectedRequest.title = place.getElementsByTagName('name')[0].childNodes[0].nodeValue;
            $rootScope.selectedRequest.set('title',$rootScope.selectedRequest.title);
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
                $rootScope.requestdetails = [];
//                if (!$rootScope.requestdetails){
//                    console.log("$scope.requestdetails empty and it's init");
//                    $rootScope.requestdetails = [];
//                }
                console.log("create selectedRequest");
            }else{
                //Refresh Request object for Display
//                $rootScope.showLoading("Loading...");
                $rootScope.selectedRequest.title = $rootScope.selectedRequest.get('title');
                $rootScope.selectedRequest.amount = $rootScope.selectedRequest.get('amount');
                $rootScope.selectedRequest.note = $rootScope.selectedRequest.get('note');

                getUserRating($rootScope.selectedRequest, $rootScope.user, function(rating){
                    $rootScope.selectedRequest.rate = rating;
                    $rootScope.$apply();
                })
                if ($rootScope.selectedRequest.get('currency')){
                    $rootScope.selectedRequest.get('currency').fetch({
                        success:function(r){
                            $scope.loadRequestDetails();
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

            }

        }



        $scope.openCamera = function(){
            var options =   {
                quality: 30,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: 1,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
                encodingType: 0     // 0=JPG 1=PNG
            }


            navigator.camera.getPicture(onSuccess,onFail,options);
        }
        var onSuccess = function(FILE_URI) {
                        $rootScope.showLoading('Loading...')
            resizeImageForPhotoNote(FILE_URI, function(data){
                console.log("success got pic");
                var file = new Parse.File("photo.jpg", {base64:data});

                $rootScope.selectedRequest.set('photo',file);
//                $rootScope.hideLoading();
                $rootScope.selectedRequest.save(null,{
                        success:function(request){
                            console.log("Photo Note saved");
                            $rootScope.$apply();
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

        $scope.payBack = function(irequest){
            //save tran
            $rootScope.showLoading("Processing");
            var tranId = Common.getID();
            var group = irequest.get('parent').get('group');
            var currencyId = irequest.get('parent').get('currency').id;
            var amount = Number(irequest.get('amount'));
            var fromuser = irequest.get('user');
            var touser = irequest.get('parent').get('created_by');
            var note = irequest.get('parent').get('title');
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
                console.log("payback - has group "+ group.get('group'));
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
        $scope.viewRatingComment = function(request){
            //load all related Comments

            $rootScope.selectedRequest = request;
            $rootScope.comment={};
            loadRelatedComments(request, function(comments){

                $rootScope.RequestComments = comments;

                getAverageRating($rootScope.selectedRequest, function(avgRating){
                    $rootScope.selectedRequest.avgrate = avgRating;
//                    sendCommentToFriends(message, request, $rootScope.user.id);
                    $rootScope.$apply();
                    $rootScope.$broadcast('scroll.refreshComplete');
                    $state.go('tab.requests-comments');
                })
                //Update Readby User
                for (var i in $rootScope.RequestComments){
                    $rootScope.RequestComments[i].addUnique('readby_userid', $rootScope.user.id);
                    $rootScope.RequestComments[i].save(null,{
                       success:function(comment){
                           console.log('comment added unique user');
                       }
                    });
                }

            });
        }
        $scope.onEditComment = function(form){
            if (form.comments !=""){
                $scope.commentSaving = false;
            }
        }
        $scope.onEditRating = function(rate, request){
            console.log("rating processing");
            saveRating(rate, request, $rootScope.user, function(r){
                console.log("rating saved in controller");
            });
        }
        $scope.saveComment = function(form, request){
            $scope.commentSaving = true;
            if (!form.comments || form.comments ===""){
                throw ("Empty Comment");
            }
            var message = $rootScope.user.getUsername() + " commented on " + request.get('title') + ": ";
            message += form.comments;
            saveComment(form, request, $rootScope.user, function(comment){
                $rootScope.RequestComments.push(comment);
                $rootScope.comment={};
                $scope.commentSaving = false;
                getAverageRating($rootScope.selectedRequest, function(avgRating){
                    $rootScope.selectedRequest.avgrate = avgRating;
                    sendCommentToFriends(message, request, $rootScope.user.id);
                    $rootScope.$apply();

                })

            });
        }



})
.controller('IncomingRequestDetailCtrl', function($rootScope, $scope, $state,$ionicModal, ParseService, Common, $filter){
        //Google Anaytics
        if (typeof analytics !== 'undefined') {
            analytics.trackView('Incoming Request Detail');
        }


});
