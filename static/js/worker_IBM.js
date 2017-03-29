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

var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  } 
  return query_string;
}();

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
    nextSelect = parseInt(currentSelect)+1;
    if ($('#' + currentPadId + nextSelect).text() != "") {
      $('#editLines').val($('#' + currentPadId + nextSelect).text());
      currentSelect = nextSelect;
    }
    else
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
var currentSelect = 1;
jQuery('<div/>', {
    id: currentPadId + lastDivId,
    "class": 'recognizing'
}).appendTo('#lines');
$('#' + currentPadId + lastDivId).click(function() {
    console.log('click');
    currentSelect = $(this).attr('id').split(currentPadId)[1];
    console.log('this id = ' + currentSelect);
    editLine($(this).text());
});

function start() {
    console.log('hihi');
    var token = 'FR%2BAgWV0xFVuMnVQQP8iy9upWDGgXm9b7OXGAvmNMjvrDeWuUcn0iWalnkPdBDskOCdYQyybs7BUGSdYCdcUlo1vw6M6s3Aks0Br9zi5wzVhLU3Uc9Mij75lHbicT9BdTlJQDCThbFW8ZfKvjdr2r3kwvmC%2FUiTgZ2gobh%2B5IQ15BDWZzsfgWVoPhPpjiniRLlAvDTScTxPNlCBA%2Fw2rW4nUokpIUiwS0Myofw6MHW36215pIWBcUcHtqksi41jX5UwDJ7wx7H1xRqs%2BiB1euVPaq5MrwCyQ1ffEB6mEwj7LyRh0yUZ5IWuEbeaiWX6KFoSsmNt1gBp1FgU6iV%2FDOOm3OYu9G68eFCk%2FQgi%2FkEP8jwVE7kYZwX5%2FtMAmidyHei7en6qLDLgEPcqptfkwzuiY%2FA2Rp5iOQTejumqt25SduQ3ro3wd4bu95jieyc3tIrEV5c0MI56Fvnw4jZ3cgSFT0bt42lJMpnpxnuo98kvPeCMkWPv3cZhP5VyfA8s8w7W2GDAScP40eyiEIjv8vvpQWGKw2ieATxU%2FnH%2FnXuA%2FfW1CoCZBW1cDOYSxgAm3M0H1AdxTKKumv%2BxwN9TIr%2BRkDbeYu8fQxkuuGFDBAQ6sPJVVgPSX4fibOY91OBWLIcRbSK1cVHZ1GuRB6lQsrhmsA0egOqRdxLtYrYlUh34bx%2B20BC2LsbWAtSYNG%2B2y8bzRnBEnUljNoO9ovBZRk2HpgEOdV8cDYwppB8d3b1Qauo3BW9xrX099B0xwJCyhSVERCMU9vJA%2FNxl5qKBOyCl3Vev8MEo5L1rzo8zABCOXqpGqIHIsgvzzu5WvTMG7hrbjLLaKT7xM4hlGkiOmtYu88uLvduN2ZTHgq92KIMTo%2BwljEPBqHeWL%2FH%2BSPkQsYg5kY4w6ip7RY8x%2FL5WM0tsoZ7ZgiuoggQSmUHmQKIKrxmRQsdrhcw%3D%3D';
    // fetch('https://watson-speech.mybluemix.net/api/speech-to-text/token',
    //   {mode: 'no-cors'
    //   // header: {
    //   //   Authorization: 'Basic MWFhOGM0ZTAtN2JlMS00YTM5LTkzMTYtNTBmNTAxNGRiZGE3OmppQnduQWlpTUYzdw=='
    //   // }
    //   // body:'username=1aa8c4e0-7be1-4a39-9316-50f5014dbda7&password=jiBwnAiiMF3w'
    // }).then(function(response) {
    //     if(response.ok){
    //       console.log('ok');
    //       return response.text();
    //     }
    //     else if(response.status == 401){
    //       console.log("not authorized!");
    //     }
    // }).then(function (token) {
    // console.log(token);
    var stream = WatsonSpeech.SpeechToText.recognizeMicrophone({
        token: token,
        object_mode: false // default
        // outputElement: '#lines' // CSS selector or DOM Element
    });
    stream.setEncoding('utf8'); // get text instead of Buffers for on data events
    stream.on('data', function(data) {
        console.log(data);
        $('#' + currentPadId + lastDivId).text(data);
        $('#' + currentPadId + lastDivId).css('cursor', 'pointer');
        $('#' + currentPadId + lastDivId).click(function(e) {
            console.log('click');
            currentSelect = $(this).attr('id').split(currentPadId)[1];
            console.log("this id = " + currentSelect);
            editLine($(this).text());
        });
        lastDivId += 1;
        console.log(lastDivId);
        jQuery('<div/>', {
            id: currentPadId + lastDivId,
            "class": 'recognizing'
        }).appendTo('#lines');
        $('#' + currentPadId + lastDivId).click(function() {
            console.log('click');
            currentSelect = $(this).attr('id').split(currentPadId)[1];
            console.log("this id = " + currentSelect);
            editLine($(this).text());
        });

        // auto scroll
        var lines = document.getElementById('lines');
        console.log("scrollHeight:" + lines.scrollHeight + ", top: " + lines.scrollTop);
        if (lines.scrollTop + 50 >= lines.scrollHeight - lines.clientHeight) lines.scrollTop = lines.scrollHeight;
        else console.log("scrolling");        
    });

    stream.on('error', function(err) {
        console.log(err);
        // start();
    });
    document.querySelector('#stop').onclick = stream.stop.bind(stream);
    // }).catch(function(error) {
    //     console.log(error);
    // });  
}