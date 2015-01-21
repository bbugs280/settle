/**
 * Created by vincent on 14/12/14.
 */

function loadRequests(user, callback){

    var RequestDetail = Parse.Object.extend("request_detail");
    var Request = Parse.Object.extend("request");
    var Tran = Parse.Object.extend("transaction");

    var queryOutgoingRequestDetail = new Parse.Query(RequestDetail);
    var queryOutgoingRequest = new Parse.Query(Request);
    queryOutgoingRequest.equalTo('created_by',user);
    queryOutgoingRequestDetail.notEqualTo('balance',0);
    queryOutgoingRequestDetail.matchesQuery('parent',queryOutgoingRequest);

    var queryOutgoingPayment = new Parse.Query(RequestDetail);
    var queryTran = new Parse.Query(Tran);
    queryTran.notEqualTo('read', true);
    queryOutgoingPayment.exists('tran');
    queryOutgoingPayment.equalTo('user',user);
    queryOutgoingPayment.matchesQuery('tran',queryTran);


    var mainQuery = Parse.Query.or(queryOutgoingRequestDetail, queryOutgoingPayment);
    mainQuery.include('parent');
    mainQuery.include('user');
    mainQuery.include('tran');
    mainQuery.include(['tran.fromuser']);
    mainQuery.include(['tran.touser']);
    mainQuery.include(['parent.created_by']);
    mainQuery.include(['parent.group']);
    mainQuery.include(['parent.currency']);
    mainQuery.descending('updatedAt');
    mainQuery.find({
        success:function(requests){
            console.log("Requests count = "+requests.length);
            for (var i in requests){
                if (requests[i].get('parent').get('title')){
                    requests[i].title = requests[i].get('parent').get('title');
                }else{
                    requests[i].title = '';
                }
                if (requests[i].get('user').id == user.id){
                    //isPayment
                    requests[i].isPayment = true;
                    requests[i].user = requests[i].get('parent').get('created_by').getUsername();
                }else if (requests[i].get('parent').get('created_by').id == user.id){
                    //isRequest
                    requests[i].isRequest = true;
                    requests[i].user = requests[i].get('user').getUsername();

                }
//                        requests[i].title = requests[i].get('parent').get('title');
                requests[i].amount = requests[i].get('amount');
                requests[i].currencyCode = requests[i].get('parent').get('currency').get('code');
                if (requests[i].get('parent').get('group')){
                    requests[i].groupName = requests[i].get('parent').get('group').get('group');
                }else{
                    requests[i].groupName = "";
                }
                requests[i].updateAt = requests[i].updatedAt.toLocaleString();
            }

            callback(requests);
        }
    })
}

function loadIncomingRequests(user, callback){
    var RequestDetail = Parse.Object.extend("request_detail");
    var Request = Parse.Object.extend("request");
    var Tran = Parse.Object.extend("transaction");
    var queryTran = new Parse.Query(Tran);
    var queryIR = new Parse.Query(RequestDetail);
    var queryTranR = new Parse.Query(Request);
    var queryTranIR = new Parse.Query(RequestDetail);

    queryTran.notEqualTo('read', true);
    queryTranR.equalTo('created_by', user);
    queryTranIR.exists('tran');
    queryTranIR.matchesQuery('parent',queryTranR);
    queryTranIR.matchesQuery('tran',queryTran);

    queryIR.equalTo('user', user);
    queryIR.notEqualTo('balance', 0);

    var mainQuery = Parse.Query.or(queryIR, queryTranIR);
    mainQuery.include('parent');
    mainQuery.include('user');
    mainQuery.include('tran');
    mainQuery.include(['tran.touser']);
    mainQuery.include(['tran.fromuser']);
    mainQuery.include(['parent.created_by']);
    mainQuery.include(['parent.group']);
    mainQuery.include(['parent.currency']);
    mainQuery.descending('updatedAt');
    mainQuery.find({
        success:function(requestdetails){
            console.log("loadIncomingRequests count = "+requestdetails.length);
            for (var i in requestdetails){
//                console.log("loadIncomingRequests user = "+requestdetails[i].get('parent').get('created_by').getUsername());
                if (requestdetails[i].get('parent').get('title')){
                    requestdetails[i].title = requestdetails[i].get('parent').get('title');
                }else{
                    requestdetails[i].title = '';
                }
                if (requestdetails[i].get('user').id == user.id){
                    //isRequest
                    requestdetails[i].isRequest = true;
                    requestdetails[i].user = requestdetails[i].get('parent').get('created_by').getUsername();

                }else if (requestdetails[i].get('parent').get('created_by').id == user.id){
                    //isPayment
                    requestdetails[i].isPayment = true;
                    requestdetails[i].user = requestdetails[i].get('user').getUsername();
                }

                requestdetails[i].amount = requestdetails[i].get('amount');
                requestdetails[i].currencyCode = requestdetails[i].get('parent').get('currency').get('code');
                if (requestdetails[i].get('parent').get('group')){
                    requestdetails[i].groupName = requestdetails[i].get('parent').get('group').get('group');
                }else{
                    requestdetails[i].groupName = "";
                }
                requestdetails[i].updateAt = requestdetails[i].updatedAt.toLocaleString();

//                getUnreadCommentCount(requestdetails[i],user);
            }

            callback(requestdetails);
        }
    })
}


