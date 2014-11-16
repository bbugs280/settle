/**
 * Created by vincent on 16/11/14.
 */

function getRates(codeArray){

    var xmlhttp = new XMLHttpRequest();
    var codes;
    var result;
    for (var i in codeArray){
        if (i!=0)
            codes+=",";
        codes+= "'"+codeArray[i]+"'";
    }
    var url = "http://query.yahooapis.com/v1/public/yql?q=select * from yahoo.finance.xchange where pair in ("+codes+")&env=store://datatables.org/alltableswithkeys";
    console.log(url);
    xmlhttp.open("GET",url,true);
    xmlhttp.send();

    result = xmlhttp.responseXML;

}

function getFXRate(ccy1, ccy2){
    var xmlhttp = new XMLHttpRequest();
    var result;
    var url ="http://rate-exchange.appspot.com/currency";
    console.log(url);
    xmlhttp.open("GET",url,true);
//    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send("from="+ccy1+"&to="+ccy2);
    result = JSON.parse(xmlhttp.responseText);
    console.log(result);
//    result should have the following format
//    {"to": "EUR", "rate": 0.76911244400000001, "from": "USD"}
    return result;
}
