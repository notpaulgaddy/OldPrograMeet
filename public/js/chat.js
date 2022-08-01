$(document).ready(function () {
  const friendsRef = firebase.database().ref("friend_lists");
  const usersRef = firebase.firestore().collection("userInfo");
  const chatMsgRef = firebase.database().ref("chatMessages");
  let frndsOutlet = document.querySelector("#frnd-list");
  let latestMsgsOutlet = document.querySelector("#recent-chats");
  let recChatRef = firebase.database().ref("recentMsgs");
  let userIds = [];
  let selectedFriend = {
    id: null,
    name: "",
    img: null,
    chatKey: null,
  };
  let currentUser = null;
  firebase.auth().onAuthStateChanged((user) => {
    //get friends lists
    getFriends(user);
    currentUser = user;
    NotificationCount(user);
    const messaging = firebase.messaging();
    Notification.requestPermission().then((permission) => {
      console.log("Notification permission granted.");
      if (permission === "granted") {
        messaging
          .getToken({
            vapidKey:
              "BMO2kTuuPgSZFWofkQhV9VFrGYErhZDHBfzecQk10c_m3dH1d6crQLi7GRKBkK99m5kM5qmGoPUek0YTYk3w-rM",
          })
          .then((currentToken) => {
            if (currentToken) {
              console.log(currentToken);
              firebase.firestore().collection("fcmTokens").doc(user.uid).set({
                userId: currentUser.uid,
                token_id: currentToken,
              });
            }
          })
          .catch((err) => {
            console.log("An error occurred while retrieving token. ", err);
          });
      }
    });
  });

  getFriends = (user) => {
    friendsRef.child(user.uid).once("value", (snap) => {
      let friends = [];
      snap.forEach((friend) => {
        let _frnd = friend.val();
        _frnd.chatKey = friend.key;

        friends.push(_frnd);
      });
      displayFriends(friends, user);
    });
  };

  displayFriends = async (frnds, user) => {
    let lstIdx = frnds.length - 1;

    frnds.forEach((frnd, i) => {
      let fnId;
      if (frnd.userId === user.uid) {
        fnId = frnd.friendId;
      } else {
        fnId = frnd.userId;
      }
      getFriendDetails(fnId).then((usrData) => {
        if (usrData.fln !== undefined) {
          frndsOutlet.innerHTML += `
       <div id="friend_${fnId}_${frnd.chatKey}" class="friend-card mt-2 p-2 friend_${fnId} shadow-sm">
                    <div class="user-pic">
                     <img class="rounded-circle profile-pic" alt="avatar" src="${usrData?.downloadURL}"/>
                    </div>
                    <div class="usr-name">
                     <div class="s-name">
                        ${usrData?.fln}
                        </div>
                    </div>
                </div>
        `;
        }
        if (i === lstIdx) {
          initFrndsView();
        
          userIds.forEach((el) => {
            $("." + el).hide();
          });
        }
      });
    });
  };

  getFriendDetails = async (frndId) => {
    let user = await usersRef.doc(frndId).get();
    return user.data();
  };

  $('#back-btn').on('click',function(){
        $('.main-chat-area-wrap').hide()
    $('#recent-chats,#frnd-list,.frn-title').fadeIn()
  })

  initFrndsView = (frnIds) => {
    $(".friend-card").on("click", function () {
     var windowsize = $(window).width();
      //TODO: toggole friend list on mobile
      if(windowsize<=820){
    $('.main-chat-area-wrap').fadeIn()
    $('#recent-chats,#frnd-list,.frn-title').fadeOut()
      }
      let frndId = (selectedFriend.id = $(this).attr("id").split("_")[1]);
      selectedFriend.chatKey = $(this).attr("id").split("_")[2];
      let usrn = (selectedFriend.name = $(this)
        .find(".usr-name")
        .find(".s-name")
        .text()
        .trim());
      if (usrn === "You") {
        usrn = selectedFriend.name = $(this)
          .find(".usr-name")

          .find(".hidden-name")
          .text()
          .trim();
      }
      let img = $(this).find(".user-pic").html().trim();
      let imgSrc = (selectedFriend.img = $.parseHTML(img)[0].src);
      handleChatView(frndId, usrn, imgSrc);
    });
  };
  handleChatView = (id, name, img) => {
    $(".chat-area").fadeIn();
    $(".not-selected").hide();
    $("#friend-name").text(name);
    $(".usr-photo").attr("src", img);
    document.getElementById("chat-text-input").focus();
    loadPrevChats();
    firebase.database().ref("recentMsgs").child(selectedFriend.chatKey).update({
      read:1
    })
  };

  loadPrevChats = () => {
    var db = chatMsgRef.child(selectedFriend.chatKey);
    db.on("value", function (chats) {
      var messageDisplay = "";
      chats.forEach(function (data) {
        var chat = data.val();
        var dateTime = chat.dateTime.split(",");
        var msg = "";
        if (chat.msgType === "image") {
          msg = `<img src='${chat.msg}' class="img-fluid" />`;
        } else if (chat.msgType === "audio") {
          msg = `<audio controls>
                        <source src="${chat.msg}" type="video/webm" />
                    </audio>`;
        } else {
          msg = chat.msg;
        }
        var dateTime = chat.dateTime.split(",");
        var msg = "";
        if (chat.msgType === "image") {
          msg = `<img src='${chat.msg}' class="img-fluid" />`;
        } else if (chat.msgType === "audio") {
          msg = `<audio controls>
                        <source src="${chat.msg}" type="video/webm" />
                    </audio>`;
        } else {
          msg = chat.msg;
        }

        if (chat.receiverId === selectedFriend.id) {
          messageDisplay += `
           <div class="me mt-3">
            <div>
       ${msg}
       <div title="${dateTime}" class="time">
${dateTime}
      </div>
       </div>
      
    </div>
          `;
        } else {
          messageDisplay += `
        <div class="other mt-3">
            <div>
            ${msg}
            <div title="${dateTime}" class="time">
                    ${dateTime}
        </div>
    </div>
   </div>
         `;
        }
      });
      let el = document.querySelector("#msg-view");
      el.innerHTML = messageDisplay;
    });
    var newscrollHeight = $("#msg-view").prop("scrollHeight"); //Scroll height after the request

    $("#msg-view").animate(
      {
        scrollTop: newscrollHeight,
      },
      "smooth"
    );
  };
  $("#chat-text-input").on("keyup", function (e) {
    let message = $(this).val();
    if (message == "") {
      $("#audio").show();
      $("#send").hide();
    } else {
      $("#audio").hide();
      $("#send").show();
    }
  });

  $("#chat-text-input").on("keypress", function (e) {
    let message = $(this).val();
    if (e.which == 13) {
      if (message !== "") {
        SendMessage(message);
      }
    }
  });

  SendMessage = (msg) => {
    var chatMessage = {
      userId: currentUser.uid,
      msg: msg,
      msgType: "normal",
      dateTime: new Date().toLocaleString(),
      receiverId: selectedFriend.id,
      photo: "",
      friendName: selectedFriend.name,
      timestamp: Date.now(),
    };
    getFriendDetails(currentUser.uid).then((usrData) => {
      chatMessage.senderName = usrData.fln;
      chatMessage.photo = usrData.downloadURL;
      chatMsgRef
        .child(selectedFriend.chatKey)
        .push(chatMessage, function (error) {
          if (error) {
            alert("Error");
          } else {
            firebase
              .firestore()
              .collection("fcmTokens")
              .doc(selectedFriend.id)
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
                        message: chatMessage.msg,
                        icon: "/logo.png",
                      },
                    }),
                    success: function (response) {
                      console.log(response);
                      document.getElementById("chat-text-input").value = "";
                      document.getElementById("chat-text-input").focus();
                    },
                    error: function (xhr, status, error) {
                      console.log(xhr.error);
                    },
                  });
                }
              });

            addRecentMsg(
              selectedFriend.chatKey,
              chatMessage,
              selectedFriend.id
            );

            $("#chat-text-input").val("");
            loadPrevChats();
          }
        });
    });
  };
  let chunks = [];
  let recorder;
  var timeout;
  record = (control) => {
    let device = navigator.mediaDevices.getUserMedia({ audio: true });
    device.then((stream) => {
      if (recorder === undefined) {
        recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          chunks.push(e.data);
          if (recorder.state === "inactive") {
            let blob = new Blob(chunks, { type: "audio/webm" });
            var reader = new FileReader();
            reader.addEventListener(
              "load",
              function () {
                var chatMessage = {
                  userId: currentUser.uid,
                  msg: reader.result,
                  msgType: "audio",
                  dateTime: new Date().toLocaleString(),
                  receiverId: selectedFriend.id,
                  photo: "",
                  friendName: selectedFriend.name,
                  timestamp: Date.now(),
                };
                getFriendDetails(currentUser.uid).then((usrData) => {
                  chatMessage.senderName = usrData.fln;
                  chatMessage.photo = usrData.downloadURL;
                  firebase
                    .database()
                    .ref("chatMessages")
                    .child(selectedFriend.chatKey)
                    .push(chatMessage, function (error) {
                      if (error) alert(error);
                      else {
                        document.getElementById("chat-text-input").value = "";
                        document.getElementById("chat-text-input").focus();
                        addRecentMsg(
                          selectedFriend.chatKey,
                          chatMessage,
                          selectedFriend.id
                        );
                      }
                    });
                });
              },
              false
            );
            reader.readAsDataURL(blob);
          }
        };
        recorder.start();
        control.setAttribute("class", "fas fa-stop fa-2x");
      }
    });
    if (recorder !== undefined) {
      if (control.getAttribute("class").indexOf("stop") !== -1) {
        recorder.stop();
        control.setAttribute("class", "fas fa-microphone fa-2x");
      } else {
        chunks = [];
        recorder.start();
        control.setAttribute("class", "fas fa-stop fa-2x");
      }
    }
  };
  ChooseImage = () => {
    document.getElementById("imageFile").click();
  };
  SendImage = (event) => {
    var file = event.files[0];
    if (!file.type.match("image.*")) {
      alert("Please select image only.");
    } else {
      var reader = new FileReader();
      reader.addEventListener(
        "load",
        function () {
          var chatMessage = {
            userId: currentUser.uid,
            msg: reader.result,
            msgType: "image",
            dateTime: new Date().toLocaleString(),
            receiverId: selectedFriend.id,
            photo: "",
            friendName: selectedFriend.name,
            timestamp: Date.now(),
          };
          getFriendDetails(currentUser.uid).then((usrData) => {
            chatMessage.senderName = usrData.fln;
            chatMessage.photo = usrData.downloadURL;
            firebase
              .database()
              .ref("chatMessages")
              .child(selectedFriend.chatKey)
              .push(chatMessage, function (error) {
                if (error) alert(error);
                else {
                  document.getElementById("chat-text-input").value = "";
                  document.getElementById("chat-text-input").focus();
                  addRecentMsg(
                    selectedFriend.chatKey,
                    chatMessage,
                    selectedFriend.id
                  );
                }
              });
          });
        },
        false
      );
      if (file) {
        reader.readAsDataURL(file);
      }
    }
  };
  function addRecentMsg(chtKey, msg, friend_id) {

    if (friend_id !== "undefined") {
      msg.read=0
      $("#user-key-" + friend_id).addClass("hide");
      firebase.database().ref("recentMsgs").child(chtKey).set(msg);
      $("#recent-chats").empty();
      getLatest();
    }
  }

  getLatest();
  function getLatest() {
    recChatRef.on("value", function (snap) {
      $("#recent-chats").empty();
      let recMsgs = [];
      snap.forEach((data) => {
        let recentMsg = data.val();
        recentMsg.key = data.key;
        recMsgs.push(recentMsg);
      });
      let lstIdx = recMsgs.length - 1;
      recMsgs.sort((a, b) => parseFloat(b.timestamp) - parseFloat(a.timestamp));

      recMsgs.forEach((chat, i) => {
        let fnId;
        if (chat.userId === currentUser.uid) {
          fnId = chat.receiverId;
        } else {
          fnId = chat.userId;
        }

        if (
          chat.userId === currentUser.uid ||
          chat.receiverId === currentUser.uid
        ) {
          if (chat.msgType === "image") {
            msg = `Image  <i class="fas fa-paperclip ml-4"></i>`;
          } else if (chat.msgType === "audio") {
            msg = `Audio       <i class="fa fa-music" aria-hidden="true"></i>`;
          } else {
            msg = chat.msg;
          }
          userIds.push(`friend_${fnId}`);
          latestMsgsOutlet.innerHTML += `
       <div id="friend_${fnId}_${chat.key}"  class="friend-card mt-2 p-2  shadow-sm">
                    <div class="user-pic">
                     ${chat.receiverId===currentUser.uid && chat.read===0 ? '<i style="color:#1ec2f5" class="fa fa-dot-circle" aria-hidden="true"></i>' :""}
                     <img class="rounded-circle profile-pic" alt="avatar" src="${chat?.photo}"/>
                    </div>
                    <div class="usr-name">
                    <div class="s-name">
                      
                        ${chat.receiverId===currentUser.uid ? chat.senderName : chat.friendName} 
                        </div>
                         <div hidden class="hidden-name">${chat?.friendName}</div>
                     <p><strong><small>${msg}</small></strong></p>
                    </div>
                       
                </div>
        `;

         
            initFrndsView();
          
        }
        $(".friend_" + fnId).addClass("hide");
      });
    });
  }

  PopulateNotifications = () => {
    document.getElementById(
      "lstNotification"
    ).innerHTML = `<div class="text-center">
                                                         <span class="spinner-border text-primary mt-5" style="width:7rem;height:7rem"></span>
                                                     </div>`;
    var db = firebase.database().ref("notifications");
    var lst = "";
    db.orderByChild("sendTo")
      .equalTo(currentUser.uid)
      .on("value", function (notis) {
        if (notis.hasChildren()) {
        }
        notis.forEach(function (data) {
          var noti = data.val();
          if (noti.status === "Pending") {
            lst += `<li class="list-group-item list-group-item-action">
                            <div class="row">
                                <div class="col-md-2">
                                    <img src="${noti.photo}" class="rounded-circle friend-pic" />
                                </div>
                                <div class="col-md-10" style="cursor:pointer;">
                                    <div class="name">${noti.name}
                                        <button onclick="Reject('${data.key}')" class="btn btn-sm btn-danger" style="float:right;margin-left:1%;"><i class="fas fa-user-times"></i> Reject</button>
                                        <button onclick="Accept('${data.key}')" class="btn btn-sm btn-success" style="float:right;"><i class="fas fa-user-check"></i> Accept</button>
                                    </div>
                                </div>
                            </div>
                        </li>`;
          }
          // if (noti.status === 'Pending' && noti.notifType === 'request') {
          //     lst += `<li class="list-group-item list-group-item-action">
          //                 <div class="row">
          //                     <div class="col-md-2">
          //                         <img src="${noti.photo}" class="rounded-circle friend-pic" />
          //                     </div>
          //                     <div class="col-md-10" style="cursor:pointer;">
          //                         <div class="name">${noti.name}
          //                             <button onclick="Reject('${data.key}')" class="btn btn-sm btn-danger" style="float:right;margin-left:1%;"><i class="fas fa-user-times"></i> Reject</button>
          //                             <button onclick="Accept('${data.key}')" class="btn btn-sm btn-success" style="float:right;"><i class="fas fa-user-check"></i> Accept</button>
          //                         </div>
          //                     </div>
          //                 </div>
          //             </li>`;
          // }
          if (noti.status === "Accept") {
            lst += `<li class="list-group-item list-group-item-action">
                            <div class="row">
                                <div class="col-md-2">
                                    <img src="${noti.photo}" class="rounded-circle friend-pic"/>
                                </div>
                                <div class="col-md-10" style="cursor:pointer;">
                                    <h6>You and ${noti.name} are now friends</h6> 
                                    </div>
                                </div>
                            </div>
                        </li>`;
          }
          if (
            noti.msg != "" &&
            noti.userId != currentUser.uid &&
            noti.notifType === "text"
          ) {
            lst += `<li class="list-group-item list-group-item-action">
                            <div class="row">
                                <div class="col-md-2">
                                    <img src="${noti.photo}" class="rounded-circle friend-pic" />
                                </div>
                                <div class="col-md-10" style="cursor:pointer;">
                                    <div class="name">${noti.friendName}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16" style="float:right;" onclick="deleteNotif('${data.key}')">
  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
</svg>
                                        <h6>You have recieved a new message</h6>
                                        <h6>${noti.msg}</h6>
                                    </div>
                                </div>
                            </div>
                        </li>`;
          }
        });

        document.getElementById("lstNotification").innerHTML = lst;
      });
  };
  (deleteNotif) => (key) => {
    firebase
      .database()
      .ref("notifications/" + key)
      .remove();
  };

  Reject = (key) => {
    let db = firebase
      .database()
      .ref("notifications")
      .child(key)
      .once("value", function (noti) {
        let obj = noti.val();
        obj.status = "Reject";
        obj.notifType = "request";
        firebase
          .database()
          .ref("notifications")
          .child(key)
          .update(obj, function (error) {
            if (error) alert(error);
            else {
              // do something
              PopulateNotifications();
            }
          });
      });
  };

  Accept = (key) => {
    let db = firebase
      .database()
      .ref("notifications")
      .child(key)
      .once("value", function (noti) {
        var obj = noti.val();
        console.log(obj);

        obj.status = "Accept";
        obj.notifType = "request";
        firebase
          .database()
          .ref("notifications")
          .child(key)
          .update(obj, function (error) {
            if (error) alert(error);
            else {
              // do something
              PopulateNotifications();
              var friendList = {
                friendId: obj.sendFrom,
                userId: currentUser.uid,
                photo: obj.photo,
                notifType: obj.notifType,
              };

              firebase
                .database()
                .ref("friend_lists")
                .child(currentUser.uid)
                .push(friendList)
                .then((snap) => {
                  console.log(snap.key);
                  firebase
                    .database()
                    .ref("friend_lists")
                    .child(obj.sendFrom)
                    .child(snap.key)
                    .set(friendList);
                });
            }
          });
      });
  };

  function NotificationCount(user) {
    console.log(user.uid);
    let db = firebase.database().ref("notifications");
    db.orderByChild("sendTo")
      .equalTo(user.uid)
      .on("value", function (noti) {
        let notiArray = [];
        if (noti.val() !== null) {
          notiArray = Object.values(noti.val());
        }
        document.getElementById("notification").innerHTML = notiArray.length;
        // document.querySelector("#notification").innerHTML = notiArray.length;
      });
  }
});
