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
        // getPadUsersCount();
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

function listenToSpeech() {
    speechRef = speechDB.ref("speech/");
    speechRef.on("child_added", function(snapshot) {
        var speech = snapshot.val();
        if (speech) {
            addSpeech(snapshot.key, snapshot.val().text);
            // auto scroll
            var lines = document.getElementById('lines');
            console.log("scrollHeight:" + lines.scrollHeight + ", top: " + lines.scrollTop);
            if (lines.scrollTop + 50 >= lines.scrollHeight - lines.clientHeight) lines.scrollTop = lines.scrollHeight;
            else console.log("scrolling");
        }
    });
}

function addSpeech(key, text) {
    // Create a div of each sentence
    jQuery('<div/>', {
        id: currentPadId + key,
        "class": 'recognizing',
        text: text
    }).appendTo('#lines');
    $('#' + currentPadId + key).css('cursor', 'pointer');
    $('#' + currentPadId + key).click(function() {
        console.log('click');
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

function listenToKeywords() {
    console.log('listen');
    var keywordRef = speechDB.ref("keyword/" + currentPadId);
    keywordRef.on("child_added", function(snapshot) {
        var keyword = snapshot.val();
        if (keyword) {
            if ($('#kw' + snapshot.key).length == 0) {
                // addKeyword(snapshot.key, snapshot.val().text);
                $("#showBlock").append('<span class="keywordSpan" id="kw' + snapshot.key + '"><input type="text" class="keywordBtn" size="8" value="' + snapshot.val().text + '" id="kw' + snapshot.key + 'text" onchange="ok(this.value,' + snapshot.key + ')"/></span>');
                txtId = parseInt(snapshot.key) + 1;
            }
        }
    });
    keywordRef.on("child_changed", function(snapshot) {
        var keyword = snapshot.val();
        if (keyword) {
            if ($('#kw' + snapshot.key).length > 0) {
                // setKeyword(snapshot.key, snapshot.val().text);
                document.getElementById("kw" + snapshot.key).innerHTML = '<input type="text" class="keywordBtn" size="8" value="' + snapshot.val().text + '" id="kw' + snapshot.key + 'text" onchange="ok(this.value,' + snapshot.key + ')"/>';
            }
        }
    });
    keywordRef.on("child_removed", function(snapshot) {
        var keyword = snapshot.val();
        if (keyword) {
            if ($('#kw' + snapshot.key).length > 0) {
                $('#kw' + snapshot.key).remove();
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

function getPadUsersCount() {
    $.ajax({
        type: "GET",
        url: "/getpadusercount"
    }).done(function(response) {
        response = JSON.parse(response); // parse JSON string
        for (var padId in response) {
            if ($('#padInfo-' + padId).length > 0) { // element exist
                $("#padInfo-" + padId).text(response[padId]);
            }
        }
    });
    setTimeout(getPadUsersCount, 3000); // call getPadUsersCount() every 3 seconds
}