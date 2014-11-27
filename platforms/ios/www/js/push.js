/**
 * Created by vincent on 12/11/14.
 */

var pushNotification;
function registerPush(){
    console.log("register Push");
    pushNotification = window.plugins.pushNotification;

    $("#app-status-ul").append('<li>registering ' + device.platform + '</li>');
    if ( device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos" ){
        pushNotification.register(
            successHandler,
            errorHandler,
            {
                //"senderID":"17853414438",
//                "senderID":"able-coast-761",
                "ecb":"onNotification"
            });
    } else if ( device.platform == 'blackberry10'){
        pushNotification.register(
            successHandler,
            errorHandler,
            {
                invokeTargetId : "replace_with_invoke_target_id",
                appId: "replace_with_app_id",
                ppgUrl:"replace_with_ppg_url", //remove for BES pushes
                ecb: "pushNotificationHandler",
                simChangeCallback: replace_with_simChange_callback,
                pushTransportReadyCallback: replace_with_pushTransportReady_callback,
                launchApplicationOnPush: true
            });
    } else {
        pushNotification.register(
            tokenHandler,
            errorHandler,
            {
                "badge":"true",
                "sound":"true",
                "alert":"true",
                "ecb":"onNotificationAPN"
            });
    }
}


function subscribe(channel){

    parsePlugin.subscribe(channel, function(){
        console.log(" subscribe to " + channel);
    },function(e){
        alert(" subscribe Error ");
    });
}

function subscribeAllGroups(email){
    //Get related channels
    var user = new SUser();
    user.getFriendListForSub(email, function(g){
        console.log(g.length);
        if (g.length !=0){
            for (var i in g){
                subscribe("GRP_"+g[i].id);
            }
        }
    });

}
function unsubscribeAll(callback){
    parsePlugin.getSubscriptions(function(s){
        for (var i in s){
            console.log(s[i]);
            parsePlugin.unsubscribe(s[i], function(r){
                console.log("unsubscribed = "+r);

            },function(e){
                console.log("error "+ e.message);
                callback(e);
            });
        }
        callback(s);
    })
}

function successHandler (result) {
    console.log('successHandler result = ' + result);
}

function errorHandler (error) {
    console.log('error = ' + error);
}
// iOS
function onNotificationAPN (event) {
//onNotificationAPN =function(event) {
    console.log("IOS onNotificationAPN");
    if ( event.alert )
    {
        navigator.notification.alert(event.alert);
    }

    if ( event.sound )
    {
        var snd = new Media(event.sound);
        snd.play();
    }

    if ( event.badge )
    {
        pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
    }
}

// Android and Amazon Fire OS
//function onNotification(e) {
onNotification = function(e) {
    console.log("android onNotification");
    $("#app-status-ul").append('<li>EVENT -> RECEIVED:' + e.event + '</li>');

    switch( e.event )
    {
        case 'registered':
            if ( e.regid.length > 0 )
            {
                $("#app-status-ul").append('<li>REGISTERED -> REGID:' + e.regid + "</li>");
                // Your GCM push server needs to know the regID before it can push to this device
                // here is where you might want to send it the regID for later use.
                console.log("regID = " + e.regid);
            }
            break;

        case 'message':
            // if this flag is set, this notification happened while we were in the foreground.
            // you might want to play a sound to get the user's attention, throw up a dialog, etc.
            if ( e.foreground )
            {
                $("#app-status-ul").append('<li>--INLINE NOTIFICATION--' + '</li>');

                // on Android soundname is outside the payload.
                // On Amazon FireOS all custom attributes are contained within payload
                var soundfile = e.soundname || e.payload.sound;
                // if the notification contains a soundname, play it.
                var my_media = new Media("/android_asset/www/"+ soundfile);
                my_media.play();
            }
            else
            {  // otherwise we were launched because the user touched a notification in the notification tray.
                if ( e.coldstart )
                {
                    $("#app-status-ul").append('<li>--COLDSTART NOTIFICATION--' + '</li>');
                }
                else
                {
                    $("#app-status-ul").append('<li>--BACKGROUND NOTIFICATION--' + '</li>');
                }
            }

            $("#app-status-ul").append('<li>MESSAGE -> MSG: ' + e.payload.message + '</li>');
            //Only works for GCM
            $("#app-status-ul").append('<li>MESSAGE -> MSGCNT: ' + e.payload.msgcnt + '</li>');
            //Only works on Amazon Fire OS
            $status.append('<li>MESSAGE -> TIME: ' + e.payload.timeStamp + '</li>');
            break;

        case 'error':
            $("#app-status-ul").append('<li>ERROR -> MSG:' + e.msg + '</li>');
            break;

        default:
            $("#app-status-ul").append('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
            break;
    }
}

function tokenHandler (result) {
    // Your iOS push server needs to know the token before it can push to this device
    // here is where you might want to send it the token for later use.
    console.log('device token = ' + result);

    //Since there's no way to reset Badge on Parse now, this is commented
//    var badgeCount = Parse.Installation.current().get('badge');
//    console.log("badge count = "+badgeCount);
//    pushNotification.setApplicationIconBadgeNumber(successBadgeCallback, errorBadgeCallback, badgeCount);
//    resetBadge();

}

function successBadgeCallback(result){
    console.log("successBadgeCallback :"+ result);
}

function errorBadgeCallback(result){
    console.log("errorBadgeCallback :"+ result);
}

function resetBadge(){
    var install = Parse.Installation.current();
    install.set('badge',0);
    install.save(null, {
        success:function (r){
            console.log("badge reset");
        },error:function(error){
            console.log("badge reset error = "+error.message);
        }
    })
}


function sendPushMessage (message, channel){
    var query = new Parse.Query(Parse.Installation);
    query.equalTo('channels', channel); // Set our channel

    Parse.Push.send({
        where: query,
        data: {
            alert: message,

            sound: "default"
//            ,
//            badge:"Increment"
        }
    }, {
        success: function() {
            // Push was successful
            console.log("Push was successful");
        },
        error: function(error) {
            // Handle error
            console.log("Push was failed"+error.message);
        }
    });
}