function loadArchive(user,ArchiveRequests, archiveRecordCount, archiveRecordToSkip,callback){
    console.log("loadArchive start with archiveRecordCount = "+archiveRecordCount);
    var RequestDetail = Parse.Object.extend("request_detail");
    var Request = Parse.Object.extend("request");
    var Tran = Parse.Object.extend("transaction");
    //OutGoing Query
    var queryOutgoingRequestDetail = new Parse.Query(RequestDetail);
    var queryOutgoingRequest = new Parse.Query(Request);
    queryOutgoingRequest.equalTo('created_by',user);
    queryOutgoingRequestDetail.equalTo('balance',0);
    queryOutgoingRequestDetail.matchesQuery('parent',queryOutgoingRequest);

    var queryOutgoingPayment = new Parse.Query(RequestDetail);
    var queryTran = new Parse.Query(Tran);
    queryTran.equalTo('read', true);
    queryOutgoingPayment.matchesQuery('tran',queryTran);
    queryOutgoingPayment.exists('tran');
    queryOutgoingPayment.equalTo('user',user);

    var outgoingQuery = Parse.Query.or(queryOutgoingRequestDetail, queryOutgoingPayment);

    //Incoming Query
    var queryTran = new Parse.Query(Tran);
    var queryIR = new Parse.Query(RequestDetail);
    var queryTranR = new Parse.Query(Request);
    var queryTranIR = new Parse.Query(RequestDetail);

    queryTran.equalTo('read', true);
    queryTranR.equalTo('created_by', user);
    queryTranIR.exists('tran');
    queryTranIR.matchesQuery('parent',queryTranR);
    queryTranIR.matchesQuery('tran',queryTran);

    queryIR.equalTo('user', user);
    queryIR.equalTo('balance', 0);

    var incomingQuery = Parse.Query.or(queryIR, queryTranIR);
    var mainQuery = Parse.Query.or(incomingQuery, outgoingQuery);

    mainQuery.include('parent');
    mainQuery.include('user');
    mainQuery.include('tran');
    mainQuery.include(['tran.touser']);
    mainQuery.include(['tran.fromuser']);
    mainQuery.include(['tran.group']);
    mainQuery.include(['parent.created_by']);
    mainQuery.include(['parent.group']);
    mainQuery.include(['parent.currency']);
    mainQuery.descending('updatedAt');

    mainQuery.limit(archiveRecordCount);
    mainQuery.skip(archiveRecordToSkip);
    mainQuery.find({
        success:function(requests){
            console.log("archived requests.length " +requests.length);
            if (requests.length==0){

                callback(null);
                throw ("no more record");
            }


            for (var i in requests){

                if (requests[i].get('parent').get('title')){
                    requests[i].title = requests[i].get('parent').get('title');
                }else{
                    requests[i].title = '';
                }
                if (requests[i].get('user').id == user.id){
                    // isPayment
                    requests[i].isPayment = true;

                    if (requests[i].get('tran').get('fromuser').id ==user.id){
                        //isOutgoing
                        requests[i].isOutgoing = true;
                        requests[i].user = requests[i].get('tran').get('touser').getUsername();
                    }else if(requests[i].get('tran').get('touser').id ==user.id){
                        requests[i].isIncoming = true;
                        requests[i].user = requests[i].get('tran').get('fromuser').getUsername();
                    }


                    requests[i].amount = requests[i].get('tran').get('amount');
                    requests[i].currencyCode = requests[i].get('tran').get('currency').get('code');
                    if (requests[i].get('parent').get('group')){
                        requests[i].groupName = requests[i].get('parent').get('group').get('group');
                    }else{
                        requests[i].groupName = "";
                    }

                    requests[i].updateAt = requests[i].updatedAt.toLocaleString();


                }else if (requests[i].get('parent').get('created_by').id == user.id){
                    // isRequest
                    requests[i].isRequest = true;

                    if (requests[i].get('parent').get('created_by').id == user.id){
                        //isOutgoing
                        requests[i].isOutgoing = true;
                        requests[i].user = requests[i].get('user').getUsername();
                    }else if(requests[i].get('user').id  == user.id){
                        requests[i].isIncoming = true;
                        requests[i].user = requests[i].get('parent').get('created_by').getUsername();
                    }
//                            requests[i].title = requests[i].get('parent').get('title');
                    requests[i].amount = requests[i].get('amount');
                    requests[i].currencyCode = requests[i].get('parent').get('currency').get('code');
                    if (requests[i].get('parent').get('group')){
                        requests[i].groupName = requests[i].get('parent').get('group').get('group');
                    }else{
                        requests[i].groupName = "";
                    }

                    requests[i].updateAt = requests[i].updatedAt.toLocaleString();
                }
                ArchiveRequests.push(requests[i]);
            }

            callback(requests);

        }
    })
}

