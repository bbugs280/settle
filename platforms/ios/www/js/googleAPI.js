/**
 * Created by vincent on 11/12/14.
 */

function placeAPI(text, country){
    var xmlhttp = new XMLHttpRequest();
    var result;
    country = country.replace(" ","+");
    var url = "https://maps.googleapis.com/maps/api/place/textsearch/xml?query="+text+"+in+"+country+"&key=AIzaSyCvyJk8GZJaJkKtOMutktGtNyo27NBGYMA";
    console.log(url);

    xmlhttp.open("GET",url,false);

    xmlhttp.send();
    result = xmlhttp.responseXML.getElementsByTagName("result");
    console.log("Place API results count =  "+ result.length);
    return result;
}