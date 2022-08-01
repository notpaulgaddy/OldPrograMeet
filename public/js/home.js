var auth = firebase.auth();
var docRef = firebase.firestore();
var db = firebase.database();
const saveButton = document.getElementById("saveButton");
const container = document.getElementById("container");
const textToSave = document.getElementById("postText").value;
const postsDiv = document.querySelector("#postsDiv");
var chatKey = "";
var time = new Date().toString();
var chatKey = "";
var friend_id = "";
var chatKey = "";
let latestDoc = null;
let likeArray = [];
let postsCount = 0;
let allPosts = [];
let usrPostLikeIds = [];
let isLiked = false;
let latestPostTimestamp = null;
let activeUser = null;
let usersLike = [];
let dataLimit = 3;
let totLikes = 0;
let commLength = 0;
var storageRef = firebase.storage();
let file_type = "";
let media_file = null;
let media_url = "";
let media_type=""
let post_with_file=false;
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
  theAgent = "PrograMeet for mobile";
}else{
  theAgent = "PrograMeet for Web";
}

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
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
        }

        const messaging = firebase.messaging();
            Notification.requestPermission().then((permission) => {
                    if (permission === "granted") {
        messaging
          .getToken({
            vapidKey:
              "BFZyQDn-Kb1EpAkCBOIJ7t0FRg33mTjAgMcToqP3KWUn6jIb4Qp3sXaurxNOqG7enhW14-OZ5M2fcBN2VBXA2lE",
          })
          .then((currentToken) => {
            if (currentToken) {    
              firebase.firestore().collection("fcmTokens").doc(user.uid).set({
                userId: activeUser.uid,
                token_id: currentToken,
              });
            }
          })
          .catch((err) => {
            console.log("An error occurred while retrieving token. ", err);
          });
      }
            })
      });
    getPosts(user);
    activeUser = user;
    getRandomUsers(user);
  }
});

$("#saveButton").on("click", function () {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      let postObj = {
        Post: $("#postText").val(),
        firstLast: null,
        profilePic: null,
        time:time,
        uid: user.uid,
        username: null,
        deviceAgent:null,
      };
      if (postObj.Post !== "") {
        $(".saveButton").prop("disabled", true).text("posting..");
        fetchUser(user.uid).then((userInfo) => {
          if (userInfo.exists) {
            let info = userInfo.data();
            postObj.firstLast = info.fln;
            postObj.profilePic = info.downloadURL;
            postObj.username = info.username;
            postObj.timestamp = Date.now();
            postObj.time = time;
            postObj.deviceAgent = theAgent;

            if(!post_with_file){
            firebase
              .firestore()
              .collection("Posts")
              .doc("allPosts")
              .collection("posts")
              .add(postObj)
              .then((post) => {
                $("#postText").val("");
                $(".saveButton").prop("disabled", false).text("Post");
                $("#myModal").modal("hide");
                window.location.reload()
                alert("Post added");
                //  getPosts(user);
              })
              .catch((error) => {
                $("#postText").val("");
                $(".saveButton").prop("disabled", false).text("Post");
                alert(error);
                $("#myModal").modal("hide");
              });
            }else{
              doUpload(postObj)
            }

          }
        });
      }
    }
  });
});

let postArr = [];
async function getPosts(user) {
  firebase
    .firestore()
    .collection("Posts")
    .doc("allPosts")
    .collection("posts")
    .orderBy("timestamp","desc")
    .limit(dataLimit)
    .get()
    .then((data) => {
      if (!data.empty) {
        let posts = data.docs;
        latestDoc = data.docs[data.docs.length - 1];
        latestDocId = latestDoc.id;
        posts.forEach((doc, i) => {
          displayPosts(doc.data(), doc.id, user);
        });
      }
    });

  displaySpinner("hide");
}

