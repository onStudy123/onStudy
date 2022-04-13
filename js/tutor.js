// jshint esversion: 8

function logout(){
  firebase.auth().signOut();
  document.location.href = "login.html";
  localStorage.setItem("loginChecked", "false");
  localStorage.setItem("emailUser", null);
}

// Firebase gets data
var db = firebase.firestore();
param = new URLSearchParams(window.location.search);
var tutorID = param.get("id");
var tutorData;

// get path
var path;
var storage_vid;
var videoID;
var myCardCol = "";
var j = 0;
var k = 0;

db.collection("Tutor").doc(tutorID.toString()).get().then(async (doc) => {
  if (doc.exists){
    tutorData = doc.data();
    $("title").text(tutorData["Tutor"]);
    $("#i_profile").attr("src", tutorData["photo"]);
    $("#title").text(tutorData["Tutor"]);
    $("#subtitle").text(tutorData["Subject"].join(", "));
    $("#des").text(tutorData["aboutMe"]);
    $(".b_email").attr("onclick", "window.open('mailto:" + tutorData["contact"]["email"] + "');");
    $(".b_fb").attr("onclick", "window.open('" + tutorData["contact"]["fb"] + "');");
    $(".b_yt").attr("onclick", "window.open('" + tutorData["contact"]["yt"] + "');");
    if(Object.keys(tutorData["lessons"]).length===1){
      $(".lesson_title").html('Lesson (<span id="totalLesson">1</span>)');
    } else {
      $("#totalLesson").text(tutorData["lessons"].length);
    }
    $(".myCardCol").html("");
    startVideoCollection(j+3);

  } else {
    console.log("No such document Tutor!");
  }
}).catch((error) => {
  console.log("Error getting document Tutor:", error);
});

function startVideoCollection(j = 3){
  myCardCol = "";
  $(".myCardCol").html("");
  db.collection("video").doc("ID").get().then(async (doc) => {
    if (doc.exists){
      if(tutorData["lessons"].length < j){
        j = tutorData["lessons"].length;
      }

      for(let i = 0; i<j; i++){
        videoID = tutorData["lessons"][i];
        path = doc.data()[tutorData["lessons"][i]];

        // Get video document
        await db.doc(path.path).get().then((doc) => {
            if (doc.exists){
              storage_vid = doc.data();
              myCardCol += '<div class="col"><zdiv class="card h-100 myCard" id="'+doc.id+'" onclick="video(\''+doc.id+'\')"><img src="'+doc.data().Video.thumbnail+'" class="card-img" alt="Video Thumbnail"><div class="card-body"><h3 class="card-title">'+doc.data().Video.title+'</h3><div class="video_type">';
              if(doc.data().Video.link!==undefined){
                myCardCol += '<i class="bx bxs-videos" onclick="v(\''+doc.id+'\')"></i>';
              }
              if(doc.data().Notes!==undefined){
              myCardCol += '<i class="bx bx-notepad" onclick="n(\''+doc.id+'\')"></i>';
              }
              myCardCol += '</div><div class="user_wishlist"><a href="tutor.html?id='+doc.data().tutorID+'"><img class="bx i_tutor_profile" src="'+tutorData["photo"]+'" alt="Tutor Profile"></img></a><i class="bx bxs-heart"></i></div><p class="card-text"><small class="text-muted">'+doc.data().Video.level+'</small></p><p class="card-text"><small class="text-muted">'+doc.data().Video.length+'</small></p><p class="card-text"><small class="text-muted">'+tutorData["Tutor"]+'</small></p><p class="card-text"><small class="text-muted">'+doc.data().Video.view;
              if(doc.data().Video.view>1){
                myCardCol += ' Views';
              } else {
                myCardCol += ' View';
              }
              myCardCol += '</small></p></div></div></div>';
            } else {
              console.log("No such document!");
            }}).catch((error) => {
              console.log("Error getting document:", error);
            });
      }
      myCardCol += "</div></div>";
      $(".myCardCol").html(myCardCol);
      if(j > 3){
        $(".card_collection").eq($(".b_right").parent().attr("id")).scrollLeft($(".col")[0].offsetWidth*3 - 100);
      }

    } else {
        console.log("No such document!");
    }}).catch((error) => {
    console.log("Error getting document video" + videoID + ":", error);
  });
}

function seeMore(){
  if(tutorData["lessons"].length+3>=j){
    startVideoCollection(tutorData["lessons"].length+3);
  } else {
    startVideoCollection(tutorData["lessons"].length);
  }
}

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
