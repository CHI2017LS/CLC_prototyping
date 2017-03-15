  //var messagesRef = ref.child("messages");
  var slideList = $(".sidebar-nav");
  var slideTemplate = $(".slideTemplate");
  // Create a root reference
  var storageRef = firebase.storage().ref();
  var databaseRef = firebase.database().ref().child('chiclc');
  var slidesRef;
  var sessionInfo;

  $(document).ready(function()
  {
    init();
  });
  function init()
  {
      databaseRef.child("session/"+QueryString.session_id).once('value').then(function(snapshot) {
      console.log(snapshot.val());
      sessionInfo = snapshot.val();
      sessionTitle = snapshot.val().title;
      $('.title').text(sessionTitle);
      listenToSlides();
    });
  }

  function listenToSlides()
  {
    sessionID = QueryString.session_id;

    slidesRef = databaseRef.child("session/"+QueryString.session_id+"/slides");
    slidesRef.on("child_added", function(snapshot) {
      var slide = snapshot.val();
      if(slide)
      {
        addSlide(snapshot.key,slide.img);
      }
    });
    // recognition.start();
  }
  var slideLength = 0;
  var sessionTitle;
  var sessionID;
    
  function addSlide(id,img_url)
  {
    var newSlide = slideTemplate.clone();
    console.log(img_url);
    $(newSlide).attr('class','slide');
    $(newSlide).attr('id','slide'+id);
    $(newSlide).find('a').attr('onclick',"changePad('"+sessionID+sessionTitle+id+"')");
    $(newSlide).find('img.img-responsive').attr('src',img_url);
    //var el = $("<li class='list-group-item'><b><img src=" +  img_url + ":</b> " + "ee" + "</li>");//modify
    slideList.append(newSlide);
  }
 
  function createSlide(data_url){
    
      databaseRef.child("session/"+QueryString.session_id).once('value').then(function(snapshot) {
          var slidesCount = 0;
          if(sessionInfo.slides!=null)
            slidesCount = snapshot.val().slides.length;
        console.log("id:"+slidesCount);
        createPad(sessionID+sessionTitle+slidesCount,function()
          {
            changePad(sessionID+sessionTitle+slidesCount)
          });
        console.log('before uploade');
        uploadImageToFirebase(data_url,slidesCount,null);
      });
  }

  var imgRef;
  function uploadImageToFirebase(data_url,slideId,callback)
  {
    console.log('images/'+sessionTitle+slideId+'.png');
    imgRef = storageRef.child('images/'+sessionTitle+slideId+'.png');
    imgRef.putString(data_url, 'data_url').then(function(snapshot) {  
      getFileURL(slideId,callback)
    });
  }

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

var ID = function () {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  var d = new Date();
  var n = d.getTime();
  return n;

  //var id = '_' + Math.random().toString(36).substr(2, 9);
  //return id;
};