async function getNextPosts(doc) {
  if (latestDoc) {
    $("#loadmore-area").html(
      `<i class="fa fa-spinner fa-spin fa-2x" aria-hidden="true"></i>`
    );
    let st = await firebase
      .firestore()
      .collection("Posts")
      .doc("allPosts")
      .collection("posts")
      .orderBy("timestamp", "desc")
      .limit(dataLimit)
      .startAfter(doc)
      .get();
    let data = await st;

    let postLists = data.docs;
    latestDoc = data.docs[data.docs.length - 1];
    if (latestDoc) {
      latestDocId = latestDoc.id;
      postLists.forEach((doc) => {
        displayPosts(doc.data(), doc.id, activeUser);
      });
    } else {
      $("#loadmore-area").html(``);
    }
  } else {
    $("#end-msg").html(`<div class="alert alert-info" role="alert">
  <strong>No more data</strong>
</div>`);
  }

  // if (postArr.length == 3) {
  //   var refDb = firebase.database();
  //   refDb
  //     .ref("Posts")
  //     .orderByChild("timestamp")
  //     .endAt(_timestamp)
  //     .limitToLast(3)
  //     .once("value", function (posts) {
  //       posts.forEach((data) => {
  //         let post = data.val();
  //         post.ky = data.key;
  //         let isadded = postArr.some((pt) => pt.ky == data.key);
  //         if (postArr.length === 3) {
  //           postArr = [];
  //         }

  //         postArr.push(post);
  //       });
  //       console.log(postArr);
  //       postArr.reverse().forEach((post) => {
  //         console.log(post);
  //         displayPosts(post, post.ky, activeUser); //display Posts
  //       });
  //       latestPostTimestamp = postArr[postArr.length - 1].timestamp;
  //       postArr = [];
  //     });
  // } else {
  //   console.log(postArr.length);
  //   for (let j = 0; j < postArr.length; j++) {
  //     const item = postArr[j];
  //     console.log(item);
  //     displayPosts(item, item.ky, activeUser); //display Posts
  //   }
  // }
}

async function displayPosts(post, Key, userData) {
  if (postsDiv) {
    let userDoc = await fetchUser(post.uid); //get user documents
    let user = await userDoc.data();
    let owner=await fetchUser(userData.uid)
    //var tTime = new Date(post.time)
    var tTime = new Date(post.time);
    var cTime = new Date();
    var sinceMin=Math.round((cTime-tTime)/60000);
    if(sinceMin==0){
        var sinceSec=Math.round((cTime-tTime)/1000);
        if(sinceSec<10)
          var since='less than 10 seconds ago';
        else if(sinceSec<20)
          var since='less than 20 seconds ago';
        else
          var since='half a minute ago';
    }else if(sinceMin==1){
        var sinceSec=Math.round((cTime-tTime)/1000);
        if(sinceSec==30)
          var since='half a minute ago';
        else if(sinceSec<60)
          var since='less than a minute ago';
        else
          var since='1 minute ago';
    }
    else if(sinceMin<45)
        var since=sinceMin+' minutes ago';
    else if(sinceMin>44&&sinceMin<60)
        var since='about 1 hour ago';
    else if(sinceMin<1440){
        var sinceHr=Math.round(sinceMin/60);
    if(sinceHr==1)
      var since='about 1 hour ago';
    else
      var since='about '+sinceHr+' hours ago';
    }
    else if(sinceMin>1439&&sinceMin<2880)
        var since='1 day ago';
    else
    {
        var sinceDay=Math.round(sinceMin/1440);
        var since=sinceDay+' days ago';
    }

    postKey = Key;
    postsDiv.innerHTML += `
    <div class="profile-box profile-box-two" id="user-pst-${Key}" style="cursor:pointer">
    <div class="d-flex align-items-center justify-content-between">
      <div   class="profile-second-content position-relative flex-direction d-flex align-items-start">
      <a class="three-dot" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><img src="public/img/three-dot.png" alt=""></a>
         <img src="${post.profilePic}" alt="">
         <div>
         <div onclick="nav('${postKey}')">
            <h3 id="name">${user.fln} @${user.username}</h3>
            <h5 id="dateTimeSince">${since}</h5>
            <h3 class="mt_10 postText" id="${postKey}"  style="font-weight:normal">${post.Post}</h3>

             ${
               post.post_type==='with_media' && post.file_type==='image' ?
               `<img src="${post.src}" class="album-img img-fluid mt_10" alt="">`
               :
               ''
             }


             ${
               post.post_type==='with_media' && post.file_type==='vid' ?
               `
               <video style="width:100%"  height="240" controls>
                <source src="${post.src}" type="${post.media_type}">
              Your browser does not support the video tag.
              </video>
               
               
               `
               :
               ''
             }
             </div>

            
            <div class="d-flex align-items-center">
            <a class="like-box mt_10" style="cursor:pointer"><img src="public/img/comment-icon.png" onclick="nav('${postKey}')" alt="">${
              post.comments || 0
            }</a>
               <a class="like-box mt_10 like-box-one" style="cursor:pointer"><img src="public/img/imoji-three.png" id="likeCheck" onclick="like('${postKey}','${
      userData.uid
    }','${post.uid}','${owner.data().username}')" id="likeBtn-${postKey}" alt="">${post.likes || 0}</a>
               
            </div>
         <h5 class="mt_10" id="${postKey}">${post.deviceAgent} </h5>
         </div>
         <div class="dropdown-menu" >
            <a style="color: #5B93FF;background: rgba(91, 147, 255, 0.19);" class="dropdown-item" id="editButton">Edit</a>
            <a style="background: rgba(231, 29, 54, 0.15);color: #5B93FF;" class="dropdown-item mt_5" id="deleteButton">Delete</a>
            <a style="background: rgba(91, 147, 255, 0.15);color:#E71D36;" class="dropdown-item mt_5 id="reportButton">Report</a>
         </div>
      </div>
    </div>
    </div>
    `;
    await getLikes(postKey);
    checkLiked(userData, document.getElementById(`heart-${Key}`), Key);

    if (Key === latestDocId) {
      initWayPoint();
    }
  }
  document.getElementById("editButton").onclick = function(){

  }
  document.getElementById("reportButton").onclick = function(){
    firebase.firestore().collection("Reports").doc(Key).set({
      nameOfPoster: user.fln,
      flaggedPost: post.Post
    })
  }
  document.getElementById("deleteButton").onclick = function(){

  }
}

