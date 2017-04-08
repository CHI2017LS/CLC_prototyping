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
        changePad(sessionID + sessionTitle + 0); // default is the first slide
        // Update pad users count
        testWs();
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
    $(newSlide).find('p.number-of-editing').attr('id', 'padInfo-' + sessionID + sessionTitle + id);
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
var QueryString = function() {
    // This function is anonymous, is executed immediately and 
    // the return value is assigned to QueryString!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
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
    nextSelect = parseInt(currentSelect) + 1;
    if ($('#' + currentPadId + nextSelect).text() != "") {
        $('#editLines').val($('#' + currentPadId + nextSelect).text());
        currentSelect = nextSelect;
    } else $('#editLines').val("");
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

function listenToKeywords() {
    console.log('listen');
    var keywordRef = speechDB.ref("keyword/" + currentPadId);
    keywordRef.on("child_added", function(snapshot) {
        var keyword = snapshot.val();
        if (keyword) {
            if ($('#kw' + snapshot.key).length == 0) {
                addKeyword(snapshot.key, snapshot.val().text);
                txtId = parseInt(snapshot.key) + 1;
            }
        }
    });
    keywordRef.on("child_changed", function(snapshot) {
        var keyword = snapshot.val();
        if (keyword) {
            if ($('#kw' + snapshot.key).length > 0) {
                setKeyword(snapshot.key, snapshot.val().text);
            }
        }
    });
}

function addKeyword(key, text) {
    // Create a span of each keyword
    $("#showBlock").append('<span class="keywordSpan" id="kw' + key + '"><input type="text" class="keywordBtn" size="8" value="' + text + '" id="kw' + key + 'text" onchange="ok(this.value,' + key + ')"/></span>');
}

function setKeyword(key, text) {
    // Keyword Modified
    document.getElementById("kw" + key).innerHTML = '<input type="text" class="keywordBtn" size="8" value="' + text + '" id="kw' + key + 'text" onchange="ok(this.value,' + key + ')"/>';
}
var currentPadId;
var changePad = function(id) {
    console.log(id);
    currentPadId = id;
    $('#mypad').pad({
        'padId': id
    });
    txtId = 1;
    $('span').remove('.keywordSpan');
    listenToKeywords();
}

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
    // https://stream.watsonplatform.net/authorization/api/v1/token?url=https://stream.watsonplatform.net/speech-to-text/api
    var token = 'UiRl3QxnqjElDFaXRwATJOwM%2Fq%2BTvF1EwOKdQWmX0bH4WbWw2mJ3XKm%2FAPv6o79h8JczBxWy41J6%2BmVmCBe8F3KYUlC0WcRDOPtRYPeCPoqUegjOmY1ARc0%2FepfV8s3oAe%2B3ySnsx8yaPlox5JvXRJWx5Xxsq8XWQVLmhi8S9lMcnNa4z%2BJRl%2FPbBiiXnQmkl8YPJAkwd1dHAAo6kIHDqWiPJVpNZyyooXgYAzduvBaRb2fXJkWi8jr5IXpbe4OYFzdBEsXFStdoJhy1aOIyeiGV%2F4kL5qZDP7d11DASn4Vkpte0k0UCuDIBPDaidPP2hhZ2AVrL97NVtzpN1J%2FYLxI62U9HzTlCtmgchI5XYkcIpJZ%2Bv1aCwiyNC83yH2cIA9MiYLEw%2Bai%2BFWGe4xm46yyCdCQ4nd1jJq8SuHzV63SGWCXDm7qOybFzGr45L7e%2FRJ4GdufbPG8xqgly%2FGn8fi1MXmVtHco0%2BQp4gfmIhxZIGUdRUZXbZQMmTFA%2FStL3JgHeuVYC3cNIoSM11HTYYYQbHm77aVBQ2A%2FHzbwoKnzse5iA%2Bhx7V3F9hfNMMM5ANwSrU0D3yoJOGUU%2BnqpdXHXoSqKDS2gHmaSHrxLV4N8TWW8nk%2FqZM9OOffZxySVHO3y%2B%2BcO9JmnP0MRnznumyLtBIgk33MuXi9tSYCP7adzG%2FPpFJtLiX9Cyx7IAlbYSshOqDxDTeeUbH7S0CYZitHutNfFdC45Bqsn5VLB05T%2B2QZ6YNBSs1r%2Fuj3oKhcxS6txpeP7YYbLDC7mYLEuEhbLw1xTVltiCEvik%2FX%2FAwLc50m1ABbEsh9p1nS9YHVjQVmeXihhXAxsc2qHl4uXIRKoXJclCimnAWCAVwQ%2F7JNcGP0Fzqq9Z1gqYKWEHxhLfUrhuKyNVJyvBs2IUzYWFdN78wciXWKZy3LC72ojPSRLgT%2BWL5069vg%3D%3D';
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
        start();
    });
    document.querySelector('#stop').onclick = stream.stop.bind(stream);
    // }).catch(function(error) {
    //     console.log(error);
    // });  
}
// Keywords adding Script
var txtId;
$('#addKeyword').click(function() {
    $("#showBlock").append('<span class="keywordSpan" id="kw' + txtId + '"><input type="text" class="keywordBtn" size="8" id="kw' + txtId + 'text" onchange="ok(this.value,' + txtId + ')"  onfocusout="checkEmpty(this.value,' + txtId + ')" autofocus/></span>');
    txtId++;
});

