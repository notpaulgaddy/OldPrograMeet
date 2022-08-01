const slug = window.location.href.split("?")[1].split("=")[1];
const container = document.getElementById("grid-container");
let cTime = new Date().toString();
let time = new Date().toString();
let commentArray = [];
let activeUser = {};
var docRef = firebase.firestore();
let latestDoc = undefined;
let latestDocId = null;
let dataLimit = 2; // change number of comments displayed here
let dataStatus = false;
let allComments = [];
let postOwner = null;
var storageRef = firebase.storage();
let file_type = "";
let media_file = null;
let media_url = "";
let media_type = "";
let post_with_file = false;

if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
  theAgent = "PrograMeet for mobile";
}else{
  theAgent = "PrograMeet Web";
}

firebase.auth().onAuthStateChanged((user) => {
  db = firebase.firestore();
  db.collection("userInfo")
    .doc(user.uid)
    .get()
    .then(function (doc) {
      if (doc.exists) {
        var downloadURL = doc.data().downloadURL;
        var fln = doc.data().fln;
        document.getElementById("leftPfp").src = downloadURL;
        document.getElementById("leftName").innerHTML = fln;
        activeUser = {
          ...user,
          ...doc.data(),
          profilePic: downloadURL,
        };
      }
    });
  getPost(user);
});

function getPost(user) {
  firebase
    .firestore()
    .collection("Posts")
    .doc("allPosts")
    .collection("posts")
    .get()
    .then((post) => {
      let data = post.docs;
      data.forEach((doc) => {
        if (doc.id === slug) {
          displayPostDetail(doc.data(), slug, user);
        }
      });

      // displayPostDetail()
    });
}

async function displayPostDetail(info, postKey, user) {
  let usr = await fetchUser(activeUser.uid);
  // get comments
  getComments(postKey, user, latestDoc);

  var tTime = new Date(info.time)
  var sinceMin = Math.round((time - tTime) / 60000);
if (sinceMin == 0) {
var sinceSec = Math.round((time - tTime) / 1000);
if (sinceSec < 10) var since = "less than 10 seconds ago";
else if (sinceSec < 20) var since = "less than 20 seconds ago";
else var since = "half a minute ago";
} else if (sinceMin == 1) {
var sinceSec = Math.round((time - tTime) / 1000);
if (sinceSec == 30) var since = "half a minute ago";
else if (sinceSec < 60) var since = "less than a minute ago";
else var since = "1 minute ago";
} else if (sinceMin < 45) var since = sinceMin + " minutes ago";
else if (sinceMin > 44 && sinceMin < 60) var since = "about 1 hour ago";
else if (sinceMin < 1440) {
var sinceHr = Math.round(sinceMin / 60);
if (sinceHr == 1) var since = "about 1 hour ago";
else var since = "about " + sinceHr + " hours ago";
} else if (sinceMin > 1439 && sinceMin < 2880) var since = "1 day ago";
else {
var sinceDay = Math.round(sinceMin / 1440);
var since = sinceDay + " days ago";
}

  document.getElementById(
    "list_div"
  ).innerHTML += `
  <div class="profile-wrapper">
  <div class="container-fluid">
     <div class="profile-box profile-box-two profile-box-three custom-profile-box-three">
        <div class="d-flex align-items-center justify-content-between">
           <div class="profile-second-content position-relative flex-direction d-flex align-items-start">
              <a class="three-dot dropdown-toggle" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" href="#"><img src="img/three-dot.png" alt=""></a>
              <img class="man-two" src="img/man-02.png" alt="">
              <div>
                 <h3>Bryson Tiller</h3>
                 <h4 class="btiller-text">@btiller</h4>
              </div>
              <div class="dropdown-menu dropdown-menu-right" >
                 <a style="color: #5B93FF;background: rgba(91, 147, 255, 0.19);" class="dropdown-item" href="#">Edit</a>
                 <a style="background: rgba(231, 29, 54, 0.15);color: #E71D36;" class="dropdown-item mt_5" href="#">Delete</a>
                 <a style="background: rgba(91, 147, 255, 0.15);color: #5B93FF;" class="dropdown-item mt_5" href="#">Activate</a>
              </div>
           </div>
        </div>
        <div class="profile-second-content">
           <h3 class="mt_20">Any new music recommendations? 🤔 </h3>
           <h3 class="mt_10">11-13-21 10:59</h3>
        </div>
     </div>
     <div class="like-comment d-flex align-items-center justify-content-around">
        <p>17 <span>Likes</span></p>
        <p>4 <span>Comments</span></p>
     </div>
     <div class="like-comment like-comment-two d-flex align-items-center justify-content-around">
        <a href="#"><img src="img/imoji-four.png" alt=""></a>
        <a href="#"><img src="img/imoji-three.png" alt=""></a>
     </div>
  </div>
</div>
  `;
  await getLikes(postKey);
  checkLiked(user, document.getElementById(`heart-${postKey}`), postKey);

  if (postKey === latestDocId) {
    initWayPoint();
  }
}

