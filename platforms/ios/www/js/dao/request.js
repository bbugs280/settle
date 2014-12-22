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
    var Comment = Parse.Object.extend("request_comment");
    var query = new Parse.Query(Comment);
    var totalRating = 0;
    query.equalTo('parent', request);
    query.descending('updatedAt');
    query.find({
        success: function(comments){
            if (comments.length!=0){
                for (var i in comments){
                    totalRating += comments[i].get('rating');
                }

                totalRating = totalRating / comments.length;
            }
            callback(totalRating);
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