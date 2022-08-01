var auth = firebase.auth();
var docRef = firebase.firestore();
var db = firebase.database();
var chatKey = "";
let currentDate = new Date();
let cDay = currentDate.getDate();
let cMonth = currentDate.getMonth() + 1;
let cYear = currentDate.getFullYear();
// let time = currentDate.getHours() + ":" + currentDate.getMinutes();
var chatKey = "";
var friend_id = "";
var chatKey = "";
// let latestDoc = null;
//let likeArray = [];
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

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    activeUser = user;
    getRandomUsers(user);
  }
});

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
                        <div class="profile col-6">
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
  
  function shuffle(array) {
    // using lodash helper library
    return _.shuffle(array);
  }