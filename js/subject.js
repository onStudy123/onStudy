// jshint esversion: 8

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
param = new URLSearchParams(window.location.search);
var level = param.get("level");
var sub = param.get("subject");
var subList = [];
$("title").text("onStudy "+level+": "+sub);
$(".section_title").text(level+": "+sub);
docRef = db.collection("Form").doc(level+"/"+sub+"/Chapters");
var subtopic = '';

var storage_vid;
var videoID = {};

docRef.get().then(async (doc) => {
    if (doc.exists) {
      // get chapters
      subList = doc.data().Chapters;
      // One chapter
      for(let i=0; i<subList.length; i++){
        subtopic += '<h3 class="section_subtitle">'+subList[i]+'</h3><div class="div_form_chevron" id="'+i+'"><button class="btn btn-outline-light b_chevron b_left" type="button" onclick="b_left(this)" name="form_left"><i class="fas fa-chevron-left"></i></button><button class="btn btn-outline-light b_chevron b_right" type="button" onclick="b_right(this)" name="form_right"><i class="fas fa-chevron-right"></i></button></div><div class="card_collection"><div class="row row-cols-lg-3 row-cols-md-2 row-cols-sm-2 row-cols-2 myCardCol">';

        // Get document from each chapters
        await db.collection("Form/"+level+"/"+sub+"/Chapters/"+subList[i]).get().then(async (querySnapshot) => {
            // One card
            await querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                storage_vid = doc.data();
                videoID[doc.id] = storage_vid.tutorID;
                console.log(videoID);

                subtopic += '<div class="col"><div class="card h-100 myCard" id="'+doc.id+'" onclick="video(\''+doc.id+'\')"><img src="'+storage_vid.Video.thumbnail+'" class="card-img" alt="Video Thumbnail"><div class="card-body"><h3 class="card-title">'+storage_vid.Video.title+'</h3><div class="video_type">';
                if(storage_vid.Video.link!==undefined){
                  subtopic += '<i class="bx bxs-videos" onclick="v(\''+doc.id+'\')"></i>';
                }
                if(storage_vid.Notes!==undefined){
                subtopic += '<i class="bx bx-notepad" onclick="n(\''+doc.id+'\')"></i>';
                }

                subtopic += '</div><div class="user_wishlist"><a href="tutor.html?id='+storage_vid.tutorID+'"><img class="bx i_tutor_profile" src="#" alt="Tutor Profile"></img></a><i class="bx bxs-heart"></i></div><p class="card-text"><small class="text-muted">'+storage_vid.Video.level+'</small></p><p class="card-text"><small class="text-muted">'+storage_vid.Video.length+'</small></p><p class="card-text"><small class="text-muted tutorName">'+'</small></p><p class="card-text"><small class="text-muted">'+storage_vid.Video.view;
                if(storage_vid.Video.view>1){
                  subtopic += ' Views';
                } else {
                  subtopic += ' View';
                }
                subtopic += '</small></p></div></div></div>';
            });

            subtopic += "</div></div>";
            $("#subtopic").html(subtopic);
        });
      }
      for(let i=0; i<Object.keys(videoID).length;i++){
        db.collection("Tutor").doc(Object.values(videoID)[i]).get().then((doc) => {
          if (doc.exists){
            // get tutor name via id
            $("#"+Object.keys(videoID)[i]).children(".card-body").children("p").children(".tutorName").text(doc.data()["Tutor"]);
            // get tutor profile image via id
            $("#"+Object.keys(videoID)[i]).children(".card-body").children(".user_wishlist").children("a").children("img").attr("src", doc.data()["photo"]);

          } else {
            console.log("No such document Tutor!");
          }
        }).catch((error) => {
          console.log("Error getting document Tutor:", error);
        });
      }
    } else {
      // undefined
      $("#subtopic").html("<i class='card-text text-muted'>Currently not available.</i>");
    }
    chevron();
}).catch((error) => {
    console.log("Error getting document:", error);
});

$(document).ready(function(){
  // Check whether user keeps login
  if(localStorage.getItem("loginChecked")==="false"&&(document.referrer!=="http://localhost/onStudy/index.html")){
    logout();
  }
});

$("#b_back").click(function(){
  window.history.back();
});

function video(vid){
  document.location.href = "lesson.html?vid="+vid;
}
function v(vid){
  $(".myCard").attr("onclick", "");
  document.location.href = "lesson.html?vid="+vid+"&notes=false";
}
function n(vid){
  $(".myCard").attr("onclick", "");
  document.location.href = "lesson.html?vid="+vid+"&video=false";
}

// Check font size for card title
$(document).ready(function () {
    resize_to_fit();
    chevron();
});
$(window).on('resize', function() {
  $(".card-title").css("font-size", "28px");
  resize_to_fit();
  chevron();
});
function resize_to_fit(){
  for (let i = 0; i<$(".card-title").length; i++){
    while ($(".card-title")[i].clientHeight > 0.05*screen.height){
      var fontsize = parseInt((window.getComputedStyle($(".card-title")[i]).fontSize).split("px")[0]);
      $(".card-title")[i].style.fontSize = (fontsize - 1) + "px";
    }
  }
}

function chevron(){
  for(let i=0; i<subList.length; i++){
    if(!($(".card_collection")[i].scrollWidth - $(".card_collection")[i].clientWidth)){
      $(".div_form_chevron").eq(i).css("display", "none");
    } else{
      $(".div_form_chevron").eq(i).css("display", "initial");
    }
  }
}

// Video move
var form_step = 0;
function b_left(el){
  form_step = Math.round($(".card_collection").eq($(el).parent().attr("id")).scrollLeft()/$(".col")[0].offsetWidth);
  if($(".col")[0].offsetWidth*form_step > 0){
    form_step--;
    for(let i = $(".col")[0].offsetWidth*(form_step+1); i>($(".col")[0].offsetWidth*form_step); i--){
      setTimeout(function(){
        $(".card_collection").eq($(el).parent().attr("id")).scrollLeft(i);
      }, 50);
    }
  }
}
function b_right (el){
  form_step = Math.round($(".card_collection").eq($(el).parent().attr("id")).scrollLeft()/$(".col")[0].offsetWidth);
  if($(".col")[0].offsetWidth*form_step < ($(".card_collection")[0].scrollWidth - $(".card_collection")[0].clientWidth)){
    form_step++;
    for(let i = $(".col")[0].offsetWidth*(form_step-1); i<($(".col")[0].offsetWidth*form_step); i++){
      setTimeout(function(){
        $(".card_collection").eq($(el).parent().attr("id")).scrollLeft(i);
      }, 50);
    }
  }
}
