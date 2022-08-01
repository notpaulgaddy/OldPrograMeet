const container = document.getElementById("grid-container");
const loading = document.querySelector(".loading");
let latestDoc = null;
var i = 0;
let totSize = 0;
let dataLimit = 4;
let latestDocId;
let userData;
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    fetchUsers(user);
    userData = user;
  }
});

function fetchUsers(user) {
  firebase
    .firestore()
    .collection("userInfo")
    .orderBy("username")
    .limit(dataLimit)
    .get()
    .then((snap) => {
      const data = snap.docs;
      displayUsers(data, user);
    });
}

function getNextUsers(doc) {
  if (latestDoc) {
    $("#loadmore-area").html(
      `<i class="fa fa-spinner fa-spin fa-2x" aria-hidden="true"></i>`
    );
    firebase
      .firestore()
      .collection("userInfo")
      .orderBy("username")
      .limit(dataLimit)
      .startAfter(doc)
      .get()
      .then((snap) => {
        const data = snap.docs;
        latestDoc = data[data.length - 1];
        if (latestDoc) {
          latestDocId = latestDoc.id;
          displayUsers(data, userData);
        } else {
          $("#loadmore-area").html(``);
        }
      });
  } else {
    $("#end-msg").html(`<div class="alert alert-info" role="alert">
  <strong>No more data</strong>
</div>`);
  }
}

function displayUsers(data, user) {
  latestDoc = data[data.length - 1];
  latestDocId = latestDoc.id;

  data.forEach((doc, i) => {
    var downloadURL = doc.data().downloadURL;
    var fln = doc.data().fln;
    var userId = doc.data().userId;
    var program = doc.data().program;
    if (user.uid !== userId) {
      display2(i, downloadURL, fln, program, userId, doc.id);
    }
  });
}

function display2(row, url, fln, program, userId, key) {
  $("#grid-container").append(`
  <div id="user-${key}" class="col-6 col-md-3 mt-3">
            <div onclick="userClicked('${userId}')" style="height:auto !important;cursor:pointer" class="card" >
              <img src="${url}" class="card-img-top" alt="...">
              <div class="card-body">
                <h5 class="card-title">${fln}</h5>
                <p class="card-text">${program || ''}
                </p>
             
              </div>
            </div>
    </div>
  `);
  if (key === latestDocId) {
    initWayPoint();
  }
}

function userClicked(userId) {
  window.location = "profile.html" + "?=" + userId;
  history.onpopstate(userId, "userId", userId);
}

const initWayPoint = () => {
  new Waypoint({
    element: document.getElementById("user-" + latestDocId),
    handler: function (direction) {
      getNextUsers(latestDoc);
    },
    offset: "50%",
  });
};

