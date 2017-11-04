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

    var dataBase = firebase.database();

    var trainName = "";
    var destination = "";
    var firstTime = "";
    var frequency = 0;
    var nextArrival = 0;
    var minutesAway = 0;


    $("#submit").on("click", function (event) {
        event.preventDefault();
        alert("clicked");
        trainName = $("#trainname").val().trim();
        destination = $("#destination").val().trim();
        firstTime = $("#firsttime").val().trim();
        frequency = $("#frequency").val().trim();

        dataBase.ref().push({

            trainname: trainName,
            destination: destination,
            firsttime: firstTime,
            frequency: frequency

        });

    });
    dataBase.ref().on("child_added", function (childSnapshot) {

        // Log everything that's coming out of snapshot
        console.log(childSnapshot.val().trainname);
        console.log(childSnapshot.val().destination);
        console.log(childSnapshot.val().firsttime);
        console.log(childSnapshot.val().frequency);

        var newTableRow = $("<tr>");

        var td1 = $("<td>").text(childSnapshot.val().trainname);
        $(newTableRow).append(td1);
        var td2 = $("<td>").text(childSnapshot.val().destination);
        $(newTableRow).append(td2);
        var td3 = $("<td>").text(childSnapshot.val().frequency);
        $(newTableRow).append(td3);
        var td4 = $("<td>").text(childSnapshot.val().nextArrival);
        $(newTableRow).append(td4);
        var td4 = $("<td>").text(childSnapshot.val().minutesAway);
        $(newTableRow).append(td4);


        $("#traintable").append(newTableRow);
    });

    console.log(moment().format('HHmm'));

    // for (trainSchedule < firstTime; ) {
    // if (trainSchedule > moment().format("HHmm")) {
    //     minutesAway = trainSchedule - moment().format("HHmm");
    }
}
})