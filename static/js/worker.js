var slideList = $(".sidebar-nav");
var slideTemplate = $(".slideTemplate");
// Create a root reference
var storageRef = firebase.storage().ref();
var databaseRef = firebase.database().ref().child('chiclc');
// Get a reference to the database service
var speechDB = firebase.database();
var slidesRef;
var sessionInfo;
$(document).ready(function() {
    init();
});

function init() {
    databaseRef.child("session/" + QueryString.session_id).once('value').then(function(snapshot) {
        console.log(snapshot.val());
        sessionInfo = snapshot.val();
        sessionTitle = snapshot.val().title;
        $('.title').text(sessionTitle);
        listenToSlides();
    });
}

function listenToSlides() {
    sessionID = QueryString.session_id;
    slidesRef = databaseRef.child("session/" + QueryString.session_id + "/slides");
    slidesRef.on("child_added", function(snapshot) {
        var slide = snapshot.val();
        if (slide) {
            addSlide(snapshot.key, slide.img);
        }
    });
}
var slideLength = 0;
var sessionTitle;
var sessionID;

function addSlide(id, img_url) {
    var newSlide = slideTemplate.clone();
    console.log(img_url);
    $(newSlide).attr('class', 'slide');
    $(newSlide).attr('id', 'slide' + id);
    $(newSlide).find('a').attr('onclick', "changePad('" + sessionID + sessionTitle + id + "')");
    $(newSlide).find('img.img-responsive').attr('src', img_url);
    //var el = $("<li class='list-group-item'><b><img src=" +  img_url + ":</b> " + "ee" + "</li>");//modify
    slideList.append(newSlide);
}

function createSlide(data_url) {
    databaseRef.child("session/" + QueryString.session_id).once('value').then(function(snapshot) {
        var slidesCount = 0;
        if (sessionInfo.slides != null) slidesCount = snapshot.val().slides.length;
        console.log("id:" + slidesCount);
        createPad(sessionID + sessionTitle + slidesCount, function() {
            changePad(sessionID + sessionTitle + slidesCount)
        });
        console.log('before uploade');
        uploadImageToFirebase(data_url, slidesCount, null);
    });
}
var imgRef;

function uploadImageToFirebase(data_url, slideId, callback) {
    console.log('images/' + sessionTitle + slideId + '.png');
    imgRef = storageRef.child('images/' + sessionTitle + slideId + '.png');
    imgRef.putString(data_url, 'data_url').then(function(snapshot) {
        getFileURL(slideId, callback)
    });
}
var id = 0;

function addSpeechToFirebase() {
    console.log('send');
    if ($('#editLines').val() != "") {
        str = $('#editLines').val().split('\n');
        for (var i = 0; i < str.length; i++) {
            text = str[i];
            speechDB.ref('speech/' + id).set({
                text: text
            });
            id += 1;
        }
    }
    $('#editLines').val("");
}

//save slides
function getFileURL(slideId, callback) {
    console.log('slides database');
    var talk_topic = "test";
    var result = imgRef.getDownloadURL().then(function(url) {
        console.log(url);
        var re = slidesRef.child(slideId).set({
            img: url
        });
        console.log(re);
    }).catch(function(error) {
        console.log('database error');
    });
}

function addLine(padID, text) { // add a new line to etherpad
    $.ajax({
        type: "GET",
        url: "/setText",
        data: {
            text: text + '\n',
            padID: padID
        }
    }).done(function(response) {
        console.log(response);
        response = JSON.parse(response); // parse JSON string
        console.log(response);
        for (var padID in response) {
            console.log('test');
        }
    });
}

function editLine(text) {
    $('#editLines').val(text);
}
var currentPadId;
var changePad = function(id) {
    console.log(id);
    currentPadId = id;
    $('#mypad').pad({
        'padId': id
    });
}
changePad('welcome');

function createPad(padID, callback) {
    $.ajax({
        type: "GET",
        url: "/createpad",
        data: {
            padID: padID
        }
    }).done(function(response) {
        callback();
        console.log(response);
        response = JSON.parse(response); // parse JSON string
        console.log(response);
    });
}
var lastDivId = 1;
jQuery('<div/>', {
    id: currentPadId + lastDivId,
    "class": 'recognizing'
}).appendTo('#lines');
$('#' + currentPadId + lastDivId).click(function() {
    console.log('click');
    editLine($(this).text());
});
var recognition = new webkitSpeechRecognition();
console.log(recognition);
var recognition;
var isStop = false;
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = "en-US";
// recognition.lang="cmn-Hant-TW";
recognition.onend = function() {
    console.log('onend');
    if (!isStop) recognition.start();
}
recognition.onstart = function() {
    console.log('開始辨識...');
};
// recognition.start();
recognition.onresult = function(event) {
    var i = event.resultIndex;
    var j = event.results[i].length - 1;
    console.log(event.results[i][j].transcript);
    console.log(currentPadId);
    if (!event.results[i].isFinal) {
        $('#' + currentPadId + lastDivId).text(event.results[i][j].transcript);
    } else {
        restart();
        // isStop = false;
        // recognition.abort();
        // recognition.stop();
        // $('#'+currentPadId+lastDivId).css('cursor', 'pointer');
        // // $('#'+currentPadId+lastDivId).click(function(e){
        // //     console.log('click');
        // //     editLine($(this).text());
        // // });      
        // lastDivId += 1;
        // console.log(lastDivId);      
        // jQuery('<div/>', {
        //     id: currentPadId+lastDivId,
        //     "class": 'recognizing'
        // }).appendTo('#lines');
        // $('#'+currentPadId+lastDivId).click(function(){
        //   console.log('click');
        //   editLine($(this).text());
        // });
        // recognition.start();
    }
    var lines = document.getElementById('lines');
    console.log("scrollHeight:" + lines.scrollHeight + ", top: " + lines.scrollTop);
    if (lines.scrollTop + 50 >= lines.scrollHeight - lines.clientHeight) lines.scrollTop = lines.scrollHeight;
    else console.log("scrolling");
};

function start() {
    recognition.start();
    isStop = false;
}

function restart() {
    console.log('restart');
    isStop = false;
    recognition.abort();
    recognition.stop();
    $('#' + currentPadId + lastDivId).css('cursor', 'pointer');
    // $('#'+currentPadId+lastDivId).click(function(){
    //     console.log('click');
    //     editLine($(this).text());
    //     // addLine(currentPadId, $(this).text());
    // }); 
    lastDivId += 1;
    jQuery('<div/>', {
        id: currentPadId + lastDivId,
        "class": 'recognizing',
    }).appendTo('#lines');
    $('#' + currentPadId + lastDivId).click(function() {
        console.log('click');
        editLine($(this).text());
    });
    recognition.start();
}

function stop() {
    recognition.abort();
    recognition.stop();
    isStop = true;
}