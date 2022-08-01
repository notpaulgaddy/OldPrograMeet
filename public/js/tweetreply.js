let paramsString = window.location.search;
let qParams = new URLSearchParams(paramsString);
let postkey = qParams.get("post");
let commkey = qParams.get("comment");
let repKey=qParams.get("reply");
let rp=qParams.get("rp");
let activeUser = null;
let tweet = null;
let tTime = new Date().toString();
let replies = [];
var storageRef = firebase.storage();
var docRef = firebase.firestore();
let file_type = "";
let media_file = null;
let media_url = "";
let media_type=""
let post_with_file=false;
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
        document.getElementById("leftName").innerHTML=fln;
        activeUser = {
          ...user,
          ...doc.data(),
          profilePic: downloadURL,
        };

        

        if(repKey!==null){
    
    fetchReply()
    fetchReplies2()

}else{
getTweet(postkey, commkey);
}
          
      }
    });
});

function getTweet(postkey, key) {
  firebase
    .firestore()
    .collection("comments")
    .doc(postkey)
    .collection("commentList")
    .doc(key)
    .get()
    .then((reply) => {
      tweet = reply.data();
      displayTweet();
    });
}
async function fetchUser(uid) {
  return await docRef.collection("userInfo").doc(uid).get();
}
async function displayTweet() {
   let usr=await fetchUser(activeUser.uid);

   var sinceMin = Math.round((tweet.time - tTime) / 60000);
   var sinceMin = Math.round((tweet.time - tTime) / 60000);
   if (sinceMin == 0) {
     var sinceSec = Math.round((tweet.time - tTime) / 1000);
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
  ).innerHTML += `<div class="profile-box profile-box-two profile-box-three custom-profile-box-three">
  <div class="d-flex align-items-center justify-content-between">
      <div class="profile-second-content position-relative flex-direction d-flex align-items-start">
          <a class="three-dot dropdown-toggle" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" href="#"><img src="img/three-dot.png" alt=""></a>
          <img class="man-two" id="${tweet.uid}" src="${
    tweet.profilePic
  }" alt="">
          <div>
          <h4 class="bryson-text">${tweet.firstLast} <span>@${
    tweet.postOwner.username
  }</span> </h4>      
          </div>
          <div class="dropdown-menu dropdown-menu-right" >
                <a style="color: #5B93FF;background: rgba(91, 147, 255, 0.19);" class="dropdown-item" href="#">Edit</a>
                <a style="background: rgba(231, 29, 54, 0.15);color: #E71D36;" class="dropdown-item mt_5" href="#">Delete</a>
                <a style="background: rgba(91, 147, 255, 0.15);color: #5B93FF;" class="dropdown-item mt_5" href="#">Activate</a>
            </div>
      </div>
  </div>
  <div class="profile-second-content">
      <h3 class="mt_20">${tweet.Post}</h3>
      <h3 class="mt_10">${since}</h3>

                   ${
               tweet.post_type==='with_media' && tweet.file_type==='image' ?
               `<img src="${tweet.src}" class="album-img img-fluid mt_10" alt="">`
               :
               ''
             }


             ${
               tweet.post_type==='with_media' && tweet.file_type==='vid' ?
               `
               <video style="width:100%"  height="240" controls>
                <source src="${tweet.src}" type="${tweet.media_type}">
              Your browser does not support the video tag.
              </video>
               
               
               `
               :
               ''
             }
             

  </div>
</div>
<div class="like-comment d-flex align-items-center justify-content-around">
  <p> <span id="commCount">${ countReplies()}</span><span>Comments</span></p>
  <p>${tweet.likes?.length || 0} <span>Likes</span></p>

</div>
<div class="like-comment like-comment-two d-flex align-items-center justify-content-around">
  <a type="button" data-toggle="modal" data-target="#commentModal"><img style="width:20px;height:20px;" src="public/img/imoji-four.png"  id="myModal"
  tabindex="-1"
  role="dialog"
  aria-labelledby="exampleModalLabel"
  aria-hidden="true"  alt=""></a>
  <a><img style="width:20px;height:20px;" src="public/img/imoji-three.png" onclick="likeComment('${commkey}','${tweet.uid}','${usr.data().username}')" id="likeBtn-${commkey}" alt=""></a> <!-- FIX THIS LATER, REPLY TO MAIN COMMENT ONLY -->
</div>
<div class="p-3">
<div class="form-group">
         
                </div>
</div>
  `;
  fetchReplies()
}

