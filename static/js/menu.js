var databaseRef = firebase.database().ref();
var ref = databaseRef.child("chiclc");
var sessionRef = ref.child('session');
//createSession("testSession");
function createSession(sessionTitle, sessionTime) {
    console.log('create session');
    var id = 0;
    ref.once('value').then(function(snapshot) {
        console.log("once");
        var id = 0;
        if (snapshot.val().session != null) {
            id = snapshot.val().session.length;
        }
        var session = new Object();
        session.title = sessionTitle;
        session.time = sessionTime;
        console.log(id);
        // ...
        sessionRef.child(id).set({
            title: sessionTitle,
            time: sessionTime
        });
        displaySessionBlock(id, session);
    });
}

function displaySessions() {
    sessionRef.once('value').then(function(snapshot) {
        console.log('display session');
        console.log(snapshot.val());
        if (snapshot.val() != null) {
            console.log(snapshot.val());
            var sessions = snapshot.val();
            for (var key in sessions) {
                var session = sessions[key];
                displaySessionBlock(key, session);
            }
        }
    });
}

function displaySessionBlock(id, session) {
    var newSessionBlock = $('.session-block-template').clone();
    $(newSessionBlock).css('display', 'block');
    $(newSessionBlock).attr('class', 'session-block');
    $(newSessionBlock).find('a').attr('href', '/slides?session_id=' + id);
    $(newSessionBlock).find('.session-title').text(session.title);
    $(newSessionBlock).find('.session-time').text(session.time);
    $('.session-display-area').append(newSessionBlock);
}
$(document).ready(function() {
    displaySessions();
    $('#create-session-btn').click(function() {
        createSession($('#create-session-titlefield').val(), $('#create-session-timefield').val());
    });
});
//session/{sessionName}/slides/{index}/
//padID = sessionName+0