function getComments(postkey, user, doc) {
  $("#allReplies").empty();
  firebase
    .firestore()
    .collection("comments")
    .doc(postkey)
    .collection("commentList")
    .orderBy("timestamp", "desc")
    .limit(dataLimit)
    .get()
    .then((data) => {
      let commentLists = data.docs;

      if (commentLists.length !== 0) {
        latestDoc = data.docs[data.docs.length - 1];
        latestDocId = latestDoc.id;

        commentLists.forEach((doc, i) => {
          let rpCount = 0;
          // firebase
          //   .firestore()
          //   .collection("comments")
          //   .doc(postkey)
          //   .collection("commentList")
          //   .doc(doc.id)
          //   .collection("replies")
          //   .get()
          //   .then((coms) => {
          //     rpCount = coms.docs.length;
          //     console.log(coms.docs.length);
          //   });
          //console.log(postkey);
          allComments.push(doc.data());
          displayComment(doc.data(), user, postkey, doc.id);
        });
      }
    });
}
$("#loadmore-btn").on("click", function () {
  getNextComments(latestDoc);
});
async function getNextComments(doc) {
  if (latestDoc) {
    $("#loadmore-area").html(
      `<i class="fa fa-spinner fa-spin fa-2x" aria-hidden="true"></i>`
    );
    let st = await firebase
      .firestore()
      .collection("comments")
      .doc(slug)
      .collection("commentList")
      .orderBy("timestamp", "desc")
      .limit(dataLimit)
      .startAfter(doc)
      .get();
    let data = await st;

    let commentLists = data.docs;
    latestDoc = data.docs[data.docs.length - 1];
    if (latestDoc) {
      latestDocId = latestDoc.id;
      commentLists.forEach((doc) => {
        displayComment(doc.data(), activeUser, slug, doc.id);
      });
    } else {
      $("#loadmore-area").html(``);
    }
  } else {
    $("#end-msg").html(`<div class="alert alert-info" role="alert">
  <strong>No more data</strong>
</div>`);
  }
}

async function fetchUser(uid) {
  return await docRef.collection("userInfo").doc(uid).get();
}

