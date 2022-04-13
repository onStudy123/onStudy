// jshint esversion: 8

function logout(){
  firebase.auth().signOut();
  document.location.href = "login.html";
  localStorage.setItem("loginChecked", "false");
  localStorage.setItem("emailUser", null);
}

var lvl, sub, chap;
var sub_text, chap_text;
var f_thumbnail, f_video, f_notes;

$("#t_thumbnail").change(function(){
  $("#file-chosen-thumbnail").text(this.files[0].name);
  f_thumbnail = this.files[0];
});

var vid = document.createElement('video');
var length;
$("#t_video").change(function(){
  $("#file-chosen-video").text(this.files[0].name);
  f_video = this.files[0];
  // create url to use as the src of the video
  vid.src = fileURL = URL.createObjectURL(this.files[0]);
  // wait for duration to change from NaN to the actual duration
  vid.ondurationchange = function() {
    let leading_zero = "";
    if(Math.round(this.duration%60)<10){
      leading_zero="0";
    }
    length = Math.floor(this.duration/60)+":"+leading_zero+Math.round(this.duration%60);
  };
});

$("#t_notes").change(function(){
  $("#file-chosen-notes").text(this.files[0].name);
  f_notes = this.files[0];
});

$("#t_title").keyup(function(){
  $("#count_title").text($("#t_title")[0].value.length);
});
$("#t_des").keyup(function(){
  $("#count_des").text($("#t_des")[0].value.length);
});

$("#c_oth").change(function(){
  if($(this).prop("checked") == true){
    $("#others_text").removeClass("disabled");
  }
  else {
    $("#others_text")[0].value = "";
    $("#others_text").addClass("disabled");
  }
});

$("#select_level").change(function(){
  sub_text = '<option value="none"> - - None - - </option>';
  lvl = $("#select_level option:selected").val();
  if(lvl!=="none"){
    db.collection("Form").doc(lvl).get().then((doc) => {
      if (doc.exists){
        // get subject list
        for(let i = 0; i<doc.data().Subjects.length; i++){
          sub_text += '<option value="'+doc.data().Subjects[i]+'">'+doc.data().Subjects[i]+'</option>';
        }
        $("#select_subject").html(sub_text);
        $("#select_subject").removeClass("disabled");
      } else {
        console.log("No such document Form!");
        $("#select_subject").addClass("disabled");
      }
    }).catch((error) => {
      console.log("Error getting document Form:", error);
    });
  }
  else {
    $("#select_subject").addClass("disabled");
  }
  $("#select_subject").html(sub_text);
});
$("#select_subject").change(function(){
  chap_text = '<option value="none"> - - None - - </option>';
  sub = $("#select_subject option:selected").val();
  if(sub!=="none"){
    db.collection("Form/"+lvl+"/"+sub).doc("Chapters").get().then((doc) => {
      if (doc.exists){
        // get chapter list
        for(let i = 0; i<doc.data().Chapters.length; i++){
          chap_text += '<option value="'+doc.data().Chapters[i]+'">'+doc.data().Chapters[i]+'</option>';
        }
        $("#select_chapters").html(chap_text);
        $("#select_chapters").removeClass("disabled");
      } else {
        console.log("No such document Form/Subject!");
        $("#select_chapters").addClass("disabled");
      }
    }).catch((error) => {
      console.log("Error getting document Form/Subject:", error);
    });
  }
  else {
    $("#select_chapters").addClass("disabled");
  }
  $("#select_chapters").html(chap_text);
});
$("#select_chapters").change(function(){
  chap = $("#select_chapters option:selected").text();
});

// Firebase gets data
var db = firebase.firestore();
var firebaseStorageForm;
var verified = false;

var language = [];
var docID;
var uid;
var lessons = [];

firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    uid = user.uid;

    // verify user as tutor
    db.collection("users").doc(uid).get().then((doc) => {
      if (doc.exists){
        if(doc.data().tutor){
          verified = true;
        }
        else {
          alert("This feature is only available for verified tutor.", "warning");
          setTimeout(function(){window.history.back();}, 1500);
        }
      } else {
        console.log("No such document Tutor!");
      }
    }).catch((error) => {
      console.log("Error getting document Tutor:", error);
    });
  } else {
    alert("Anonymous login", "danger");
    setTimeout(function(){window.history.back();}, 1500);
  }
});

