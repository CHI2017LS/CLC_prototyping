var imgMain;
$(document).ready(function(){
    var takePicture = document.querySelector("#take-picture");
    //showPicture = document.querySelector("#show-picture");
    console.log(takePicture);
    if (takePicture) {
        // Set events
        takePicture.onchange = function(event) {
            console.log("take picture~~");
            // Get a reference to the taken picture or chosen file
            var files = event.target.files,file;
            var img = document.createElement("img");

            if (files && files.length > 0) {
                console.log(">0");
                file = files[0];
                var extension = file.name.split('.').pop().toLowerCase();
                try {
                    var ii = loadImage(
                            file,
                            function (canvas) {
                                
                                console.log(canvas);
                                createSlide(canvas.toDataURL("image/"+extension));

                            },
                            {maxWidth: 300,canvas:true} // Options
                    );
                    //var mpImg = new MegaPixImage(file);
                    /*
                    var fileReader = new FileReader();
                    
                    var resCanvas1 = document.createElement('canvas');
                    
                    console.log(extension);
                    
                    fileReader.onload = function(event) {
                        //showPicture.src = event.target.result;
                        //img.src = event.target.result;
                        console.log("onload");
                        
                        //img.onload = function()
                
                        //console.log("img start: " + img.width + ", " + img.height);
                        //var newURL = resizeImage(img);
                        //mpImg.render(img, { maxWidth: 300, maxHeight: 300, quality: 0.5 });
                        //mpImg.render(resCanvas1, { maxWidth: 300, maxHeight: 300 });
                        
                        //cvs = resCanvas1;
                        //console.log(resCanvas1.toDataURL("image/"+extension));
                        //createSlide(resCanvas1.toDataURL("image/"+extension));

                        //console.log(newURL);
                        //createSlide("image/"+extension+newURL);
                        //createSlide(img.src);
                        //createSlide(event.target.result);
                    };
                    fileReader.readAsDataURL(file);
                    */
                } catch (e) {
                    //
                    var error = document.querySelector("#error");
                    if (error) {
                        error.innerHTML = "Neither createObjectURL or FileReader are supported";
                    }
                    console.log(error);
                }

            }
        };
    }
});

function resizeImage(img) {
    //console.log("img is resize function: " + img.naturalWidth + ", " + img.naturalHeight);

    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");

    //ctx.drawImage(img, 0, 0); // Workable on Android 
    drawImageIOSFix(ctx, img, 0, 0);

    var MAX_WIDTH = 200;
    var MAX_HEIGHT = 200;
    var width = img.width;
    var height = img.height;

    console.log("img.width: " + img.width + ", img.height: "+ img.height);

    if (width > height) {
        if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
        }
    } else {
        if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
        }
    }
    canvas.width = width;
    canvas.height = height;

    console.log("canvas.width: " + canvas.width + ", canvas.height: " + canvas.height);

    var ctx = canvas.getContext("2d");
    //ctx.drawImage(img, 0, 0, width, height); // Workable Android 
    drawImageIOSFix(ctx, img, 0, 0, width, height);
    var dataurl = canvas.toDataURL("image/png");
    //console.log("new dataurl: " + dataurl);
    return dataurl;
    //document.getElementById('output').src = dataurl;
}

/**
 * Detecting vertical squash in loaded image.
 * Fixes a bug which squash image vertically while drawing into canvas for some images.
 * This is a bug in iOS6 devices. This function from https://github.com/stomita/ios-imagefile-megapixel
 * 
 */
function detectVerticalSquash(img) {
    var iw = img.naturalWidth,
        ih = img.naturalHeight;

    var canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = ih;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    //console.log("in detectVerticalSquash: " + ih);
    var data = ctx.getImageData(0, 0, 1, ih).data;
    // search image edge pixel position in case it is squashed vertically.
    var sy = 0;
    var ey = ih;
    var py = ih;
    while (py > sy) {
        var alpha = data[(py - 1) * 4 + 3];
        if (alpha === 0) {
            ey = py;
        } else {
            sy = py;
        }
        py = (ey + sy) >> 1;
    }
    var ratio = (py / ih);
    return (ratio === 0) ? 1 : ratio;
}

/**
 * A replacement for context.drawImage
 * (args are for source and destination).
 */
function drawImageIOSFix(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
    var vertSquashRatio = detectVerticalSquash(img);
    // Works only if whole image is displayed:
    // ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh / vertSquashRatio);
    // The following works correct also when only a part of the image is displayed:
    
    ctx.drawImage(img, sx * vertSquashRatio, sy * vertSquashRatio,
        sw * vertSquashRatio, sh * vertSquashRatio,
        dx, dy, dw, dh);
/*
    if (vertSquashRatio < 1) {
        canvas.width = img.width * vertSquashRatio;
        canvas.height = img.height * vertSquashRatio; 
        ctx.drawImage(img, 0, 0, 
                       img.width * vertSquashRatio, img.height);
    } else {
        canvas.width = img.width * vertSquashRatio;
        canvas.height = img.height * vertSquashRatio; 
        ctx.drawImage(img, 0, 0, 
                       img.width, img.height);
    }*/
}