async function displayComment(replies, user, postkey, key) {
  let usr = await fetchUser(activeUser.uid);
  var tTime = new Date(replies.time)
  var sinceMin = Math.round((time - tTime) / 60000);
if (sinceMin == 0) {
var sinceSec = Math.round((time - tTime) / 1000);
if (sinceSec < 10) var since = "less than 10 seconds ago";
else if (sinceSec < 20) var since = "less than 20 seconds ago";
else var since = "half a minute ago";
} else if (sinceMin == 1) {
var sinceSec = Math.round((time - tTime) / 1000);
if (sinceSec == 30) var since = "half a minute ago";
else if (sinceSec < 60) var since = "less than a minute ago";
else var since = "1 minute ago";
} else if (sinceMin < 45) var since = sinceMin + " minutes ago";
else if (sinceMin > 44 && sinceMin < 60) var since = "about 1 hour ago";
else if (sinceMin < 1440) {
var sinceHr = Math.round(sinceMin / 60);
if (sinceHr == 1) var since = "about 1 hour ago";
else var since = "about " + sinceHr + " hours ago";
} else if (sinceMin > 1439 && sinceMin < 2880) var since = "1 day ago";
else {
var sinceDay = Math.round(sinceMin / 1440);
var since = sinceDay + " days ago";
}
  let els = document.getElementById("allReplies");
  els.innerHTML += `<div  style="cursor:pointer" id="comment-index-${latestDocId}"  class="profile-box replybx profile-box-two mb-5 profile-box-three profile-box-custom">
  <div class="d-flex align-items-center justify-content-between">
      <div class="profile-second-content position-relative flex-direction d-flex align-items-start" id="${
        replies.uid
      }">
      <a class="three-dot" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><img src="public/img/three-dot.png" alt=""></a>
          <img src="${replies.profilePic} alt="">
          <div class="bryson-main">
              <h4 class="bryson-text">${replies.firstLast} <span>@${
    replies.username
  } ${since}</span> </h4>
              <h5 class="reply-text mt_10">Replying to @${
                replies.postOwner.username
              }</h5>
              <div class="text-center mt_10">
                  <!-- <img src="img/album-img.png" class="album-img img-fluid mt_10" alt=""> -->
                  <h3 class="mt_20">${replies.Post}</h3>

             ${
               replies.post_type === "with_media" &&
               replies.file_type === "image"
                 ? `<img src="${replies.src}" class="album-img img-fluid mt_10" alt="">`
                 : ""
             }


             ${
               replies.post_type === "with_media" && replies.file_type === "vid"
                 ? `
               <video style="width:100%"  height="240" controls>
                <source src="${replies.src}" type="${replies.media_type}">
              Your browser does not support the video tag.
              </video>
               
               
               `
                 : ""
             }
                  <div class="like-box-two-main d-flex align-items-center justify-content-center">
                      <a style="font-size:15px"   class="like-box like-box-two mt_10 like-box-one" type="button" ><img style="max-height:15px;max-width:15px;" src="public/img/imoji-four.png" id="myModal"
                      tabindex="-1"
                      role="dialog"
                      aria-labelledby="exampleModalLabel"
                      aria-hidden="true" onclick="naviToReplies('${postkey}','${key}')" alt="">${
    countReplies(key) || ""
  }<span id="commCount-${key}"></span></a>
                      <a onclick="likeComment('${key}','${replies.uid}','${
    usr.data().username
  }')" style="font-size:15px" class="like-box mt_10 like-box-two"><img style="max-height:15px;max-width:15px;" src="public/img/imoji-three.png" alt="">
                      ${replies.likes?.length || 0}
                      </a>
                  </div>
              </div>
              <h4 class="bryson-text">${replies.deviceAgent} </h4>
          </div>
          <div class="dropdown-menu dropdown-menu-right" >
                <a style="color: #5B93FF;background: rgba(91, 147, 255, 0.19);" class="dropdown-item" href="#">Edit</a>
                <a style="background: rgba(231, 29, 54, 0.15);color: #E71D36;" class="dropdown-item mt_5" href="#">Delete</a>
                <a style="background: rgba(91, 147, 255, 0.15);color: #5B93FF;" class="dropdown-item mt_5" href="#">Activate</a>
            </div>
      </div>
  </div>
</div>
                  `;
  getReplies(postkey, key);
  //replyToComment(replies,postkey,user,key);

  if (key === latestDocId) {
    initWayPoint();
  }

  return replies, user, postkey, key;
}

