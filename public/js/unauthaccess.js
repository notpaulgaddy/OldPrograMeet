firebase.auth().onAuthStateChanged(function (user) {
	if (user) {
        }else{
            document.getElementById("page service-page").remove()
            alert("You must be logged in to view this page")
            document.getElementById("unauth").innerHTML = "You must be logged in to view this page."
        }
    })