// jshint esversion: 6
var db = firebase.firestore();

$(document).ready(function(){
  // Check whether user keeps login
  if(localStorage.getItem("loginChecked")==="true"){
    alert("Login successfully!", "success");
    localStorage.setItem("anonymous", true);
    document.location.href = "index.html";
    localStorage.setItem("emailUser", $("#inputEmail")[0].value);
  }
  else{
    localStorage.setItem("loginChecked", "false");
  }
});

// Enter
$("body").keypress(function(e){
  if(e.key==="Enter"){
    if($("#cardTitle").text()==="Login"){
      login();
    }
    else{
      register();
    }
  }
});


mode(0);
mode(0);
checkHeight();

function mode(value = 1){
  $("#e_email").css("display", "none");
  $("#e_pw").css("display", "none");
  $("#e_r_e").css("display", "none");
  $("#e_l_ra").css("display", "none");
  $("#e_r_wpw").css("display", "none");
  // Change to register mode
  if($("#cardTitle").text() === "Login"){
    if(value){
      $("#cardH3").html("<b>Let's Get Started!</b>");

    }
    else{
      $("#cardH3").html("Welcome to <b>onStudy</b>");
    }
    $("#cardTitle").text("Sign Up");
    $("#inputFirst").css("display", "inline-block");
    $("#inputLast").css("display", "inline-block");
    $(".inputDivCheckbox").css("display", "none");
    $("#date_label").css("display", "block");
    $("#inputDate").css("display", "block");
    $("#chg_mode").text("Login");
    $("#login_submit").css("display", "none");
    $("#register_submit").css("display", "inline-block");
  }
  else{
    // change to login mode
    if(value){
      $("#cardH3").html("<b>Welcome Back!</b>");

    }
    else{
      $("#cardH3").html("Welcome to <b>onStudy</b>");
    }
    $("#cardTitle").text("Login");
    $("#inputFirst").css("display", "none");
    $("#inputLast").css("display", "none");
    $(".inputDivCheckbox").css("display", "block");
    $("#date_label").css("display", "none");
    $("#inputDate").css("display", "none");
    $("#chg_mode").text("Sign Up");
    $("#login_submit").css("display", "inline-block");
    $("#register_submit").css("display", "none");
  }
}

var lastHeight = 0;
function checkHeight(){
    if ($(document).innerHeight() != lastHeight)
    {
        lastHeight = $(document).innerHeight();
        $(".bgImg").css("height", "calc(" + lastHeight + "px - 20px)");
    }

    setTimeout(checkHeight, 50);
}

$(".inputDivCheckbox").click(function(){
  if($("#c_input")[0].checked){
    $("#c_input")[0].checked = false;
  }
  else{
    $("#c_input")[0].checked = true;
  }
});

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    var uid = user.uid;
  }
});

function login(){
  if(($("#inputEmail")[0].value !== "") && ($("#inputPassword")[0].value !== "")){
    // Email verification
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test($("#inputEmail")[0].value)){
      $("#e_email").css("display", "none");

      // Firebase email verification
      var userEmail = $("#inputEmail")[0].value;
      var userPassword = $("#inputPassword")[0].value;

      firebase.auth().signInWithEmailAndPassword(userEmail, userPassword)
      .then((userCredential) => {
        alert("Login successfully!", "success");
        localStorage.setItem("anonymous", false);
        var user = userCredential.user;
        $("#e_pw").css("display", "none");
        $("#e_l_ra").css("display", "none");
        localStorage.setItem("loginChecked", $("#c_input")[0].checked);
        localStorage.setItem("emailUser", $("#inputEmail")[0].value);
        document.location.href = "index.html";

      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorCode+": "+errorMessage, 'danger');
        if(errorCode === "auth/too-many-requests"){
          $("#e_l_ra").css("display", "block");
          $("#e_pw").css("display", "none");
        }
        else{
          $("#e_pw").css("display", "block");
          $("#e_l_ra").css("display", "none");
        }
      });
    }
    else{
      // Invalid email
      $("#e_email").css("display", "block");
    }
  }
  else{
    alert("Please fill in the all the blanks.", "warning");
  }
}

function register(){
  if(($("#inputFirst")[0].value !== "") && ($("#inputLast")[0].value !== "") && ($("#inputEmail")[0].value !== "") && ($("#inputPassword")[0].value !== "") && ($("#inputDate")[0].value !== "")){
    // Email verification
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test($("#inputEmail")[0].value)){
      $("#e_email").css("display", "none");

      // Firebase email verification
      var userEmail = $("#inputEmail")[0].value;
      var userPassword = $("#inputPassword")[0].value;

      // Register in Firebase Authentication Users
      firebase.auth().createUserWithEmailAndPassword(userEmail, userPassword)
      .then((userCredential) => {
        var user = userCredential.user;
        $("#e_r_e").css("display", "none");
        $("#e_r_wpw").css("display", "none");

        // Add a new document in Cloud Firestore collection
        var id=firebase.auth().currentUser.uid;
        console.log(id);
        db.collection("users").doc(id).set({
            firstname: $("#inputFirst")[0].value,
            lastname: $("#inputLast")[0].value,
            birthday: $("#inputDate")[0].value,
            tutor: false
        })
        .then(() => {
            console.log("Document successfully written!");
            alert("Register successfully! Please re-login to verify your account.", "success");
            mode();
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorCode+": "+errorMessage, 'danger');
        if($("#cardTitle").text()==="Sign Up"){
          if(errorCode==="auth/email-already-in-use"){
            $("#e_r_e").css("display", "block");
            $("#e_r_wpw").css("display", "none");
          }
          if(errorCode==="auth/weak-password"){
            $("#e_r_wpw").css("display", "block");
            $("#e_r_e").css("display", "none");
          }
        }
      });
    }
    else{
      // Invalid email
      $("#e_email").css("display", "block");
    }
  }
  else{
    alert("Please fill in the all the blanks.", "warning");
  }
}

function anonymous() {
  firebase.auth().signInAnonymously()
    .then(() => {
      alert("Successfully login anonymously!", "success");
      localStorage.setItem("anonymous", true);
      document.location.href = "index.html";
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      setTimeout(alert(errorCode+": "+errorMessage, 'danger'), 1000);
    });
}

// Bootstrap alert
function alert(message, type) {
  var wrapper = document.createElement('div');
  wrapper.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible d-flex align-items-center" role="alert"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>'+ message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
  $("#liveAlertPlaceholder").append(wrapper);
}