// addcomment
$("#saveButton").on("click", async function () {
  if ($("#postRep").val() !== "") {
    $(this).attr("disabled", true).text("posting...");
    let commentObj = {
      Post: $("#postRep").val(),
      postId: slug,
      uid: activeUser.uid,
      profilePic: activeUser.profilePic,
      firstLast: activeUser.fln,
      username: activeUser.username,
      postOwner: await getPostOwner(slug),
      time: time,
      timestamp: Date.now(),
      deviceAgent: theAgent,
    };

    let ownr = await getPostOwner(slug);

 

    if (!post_with_file) {
      firebase
        .firestore()
        .collection("comments")
        .doc(slug)
        .collection("commentList")
        .add(commentObj)
        .then(() => {
          $("#comment-btn").attr("disabled", false).text("Comment");
          $("#postRep").val("");
          $("#commentModal").modal("hide");
          $(".modal-backdrop").removeClass("show").addClass("hide");
          //TODO: add notificaions
          
      
           let notifyData={
              sendTo:ownr.uid,
              sendFrom:activeUser.uid,
              msg:`${activeUser.username} added a comment  to your post`,
              name:activeUser.fln,
              email:activeUser.email,
              photo: activeUser.downloadURL,
              dateTime: new Date().toLocaleString(),
              status:'unread',
              notifType: "comment",
            }
          
            sendNotif(notifyData)
                sendNotification(ownr.uid, `${activeUser.username} added a comment`);
          getComments(slug, activeUser);
          updatePostComment(slug);
        })
        .catch(function (error) {
          alert(error);
          $("#comment-btn").attr("disabled", false).text("Comment");
          $("#postRep").val("");
        });
    } else {
      doUpload(commentObj);
    }
  } else {
    alert("You can't post empty comment");
  }
});

async function getPostOwner(postId) {
  let post = await firebase
    .firestore()
    .collection("Posts")
    .doc("allPosts")
    .collection("posts")
    .doc(postId)
    .get();
  return {
    ...post.data(),
  };
}

function naviToReplies(postkey, replyPostKey) {
  window.location = `/tweet-reply.html?post=${postkey}&&comment=${replyPostKey}`;
  //onclick="replyToComment('${postkey}','${replies.username}','${replies.uid}','${replies.profilePic}','${replies.firstLast}')"
}
function replyToComment(key, postkey, user, replies) {
  if ($("#postRep").val() !== "") {
    $("#saveButton").attr("disabled", true).text("posting...");
    let commentObj = {
      Post: $("#postRep").val(),
      postId: key,
      uid: user.uid,
      profilePic: user.profilePic,
      firstLast: user.fln,
      username: user.username,
      time: cTime,
      timestamp: Date.now(),
    };
    firebase
      .firestore()
      .collection("comments")
      .doc(postkey)
      .collection("commentList")
      .doc("3eOqsL6lVsArYLP6cz0p")
      .add(commentObj)
      .then(() => {
        $("#comment-btn").attr("disabled", false).text("Comment");
        $("#postRep").val("");
        getComments(postKey, activeUser);
        updatePostComment(postKey);
      })
      .catch(function (error) {
        alert(error);
        $("#comment-btn").attr("disabled", false).text("Comment");
        $("#postRep").val("");
      });
  } else {
    alert("You can't post empty comment");
  }
}

function nav(postId) {
  window.location = "reply.html" + "?=" + postId;
}

function getReplies(postkey, key) {
  firebase
    .firestore()
    .collection("comments")
    .doc(postkey)
    .collection("commentList")
    .doc(key)
    .collection("replies")
    .get()
    .then((reply) => {
      let replies = reply.docs;
      replies.forEach((reply) => {
        displayReplies(reply, key);
      });
    });
}

function displayReplies(reply, commkey) {
  let key = reply.id;
  document.querySelector(`#replies-div-${commkey}`).innerHTML += `
   <div class="shadow-sm pl-3 style=" display:flex;align-items:center;">
      <div style="flex:0.3;display:flex;justify-content:flex-start;align-items:center">
        
      </div>
      <div style="flex:0.7">
        ${reply.data().reply}</div>
        <div><small><strong>@${
          reply.data().username
        }</strong></small>,<small><strong>@${
    reply.data().time
  }</strong></small></div>
    </div>
    
    `;
}