$("#b_upload").click(function(){
  if(verified){
    // check all information are filled in
    if(($("#t_title")[0].value!=="")&&($("#t_des")[0].value!=="")&&(lvl!=="none")&&(sub!=="none")&&(chap!=="none")){
      language = [];
      let check = 0;
      for(let i = 0; i<$(".checkbox_lang").length; i++){
        if($(".checkbox_lang")[i].checked){
          check++;
          if(i!==$(".checkbox_lang").length-1){
            language.push($(".checkbox_lang")[i].value);
          } else {
            language = language.concat($("#others_text")[0].value.split(","));
          }
          console.log(language);
        }
        if(($(".checkbox_lang").eq(-1)[0].checked)&&($("#others_text")[0].value==="")){
          check = 0;
        }
      }
      if(check>0){
        if(($("#file-chosen-thumbnail").text()!=="No file chosen")&&(($("#c_video_upload")[0].checked)||($("#c_notes_upload")[0].checked))){
          if($("#c_video_upload")[0].checked){
            if($("#file-chosen-video").text()!=="No file chosen"){check = 1;} else {check = 0;  }
          }
          if($("#c_notes_upload")[0].checked){
            if($("#file-chosen-notes").text()!=="No file chosen"){check = 1;} else {check = 0;}
          }

          if(check){
            // Upload details into firebase
            // Add a new document with a generated id.
            db.collection("Form/"+lvl+"/"+sub+"/Chapters/"+chap).add({
              Video: {
                description: $("#t_des")[0].value,
                language: language,
                length: length,
                level: lvl,
                title: $("#t_title")[0].value,
                upload: firebase.firestore.FieldValue.serverTimestamp(),
                view: 0
              },
              tutorID: uid
            })
            .then((docRef) => {
                console.log("Document written with ID: ", docRef.id);
                docID = docRef.id;
                alert("Successfully create a database!", "success");

                // Upload thumbnail and get link
                firebase.storage().ref("thumbnail/"+f_thumbnail.name).put(f_thumbnail).then((snapshot) => {
                  console.log('Uploaded file Thumbnail!');
                  firebase.storage().ref("thumbnail/"+f_thumbnail.name).getDownloadURL().then((downloadURL) => {
                    db.collection("Form/"+lvl+"/"+sub+"/Chapters/"+chap).doc(docID).set({
                      Video: {
                        thumbnail: downloadURL
                      }
                    }, { merge: true })
                    .then(() => {
                        console.log("Document successfully written Thumbnail!");
                        alert("Successfully uploading thumbnail image!", "success");
                    })
                    .catch((error) => {
                        console.error("Error writing document Thumbnail: ", error);
                        alert("Failed to upload thumbnail image. Please re-upload.", "danger");
                    });
                  });
                });

                if($("#c_notes_upload")[0].checked){
                  db.collection("Form/"+lvl+"/"+sub+"/Chapters/"+chap).doc(docID).set({
                    Notes: {
                      language: language
                    }
                  }, { merge: true })
                  .then(() => {
                      console.log("Document Notes successfully written!");
                      alert("Successfully uploading notes!", "success");
                  })
                  .catch((error) => {
                      console.error("Error writing document Notes: ", error);
                      alert("Failed to upload notes. Please re-upload.", "danger");
                  });
                  // Upload notes and get link
                  firebase.storage().ref("notes/"+f_notes.name).put(f_notes).then((snapshot) => {
                    console.log('Uploaded file Notes!');
                    firebase.storage().ref("notes/"+f_notes.name).getDownloadURL().then((downloadURL) => {
                      db.collection("Form/"+lvl+"/"+sub+"/Chapters/"+chap).doc(docID).set({
                        Notes: {
                          link: downloadURL
                        }
                      }, { merge: true })
                      .then(() => {
                          console.log("Document successfully written Notes!");
                      })
                      .catch((error) => {
                          console.error("Error writing document Notes: ", error);
                      });
                    });
                  });
                }

                if($("#c_video_upload")[0].checked){
                  // Upload video and get link
                  firebase.storage().ref("video/"+f_video.name).put(f_video).then((snapshot) => {
                    console.log('Uploaded file Video!');
                    firebase.storage().ref("video/"+f_video.name).getDownloadURL().then((downloadURL) => {
                      db.collection("Form/"+lvl+"/"+sub+"/Chapters/"+chap).doc(docID).set({
                        Video: {
                          link: downloadURL
                        }
                      }, { merge: true })
                      .then(() => {
                          console.log("Document successfully written Video!");
                          alert("Successfully uploading video!", "success");
                      })
                      .catch((error) => {
                          console.error("Error writing document Video: ", error);
                          alert("Failed to upload video. Please re-upload.", "danger");
                      });
                    });
                  });
                }

                // add firebase reference to video collection
                db.collection("video").doc("ID").set({
                  [docID]: db.doc("Form/"+lvl+"/"+sub+"/Chapters/"+chap+"/"+docID)
                }, { merge: true })
                .then(() => {
                  console.log("Document Video ID written successfully.");
                })
                .catch((error) => {
                  console.error("Error writing document Video ID: ", error);
                });

                // add video ID to lesson in Tutor card_collection
                db.collection("Tutor").doc(uid).get().then((doc) => {
                  if (doc.exists){
                    lessons = doc.data()["lessons"];
                    console.log(lessons);
                    if(lessons == ""){
                      lessons = [docID];
                      console.log("1");
                    } else {
                      lessons.push(docID);
                    }
                    db.collection("Tutor").doc(uid).set({
                      lessons: lessons
                    }, { merge: true })
                    .then(() => {
                      console.log("Document Tutor written successfully.");
                    })
                    .catch((error) => {
                      console.error("Error writing document Tutor: ", error);
                    });
                  } else {
                    console.log("No such document Tutor!");
                  }
                }).catch((error) => {
                    console.log("Error getting document Tutor:", error);
                });
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });

          } else {
            alert("Please upload required media.", "warning");
          }
        } else {
          alert("Please upload required media.", "warning");
        }
      } else {
        alert("Please check the language(s) chosen and mention the other languages used.", "warning");
      }
    } else {
      alert("Please fill in all information in General section.", "warning");
    }
  }
});

// Bootstrap alert
function alert(message, type) {
  var wrapper = document.createElement('div');
  wrapper.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible d-flex fade show fixed-top" role="alert"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>'+ message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
  $("#liveAlertPlaceholder").append(wrapper);
  setTimeout(function(){$(".alert").alert('close');}, 5000);
}
