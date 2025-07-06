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

    // variables for firebase database, values in the form and for current time
    var dataBase = firebase.database();
    var minutesAway = 0;
    var trainName = "";
    var destination = "";
    var firstTime = "";
    var frequency = 0;
    var nextArrival = 0;
    var currentTime = "";
    var t = 0;
    var trainKey = "";


    // Replace spaces with underscores
    // Remove anything not a-z, 0-9, or underscore
    function formatKey(trainName) {
        return trainName 
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
        
    }


    // when submit button is clicked this function will be carried out
    $("#submit").on("click", function (event) {
        event.preventDefault();

        // get values from form 
        trainName = $("#trainname").val().trim();
        destination = $("#destination").val().trim();
        firstTime = $("#firsttime").val().trim();
        frequency = $("#frequency").val().trim();

         // Validate required fields
    if (!trainName || !destination || !firstTime || !frequency) {
        alert("Please fill in all fields before adding a train.");
        return;
    }

        
        var trainKey = formatKey(trainName);
        console.log("TrainKey outside of function is " + trainKey);
        // store values in our database

        dataBase.ref("trains/" + trainKey).once("value", function(snapshot) {
            if (snapshot.exists()) {
                alert("A train with that name already exists.");
            } else {
        dataBase.ref("trains/" + trainKey).set({
            trainname: trainName,
            destination: destination,
            firsttime: firstTime,
            frequency: frequency        
        
        }, function(error) {
            if (error) {
            alert("Train could not be added. Please try again.");
            } else {
            alert("Train added successfully!");
        
    
        // clear values from form
        $("#trainname").val('');
        $("#destination").val('');
        $("#firsttime").val('');
        $("#frequency").val('');

    }
              });
            }
           });
        });
    // anytime new data is added we create it's own object in firebase to store it
    dataBase.ref("trains").on("child_added", function (childSnapshot) {

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
        
        //add trainname to the dropdown list in the edit/delete section
        var option = $("<option>").text(childSnapshot.val().trainname);
        $(option).attr("value", childSnapshot.val().trainname )
        $("#dropdown").append(option);

         console.log("Value is " + $("#dropdown").val());

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


     $("#dropdown").on("input", function (event) {
       
        var selectedtrainName = $(this).val();
        console.log("TrainName is " + selectedtrainName);
       dataBase.ref("trains/" ).orderByChild("trainname").equalTo(selectedtrainName).once("value", function(snapshot) {
        if (snapshot.exists()) {
            snapshot.forEach(function(childSnapshot) {
                var trainData = childSnapshot.val();
                console.log("TrainData is " + trainData);
                // Fill in the form fields
                $("#existingdestination").val(trainData.destination);
                $("#existingfirsttime").val(trainData.firsttime);
                $("#existingfrequency").val(trainData.frequency);

                // Optional: store key for edit/delete buttons
                $("#edit").data("key", childSnapshot.key);
                $("#delete").data("key", childSnapshot.key);

         });
        } else {
            console.log("No train found with that name.");
        }
    });
       
           
        });

$("#edit").on("click", function () {
    var key = $(this).data("key");

       
    
        trainName =  $("#dropdown").val().trim();
        destination =  $("#existingdestination").val().trim();
        firstTime = $("#existingfirsttime").val().trim();
        frequency = $("#existingfrequency").val().trim();
    
    
      // Validate required fields
    if (!destination || !firstTime || !frequency) {
        alert("Please fill in all fields before editing a train.");
        return;
    }

    var updatedData = {
        trainname: trainName,
        destination: destination,
        firsttime: firstTime,
        frequency: frequency
    };

    dataBase.ref("trains").child(key).update(updatedData, function(error) {
        if (error) {
            alert("Update failed.");
        } else {
            alert("Train updated successfully.");
            location.reload(); // Refresh to reflect changes
        }
    });
});

$("#delete").on("click", function () {
    var key = $(this).data("key");

    if (confirm("Are you sure you want to delete this train?")) {
        dataBase.ref("trains").child(key).remove(function(error) {
            if (error) {
                alert("Delete failed.");
            } else {
                alert("Train deleted successfully.");
                location.reload(); // Refresh to reflect deletion
            }
        });
    }
});



     });
