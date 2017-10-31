$(document).ready(function () {

// Initialize Firebase
var config = {
    apiKey: "AIzaSyCuoaga2RX28gNNgUdqELpgCkyHr0qphKU",
    authDomain: "traintime-19073.firebaseapp.com",
    databaseURL: "https://traintime-19073.firebaseio.com",
    projectId: "traintime-19073",
    storageBucket: "",
    messagingSenderId: "85912264302"
};
firebase.initializeApp(config);

var data = firebase.database();

var trainname = "";
var destination = "";
var firsttime = "";
var frequency = "";

$("#submit").on("click", function (event) {
    event.preventDefault();
    alert("clicked");
    trainname = $("#trainname").val().trim();
    destination = $("#destination").val().trim();
    firsttime = $("#firsttime").val().trim();
    frequency = $("#frequency").val().trim();

    dataRef.ref().push({

        trainname: trainname,
        destination: destination,
        firsttime: firsttime,
        frequency: frequency

    });

});


})