async function likeComment(ky, postOwner, username){
   let usrData=await fetchUser(activeUser.uid)
  firebase
    .firestore()
    .collection("comments")
    .doc(slug)
    .collection("commentList")
    .doc(ky)
    .get()
    .then((data) => {
      let dt = data.data();
      if (dt.likes && dt.likes.includes(activeUser.uid)) {
        alert("Liked");

      } else {
        let likesArr = [];
        if (dt.likes) {
          likesArr = [...dt.likes];
        }

        likesArr.push(activeUser.uid);
        firebase
          .firestore()
          .collection("comments")
          .doc(slug)
          .collection("commentList")
          .doc(ky)
          .update({
            likes: likesArr,
          })
          .then((data) => {
            sendNotification(postOwner, `${username} liked your comment`);
            let notifyData = {
              sendTo: postOwner,
              sendFrom: activeUser.uid,
              msg: `${username} liked your comment`,
              name: usrData.data().fln,
              email: activeUser.email,
              photo: usrData.data().downloadURL,
              dateTime: new Date().toLocaleString(),
              status: "unread",
              notifType: "like",
            };
            sendNotif(notifyData);

            
            alert("liked");
          });
      }
    });
}

function countReplies(ky) {
  firebase
    .firestore()
    .collection("replies")
    .doc(ky)
    .collection("allReplies")
    .get()
    .then((replies) => {
      let data = replies.docs;
 

      $("#commCount-" + ky).text(data.length);

      //  data.forEach((dt)=>{
      //    console.log(dt.id);
      //    $('#commCount-'+dt.id).text(data.length)
      //  })
    })
    .catch((err) => {
      console.log(err);
    });
}

function likeBtnStatus(uid, ky) {
  console.log(usersLike);
  firebase
    .firestore()
    .collection("Posts")
    .doc("allPosts")
    .collection("posts")
    .doc(ky)
    .collection("likes")
    .get()
    .then((data) => {
      let likes = data.docs;
      $("#likes-" + ky).text(likes.length);
      likes.forEach((like) => {
        let isLiked = usersLike.some(
          (lk) => lk.uid === uid && lk.postKey === ky
        );
        if (!isLiked) {
          usersLike.push(like.data());
          return false;
        }
        return true;
      });
    });
}

