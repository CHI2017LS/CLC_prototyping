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
        // changePad(sessionID + sessionTitle + 0); // default is the first slide
        changePad("introduction"); // default is the introduction pad
        createSpeechDiv();
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
    $(newSlide).find('a').attr('onclick', "slideClickEvent('" + id + "')");
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
    $(newSlide).find('p.number-of-looking').attr('id', 'padUserCount-' + sessionID + sessionTitle + id);
    $(newSlide).find('p.number-of-looking').css("display", "inline");
    $(newSlide).find('p.keyword').attr('id', 'padKeyword-' + sessionID + sessionTitle + id);
    $(newSlide).find('p.keyword').css("display", "block");
    //var el = $("<li class='list-group-item'><b><img src=" +  img_url + ":</b> " + "ee" + "</li>");//modify
    slideList.append(newSlide);
    listenToUserCount(id);
}

function slideClickEvent(slideId) {
    changePad(sessionID + sessionTitle + slideId);
    updateUserCount(slideId);
}

function highlightSlide(slide) {
    slideList.find('img.img-responsive').css('box-shadow', "initial");
    slide.style.boxShadow = "0px 0px 40px 5px lightblue";
}

function createSlide(data_url) {
    databaseRef.child("session/" + QueryString.session_id).once('value').then(function(snapshot) {
        var slidesCount = 0;
        if (snapshot.val().slides != null) slidesCount = snapshot.val().slides.length;
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
            speechDB.ref('speech/' + sessionID + sessionTitle + '/' + id).set({
                text: text
            });
            id += 1;
        }
    }
    nextSelect = parseInt(currentSelect) + 1;
    if ($('#speech' + currentPadId + nextSelect).text() != "") {
        $('#editLines').val($('#speech' + currentPadId + nextSelect).text());
        currentSelect = nextSelect;
    } else $('#editLines').val("");
}

function autoAddSpeechToFirebase(text) {
    if (text != "") {
        speechDB.ref('speech/' + sessionID + sessionTitle + '/' + id).set({
            text: text
        });
        id += 1;
    }
}
//save slides
function getFileURL(slideId, callback) {
    console.log('slides database');
    var talk_topic = "test";
    var result = imgRef.getDownloadURL().then(function(url) {
        console.log(url);
        var re = slidesRef.child(slideId).set({
            img: url,
            count: 0 // initialize
        });
        console.log(re);
    }).catch(function(error) {
        console.log('database error');
    });
}

function editLine(text) {
    $('#editLines').val(text);
}
var existPadId = [];