//save slides
function getFileURL(slideId,callback)
{
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


  //getShareLink('l0HegeFKCoSfOaKsg');
  
function getShareLink(giphy_id,callback)
{
    var request = "https://api.giphy.com/v1/gifs/"+giphy_id+"?api_key=dc6zaTOxFJmzC";
    $.get(request, function( data ) {
        writeGameData(game_ch,game_place,game_verb,giphy_id)
        callback(data.data.bitly_url);
    });
}

function writeGameData() {
  if(ch!=null&&place!=null&&verb!=null)
  {
    firebase.database().ref('slide/'+talk_topic+'/'+id).set({
    ch: ch,
    place: place,
    verb : verb
    });  
  }
}
function addLine(padID,text) {
          $.ajax({
            type: "GET",
            url: "/setText",
            data:{ text: text+'\n',padID:padID}

          }).done(function( response ) {
            console.log(response);
              response = JSON.parse(response);    // parse JSON string
              console.log(response);
              for(var padID in response){
                  console.log('test');
             }            
          }); 

          //setTimeout(getPadUsersCount, 3000); // call getPadUsersCount every 3 seconds
      }
      
var currentPadId;
var changePad = function(id){
  console.log(id);
  currentPadId = id;
    $('#mypad').pad({
        'padId': id
    });
}
changePad('welcome');
function createPad(padID,callback) {
          $.ajax({
            type: "GET",
            url: "/createpad",
            data:{padID:padID}
          }).done(function( response ) {
            callback();
            console.log(response);
              response = JSON.parse(response);    // parse JSON string
              console.log(response);
          }); 

          //setTimeout(getPadUsersCount, 3000); // call getPadUsersCount every 3 seconds
      }
/*
function writeUserData(userId, name, email, imageUrl) {
  firebase.database().ref('users/' + userId).set({
    username: name,
    email: email,
    profile_picture : imageUrl
  });
}*/

// var recognition = new webkitSpeechRecognition();
var recognition;
if (annyang) {
  annyang.start(continuous=true);
  recognition = annyang.getSpeechRecognizer();
  console.log(recognition);

  // var commands = {
  //   '*speech': 
    
    // function(speech) { 
        // console.log(speech); 

        // $.ajax({
        //   type: "GET",
        //   url: "/setText",
        //   data:{ a: speech+'\n'}

        // }).done(function( response ) {
        //     console.log(response);
        //     response = JSON.parse(response);    // parse JSON string
        //     console.log(response);
        //     for(var padID in response){
        //         console.log('test');
        //    }            
        // });             
    // }

  
    recognition.continuous=true;
    recognition.interimResults=true;
    // recognition.lang="en-US";
    //recognition.lang="cmn-Hant-TW";
    // recognition.onend = function(){
    // console.log('restart');
    //   recognition.start();
    // }

    // recognition.onstart=function(){
    // console.log('開始辨識...');
    // };
    // recognition.start();
      // recognition.onresult=function(event){
      // var i = event.resultIndex;
      // var j = event.results[i].length-1;
      // console.log(event.results[i][j].transcript);
      // console.log(currentPadId);
      // addLine(currentPadId,event.results[i][j].transcript);
      // };

}


$(document).ready(function() {
  // Get references to Firebase data


  /*
  // Get references to DOM elements
  var $username = $("#username");
  var $newMessage = $("#newMessage");
  var $messageList = $("#messageList");
  var $loginButton = $("#loginButton");
  var $loggedInText = $("#loggedInText");
  var $logoutButton = $("#logoutButton");

  // Add a new message to the message list
  

  // Loop through the last ten messages stored in Firebase
  messagesRef.limitToLast(10).on("child_added", function(snapshot) {
    var message = snapshot.val();

    // Escape unsafe characters
    var username = message.username.replace(/\</g, "&lt;").replace(/\>/g, "&gt;");
    var text = message.text.replace(/\</g, "&lt;").replace(/\>/g, "&gt;");

    addMessage(username, text);
  });

  // Listen for key presses on the new message input
  $newMessage.keypress(function (e) {
    // Get field values
    var username = $username.val();
    var text = $newMessage.val().trim();

    // Save message to Firebase when enter key is pressed
    if (e.keyCode == 13 && text.length) {
      messagesRef.push({
        username: "@" + globalAuthData.twitter.username,
        text: text
      }, function(error) {
        if (error) {
          console.log("Error adding new message:", error);
        }
      });

      // Reset new message input
      $newMessage.val("");
    }
  });

  // Listen for changes in auth state and show the appropriate buttons and messages
  var globalAuthData;
  ref.onAuth(function(authData) {
    globalAuthData = authData;

    if (authData) {
      // User logged in
      $loginButton.hide();
      $logoutButton.show();
      $loggedInText.text("Logged in as " + authData.twitter.displayName);
      $newMessage.prop("disabled", false);
    } else {
      // User logged out
      $loginButton.show();
      $logoutButton.hide();
      $loggedInText.text("");
      $newMessage.prop("disabled", true);
    }
  });

  // Login with Twitter when the login button is pressed
  $loginButton.click(function() {
    ref.authWithOAuthPopup("twitter", function(error, authData) {
      if (error) {
        console.error("Error authenticating with Twitter:", error);
      }
    });
  });

  // Logout when the logout button is pressed
  $logoutButton.click(function() {
    ref.unauth();
  });
  */
});
