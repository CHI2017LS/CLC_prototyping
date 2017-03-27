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
    $('#editLines').val(""); // after sending the text, the editor will be blank
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
jQuery('<div/>', {
    id: currentPadId + lastDivId,
    "class": 'recognizing'
}).appendTo('#lines');
$('#' + currentPadId + lastDivId).click(function() {
    console.log('click');
    editLine($(this).text());
});

function start() {
    console.log('hihi');
    var token = 'jIiEcg4GW7oZu3htCajm1sBb1o4UgmxF9%2FuQHK%2F%2B%2BhsX44TQA0ueUkaVwO1R3RCsKt3nKBWvLZ2jxqGhEL4U33SaJfWawOmZ8kn7Zx7MHFy5LKeBUVwprQfUdLh3gzgQyoilz10mYk3LARr1CagfpIygD2L0TFtTOqpIKmE%2F%2FIIJBN6YPRXGbUwjOHT8eUSWeVcD7HSLoNciIGcHIol%2B%2FX1faIGcsqeO1XqkXERgEz2mfC7c6%2B2u6sAj8wrJQ3KZ0U%2F0hO0bELJ9RtEcLdwmKCYEZJIf6HNjRTMGuu51BnRVDr%2BPrP3rX%2BRPU1Q2YQRTL7pZ5UVwXd7QvZjdqqsAfSHNAOdk9HcIF4DgqAPIxxYrhAomduAsBxWnlkoGmyORpBUNNXsR0XrMYUqdk79pYyToxAapqCAv73JwzePfIqy93SHZqueIyXiJ2LcWjIXt5PJFcpZvKPbCa4mREcBVNMPSiQFjlAAnYnRJxYdJF%2BGV6OYP2uvHGHR%2FpZejREzDUtnf28ZDTSlHJQxfeMwJXRTGorEVnhfiqE9HlmNaOYQNY2%2Bilipu6Q6rC18%2FQGHGvMACyvUF1%2BBUzAMDBGxlEqJG0hmiFox7D9vNz7lFoZ38Q30BwuZ%2F8Cq61T%2BHE%2B99elzR5lFo9djD%2FkjuZ%2BT0kxxLJL7HERViIL%2B8vpyQ9VJVhEFtWtsvREwc%2FQNfNrGRGSgOk7KHjZ4NF%2BSY0kOTarb%2BQOV8WR9OAqAVucg4kXbPJc9hXvRC9G1LDljglw%2FbzM6XKyye9fDXo2LxisrEx1kjY1xknlWSUEcOL%2FXl%2FOiucc9tB%2BUOGRTMXOaLaVtl2AAFUzH5f%2FPd44Z0NVF01%2Fp%2F%2F9%2FapG%2FyTjsTRuw1wcXEi%2F1cKImjbjXs%2BQk4Ase3usZS8bLLv74l1hwqOdqsWS%2BKCoUlhG%2FUT1%2FrcSv5Hi70kagfHrq7WAgetcj4hXTDUOE1uaNOajZKjC%2FaBd4Cek7XkOplSB8W';
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
        object_mode: false, // default
        interim_results: true
        // outputElement: '#lines' // CSS selector or DOM Element
    });
    stream.setEncoding('utf8'); // get text instead of Buffers for on data events
    stream.on('data', function(data) {
        console.log(data);
        $('#' + currentPadId + lastDivId).text(data);
        $('#' + currentPadId + lastDivId).css('cursor', 'pointer');
        $('#' + currentPadId + lastDivId).click(function(e) {
            console.log('click');
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
            editLine($(this).text());
        });
    });
    var lines = document.getElementById('lines');
    console.log("scrollHeight:" + lines.scrollHeight + ", top: " + lines.scrollTop);
    if (lines.scrollTop + 50 >= lines.scrollHeight - lines.clientHeight) lines.scrollTop = lines.scrollHeight;
    else console.log("scrolling");
    stream.on('error', function(err) {
        console.log(err);
    });
    document.querySelector('#stop').onclick = stream.stop.bind(stream);
    // }).catch(function(error) {
    //     console.log(error);
    // });  
}