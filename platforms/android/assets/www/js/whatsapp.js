/**
 * Created by vincent on 14/12/14.
 */
function whatsappSendMessage(contactid, msg){

    var url = "whatsapp://send?abid="+contactid+"&text="+encodeURIComponent(msg);
    console.log(url);
    window.open(url, '_system', 'location=no');
}

function openWhatsappWithMsg(msg){

    var url = "whatsapp://send?text="+encodeURIComponent(msg);
//    url = url.replace(" ","+");
    window.open(url, '_system', 'location=no');
}