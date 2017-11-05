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

    var trainName = "";
    var destination = "";
    var firstTime = "";
    var frequency = 0;
    var nextArrival = 0;
    var minutesAway = 0;
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

        // set nextarrival to firstTime since they will be the same time for the first train
        nextArrival = (childSnapshot.val().firsttime);

        console.log(nextArrival);
        console.log(currentTime);

        // console.log(moment(nextArrival));
        // console.log(moment(currentTime));

        // // loop starts here
        // create a loop that will compare the current time to the next Arrival time.



        // if the current time is before the next Arrival time then we calculate the difference in minutes and append that value to our table
        // if the current time is after the next Arrival time then we have missed the train and we need to add the frequency to the next Arrival time to see if we have time to catch the next one
        // we repeat this until we find the next Arrival time that is in the future and we append that value to our table

        // moment().subtract(Number, String);

        minutesAway = moment().subtract(nextArrival);
        console.log(minutesAway.min);

        // nextArrival = moment(nextArrival, 'HH:mm').add((childSnapshot.val().frequency), 'm');

        // console.log(moment(nextArrival).format('HH:mm'));
        // // console.log(moment(nextArrival).unix());
        // // currentTime = moment().unix();
        // console.log(currentTime);

        // var a = moment();
        // var b = moment().add(1, 'seconds');
        // minutesAway = (moment((nextArrival).format('HH:mm')).diff(moment().format('HH:mm'))); 
        // b.diff(a) // 1000

        // minutesAway = nextArrival - currentTime;






        // for (nextArrival = moment(firstTime).format('HH:mm'); nextArrival < 2401; nextArrival = moment(nextArrival).add(frequency, 'm')) {
        // console.log(nextArrival);

        //     if (nextArrival > currentTime) {
        //         minutesAway = moment(nextArrival).subtract(currentTime, 'm');
        //         console.log(minutesAway);
        //         break;
        //     }  else {
        //         console.log("No Train Yet");

        // }

        // }
        // moment().add(7, 'days');
        // moment().add(7, 'd');
        // moment().add(Duration);
        // moment("123", "hmm").format("HH:mm") === "01:23"
        // moment("1234", "hmm").format("HH:mm") === "12:34"

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
        var td4 = $("<td>").text(moment(nextArrival).format('HH:mm'));
        $(newTableRow).append(td4);

        // get calculated value for minutes Away and append to position in table row        
        var td5 = $("<td>").text(minutesAway);
        $(newTableRow).append(td5);

        // Append new table row to traintable in DOM
        $("#traintable").append(newTableRow);



    });

})