var auth = firebase.auth().currentUser;
firebase.auth().onAuthStateChanged(function (user) {
	if (user) {
		db = firebase.firestore();
		db.collection("userInfo")
			.doc(user.uid)
			.get()
			.then(function (doc) {
				if (doc.exists) {
					var downloadURL = doc.data().downloadURL;
		document.getElementById("navbar").innerHTML = `
		<header>
		<div class="container-fluid">
			<div class="row" style="background-color:black">
				<div class="col-md-4 col-sm-4 col-4 d-flex mobile-nav-left align-items-center">
					<div class="logo">
						<a href="/home.html">
							<img src="public/img/logo.png" alt="logo">
						</a>
					</div>
					<div class="search-box">
						<button type="submit"><img src="public/img/search-icon.svg"></button>
						<input type="text" id="search-field" placeholder="Search PrograMeet">
					</div>
				</div>
				<div class="col-md-8 col-sm-8 col-8 d-flex justify-content-end align-items-center">
					<div class="position-relative">
					<a class="mini-logo" href="explore.html"><img src="public/img/imoji-03.png" alt=""></a>
					<a class="mini-logo" href="chat.html"><img src="public/img/chat-icon.png" alt=""></a>
					<span id="notify-drop" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" class="dropdown">
					<span id="noti-count" style="font-size:17px" class="position-absolute top-0  start-100 translate-middle badge rounded-pill bg-danger">
									0
									<span class="visually-hidden"></span>
								</span>	
					<a  class="mini-logo  position-relative" href="#!"><img src="public/img/alerm-icon.png" alt=""></a>
								  <ul id="dropdown-items" style="width:400px" class="dropdown-menu" aria-labelledby="dropdownMenu1">
										 
									</ul>
								</span>
						<a class="mini-logo" href="resource.html"><img src="public/img/resource-icon.png" alt=""></a>
						<a class="mini-logo" href="events.html"><img src="public/img/event-icon.png" alt=""></a>
						<a class="mini-logo" href="contact.html"><img src="public/img/contact-icon.png" alt=""></a>
						<a class="mini-logo" href="settings.html"><img id="navPfp" src="${downloadURL}" alt=""></a>
						<a class="make-btn andrew-btn" id="navName" href="#"></a>
						<a class="make-btn log-btn" onclick="logout()">Logout </a>
					</div>
					<div class="mini-icon-box">
						<span><img src="public/img/comment-icon.png" alt=""></span>
						<span class="mini-search-icon-default">
						<img src="public/img/mini-search-icon.png" alt="">
						</span>
					</div>
					<div class="hamburger-menu">
						<span class="line-top"></span>
						<span class="line-center"></span>
						<span class="line-bottom"></span>
					</div>
				</div>
			</div>
		</div>
	</header>

	<div class="main-search-box">
		<input id="mob-search" placeholder="Search..." type="text">
		<button class="mini-search-icon">
		<i style="font-size:17px" class="fa fa-times-circle " aria-hidden="true"></i>
		</button>
		<div  class="shadow-lg res-suggestions" aria-labelledby="dropdownMenuButton">
							<div id="tweets-res"></div>
							<div id="users-view"></div>
				</div>
	</div>


	 <div class="ofcavas-menu">
        <!--menu start-->
        <ul>
            <li class="nav-item">
                <a href="/chat.html" class="nav-link"><span><img src="public/img/ofcavas-chat.png" alt=""> Chat</span> <i class="fas fa-chevron-right"></i></a>
                <a href="/settings.html" class="nav-link"><span><img src="public/img/setting-icon.png" alt=""> Settings</span> <i class="fas fa-chevron-right"></i></a>
                <a href="/contacts.html" class="nav-link"><span><img src="public/img/contact-icon.png" alt=""> Contact</span> <i class="fas fa-chevron-right"></i></a>
                <a href="/events.html" class="nav-link"><span><img src="public/img/event-icon.png" alt=""> Events</span> <i class="fas fa-chevron-right"></i></a>
                <a href="/resource.html" class="nav-link"><span><img src="public/img/resource-icon.png" alt=""> Resources</span> <i class="fas fa-chevron-right"></i></a>
                <a href="#" class="nav-link logout-center"><span class="logout-btn">Logout</span></a>
            </li>
        </ul>
    </div>
              `;

			  getNotcount(user.uid)
	} 
	initSrch() 
});
}else {
	document.getElementById(
		"navbar"
	).innerHTML = `
	<header>
	<div class="container-fluid">
		<div class="row">
			<div class="col-sm-4 col-5 d-flex align-items-center">

				<div class="logo">
					<a href="index.html">
						<img src="public/img/logo.png" alt="">
					</a>
				</div>

			</div>
			<div class="col-sm-8 col-7 d-flex align-items-center justify-content-end">
				<a class="signlogin-btn custom-login" href="login.html">Login</a>
				<a class="signlogin-btn" href="signup.html">Signup</a>
			</div>
		</div>
	</div>
</header>



	  `;
}
});
function logout() {
	firebase
		.auth()
		.signOut()
		.then(function () {
			console.log("User Logged Out!");
		})
		.catch(function (error) {
			console.log(error);
		});
}



// NotificationCount()
function getNotcount(currentUserKey){
let db = firebase.database().ref("notifications");
	db.orderByChild("sendTo")
		.equalTo(currentUserKey)
		.on("value", function (noti) {
			if(noti.val()!==null){
			let notiArray = Object.values(noti.val());
			console.log(notiArray.length);
			
			document.getElementById("noti-count").innerHTML = notiArray.length;
			}else{
				document.getElementById("noti-count").innerHTML = 0
			}
		});

		$('#notify-drop').on('click',function(){
			PopulateNotifs(currentUserKey)

		})

		$('.hamburger-menu').on('click', function () {
            $('.hamburger-menu .line-top').toggleClass('current');
            $('.hamburger-menu .line-center').toggleClass('current');
            $('.hamburger-menu .line-bottom').toggleClass('current');
            $('.ofcavas-menu').toggleClass('current');
        });
		   $('.mini-search-icon-default, .mini-search-icon').on('click', function () {
            $('.main-search-box').toggleClass('d-inline-flex');
        });

}


  PopulateNotifs = (uid) => {
    var db = firebase.database().ref("notifications");
    var lst = "";
    db.orderByChild("sendTo")
      .equalTo(uid)
      .on("value", function (notis) {
        if (notis.hasChildren()) {
        }
        notis.forEach(function (data) {
           var noti = data.val();
		  
		  lst+=`  <li><a onclick="markRead('${data.key}')"  class="dropdown-item" href="#">${noti.msg}</a></li>`
		})
	})
	document.getElementById("dropdown-items").innerHTML = lst;
}

function markRead(ky){
	  firebase
      .database()
      .ref("notifications/" + ky)
      .remove();
}