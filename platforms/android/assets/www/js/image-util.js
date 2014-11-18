/**
 * Created by vincent on 17/11/14.
 */
var MAX_HEIGHT = 200;
var MAX_WIDTH = 200;
function resizeImage(src, callback){
    var image = new Image();

    image.onload = function(){
        //    var canvas = document.getElementById("myCanvas");
        var canvas = document.createElement('canvas');
        if(image.width > MAX_WIDTH) {
            image.height *= MAX_WIDTH / image.width;
            image.width = MAX_WIDTH;
        }
        console.log(image.width);
        console.log(image.height);
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0, image.width, image.height);

        //ctx.rect(0,0,MAX_WIDTH,MAX_HEIGHT);
        //ctx.stroke();
        //ctx.clip();
        //ctx.drawImage(image, 0, 0, image.width, image.height);

        callback(canvas.toDataURL());
    }

    image.src = src;

}