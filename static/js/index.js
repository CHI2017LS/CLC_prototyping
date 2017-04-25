var databaseRef = firebase.database().ref();
var ref = databaseRef.child("chiclc");
var sessionRef = ref.child('session');

function displaySessions() {
    sessionRef.once('value').then(function(snapshot) {
        console.log('display session');
        console.log(snapshot.val());
        if (snapshot.val() != null) {
            console.log(snapshot.val());
            var sessions = snapshot.val();
            for (var key in sessions) {
                var session = sessions[key];
                displaySessionRow(key, session);
            }
        }
    });
}

function displaySessionRow(id, session) {
    var sessionTable = document.getElementById('session-display-table');
    var row = sessionTable.insertRow(-1);
    $(row).attr("class", "clickable-row").attr("data-href", "/slides?session_id=" + id);
    var sessionId = row.insertCell(0);
    var title = row.insertCell(1);
    var time = row.insertCell(2);
    sessionId.innerHTML = id;
    title.innerHTML = session.title;
    time.innerHTML = session.time;
}

$(document).ready(function() {
    // displaySessions();

    $(".clickable-row").click(function() {
        window.location = $(this).data("href");
    });
});
//session/{sessionName}/slides/{index}/
//padID = sessionName+0