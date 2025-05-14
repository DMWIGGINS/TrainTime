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

    // variables for firebase databse, values in the form and for current time
    var dataBase = firebase.database();
    var minutesAway = 0;
    var trainName = "";
    var destination = "";
    var firstTime = "";
    var frequency = 0;
    var nextArrival = 0;
    var currentTime = "";
    var t = 0;

    // when submit button is clicked this function will be carried out
    $("#submit").on("click", function (event) {
        event.preventDefault();

        // get values from form 
        trainName = $("#trainname").val().trim();
        destination = $("#destination").val().trim();
        firstTime = $("#firsttime").val().trim();
        frequency = $("#frequency").val().trim();

        // store values in our database
        dataBase.ref().push({
            trainname: trainName,
            destination: destination,
            firsttime: firstTime,
            frequency: frequency
        });

        // clear values from form
        $("#trainname").val('');
        $("#destination").val('');
        $("#firsttime").val('');
        $("#frequency").val('');

        
    });

    // anytime new data is added we create it's own object in firebase to store it
    dataBase.ref().on("child_added", function (childSnapshot) {

        // Log everything that's coming out of snapshot
        console.log(childSnapshot.val().trainname);
        console.log(childSnapshot.val().destination);
        console.log(childSnapshot.val().firsttime);
        console.log(childSnapshot.val().frequency);

        // get current time
        currentTime = moment().format('HH:mm');
        var currentTimeHour = moment().format('HH');
        var currentTimeMin = moment().format('mm');
        console.log(currentTime);
        console.log(currentTimeHour);
        console.log(currentTimeMin);


        // set nextarrival to firstTime since they will be the same time for the first train
        nextArrival = (childSnapshot.val().firsttime);
        console.log(nextArrival);

        var nextArrivalTime = moment(nextArrival, "HH:mm");
        var nextArrivalHour = moment(nextArrival, "HH:mm").format("HH");
        var nextArrivalMin = moment(nextArrival, "HH:mm").format("mm");

        console.log(nextArrivalMin);


        // create a loop that will compare the current time to the next Arrival time.
        while (moment().isAfter(nextArrivalTime)) {
            
            // if the current time is after the next Arrival time then we have missed the train and we need to add the frequency to the next Arrival time to see if we have time to catch the next one
            // we repeat this until we find the next Arrival time that is in the future 
            
            nextArrivalTime = moment(nextArrivalTime).add(childSnapshot.val().frequency, "minutes");
            console.log(moment(nextArrivalTime).format("HH:mm"));

        }
        // when the current time is before the next Arrival time then we calculate the difference in minutes and append that value to our table

        nextArrivalHour = moment(nextArrivalTime, "HH:mm").format("HH");
        nextArrivalMin = moment(nextArrivalTime, "HH:mm").format("mm");
        console.log(nextArrivalHour);
        console.log(nextArrivalMin);
        console.log(currentTimeHour);
        console.log(currentTimeMin);
        console.log(nextArrivalHour * 60 + parseInt(nextArrivalMin));
        console.log(currentTimeHour * 60 + parseInt(currentTimeMin));
        minutesAway = ((nextArrivalHour * 60) + parseInt(nextArrivalMin)) - ((currentTimeHour * 60) + parseInt(currentTimeMin));

        // if result is a negative number than next train is at midnight or after so need to add 1440 (24 * 60) to minutesAway for next day and bring to positive
        if (minutesAway < 0) {
            minutesAway = minutesAway + 1440;
        }
        console.log(minutesAway);

        // create a new row in the table for the new train info
        var newTableRow = $("<tr>");

        // retrieve trainname from database and append to position in table row
        var td1 = $("<td>").text(childSnapshot.val().trainname);
        $(newTableRow).append(td1);

        // retrieve destination from database and append to position in table row
        var td2 = $("<td>").text(childSnapshot.val().destination);
        $(newTableRow).append(td2);

        // retrieve frequency from database and append to position in table row
        var td3 = $("<td>").text(childSnapshot.val().frequency);
        $(newTableRow).append(td3);

        // get calculated value for next Arrival and append to position in table row
        var td4 = $("<td>").text(moment(nextArrivalTime, "HH:mm").format("h:mm a"));
        $(newTableRow).append(td4);

        // get calculated value for minutes Away and append to position in table row        
        var td5 = $("<td>").text(minutesAway);
        $(newTableRow).append(td5);

        // Append new table row to traintable in DOM
        $("#traintable").append(newTableRow);
    });
});