// jshint esversion: 6

// Firebase
function logout(){
  firebase.auth().signOut();
  document.location.href = "login.html";
  localStorage.setItem("loginChecked", "false");
  localStorage.setItem("emailUser", null);
}

// Firebase gets data
var db = firebase.firestore();
var docRef;
var firebaseStorageForm;
var form = "";
$(".b_form").click(function(){
  form = $(this).text();
  $(".div_form_btn").css("display", "none");
  $(".div_subject_btn").css("display", "inline-block");
  $(".div_subject_btn").html('<button class="b_subject" id="b_subject_back" type="button" onclick="categoryBack()"><i class="fas fa-chevron-left"></i>  <b>Back</b></button>');
  docRef = db.collection("Form").doc(form);
  docRef.get().then((doc) => {
      if (doc.exists) {
        firebaseStorageForm = doc.data();
        for(let i=0; i<firebaseStorageForm.Subjects.length; i++){
          $(".div_subject_btn").html($(".div_subject_btn").html() + '<button class="b_subject" type="button" onclick="subject(this)">' + firebaseStorageForm.Subjects[i] + '</button>');
        }
      } else {
        // undefined
        firebaseStorageForm = [];
        firebaseStorageForm.Subjects = [];
        $(".div_subject_btn").html($(".div_subject_btn").html() + '<span style="color:#eee;padding-left:5px;">Currently unavailable.</span>' );
      }
  }).catch((error) => {
      console.log("Error getting document:", error);
  });
});

function categoryBack(){
  $(".div_form_btn").css("display", "inline-block");
  $(".div_subject_btn").css("display", "none");
}
// Go to subject.html

function subject(el){
  document.location.href = "subject.html?level="+form+"&subject="+$(el).text();
}

$(document).ready(function(){
  // Check whether user keeps login
  if((localStorage.getItem("loginChecked")==="false"&&(document.referrer!=="http://localhost/onStudy/login.html"))||((localStorage.getItem("emailUser")==null)&&(localStorage.getItem("anonymous")!=="true"))){
    // console.log(1);
    logout();
  }
});

// Categories form


var form_step = 0;
$("#b_left").click(function(){
  if(175*form_step > 0){
    form_step--;
    for(let i = 175*(form_step+1); i>(175*form_step); i--){
      setTimeout(function(){
        $(".div_form_btn").scrollLeft(i);
      }, 50);
    }
  }
});
$("#b_right").click(function(){
  if(175*form_step < ($(".div_form_btn")[0].scrollWidth - $(".div_form_btn")[0].clientWidth)){
    form_step++;
    for(let i = 175*(form_step-1); i<(175*form_step); i++){
      setTimeout(function(){
        $(".div_form_btn").scrollLeft(i);
      }, 50);
    }
  }
});

setInterval(function(){
  if(!($(".div_form_btn")[0].scrollWidth - $(".div_form_btn")[0].clientWidth)){
    $(".div_form_chevron").css("display", "none");
  }
  else{
    $(".div_form_chevron").css("display", "initial");
  }
}, 100);

// Categories subject