async function like(ky, uid, postOwner, username) {
   let usrData=await fetchUser(activeUser.uid)
  let alllikes = [];
  let storedLikes = [];
  let userLikeIds = [];

  let likes = await firebase
    .firestore()
    .collection("likes")
    .doc(ky)
    .collection("allLikes")
    .get();
  if (likes.docs.length === 0) {
    firebase
      .firestore()
      .collection("likes")
      .doc(ky)
      .collection("allLikes")
      .add({
        uid: activeUser.uid,
      });
    alllikes.push(activeUser.uid);
    sendNotification(postOwner, `${username} liked your post`);
    let notifyData = {
      sendTo: postOwner,
      sendFrom: activeUser.uid,
      msg: `${username} liked your post`,
      name: usrData.data().fln,
      email: activeUser.email,
      photo: usrData.data().downloadURL,
      dateTime: new Date().toLocaleString(),
      status: "unread",
      notifType: "like",
    };
    sendNotif(notifyData);
  } else {
    let data = likes.docs;
    data.forEach((like) => {
      if (!alllikes.includes(like.data().uid)) alllikes.push(like.data().uid);
    });
    if (alllikes.includes(uid)) {
      if (confirm("Would you like to unlike the post?")) {
        let idx = alllikes.indexOf(uid);
        var likesRef = firebase
          .firestore()
          .collection("likes")
          .doc(ky)
          .collection("allLikes");
        likesRef
          .where("uid", "==", uid)
          .get()
          .then((likedt) => {
            let likes = likedt.docs;
            if (!likedt.empty) {
              likes.forEach((doc) => {
                if (doc.exists) {
                  doc.ref.delete().then(() => {
                    firebase
                      .firestore()
                      .collection("likes")
                      .doc(ky)
                      .collection("allLikes")
                      .get()
                      .then((dt) => {
                        let likes = dt.docs;
                        likes.forEach((dt) => {
                          storedLikes.push(dt.data());
                        });
                        firebase
                          .firestore()
                          .collection("Posts")
                          .doc("allPosts")
                          .collection("posts")
                          .doc(ky)
                          .update({
                            likes: storedLikes.length,
                          });
                      });
                  });
                }
              });
            }
          });
      }

      return;
    }
    firebase
      .firestore()
      .collection("likes")
      .doc(ky)
      .collection("allLikes")
      .add({
        uid: activeUser.uid,
      });
    sendNotification(postOwner, `${username} liked your post`);
    let notifyData = {
      sendTo: postOwner,
      sendFrom: activeUser.uid,
      msg: `${username} liked your post`,
      name: usrData.data().fln,
      email: activeUser.email,
      photo: usrData.data().downloadURL,
      dateTime: new Date().toLocaleString(),
      status: "unread",
      notifType: "like",
    };
    sendNotif(notifyData);
  }
  //update post num likes
  updatePostLikes(ky, alllikes.length);

  return;
}
async function updatePostLikes(ky, totLikes) {
  let post = await firebase
    .firestore()
    .collection("Posts")
    .doc("allPosts")
    .collection("posts")
    .doc(ky)
    .get();
  let data = await post.data();
  if (data.likes) {
    data.likes = data.likes + totLikes;
  } else {
    data.likes = totLikes;
  }

  await firebase
    .firestore()
    .collection("Posts")
    .doc("allPosts")
    .collection("posts")
    .doc(ky)
    .set(data);
}
async function getLikes(ky) {
  let likes = await firebase
    .firestore()
    .collection("likes")
    .doc(ky)
    .collection("allLikes")
    .get();
  let data = await likes.docs;
  totLikes = data.length;
  return totLikes;
  // return data.length;
}
async function updatePostComment(ky) {
  let post = await firebase
    .firestore()
    .collection("Posts")
    .doc("allPosts")
    .collection("posts")
    .doc(ky)
    .get();
  let data = await post.data();
  let allcomms = await firebase
    .firestore()
    .collection("comments")
    .doc(ky)
    .collection("commentList")
    .get();

  let comm = allcomms.docs;

  data.comments = comm.length;
  await firebase
    .firestore()
    .collection("Posts")
    .doc("allPosts")
    .collection("posts")
    .doc(ky)
    .set(data);
}

function reply(postkey, comentId, uid) {
  db = firebase.firestore();
  db.collection("userInfo")
    .doc(uid)
    .get()
    .then(function (doc) {
      var fln = doc.data().fln;
      var username = doc.data().username;
      let replyObj = {
        reply: $("#input-" + comentId).val(),
        timestamp: Date.now(),
        comentId,
        uid,
        postkey,
        username,
        fln,
        time: cTime,
      };
      if (replyObj.reply !== "") {
        $("#input-" + comentId).val("");
        firebase
          .firestore()
          .collection("comments")
          .doc(postkey)
          .collection("commentList")
          .doc(comentId)
          .collection("replies")
          .add(replyObj)
          .then((reply) => {})
          .catch((error) => {
            console.log(error);
          });
      }
    });
}
const initWayPoint = () => {
  new Waypoint({
    element: document.getElementById("comment-index-" + latestDocId),
    handler: function (direction) {
      getNextComments(latestDoc);
    },
    offset: "100%",
  });
};

$("#attach_img").on("click", function () {
  file_type = $(this).data("type");
  post_with_file = true;
  $("#media-input").trigger("click");
});

$("#attach_vid").on("click", function () {
  post_with_file = true;
  file_type = $(this).data("type");
  $("#media-input").trigger("click");
});

