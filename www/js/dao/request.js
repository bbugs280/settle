/**
 * Created by vincent on 14/12/14.
 */
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

function getUserRating(request, user, callback){
    console.log("getUserRating");
    var Rating = Parse.Object.extend("request_rating");
    var query = new Parse.Query(Rating);
    query.equalTo('parent', request);
    query.equalTo('created_by', user);
    query.first({
        success: function(rating){
            if (rating.length!=0){
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