function edit(kwId) {
    console.log("edit");
    var keyword = document.getElementById("kw" + kwId + "text").value;
    if (keyword.length > 0) {
        //document.write(keyword);
        document.getElementById("kw" + kwId).innerHTML = '<input type="text" class="keywordBtn" size="8" value="' + keyword + '" id="kw' + kwId + 'text" onchange="ok(this.value,' + kwId + ')"/>';
        // update entry in Firebase
        // var postData = {
        //     text: keyword
        // }; // A post entry
        // var newPostKey = speechDB.ref().child('keyword').push().key; // Get a key for a new Post
        // console.log('newPostKey');
        // var updates = {};
        // updates['/' + currentPadId + '/' + newPostKey] = postData;
        // return speechDB.ref('keyword' + currentPadId).update(updates);
    }
}

function ok(edit_value, kwId) {
    console.log("ok");
    
    // var keyword = document.getElementById("kw" + kwId + "text").value;
    console.log('keyword: ' + edit_value);
    if (edit_value.length == 0) {
        console.log("delete");
        $('#kw' + kwId).remove();
        speechDB.ref('keyword/' + currentPadId).child(kwId).set({
            text: null
        });
    } else {
        console.log("not delete");
        document.getElementById("kw" + kwId).innerHTML = '<input type="button" class="keywordBtn" id="kw' + kwId + 'text" value="' + edit_value + '" onclick="edit(' + kwId + ')"/>';
        // create entry in Firebase
        speechDB.ref('keyword/' + currentPadId).child(kwId).set({
            text: edit_value
        });
    }
}

function checkEmpty(edit_value, kwId) {
    if (edit_value.length == 0) {
        $('#kw' + kwId).remove();
    }
}

// Get pad user count with websocket
// var wsUri = "ws://echo.websocket.org/";
var wsUri = "/getpadusercount";
var output;
var socket = new io.connect(location.protocol + '//' + document.domain + ':' + location.port + wsUri);

function testWs() {   // use web-socket
    
    socket.on('connect', function() {
        console.log("connected!");
    });
    socket.on('disconnect', function() {
       console.log("disconnected!"); 
    });
    socket.on('error', function(evt) {
        console.log("ERROR: " + evt.data);
    });
    socket.on('response', function(msg) {
        console.log(msg.data);
        response = JSON.parse(msg.data); // parse JSON string
        for (var padId in response) {
            if ($('#padInfo-' + padId).length > 0) { // element exist
                $("#padInfo-" + padId).text(response[padId]);
            }
        }
    });
}

// function getPadUsersCount() {
//     $.ajax({
//         type: "GET",
//         url: "/getpadusercount"
//     }).done(function(response) {
//         response = JSON.parse(response); // parse JSON string
//         for (var padId in response) {
//             if ($('#padInfo-' + padId).length > 0) { // element exist
//                 $("#padInfo-" + padId).text(response[padId]);
//             }
//         }
//     });
//     setTimeout(getPadUsersCount, 3000); // call getPadUsersCount() every 3 seconds
// }