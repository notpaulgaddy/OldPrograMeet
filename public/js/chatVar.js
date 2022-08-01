$(document).ready(function(){ 
    var currentUserKey = "";  
  var friendNames = []

function onFirebaseStateChanged() {
    firebase.auth().onAuthStateChanged(onStateChanged);
  }
  
  function onStateChanged(user) {
    if (user) {
      var userProfile = { email: "", name: "", photoURL: "" };
      userProfile.email = firebase.auth().currentUser.email;
      userProfile.name = firebase.auth().currentUser.displayName;
      userProfile.photoURL = firebase.auth().currentUser.photoURL;
      var db = firebase.database().ref("users");
      var flag = false;
      db.on("value", function (users) {
        users.forEach(function (data) {
          var user = data.val();
          if (user.email === userProfile.email) {
            currentUserKey = data.key;
            photoURL = user.photoURL;
            flag = true;
          }
        });
  
        if (flag === false) {
          firebase.database().ref("users").push(userProfile, callback);
        } else {
          me = firebase.firestore();
          me.collection("userInfo")
            .doc(user.uid)
            .get()
            .then(function (doc) {
              if (doc.exists) {
                var downloadURL = doc.data().downloadURL;
                document.getElementById("imgProfile").src = downloadURL;
              }
            });
  
        }
  
        LoadChatList();
        NotificationCount();
      });
    } else {
      document.getElementById("imgProfile").src = "images/pp.png";
      document.getElementById("imgProfile").title = "";
      document.getElementById("lnkNewChat").classList.add("disabled");
    }
  }
  function callback(error) {
    if (error) {
      alert(error);
    } else {

    }
  }
  onFirebaseStateChanged();

  LoadChatList();
          $("#searchChat").autocomplete({
            source: friendNames
          })
        });