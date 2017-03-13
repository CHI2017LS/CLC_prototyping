(function () {
    var takePicture = document.querySelector("#take-picture"),
        showPicture = document.querySelector("#show-picture");

    if (takePicture && showPicture) {
        // Set events
        takePicture.onchange = function (event) {
            // Get a reference to the taken picture or chosen file
            var files = event.target.files,
                file;
            if (files && files.length > 0) {
                file = files[0];
                try {
                    // Create ObjectURL
                    var imgURL = window.URL.createObjectURL(file); // Type: blob url

                    // Set img src to ObjectURL
                    showPicture.src = imgURL;

                    //upload the file to server
                    uploadFile(imgURL);

                    // Revoke ObjectURL
                    URL.revokeObjectURL(imgURL); // After used, release the memory
                }
                catch (e) {
                    try {
                        // Fallback if createObjectURL is not supported
                        var fileReader = new FileReader();
                        fileReader.onload = function (event) {
                            showPicture.src = event.target.result;
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