const initWayPoint = () => {
  new Waypoint({
    element: document.getElementById("user-pst-" + latestDocId),
    handler: function (direction) {
      getNextPosts(latestDoc);
    },
    offset: "100%",
  });
};
async function fetchUser(uid) {
  return await docRef.collection("userInfo").doc(uid).get();
}
async function commentsSize(ky) {
  let st = await firebase
    .firestore()
    .collection("comments")
    .doc(ky)
    .collection("commentList")
    .get();
  let data = await st;
  console.log(data);
  // $("#comment-" + ky).html(data.size);
}

function displaySpinner(classname) {
  $("#spinner").addClass(classname);
}

function checkLiked(user, like, ky) {
  let isLiked = false;
  firebase
    .firestore()
    .collection("likes")
    .doc(ky)
    .collection("allLikes")
    .get()
    .then((dt) => {
      let likes = dt.docs;
      likes.forEach((dt) => {
        isLiked = true;
        if (like) {
          like.style.color = "#fe2712";
        }
      });
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
        console.log(isLiked);
        if (!isLiked) {
          usersLike.push(like.data());
          return false;
        }
        return true;
      });
    });
}

async function like(ky, uid,postOwner,username) {
  console.log(ky);
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
    
    sendNotification(postOwner,`${username} liked your post`)

    let usrData=await fetchUser(activeUser.uid)
   
    let notifyData={
      sendTo:postOwner,
      sendFrom:activeUser.uid,
      msg:`${username} liked your post`,
      name:usrData.data().fln,
      email:activeUser.email,
      photo: usrData.data().downloadURL,
      dateTime: new Date().toLocaleString(),
      status:'unread',
      notifType: "like",
    }
    sendNotif(notifyData)
    
  } else {
    let data = likes.docs;
    data.forEach((like) => {
      if (!alllikes.includes(like.data().uid)) alllikes.push(like.data().uid);
    });
    if (alllikes.includes(uid)) {
       document.getElementById("likeCheck").src="/public/img/likedPost.png";
      //document.getElementById("likeCheck").style.fill = "blue";
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
      sendNotification(postOwner,`${username} liked your post`)
          let usrData=await fetchUser(activeUser.uid)
  
    let notifyData={
      sendTo:postOwner,
      sendFrom:activeUser.uid,
      msg:`${username} liked your post`,
      name:usrData.data().fln,
      email:activeUser.email,
      photo: usrData.data().downloadURL,
      dateTime: new Date().toLocaleString(),
      status:'unread',
      notifType: "like",
    }
    sendNotif(notifyData)
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
let friendsIds = [];
let newIds = [];
let newFriends = [];
let newFriendsTwo = [];
let randomFriends = [];
let potentialFriends = [];

function getRandomUsers(user) {
  var ref = firebase.database().ref("friend_list");
  ref.on("value", function (friends) {
    friends.forEach((fr) => {
      let friend = fr.val();
      if (friend.userId === user.uid) {
        friendsIds.push(friend.friendId);
      }
    });

    var ref2 = firebase.database().ref("users");
    ref2.once("value", function (users) {
      users.forEach(function (snap) {
        if (
          !friendsIds.includes(snap.val().userId) &&
          snap.val().userId &&
          activeUser.uid !== snap.val().userId
        ) {
          potentialFriends.push(snap.val());
        } else {
        }
      });
      randomFriends = [...shuffle(potentialFriends)];
      randomFriends.forEach((us, i) => {
        if (i < 5) {
          document.getElementById("theSuggestions").innerHTML += `
                        <div class="profile">
                          <img class="profile-pic rounded" id="profile-pic" style="width:70px;height:70px;border-radius: 50%;" src=${us.photoURL}></img>
                          <div class="profile-info">
                          <span class="display-name">${us.name}</span>
                          <span class="username">@${us.username}</span>
                          </div>
                        </div>
                  `;
        }
      });
    });
  });
  return friendsIds;
}


function nav(postId) {
  window.location = "reply.html" + "?=" + postId;
}

function shuffle(array) {
  // using lodash helper library
  return _.shuffle(array);
}


$("#attach_img").on("click", function () {
  file_type = $(this).data("type");
  post_with_file=true
  $("#media-input").trigger("click");
});

$("#attach_vid").on("click", function () {
  post_with_file=true
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
  }else if(file_type==='vid'){
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
      uid:activeUser.uid
    };
    let filename=Date.now()+'-'+media_file.name
    let ref = storageRef.ref(`posts/${file_type}/${activeUser.uid}/${filename}`).put(media_file,metadata);
     $('.progress').show()
    ref.on(
      "state_changed",
      (snapshot) => {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
     
       
        $('#progressbar').css('width',progress+'%')

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
      },
      () => {
        ref.snapshot.ref.getDownloadURL().then((downloadURL) => {
          console.log("File available at", downloadURL);
            postData.post_type="with_media",
            postData.file_type=file_type
            postData.src=downloadURL
            postData.media_type=media_file.type

              firebase
              .firestore()
              .collection("Posts")
              .doc("allPosts")
              .collection("posts")
              .add(postData)
              .then((post) => {
                $("#postText").val("");
                $(".saveButton").prop("disabled", false).text("Post");
                $("#myModal").modal("hide");
                getPosts(activeUser);
                alert("Post added");
                //  getPosts(user);
              })
              .catch((error) => {
                $("#postText").val("");
                $(".saveButton").prop("disabled", false).text("Post");
                console.log(error);
                $("#myModal").modal("hide");
              });

        });
      }
    );
  });

  if (media_file) {
    reader.readAsDataURL(media_file);
  }
}

function sendNotification(postOwner,msg){
   if(postOwner!==activeUser.uid){
    
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
                        icon: "/logo.png",
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
function sendNotif(notifyData){
  let notification ={
    ...notifyData
  }
  if(notifyData.sendTo!==activeUser.uid){
firebase.database().ref("notifications").push(notification);
  }
}

function logout() {
  firebase.auth().signOut();
}