function loadKeywordsFromFirebase() { // display on right side of the page
    var keywordRef = speechDB.ref("keyword/" + sessionID + sessionTitle + '/' + currentPadId); // reference to keywords of current pad
    keywordRef.once("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var keyword = childSnapshot.val();
            console.log("parent: " + keywordRef.key);
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
    var kw_slides = speechDB.ref("keyword/" + sessionID + sessionTitle + '/'); // reference to keywords for each slide in the talk
    kw_slides.on("child_added", function(snapshot) {
        snapshot.forEach(function() { // each slide
            var padId = snapshot.key;
            console.log("padId: " + padId); // get the pad id
            console.log("existPadId: " + existPadId);
            if (existPadId.length == 0 || !(existPadId.includes(padId))) {
                existPadId.push(padId);
                var pad_ref = speechDB.ref("keyword/" + sessionID + sessionTitle + '/' + padId);
                pad_ref.on("child_added", function(childSnapshot) {
                    var id = childSnapshot.key;
                    var keyword = childSnapshot.val().text;
                    console.log(padId + ": " + keyword);
                    if (keyword) {
                        // display on the left-bar
                        if ($('#padKeyword-' + padId).find("span").length == 0) { // no keyword now
                            $('#padKeyword-' + padId).append('<span id="padKw' + padId + childSnapshot.key + '">' + keyword + '</span>');
                        } else {
                            $('#padKeyword-' + padId).append('<span id="padKw' + padId + childSnapshot.key + '">' + ", " + keyword + '</span>');
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
                            $('#padKw' + padId + childSnapshot.key).text(keyword);
                        } else if (document.getElementById("padKeyword-" + padId).childElementCount > 1) {
                            if (document.getElementById("padKeyword-" + padId).childNodes[1] == $('#padKw' + padId + childSnapshot.key)[0]) $('#padKw' + padId + childSnapshot.key).text(keyword);
                            else $('#padKw' + padId + childSnapshot.key).text(", " + keyword);
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
                        $('#padKw' + padId + childSnapshot.key).remove();
                        if ($(kwList[0]).text() == keyword) { // remove the first keyword
                            // remove the ','
                            $(kwList[1]).text($(kwList[1]).text().split(", ")[1]);
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
var currentPadId;
var changePad = function(id) {
    console.log(id);
    if (id == "introduction") {  // cancel slide highlight if id = 'introduction'
        slideList.find('img.img-responsive').css('box-shadow', "initial");
        if(lastSlideId != undefined)
            updateUserCount("introduction");
    }

    currentPadId = id;
    $('#mypad').pad({
        'padId': id
    });
    txtId = 1; // default keyword id
    $('span').remove('.keywordSpan');
    loadKeywordsFromFirebase();
}

function createPad(padID, callback) {
    $.ajax({
        type: "GET",
        url: "/createpad",
        data: {
            padID: padID,
            text: "Contents of the Slide and What the speaker said in this page:\n\
\t- Please use bullet points to do note-taking like the formats here.\n\
\t- You can also bold or italic fonts to highlight the important parts.\n\n\n\
Comments:\n\
\t- If you have any ideas or any thoughts, please type them here with bullet points format like this.\n\
\t\t- You can reply to the comments with indention like this one.\n"
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
var createSpeechDiv = function() {
    jQuery('<div/>', {
        id: "speech" + currentPadId + lastDivId,
        "class": 'recognizing'
    }).appendTo('#lines');
    $('#speech' + currentPadId + lastDivId).click(function() {
        console.log('click');
        currentSelect = $(this).attr('id').split(currentPadId)[1];
        console.log('this id = ' + currentSelect);
        editLine($(this).text());
    });
}

function start() {
    var token = $('#tokenDiv').text().trim();
    console.log(token);
    console.log('hihi');
    var stream = WatsonSpeech.SpeechToText.recognizeMicrophone({
        token: token,
        object_mode: false // default
        // outputElement: '#lines' // CSS selector or DOM Element
    });
    stream.setEncoding('utf8'); // get text instead of Buffers for on data events
    stream.on('data', function(data) {
        console.log(data);
        $('#speech' + currentPadId + lastDivId).text(data);
        $('#speech' + currentPadId + lastDivId).css('cursor', 'pointer');
        $('#speech' + currentPadId + lastDivId).click(function(e) {
            console.log('click');
            currentSelect = $(this).attr('id').split(currentPadId)[1];
            console.log("this id = " + currentSelect);
            editLine($(this).text());
        });
        autoAddSpeechToFirebase(data);
        
        lastDivId += 1;
        console.log(lastDivId);
        jQuery('<div/>', {
            id: "speech" + currentPadId + lastDivId,
            "class": 'recognizing'
        }).appendTo('#lines');

        $('#speech' + currentPadId + lastDivId).click(function() {
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
// User count of each slide
function listenToUserCount(slideId) {
    // countRef = speechDB.ref("userCount/" + sessionID + sessionTitle + "/" + slideId);
    countRef = slidesRef.child("/" + slideId);
    // initialize
    countRef.once("value").then(function(snapshot) {
        var count = snapshot.val();
        if (count) {
            $('#padUserCount-' + sessionID + sessionTitle + slideId).text(snapshot.val().count);
        }
    });
    countRef.on("child_changed", function(snapshot) {
        var count = snapshot.val();
        console.log("count change! : " + count);
        if (snapshot.key == "count") {
            console.log("count: " + count);
            $('#padUserCount-' + sessionID + sessionTitle + slideId).text(count);
        }
    });
}
var already_added_slideId;
var already_minused_slideId;
var lastSlideId;

function updateUserCount(newSlideId) {
    // format: currentPadId=4meeting0; newSlideId=0, lastSlideId=0
    console.log("updateUserCount: " + lastSlideId + ", " + newSlideId);
    if (newSlideId == "introduction") {
        minusRef = slidesRef.child("/" + lastSlideId);
        minusRef.transaction(function(snapshot) {
            // If users/ada/rank has never been set, currentRank will be `null`.
            var user_count = snapshot.count;
            var new_user_count = user_count - 1;
            var postData = {
                count: new_user_count,
                img: snapshot.img
            };
            return postData;
        });
        already_minused_slideId = lastSlideId;
    } else {
        if (already_minused_slideId != lastSlideId && lastSlideId != newSlideId) { // prevent from double click
            // minus 1 to user count of the last slide
            minusRef = slidesRef.child("/" + lastSlideId);
            minusRef.transaction(function(snapshot) {
                // If users/ada/rank has never been set, currentRank will be `null`.
                var user_count = snapshot.count;
                var new_user_count = user_count - 1;
                var postData = {
                    count: new_user_count,
                    img: snapshot.img
                };
                return postData;
            });
            already_minused_slideId = lastSlideId;
        }
        if (already_added_slideId != newSlideId) {
            // add 1 to user count of the select slide
            addRef = slidesRef.child("/" + newSlideId);
            addRef.transaction(function(snapshot) {
                // If users/ada/rank has never been set, currentRank will be `null`.
                console.log("add: " + snapshot.count);
                var user_count = snapshot.count;
                var new_user_count = user_count + 1;
                var postData = {
                    count: new_user_count,
                    img: snapshot.img
                };
                return postData;
            });
            already_added_slideId = newSlideId;
            lastSlideId = newSlideId;
        }
    }
    console.log("already_added_slideId: " + already_added_slideId);
    console.log("already_minused_slideId: " + already_minused_slideId);
    console.log("lastSlideId: " + lastSlideId);
}

function userUnload() {
    // minus 1 to user count of the last slide
    minusRef = slidesRef.child("/" + currentPadId.split(sessionTitle)[1]);
    minusRef.transaction(function(snapshot) {
        // If users/ada/rank has never been set, currentRank will be `null`.
        var user_count = snapshot.count;
        var new_user_count = user_count - 1;
        var postData = {
            count: new_user_count,
            img: snapshot.img
        };
        return postData;
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

function ok(edit_value, kwId) { // user press enter
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