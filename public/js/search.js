var currentUserKey = "";
var chatKey = "";
var friend_id = "";
var sendTo = "";
var testing = [];
var tweets = [];
let tweetResView = $("#tweets-res");
let twtDisp = ``;
var data = "";
var db = firebase.database();

function initSrch(){
  firebase
  .firestore()
  .collection("Posts")
  .doc("allPosts")
  .collection("posts")
  .get()
  .then((snap) => {
    let docs = snap.docs;

    docs.forEach((doc) => {
      let docObj = {
        ...doc.data(),
        key: doc.id,
      };
      tweets.push(docObj);
    });
   
    $("#search-field,#mob-search").on("keyup", function () {
    
      $("#tweets-res").empty();
      $("#users-view").empty();
      let item = $(this).val();
      if (item !== "" && item.length > 1) {
        let it = tweets.filter(
          (tweet) => tweet.Post.toUpperCase().indexOf(item.toUpperCase()) !== -1
        );
        let users = testing.filter(
          (usr) => usr.name.toUpperCase().indexOf(item.toUpperCase()) !== -1
        );
        if (it.length > 0 || users.length > 0) {
          $("#srch-res").fadeIn();
          it.forEach((twt) => {
            document.getElementById(
              "tweets-res"
            ).innerHTML += `
              
                          <div style="height:35px" class="d-flex p-3 mt-2 justify-content-between align-items-center">
                          <span><a class="dropdown-item" href="/reply.html?=${twt.key}"> ${twt.Post}</a></span>
                          <span><i class="fa fa-chevron-right" aria-hidden="true"></i></span>
                          </div>
`;
          });
          users.forEach((usr) => {
            document.getElementById(
              "users-view"
            ).innerHTML += `
            <div style="height:35px" class="d-flex p-3 mt-2 justify-content-between align-items-center">
                          <span><a href="/profile.html?=${usr.userId}"> ${usr.name}</a></span>
                          <span><i class="fa fa-chevron-right" aria-hidden="true"></i></span>
            </div>
   `;
          });
        } else {
          $("#srch-res").fadeOut();
          document.getElementById("tweets-res").innerHTML = "No results found";
        }
      } else {
        $("#srch-res").fadeOut();
      }
    });
  });
}
const nameRef = db.ref("users");

nameRef.on("value", gotData);

function gotData(data) {
  var person = data.val();
  var keys = Object.keys(person);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var personsName = person[key];
    testing.push(personsName);
  }
  $("#search-field").autocomplete({
    source: testing,
    select: redirect,
  });
  var labelName;
  function redirect(event, ui) {
    labelName = ui.item.label;
    console.log(event);
    var key = keys[i];
    for (var i = 0; i < keys.length; i++) {
      var key2 = keys[i];
      if (labelName == person[key2].name) {
        console.log(person[key2].userId);
        window.location = "profile.html" + "?=" + person[key2].userId;
        history.onpopstate(person[key2].userId, "userId", person[key2].userId);
      } else {
        console.log("nah");
      }
    }
  }
}

function onFirebaseStateChanged() {
  firebase.auth().onAuthStateChanged(onStateChanged);
}