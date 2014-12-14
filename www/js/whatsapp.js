/**
 * Created by vincent on 14/12/14.
 */
function whatsappSendMessage(contactid, msg){

    var url = "whatsapp://send?abid="+contactid
        //+"&text="+msg;

    url = url.replace(" ","+");
    console.log(url);
    window.open(url, '_system', 'location=no');
}

function openWhatsappWithMsg(msg){

    var url = "whatsapp://send?text="+msg;
    url = url.replace(" ","+");
    window.open(url, '_system', 'location=no');
}