"use strict";
if ("function" === typeof importScripts) {
  importScripts("https://www.gstatic.com/firebasejs/7.16.0/firebase-app.js");
  importScripts(
    "https://www.gstatic.com/firebasejs/7.16.0/firebase-messaging.js"
  );

  self.addEventListener("push", function (event) {
    var data = event.data.json();
    console.log(data);
    const pushData = data.data;

    const title = "You have a new message ";
    const options = {
      body: pushData.message,
    };
    event.waitUntil(self.registration.showNotification(title, options));
  });

  self.addEventListener("notificationclick", function (event) {
    console.log("registered");
  });

  self.addEventListener("notificationclose", function (event) {});
}