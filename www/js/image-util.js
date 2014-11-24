/**
 * Created by vincent on 17/11/14.
 */
var MAX_HEIGHT = 200;
var MAX_WIDTH = 200;
var x = 0;
var y = 0;
var output_height =0;
var output_width = 0;
var TO_RADIANS = Math.PI/180;

function resizeImage(src, callback){
    var image = new Image();

    image.onload = function(){
        //    var canvas = document.getElementById("myCanvas");
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //Detect Image orientation
        if (image.width > image.height){
            //Landscape
            console.log("orientation is landscape");
            x = (image.width - image.height) / 2;
            output_height = image.height;
            output_width = image.height;
        }else{
            console.log("orientation is hort");
            y = (image.height - image.width) / 2;
            output_height = image.width;
            output_width = image.width;
        }

//        if(image.width > MAX_WIDTH) {
//            image.height *= MAX_WIDTH / image.width;
//            image.width = MAX_WIDTH;
//        }
//        canvas.width = image.width;
//        canvas.height = image.height;

        canvas.width = MAX_WIDTH;
        canvas.height = MAX_HEIGHT;
console.log("x ", x);
console.log("y ", y);
console.log("width ", image.width);
console.log("height ", image.height);
//        ctx.drawImage(image, x, y, image.width, image.height);
        ctx.drawImage(image, x, y, output_width, output_height, 0, 0, MAX_WIDTH, MAX_HEIGHT);
        ctx.rotate(90 * TO_RADIANS);
        ctx.drawImage(image, 0,0);

        callback(canvas.toDataURL());
    }

    image.src = src;

}