async function likeComment(ky,postOwner,username){
     let usrData=await fetchUser(activeUser.uid)
    firebase.firestore()
    .collection("comments")
    .doc(postkey)
    .collection("commentList")
    .doc(ky)
    .get().then((data)=>{
      let dt = data.data();
       if(dt.likes&&dt.likes.includes(activeUser.uid)){

         alert('Already Liked')
       }else{
         let likesArr=[];
  if(dt.likes){
   likesArr=[...dt.likes]
  }
  likesArr.push(activeUser.uid)
    firebase
    .firestore()
    .collection("comments")
    .doc(postkey)
    .collection("commentList")
    .doc(ky)
    .update({
      likes:likesArr
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
              dateTime: new Date(),
              status: "unread",
              notifType: "like",
            };
            sendNotif(notifyData);
        sendNotification(postOwner,`${username} liked your comment`)
      alert('liked')
    })
       }
    })
}

async function getPostOwner(postId){
  let  post=  await firebase
    .firestore()
    .collection("Posts")
    .doc("allPosts")
    .collection("posts")
    .doc(postId)
    .get()  
  return {
    ...post.data()
  }
}

$('#saveButton').on('click',async function(){
  if(repKey){
     addReply2(repKey)
  }else{
  await addReply(commkey)
  }
})

async function addReply(key) {
  if ($("#postRep").val() !== "") {
    $("#saveButton").attr("disabled", true).text("posting...");
      let commentObj = {
      Post: $("#postRep").val(),
      commentId: key,
       postOwner: tweet.postOwner,
      uid: activeUser.uid,
      profilePic: activeUser.profilePic,
      trackId:'none',
      firstLast: activeUser.fln,
      username: activeUser.username,
      time: new  Date(),
      timestamp: Date.now(),
      deviceAgent:theAgent,
    };
  
 if(!post_with_file){
    firebase
      .firestore()
      .collection("replies")
      .doc(commkey)
      .collection("allReplies")
      .add(commentObj)
      .then(() => {
        $("#comment-btn").attr("disabled", false).text("Comment");
        $("#postRep").val("");
         $('#commentModal').modal('hide');
         $('.modal-backdrop').removeClass('show').addClass('hide')

           let notifyData={
              sendTo:tweet.uid,
              sendFrom:activeUser.uid,
              msg:`${activeUser.username} added a comment  to your post`,
              name:activeUser.fln,
              email:activeUser.email,
              photo: activeUser.downloadURL,
              dateTime: new Date(),
              status:'unread',
              notifType: "comment",
            }
          
            sendNotif(notifyData)
        
        sendNotification(tweet.uid,`${activeUser.username} commented your post`)
        fetchReplies();
      // window.location.reload()
      })
      .catch(function (error) {
         console.log(error);
        $("#comment-btn").attr("disabled", false).text("Comment");
        $("#postRep").val("");
      });
    }else{
      doUpload(commentObj)
    }

  } else {
    alert("You can't post empty reply");
  }

}

function fetchReplies() {

$('#allReplies').empty()
  firebase
    .firestore()
    .collection("replies")
    .doc(commkey)
    .collection("allReplies")

    .orderBy("timestamp", "desc")
    .get()
    .then((replies) => {
        let data=replies.docs;
        
        data.forEach((doc)=>{
            console.log(doc.data());
            if(doc.data().trackId==='none'){
              
            displayReplies(doc.data(),doc.id)
            }else{
                console.log('@');
            }
        })
    });
}


function countReplies(){
  firebase
  .firestore()
  .collection('replies')
  .doc(commkey)
  .collection('allReplies')
  .where("trackId", "==", 'none')
  .get()
  .then((replies)=>{
    let data = replies.docs;
    console.log(data);
    $('#commCount').text(data.length)
    

  })
  .catch((err)=>{
    console.log(err);
  })
}

