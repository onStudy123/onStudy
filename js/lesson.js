//jshint esversion: 8

function logout(){
  firebase.auth().signOut();
  document.location.href = "login.html";
  localStorage.setItem("loginChecked", "false");
  localStorage.setItem("emailUser", null);
}

$("#b_back").click(function(){
  window.history.back()
});

$(document).ready(function(){
  if(localStorage.getItem("loginChecked")==="false"&&(document.referrer.split("?")[0]!=="http://localhost/onStudy/subject.html")){
    logout();
  }
});

// Firebase gets data
var db = firebase.firestore();
var path;
var storage_vid;
param = new URLSearchParams(window.location.search);
var vid = param.get("vid");
var video = (param.get("video")===null) || false;
var notes = (param.get("notes")===null) || false;

db.collection("video").doc("ID").get().then(async (doc) => {
    if (doc.exists){
      path = doc.data()[vid];

      // Get video document
      await db.doc(path.path).get().then((doc) => {
          if (doc.exists){
            // Get video document
            storage_vid = doc.data();
            $("title").text(storage_vid.Video.title);
            $("video").attr("poster", storage_vid.Video.thumbnail);
            if(storage_vid.Video.link!==undefined && video){
              $(".video_type").html($(".video_type").html()+'<i class="bx bxs-videos bx_l"></i>');
              $("video").html('<source src="'+storage_vid.Video.link+'" type="video/mp4">');
              $("#vid_lang").html($("#vid_lang").html()+"  "+storage_vid.Video.language.join(", "));
            } else{
              $(".col-md-7").css("display", "none");
              $(".col-md-5").removeClass("col-md-5");
              $("#vid_lang").css("display", "none");
            }
            if(storage_vid.Notes!==undefined && notes){
              $(".video_type").html($(".video_type").html()+'<i class="bx bx-notepad bx_l"></i>');
              $("#notes_lang").html(storage_vid.Notes.language.join(", "));
              $("#notes_link").attr("src", storage_vid.Notes.link);
            } else{
              $("#notes_div").css("display", "none");
            }
            $("#title").text(storage_vid.Video.title);
            $("#subtitle").text(storage_vid.Video.level+" "+path.q.path.segments[7]);
            $("#des").text(storage_vid.Video.description);

            $("#dur").html($("#dur").html()+"  "+storage_vid.Video.length);

            // get tutor name via id
            db.collection("Tutor").doc(storage_vid.tutorID).get().then(async (doc) => {
              if (doc.exists){
                $("#instructor").html($("#instructor").html()+' '+'<a href="javascript:toTutorHTML(\''+storage_vid.tutorID+'\')">'+doc.data()["Tutor"]+'</a>');
                $(".i_tutor_profile").attr("src", doc.data()["photo"]);
                $(".i_tutor_profile").parent("a").attr("href", "tutor.html?id="+storage_vid.tutorID);
              } else {
                console.log("No such document Tutor!");
              }
            }).catch((error) => {
              console.log("Error getting document Tutor:", error);
            });

            let view = $("#view").html()+"  "+storage_vid.Video.view;
            if(storage_vid.Video.view>1){
              $("#view").html(view+" views");
            }
            else {
              $("#view").html(view+" view");
            }
          } else {
            console.log("No such document!");
          }}).catch((error) => {
            console.log("Error getting document:", error);
          });
    } else {
      console.log("No such document!");
    }}).catch((error) => {
      console.log("Error getting document video:", error);
    });

function toTutorHTML(id){
  document.location.href = 'tutor.html?id='+id;
}