function loadRelatedComments(request, callback){
    var Comment = Parse.Object.extend("request_comment");
    var query = new Parse.Query(Comment);
    query.include('created_by');
    query.equalTo('parent', request);
    query.ascending('updatedAt');
    query.find({
        success: function(comments){
            console.log("loadRelatedComments "+comments.length);
            callback(comments);
        }
    });
}

function getAverageRating(request, callback){
    var Rating = Parse.Object.extend("request_rating");
    var query = new Parse.Query(Rating);
    var totalRating = 0;
    var noOfrating = 0;
    query.equalTo('parent', request);
    query.find({
        success: function(rating){
            if (rating.length!=0){
                for (var i in rating){
                    if (rating[i].get('rating')){
                        totalRating += rating[i].get('rating');
                        noOfrating++;
                    }
                }
                totalRating = totalRating / noOfrating;
            }

            console.log(totalRating);
            callback(totalRating);
        }
    });
}

function getUnreadCommentCount(requestdetail,user,callback){
    var RequestDetail = Parse.Object.extend("request_detail");
    var Request = Parse.Object.extend("request");
    var RequestComment = Parse.Object.extend("request_comment");

    var queryRequestComment = new Parse.Query(RequestComment);
    queryRequestComment.equalTo('parent',requestdetail.get('parent'));
    queryRequestComment.notEqualTo('readby_userid',user.id);
    queryRequestComment.count({
        success:function(c){
//            console.log("getUnreadCommentCount = "+ c);
            requestdetail.commentUnreadCount = c;
            callback(c);
        }
    })

}

function getUserRating(request, user, callback){
    console.log("getUserRating");
    var Rating = Parse.Object.extend("request_rating");
    var query = new Parse.Query(Rating);
    query.equalTo('parent', request);
    query.equalTo('created_by', user);
    query.first({
        success: function(rating){
            if (rating){
               console.log("user rating = "+rating.get('rating'));
               callback(rating.get('rating'));
            }
        }
    });
}

function saveComment(form,request,user,callback){
    var Comment = Parse.Object.extend("request_comment");
    var comment = new Comment();

    comment.set('rating', form.rate);
    comment.set('comment', form.comments);
    comment.set('parent', request);
    comment.set('created_by', user);
    comment.save(null,{
        success:function(c){
            console.log("comment saved");
            callback(c);
        }
    })
}

function saveRating(rating,request,user,callback){
    var Rating = Parse.Object.extend("request_rating");
    var rate = new Rating();
    var query = new Parse.Query(Rating);

    query.equalTo('created_by', user);
    query.equalTo('parent', request);
    query.first({
        success:function(r){
            if (r){
                rate = r;
            }

            rate.set('rating', rating);
            rate.set('parent', request);
            rate.set('created_by', user);
            rate.save(null,{
                success:function(c){
                    console.log("rating saved");
                    callback(c);
                }
            })
        }
    });

}

function sendCommentToFriends(message, request, ownuser_id){
    var userArray = [];
    var RequestDetail = Parse.Object.extend("request_detail");
    var RequestComment = Parse.Object.extend("request_comment");
    var query = new Parse.Query(RequestDetail);
    var queryComment = new Parse.Query(RequestComment);
    var ownuser_channel = "P_"+ownuser_id;
    //Sent to Request Creator

    userArray.push("P_"+request.get('created_by').id);
    //Send to People in Request
        query.equalTo('parent', request);
        query.include('user');
        query.find({
            success:function(rd){
                for (var i in rd){
                    var user_id = "P_"+rd[i].get('user').id;

                    console.log("sendCommentToFriends to Individuals = "+user_id);
                    if (userArray.indexOf(user_id)==-1){
                        userArray.push(user_id);
                    }

                }
                //Send to People commented
                queryComment.equalTo('parent', request);
                queryComment.include('created_by');
                queryComment.find({
                    success:function(rc){

                        for (var i in rc){
                            var user_id = "P_"+rc[i].get('created_by').id;
                            console.log("sendCommentToFriends to Individuals = "+user_id);
                            if (userArray.indexOf(user_id)==-1){
                                userArray.push(user_id);
                            }
                        }
                        userArray.splice(userArray.indexOf(ownuser_channel),1);
                        console.log("User in Array " + userArray);
                        sendPushMessage(message, userArray);
                    }
                });
            }
        });
//    }



}