function countReplies2(ky){
  
  firebase
  .firestore()
  .collection('replies')
  .doc(commkey)
  .collection('allReplies')
   .where("trackId", "==", ky)
  .get()
  .then((replies)=>{
    let data = replies.docs;
    $('#commCount2-'+ky).text(data.length)
  
  })
  .catch((err)=>{
    console.log(err);
  })
}

function countReplies3(ky){
  
  firebase
  .firestore()
  .collection('replies')
  .doc(commkey)
  .collection('allReplies')
   .where("trackId", "==", ky)
  .get()
  .then((replies)=>{
    let data = replies.docs;
   
    $('#rep-'+ky).text(data.length)
  })
  .catch((err)=>{
    console.log(err);
  })
}



async function displayReplies(reply,repKey){
  let usr=await fetchUser(activeUser.uid)
   let els = document.getElementById("allReplies");
  els.innerHTML += `<div  style="cursor:pointer"  class="profile-box replybx profile-box-two mb-5 profile-box-three profile-box-custom">
  <div class="d-flex align-items-center justify-content-between">
      <div class="profile-second-content position-relative flex-direction d-flex align-items-start" id="${reply.uid}">
          <a class="three-dot dropdown-toggle" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" href="#"><img src="img/three-dot.png" alt=""></a>
          <img src="${reply.profilePic} alt="">
          <div class="bryson-main">
              <h4 class="bryson-text">${reply.firstLast} <span>@${reply.username}</span> ${reply.time}</h4>
              <h5 class="reply-text mt_10">Replying to @${reply.username}</h5>
              <div class=" mt_10">
                  <!-- <img src="img/album-img.png" class="album-img img-fluid mt_10" alt=""> -->
                  <h5 class="mt_20">${reply.Post} </h5>
                                  ${
               reply.post_type==='with_media' && reply.file_type==='image' ?
               `<img src="${reply.src}" class="album-img img-fluid mt_10" alt="">`
               :
               ''
             }


             ${
               reply.post_type==='with_media' && reply.file_type==='vid' ?
               `
               <video style="width:100%"  height="240" controls>
                <source src="${reply.src}" type="${reply.media_type}">
              Your browser does not support the video tag.
              </video>
               
               
               `
               :
               ''
             }
                  <div class="like-box-two-main d-flex align-items-center justify-content-center">
                      <a style="font-size:13px" class="like-box like-box-two mt_10 like-box-one" type="button" ><img style="max-height:13px;max-width:13px;" src="public/img/imoji-four.png" id="myModal"
                      tabindex="-1"
                      role="dialog"
                      aria-labelledby="exampleModalLabel"
                      aria-hidden="true" onclick="naviToReplies('${postkey}','${repKey}')" alt="">
                      ${countReplies2(repKey) || ''}<span id="commCount2-${repKey}"></span>
                      </a>
                      <a onclick="likeCommentRep('${repKey}','${reply.uid}','${usr.data().username}')"  style="font-size:13px" class="like-box mt_10 like-box-two">
                      <img style="max-height:13px;max-width:13px;" src="public/img/imoji-three.png" alt="">
                      ${reply.likes?.length||0}
                      </a>
                  </div>
              </div>
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

}

async function likeCommentRep(ky,postOwner,username){
     let usrData=await fetchUser(activeUser.uid)
    firebase.firestore()
    .collection("replies")
    .doc(commkey)
    .collection("allReplies")
    .doc(ky)
    .get().then((data)=>{
      let dt = data.data();
       if(dt.likes&&dt.likes.includes(activeUser.uid)){
         alert('Already Liked')
       }else{
       let likesArr=[]
        if(dt.likes){
         likesArr=[...dt.likes]
        }
  likesArr.push(activeUser.uid)
    firebase
    .firestore()
    .collection("replies")
    .doc(commkey)
    .collection("allReplies")
    .doc(ky)
    .update({
      likes:likesArr
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
              dateTime: new Date(),
              status: "unread",
              notifType: "like",
            };
            sendNotif(notifyData);
               sendNotification(postOwner,`${username} liked your comment`)
      alert('Comment liked')
    })
       }
    })
    
}




function fetchReply(){
  firebase
    .firestore()
    .collection("replies")
    .doc(commkey)
    .collection("allReplies")
    .doc(repKey)
    .get()
    .then((reply) => {
        console.log(reply.data());
        
     tweet = reply.data();
     
      displayReply();
     
    });
}

async function displayReply(){
   let usr=await fetchUser(activeUser.uid)
      document.getElementById(
    "list_div"
  ).innerHTML += `<div class="profile-box profile-box-two profile-box-three custom-profile-box-three">
  <div class="d-flex align-items-center justify-content-between">
      <div class="profile-second-content position-relative flex-direction d-flex align-items-start">
          <a class="three-dot dropdown-toggle" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" href="#"><img src="img/three-dot.png" alt=""></a>
          <img class="man-two" id="${tweet.uid}" src="${
    tweet.profilePic
  }" alt="">
          <div>
          <h4 class="bryson-text">${tweet.firstLast} <span>@${
    tweet.username
  }</span> </h4>      
          </div>
          <div class="dropdown-menu dropdown-menu-right" >
                <a style="color: #5B93FF;background: rgba(91, 147, 255, 0.19);" class="dropdown-item" href="#">Edit</a>
                <a style="background: rgba(231, 29, 54, 0.15);color: #E71D36;" class="dropdown-item mt_5" href="#">Delete</a>
                <a style="background: rgba(91, 147, 255, 0.15);color: #5B93FF;" class="dropdown-item mt_5" href="#">Activate</a>
            </div>
      </div>
  </div>
  <div class="profile-second-content">
      <h3 class="mt_20">${tweet.Post}</h3>
      <h3 class="mt_10">${tweet.time}</h3>

                              ${
               tweet.post_type==='with_media' && tweet.file_type==='image' ?
               `<img src="${tweet.src}" class="album-img img-fluid mt_10" alt="">`
               :
               ''
             }


             ${
               tweet.post_type==='with_media' && tweet.file_type==='vid' ?
               `
               <video style="width:100%"  height="240" controls>
                <source src="${tweet.src}" type="${tweet.media_type}">
              Your browser does not support the video tag.
              </video>
               
               
               `
               :
               ''
             }
  </div>
