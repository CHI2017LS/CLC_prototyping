(function () {
    var takePicture = document.querySelector("#take-picture");
        //showPicture = document.querySelector("#show-picture");
    console.log(takePicture);
    if (takePicture) {
        // Set events
        takePicture.onchange = function (event) {
            console.log("take picture");
            // Get a reference to the taken picture or chosen file
            var files = event.target.files,
                file;
            if (files && files.length > 0) {
                file = files[0];
                try {
                    // Fallback if createObjectURL is not supported
                    var fileReader = new FileReader();
                    fileReader.onload = function (event) {
                        //showPicture.src = event.target.result;
                        
                    createSlide(event.target.result);
                        

                    };
                    fileReader.readAsDataURL(file);
                }
                catch (e) {
                    //
                    var error = document.querySelector("#error");
                    if (error) {
                        error.innerHTML = "Neither createObjectURL or FileReader are supported";
                    }
                }
                
            }
        };
    }
})();

function uploadFile(blobFile){

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "server.php", true);
    xhr.onload = function (oEvent){
        // After finishing uploading
        alert("upload finish!");
    }
    
    xhr.send(blobFile);
}