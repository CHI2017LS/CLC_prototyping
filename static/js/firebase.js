  //var messagesRef = ref.child("messages");
  var slideList = $(".sidebar-nav");
  var slideTemplate = $(".slideTemplate");
  // Create a root reference
  var storageRef = firebase.storage().ref();
  var databaseRef = firebase.database().ref();

  var slides;
  slideRef = databaseRef.child("slides/test");
  slideRef.on("value", function(snapshot) {
    slides = snapshot.val();
    if(slides)
    {
      slideLength = Object.keys(slides).length;
      console.log(slideLength);
      for (var k in slides) {
          if (slides.hasOwnProperty(k)) {
            console.log($('#slide'+k));
            if($('#slide'+k).length==0)
             addSlide(k,slides[k].img);
          }
      }  
    }
    
    //addSlide(slide);
  });
  var slideLength = 0;
  
    
  function addSlide(id,img_url)
  {
    var newSlide = slideTemplate.clone();
    console.log(img_url);
    $(newSlide).attr('class','slide');
    $(newSlide).attr('id','slide'+id);
    $(newSlide).find('img.img-responsive').attr('src',img_url);
    //var el = $("<li class='list-group-item'><b><img src=" +  img_url + ":</b> " + "ee" + "</li>");//modify
      slideList.append(newSlide);
  }
 
  function createSlide(data_url) {
    uploadFirebase(data_url,1,null);
  }

  var imgRef;
  function uploadFirebase(data_url,slideId,callback)
  {
    // Base64 formatted string
    var id = ID();
    console.log('uploading base64 image');

    imgRef = storageRef.child('images/'+id+'.png');
    imgRef.putString(data_url, 'data_url').then(function(snapshot) {  
      getFileURL(callback)
    });
  }

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

function getFileURL(callback)
{
  console.log('slides database');
  var talk_topic = "test";
  var result = imgRef.getDownloadURL().then(function(url) {
    console.log(url);
    var re = firebase.database().ref('slides/'+talk_topic+'/'+slideLength).set({
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

function writeUserData(userId, name, email, imageUrl) {
  firebase.database().ref('users/' + userId).set({
    username: name,
    email: email,
    profile_picture : imageUrl
  });
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
