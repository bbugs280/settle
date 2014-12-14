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


        canvas.width = MAX_WIDTH;
        canvas.height = MAX_HEIGHT;

        ctx.drawImage(image, x, y, output_width, output_height, 0, 0, MAX_WIDTH, MAX_HEIGHT);


        callback(canvas.toDataURL());
    }

    image.src = src;

}



function resizeImageForPhotoNote(src, callback){
    var MAX_HEIGHT_NOTE = 500;
    var x = 0;
    var y = 0;

    var image = new Image();

    image.onload = function(){
        //    var canvas = document.getElementById("myCanvas");
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);


        if (image.height > MAX_HEIGHT_NOTE){
            var ratio = MAX_HEIGHT_NOTE / image.height;
            console.log("resize ratio "+ratio);
            image.width = image.width * ratio;
            image.height = MAX_HEIGHT_NOTE;
        }

        canvas.width = image.width;
        canvas.height = image.height;

        console.log("image size w = "+canvas.width);
        console.log("image size h = "+canvas.height);
        ctx.drawImage(image, x, y, canvas.width, canvas.height);


        //Rotate
//        ctx.clearRect(0,0,canvas.width,canvas.height);
//
//        // save the unrotated context of the canvas so we can restore it later
//        // the alternative is to untranslate & unrotate after drawing
//        ctx.save();
//
//        // move to the center of the canvas
//        ctx.translate(canvas.width/2,canvas.height/2);
//
//        // rotate the canvas to the specified degrees
//        ctx.rotate(90*Math.PI/180);
//
//        // draw the image
//        // since the context is rotated, the image will be rotated also
//        ctx.drawImage(image,-image.width/2,-image.width/2);

        callback(canvas.toDataURL());
    }

    image.src = src;

}