</div>
<div class="like-comment d-flex align-items-center justify-content-around">
  <p><span id="rep-${repKey}"></span>${ countReplies3(repKey) || ''}<span>Comments</span></p>
    <p>${tweet.likes?.length || 0} <span>Likes</span></p>
</div>
<div class="like-comment like-comment-two d-flex align-items-center justify-content-around">
  <a type="button" data-toggle="modal" data-target="#commentModal"><img style="width:20px;height:20px;" src="public/img/imoji-four.png"  id="myModal"
  tabindex="-1"
  role="dialog"
  aria-labelledby="exampleModalLabel"
  aria-hidden="true"  alt=""></a>
  <a><img style="width:20px;height:20px;cursor:pointer;" src="public/img/imoji-three.png" onclick="likeCommentRep('${repKey}','${tweet.uid}','${usr.data().username}')"  id="likeBtn-${commkey}" alt=""></a> <!-- FIX THIS LATER, REPLY TO MAIN COMMENT ONLY -->
</div>
<div class="p-3">
<div class="form-group">
               
                </div>
</div>
  `;
}


async function addReply2(key) {
  if ($("#postRep").val() !== "") {
    $("#saveButton").attr("disabled", true).text("posting...");
    let commentObj = {
      Post: $("#postRep").val(),
      trackId: repKey,
      uid: activeUser.uid,
      profilePic: activeUser.profilePic,
      firstLast: activeUser.fln,
      username: activeUser.username,
      time: new Date(),
      timestamp: Date.now(),
    };

    
     if(!post_with_file){
    firebase
      .firestore()
      .collection("replies")
      .doc(commkey)
      .collection("allReplies")
      .add(commentObj)
      .then(() => {
        let notifyData={
              sendTo:tweet.uid,
              sendFrom:activeUser.uid,
              msg:`${activeUser.username} added a comment  to your post`,
              name:activeUser.fln,
              email:activeUser.email,
              photo: activeUser.downloadURL,
              dateTime: new Date(),
              status:'unread',
              notifType: "comment",
            }
          
            sendNotif(notifyData)
         sendNotification(tweet.uid,`${activeUser.username} commented your post`)
        $("#comment-btn").attr("disabled", false).text("Comment");
        $("#postRep").val("");
         $('#commentModal').modal('hide');
         $('.modal-backdrop').removeClass('show').addClass('hide')
        fetchReplies2();
      })
      .catch(function (error) {
        alert(error);
        $("#comment-btn").attr("disabled", false).text("Comment");
        $("#postRep2").val("");
      });
      }else{
  doUpload2(commentObj,ownr)
}
  } else {
    alert("You can't post empty reply");
  }
}

function fetchReplies2() {
  firebase
    .firestore()
    .collection("replies")
    .doc(commkey)
    .collection("allReplies")
    .orderBy("timestamp", "desc")
    .get()
    .then((replies) => {
        let data=replies.docs;
        data.forEach((doc)=>{
            if(doc.data().trackId && doc.data().trackId===repKey){
            displayReplies(doc.data(),doc.id)
            }
        })
    });
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
    let ref = storageRef.ref(`replies/${file_type}/${activeUser.uid}/${filename}`).put(media_file,metadata);
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
      .collection("replies")
      .doc(commkey)
      .collection("allReplies")
      .add(postData)
      .then(() => {
        $("#comment-btn").attr("disabled", false).text("Comment");
        $("#postRep").val("");
         $('#commentModal').modal('hide');
         $('.modal-backdrop').removeClass('show').addClass('hide')
         let notifyData={
              sendTo:tweet.uid,
              sendFrom:activeUser.uid,
              msg:`${activeUser.username} added a comment  to your post`,
              name:activeUser.fln,
              email:activeUser.email,
              photo: activeUser.downloadURL,
              dateTime: new Date(),
              status:'unread',
              notifType: "comment",
            }  
         sendNotif(notifyData)
         sendNotification(tweet.uid,`${activeUser.username} commented your post`)
        fetchReplies();
        window.location.reload()
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

async function doUpload2(postData,ownr) {

  var reader = new FileReader();
  reader.addEventListener("load", function () {

    var metadata = {
      contentType: media_file.type,
      size: media_file.size,
      uid:activeUser.uid
    };
    let filename=Date.now()+'-'+media_file.name
    let ref = storageRef.ref(`replies/${file_type}/${activeUser.uid}/${filename}`).put(media_file,metadata);
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
      .collection("replies")
      .doc(commkey)
      .collection("allReplies")
      .add(postData)
      .then(async() => {
        $("#comment-btn").attr("disabled", false).text("Comment");
        $("#postRep").val("");
         $('#commentModal').modal('hide');
         $('.modal-backdrop').removeClass('show').addClass('hide')
         let notifyData={
              sendTo:tweet.uid,
              sendFrom:activeUser.uid,
              msg:`${activeUser.username} added a comment  to your post`,
              name:activeUser.fln,
              email:activeUser.email,
              photo: activeUser.downloadURL,
              dateTime: new Date(),
              status:'unread',
              notifType: "comment",
            }
          
            sendNotif(notifyData)
         
          sendNotification(tweet.uid,`${activeUser.username} commented your post`)
        fetchReplies2();
      })
      .catch(function (error) {
        alert(error);
        $("#comment-btn").attr("disabled", false).text("Comment");
        $("#postRep2").val("");
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


function naviToReplies(postkey,replyPostKey,postky){
 
       window.location = `/tweet-reply.html?post=${postkey}&&comment=${commkey}&&reply=${replyPostKey}`;

}

function sendNotif(notifyData){
  let notification ={
    ...notifyData
  }
  if(notifyData.sendTo!==activeUser.uid){
firebase.database().ref("notifications").push(notification);
  }
}