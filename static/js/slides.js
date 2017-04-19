var slideList = $(".sidebar-nav");
var slideTemplate = $(".slideTemplate");
var speechTemplate = $(".speechTemplate");
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
    sessionID = QueryString.session_id;
    databaseRef.child("session/" + QueryString.session_id).once('value').then(function(snapshot) {
        console.log(snapshot.val());
        sessionInfo = snapshot.val();
        sessionTitle = snapshot.val().title;
        $('.title').text(sessionTitle);
        listenToSlides();
        listenToSpeech();
        changePad(sessionID + sessionTitle + 0); // default is the first slide
        // Update pad users count
        testWs();
        listenToKeywords();
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
    $(newSlide).find('p.id-of-slide').attr("id", "slide-id-" + id);
    $(newSlide).find('p.id-of-slide').text(parseInt(id) + 1);
    $(newSlide).find('p.id-of-slide').css("display", "block");
    $(newSlide).find('img.img-responsive').attr({
        'src': img_url,
        'onclick': "highlightSlide(this)"
    });
    //$(newSlide).find('img.img-responsive').attr('src', img_url);
    $(newSlide).find('img.img-responsive').css("display", "inline");
    $(newSlide).find('img.user-img').css("display", "inline");
    $(newSlide).find('p.number-of-editing').attr('id', 'padInfo-' + sessionID + sessionTitle + id);
    $(newSlide).find('p.number-of-editing').css("display", "inline");
    $(newSlide).find('p.keyword').attr('id', 'padKeyword-' + sessionID + sessionTitle + id);
    $(newSlide).find('p.keyword').css("display", "block");
    //var el = $("<li class='list-group-item'><b><img src=" +  img_url + ":</b> " + "ee" + "</li>");//modify
    slideList.append(newSlide);
}

function highlightSlide(slide) {
    slideList.find('img.img-responsive').css('box-shadow', "initial");
    slide.style.boxShadow = "0px 0px 40px 5px lightblue";
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
//save slides
function getFileURL(slideId, callback) {
    console.log("slides database");
    var talk_topic = "test";
    var result = imgRef.getDownloadURL().then(function(url) {
        console.log(url);
        var re = slidesRef.child(slideId).set({
            img: url
        });
        console.log(re);
    }).catch(function(error) {
        console.log("database error");
    });
}

function listenToSpeech() {
    speechRef = speechDB.ref("speech/" + sessionID + sessionTitle);
    speechRef.on("child_added", function(snapshot) {
        var speech = snapshot.val();
        if (speech) {
            addSpeech(snapshot.key, snapshot.val().text);
            // auto scroll
            var lines = document.getElementById('lines');
            // console.log("scrollHeight:" + lines.scrollHeight + ", top: " + lines.scrollTop);
            if (lines.scrollTop + 50 >= lines.scrollHeight - lines.clientHeight) lines.scrollTop = lines.scrollHeight;
            else console.log("scrolling");
        }
    });
}

function addSpeech(key, text) {
    // Create a div of each sentence
    jQuery('<div/>', {
        id: "speech" + currentPadId + key,
        "class": 'recognizing',
        text: text
    }).appendTo('#lines');
    $('#speech' + currentPadId + key).css('cursor', 'pointer');
    $('#speech' + currentPadId + key).click(function() {
        addLine(currentPadId, $(this).text());
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
var existPadId = [];

function loadKeywordsFromFirebase() {   // display on the right-top
    var keywordRef = speechDB.ref("keyword/" + sessionID + sessionTitle + '/' + currentPadId); // reference to keywords of current pad
    keywordRef.once("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var keyword = childSnapshot.val();
            // console.log("parent: " + keywordRef.key);
            if (keyword) {
                if ($('#kw' + currentPadId + childSnapshot.key).length == 0) { // element not exists
                    $("#showBlock").append('<span class="keywordSpan" id="kw' + currentPadId + childSnapshot.key + '"><input type="text" class="keywordBtn" size="8" value="' + childSnapshot.val().text + '" id="kw' + currentPadId + childSnapshot.key + 'text" onchange="ok(this.value,' + childSnapshot.key + ')"/></span>');
                    txtId = parseInt(childSnapshot.key) + 1;
                }
            }
        })
    });
}

function listenToKeywords() {
    var kw_slides = speechDB.ref("keyword/" + sessionID + sessionTitle + '/'); // reference to keywords of each slide in the talk
    kw_slides.on("child_added", function(snapshot) {
        snapshot.forEach(function() { // each slide
            var padId = snapshot.key;
            console.log("padId: " + padId); // get the pad id
            console.log("existPadId: " + existPadId);
            if (existPadId.length == 0 || !(existPadId.includes(padId))) {
                existPadId.push(padId); // record the pad id which has been 
                var pad_ref = speechDB.ref("keyword/" + sessionID + sessionTitle + '/' + padId);
                pad_ref.on("child_added", function(childSnapshot) {
                    var id = childSnapshot.key;
                    var keyword = childSnapshot.val().text;
                    console.log(padId + ": " + keyword);
                    if (keyword) {
                        // display on the left-bar
                        if ($('#padKeyword-' + padId).find("span").length == 0) {  // no keyword now
                            console.log("the first keyword");
                            $('#padKeyword-' + padId).append('<span id="' + padId + childSnapshot.key + '">' + keyword + '</span>');
                        } else {
                            $('#padKeyword-' + padId).append('<span id="' + padId + childSnapshot.key + '">' + ", " + keyword + '</span>');
                        }

                        //display on the right-top
                        if ($('#kw' + padId + childSnapshot.key).length == 0 && currentPadId == padId) { // element not exists
                            $("#showBlock").append('<span class="keywordSpan" id="kw' + padId + childSnapshot.key + '"><input type="text" class="keywordBtn" size="8" value="' + childSnapshot.val().text + '" id="kw' + padId + childSnapshot.key + 'text" onchange="ok(this.value,' + childSnapshot.key + ')"/></span>');
                            txtId = parseInt(childSnapshot.key) + 1;
                        }
                    }
                });
                pad_ref.on("child_changed", function(childSnapshot) {
                    var keyword = childSnapshot.val().text;
                    if (keyword) {
                        // display on the left-bar
                        if (document.getElementById("padKeyword-" + padId).childElementCount == 1) {
                            $('#' + padId + childSnapshot.key).text(keyword);
                        } else if (document.getElementById("padKeyword-" + padId).childElementCount > 1) {
                            if (document.getElementById("padKeyword-" + padId).childNodes[1] == $('#' + padId + childSnapshot.key)[0]) $('#' + padId + childSnapshot.key).text(keyword);
                            else $('#' + padId + childSnapshot.key).text(", " + keyword);
                        }

                        //display on the right-top
                        if ($('#kw' + currentPadId + childSnapshot.key).length > 0 && currentPadId == padId) {
                            document.getElementById("kw" + currentPadId + childSnapshot.key).innerHTML = '<input type="text" class="keywordBtn" size="8" value="' + childSnapshot.val().text + '" id="kw' + currentPadId + childSnapshot.key + 'text" onchange="ok(this.value,' + childSnapshot.key + ')"/>';
                        }
                    }
                });
                pad_ref.on("child_removed", function(childSnapshot) {
                    var keyword = childSnapshot.val().text;
                    if (keyword) {
                        // display on the left-bar
                        var kwList = $("#padKeyword-" + padId).find('span');
                        $('#' + padId + childSnapshot.key).remove();

                        if($(kwList[0]).text() == keyword) {    // remove the first keyword
                            // remove the ','
                            $(kwList[1]).text( $(kwList[1]).text().split(", ")[1]);
                        }
                        
                        //display on the right-top
                        if ($('#kw' + currentPadId + childSnapshot.key).length > 0 && currentPadId == padId) {
                            $('#kw' + currentPadId + childSnapshot.key).remove();
                        }
                    }
                });
            }
        });
    });
}
// Create pad and change pad Script
var currentPadId;
var changePad = function(id) {
    console.log(id);
    currentPadId = id;
    $('#mypad').pad({
        'padId': id
    });
    txtId = 1;
    $('span').remove('.keywordSpan');
    loadKeywordsFromFirebase();
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
// Keywords adding Script
var txtId;
$('#addKeyword').click(function() {
    $("#showBlock").append('<span class="keywordSpan" id="kw' + currentPadId + txtId + '"><input type="text" class="keywordBtn" size="8" id="kw' + currentPadId + txtId + 'text" onchange="ok(this.value,' + txtId + ')"  onfocusout="checkEmpty(this.value,' + txtId + ')" autofocus/></span>');
    txtId++;
});

function edit(kwId) {
    console.log("edit");
    var keyword = document.getElementById("kw" + currentPadId + kwId + "text").value;
    if (keyword.length > 0) {
        //document.write(keyword);
        document.getElementById("kw" + currentPadId + kwId).innerHTML = '<input type="text" class="keywordBtn" size="8" value="' + keyword + '" id="kw' + currentPadId + kwId + 'text" onchange="ok(this.value,' + kwId + ')"/>';
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
        $('#kw' + currentPadId + kwId).remove();
        speechDB.ref('keyword/' + sessionID + sessionTitle + '/' + currentPadId).child(kwId).set({
            text: null
        });
    } else {
        console.log("not delete");
        document.getElementById("kw" + currentPadId + kwId).innerHTML = '<input type="text" class="keywordBtn" size="8" id="kw' + currentPadId + kwId + 'text" value="' + edit_value + '" onclick="edit(' + kwId + ')"/>';
        // create entry in Firebase
        speechDB.ref('keyword/' + sessionID + sessionTitle + '/' + currentPadId).child(kwId).set({
            text: edit_value
        });
    }
}

function checkEmpty(edit_value, kwId) {
    if (edit_value.length == 0) {
        $('#kw' + currentPadId + kwId).remove();
    }
}
// Get pad user count with websocket
// var wsUri = "ws://echo.websocket.org/";
var wsUri = "/getpadusercount";
var output;
var socket = new io.connect(location.protocol + '//' + document.domain + ':' + location.port + wsUri);

function testWs() { // use web-socket to get pad users count
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
        // console.log(msg.data);
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