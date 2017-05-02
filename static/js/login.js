/* 

I built this login form to block the front end of most of my freelance wordpress projects during the development stage. 

This is just the HTML / CSS of it but it uses wordpress's login system. 

Nice and Simple

*/
if (navigator.cookieEnabled){
	console.log("enabled");
	// 在此加入使用 Cookie 的程式碼
} else {
	console.log("你的瀏覽器設定不支援 Cookie，請先開啟瀏覽器的 Cookie 功能後，才能得到瀏覽本網頁的最佳效果！");
	// 在此加入不使用 Cookie 的程式碼
}

var databaseRef = firebase.database().ref();
var ref = databaseRef.child("password");
var password;

function validateForm() {
	ref.once('value').then(function(snapshot) {
        console.log(snapshot.val());
        if (snapshot.val() != null) {
            password = snapshot.val();
        }
    });
    console.log(password);
    var pw = document.loginForm.password.value;

    if (pw == password) {
        $("#unsuccessful-login-alert").css("display","none");
        Cookies.set('login', new Date().getTime());
        window.location = "/index";
    } else {
        $("#unsuccessful-login-alert").css("display","block");
    }
}