$("#media-input").on("change", function (e) {
  media_file = e.target.files[0];
  let url = URL.createObjectURL(media_file);

  if (file_type === "image") {
    $("#preview-media").html(`
             <img style="max-width: 300px;height: 100px;" src="${url}" alt=""/>
             `);
  } else if (file_type === "vid") {
    $("#preview-media").html(`
 <video width="320" height="240" controls>
                <source src="${url}" type="${media_file.type}">
              Your browser does not support the video tag.
              </video>


             `);
  }
});

$("#upload-btn").on("click", function () {
  // doUpload
  doUpload();
});

function doUpload(postData) {
  var reader = new FileReader();
  reader.addEventListener("load", function () {
    var metadata = {
      contentType: media_file.type,
      size: media_file.size,
      uid: activeUser.uid,
    };
    let filename = Date.now() + "-" + media_file.name;
    let ref = storageRef
      .ref(`comments/${file_type}/${activeUser.uid}/${filename}`)
      .put(media_file, metadata);
    $(".progress").show();
    ref.on(
      "state_changed",
      (snapshot) => {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");

        $("#progressbar").css("width", progress + "%");

        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log("Upload is paused");
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log("Upload is running");
            break;
        }
      },
      (error) => {
        // Handle unsuccessful uploads
        console.log(error);
      },
      () => {
        ref.snapshot.ref.getDownloadURL().then((downloadURL) => {
          console.log("File available at", downloadURL);
          (postData.post_type = "with_media"), (postData.file_type = file_type);
          postData.src = downloadURL;
          postData.media_type = media_file.type;
          firebase
            .firestore()
            .collection("comments")
            .doc(slug)
            .collection("commentList")
            .add(postData)
            .then(() => {
              sendNotification(
                ownr.uid,
                `${activeUser.username} added a comment`
              );

              let notifyData={
      sendTo:ownr.uid,
      sendFrom:activeUser.uid,
      msg:`${username} added a comment  to your post`,
      name:usrData.data().fln,
      email:activeUser.email,
      photo: ownr.downloadURL,
      dateTime: new Date().toLocaleString(),
      status:'unread',
      notifType: "comment",
    }
    sendNotif(notifyData)

              $("#comment-btn").attr("disabled", false).text("Comment");
              $("#postRep").val("");
              $("#commentModal").modal("hide");
              $(".modal-backdrop").removeClass("show").addClass("hide");
              getComments(slug, activeUser);
              updatePostComment(slug);
            })
            .catch(function (error) {
              alert(error);
              $("#comment-btn").attr("disabled", false).text("Comment");
              $("#postRep").val("");
            });
        });
      }
    );
  });

  if (media_file) {
    reader.readAsDataURL(media_file);
  }
}

function sendNotification(postOwner, msg) {
  if (postOwner !== activeUser.uid) {
    firebase
      .firestore()
      .collection("fcmTokens")
      .doc(postOwner)
      .get()
      .then((snap) => {
        let data = snap.data();
        console.log(data);
        if (data !== undefined) {
          $.ajax({
            url: "https://fcm.googleapis.com/fcm/send",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "key=AAAAm2HMEIs:APA91bGjCL3TaDfNxGJQ1E61XPQurXGArpEKCyFRHjHoKWG1Ey1eoL9HP3NTv_Y665LyrSAzgutg_XVzq9Cw4ndTIUmONPpkJSjSHHkD-sGoeB8-6yqjBB7sVMyYlB-TbDcwfx9xHFXM",
            },
            data: JSON.stringify({
              to: data.token_id,
              data: {
                message: msg,
                icon: "/public/imgs/Logo.png",
              },
            }),
            success: function (response) {
              console.log(response);
            },
            error: function (xhr, status, error) {
              console.log(xhr.error);
            },
          });
        }
      });
  }
}

function sendNotif(notifyData) {
  let notification = {
    ...notifyData,
  };
  if (notifyData.sendTo !== activeUser.uid) {
    firebase.database().ref("notifications").push(notification);
  }
}