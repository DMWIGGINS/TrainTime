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

    function showAlert(message, type = 'success') {
  $('#message')
    .removeClass('alert-success alert-danger alert-warning alert-info show')
    .addClass('alert alert-' + type)
    .html(message)
    .show(); // ensure it's visible

  setTimeout(() => {
    $('#message').addClass('show');
  }, 10); // allow DOM to apply display before animation

  setTimeout(() => {
    $('#message').removeClass('show');
  }, 4000); // hide after 4 seconds

  setTimeout(() => {
    $('#message').fadeOut();
  }, 4500); // then fade it out completely
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
        showAlert("Please fill in all fields before adding a train.", "danger");
        return;
    }

    frequency = Number(frequency);
    if (frequency <= 0 || !Number.isInteger(frequency)) {
        console.log("less than zero? ",  frequency <= 0);
        console.log("not an integer? ",  !Number.isInteger(frequency))
        showAlert("Please enter an integer greater than zero.", "danger");
        return;
    }


        var trainKey = formatKey(trainName);
        //console.log("TrainKey outside of function is " + trainKey);
        // store values in our database

        dataBase.ref("trains/" + trainKey).once("value", function(snapshot) {
            if (snapshot.exists()) {
                showAlert("A train with that name already exists.", "warning");
                
            } else {
        dataBase.ref("trains/" + trainKey).set({
            trainname: trainName,
            destination: destination,
            firsttime: firstTime,
            frequency: frequency        
        
        }, function(error) {
            if (error) {
            showAlert("Train could not be added. Please try again.", "danger");
            } else {
            showAlert("Train added successfully!", "success");

            //remove focus from submit button when successfull
            $("#submit").blur();
        
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
        //console.log("trainname " + childSnapshot.val().trainname);
        //console.log("destination " + childSnapshot.val().destination);
        //console.log("firstarrival " + childSnapshot.val().firsttime);
        //console.log("frequency " + childSnapshot.val().frequency);
        
      // get current time
        currentTime = moment().format('HH:mm');
        var currentTimeHour = moment().format('HH');
        var currentTimeMin = moment().format('mm');
        //console.log(currentTime);
        //console.log(currentTimeHour);
       // console.log(currentTimeMin);


        // set nextarrival to firstTime since they will be the same time for the first train
        nextArrival = (childSnapshot.val().firsttime);
        //console.log(nextArrival);

        var nextArrivalTime = moment(nextArrival, "HH:mm");
        var nextArrivalHour = moment(nextArrival, "HH:mm").format("HH");
        var nextArrivalMin = moment(nextArrival, "HH:mm").format("mm");

        //console.log(nextArrivalMin);


        // create a loop that will compare the current time to the next Arrival time.
        while (moment().isAfter(nextArrivalTime)) {
            
            // if the current time is after the next Arrival time then we have missed the train and we need to add the frequency to the next Arrival time to see if we have time to catch the next one
            // we repeat this until we find the next Arrival time that is in the future 
            
            nextArrivalTime = moment(nextArrivalTime).add(childSnapshot.val().frequency, "minutes");
            //console.log(moment(nextArrivalTime).format("HH:mm"));

        }
        // when the current time is before the next Arrival time then we calculate the difference in minutes and append that value to our table

        nextArrivalHour = moment(nextArrivalTime, "HH:mm").format("HH");
        nextArrivalMin = moment(nextArrivalTime, "HH:mm").format("mm");
        //console.log(nextArrivalHour);
        //console.log(nextArrivalMin);
        //console.log(currentTimeHour);
        //console.log(currentTimeMin);
       // console.log(nextArrivalHour * 60 + parseInt(nextArrivalMin));
        //console.log(currentTimeHour * 60 + parseInt(currentTimeMin));
        minutesAway = ((nextArrivalHour * 60) + parseInt(nextArrivalMin)) - ((currentTimeHour * 60) + parseInt(currentTimeMin));

        // if result is a negative number than next train is at midnight or after so need to add 1440 (24 * 60) to minutesAway for next day and bring to positive
        if (minutesAway < 0) {
            minutesAway = minutesAway + 1440;
        }
        //onsole.log(minutesAway);

        // create a new row in the table for the new train info
        
        var newTableRow = $("<tr>").attr("data-key", childSnapshot.key);
        //console.log("How may times will this happen?" + trainname);
       
        // retrieve trainname from database and append to position in table row
        var td1 = $("<td>").text(childSnapshot.val().trainname);
        $(newTableRow).append(td1);

         //add trainname to the dropdown list in the edit/delete section
        var option = $("<option>").text(childSnapshot.val().trainname);
        $(option).attr("value", childSnapshot.val().trainname )
        $("#dropdown").append(option);

        //console.log("Value is " + $(option).val());

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

    //listener for deleted data
    dataBase.ref("trains").on("child_removed", function (oldChildSnapshot) {
    const key = oldChildSnapshot.key;
     // Remove row from table
    $('tr[data-key="' + key + '"]').remove();

    $('#dropdown option').each(function () {
       if ($(this).val() === oldChildSnapshot.val().trainname) {
           $(this).remove();
       }

    });
    //console.log("Train with key", key, "has been removed from table");
    });

 dataBase.ref("trains").on("child_added", function (childSnapshot) {
var newTableRow = $("<tr>").attr("data-key", childSnapshot.key);
   


     $("#dropdown").on("input", function (event) {
       
        var selectedtrainName = $(this).val();
        
        //console.log("TrainName is " + selectedtrainName);
       
       dataBase.ref("trains/").orderByChild("trainname").equalTo(selectedtrainName).once("value", function(snapshot) {
        if (snapshot.exists()) {
            snapshot.forEach(function(childSnapshot) {
                var trainData = childSnapshot.val();
                console.log("TrainData is " + trainData);
                // Fill in the form fields
                $("#existingdestination").val(trainData.destination);
                $("#existingfirsttime").val(trainData.firsttime);
                $("#existingfrequency").val(trainData.frequency);

                // Store key for edit/delete buttons
                $("#edit").data("key", childSnapshot.key);
                $("#delete").data("key", childSnapshot.key);

         });
        } else {
           showAlert("No train found with that name.", "warning");
        }
    });
       
           
        });

$("#edit").on("click", function () {
    var key = $(this).data("key");

       
    
        trainName =  $("#dropdown").val().trim();
        destination = $("#existingdestination").val().trim();
        firstTime = $("#existingfirsttime").val().trim();
        frequency = $("#existingfrequency").val().trim();
    
    
      // Validate required fields


    if (!destination || !firstTime || !frequency) {
        showAlert("Please fill in all fields before editing a train.", "warning");
        return;
    }

    var updatedData = {
        trainname: trainName,
        destination: destination,
        firsttime: firstTime,
        frequency: frequency
    };

    dataBase.ref("trains/" + key).update(updatedData, function(error) {
        if (error) {
            showAlert("Update failed.", "danger");
        } else {
          
    var row = $('tr[data-key="' + key + '"]');
    row.find("td:eq(0)").text(trainName);
    row.find("td:eq(1)").text(destination);
    row.find("td:eq(2)").text(frequency);


     
    // Recalculate arrival time and minutes away
    let firstTrainTime = moment(firstTime, "HH:mm");
    let nextArrivalTime = firstTrainTime;

    while (moment().isAfter(nextArrivalTime)) {
        nextArrivalTime = moment(nextArrivalTime).add(parseInt(frequency), "minutes");
    }

    let minutesAway = moment(nextArrivalTime).diff(moment(), "minutes");
    if (minutesAway < 0) minutesAway += 1440;

    row.find("td:eq(3)").text(nextArrivalTime.format("h:mm a"));
    row.find("td:eq(4)").text(minutesAway);

     // clear values from form
        $("#dropdown").val('');
        $("#existingdestination").val('');
        $("#existingfirsttime").val('');
        $("#existingfrequency").val('');

        
      showAlert("Train updated successfully.", "success");

      // remove focus from edit button when action is successfull
      $("#edit").blur();

}
        });
    });

let deleteKey = ""; // global var to store key temporarily

$("#delete").on("click", function () {
     deleteKey = $(this).data("key");
    $("#confirmModal").modal("show");

});

$("#confirmDeleteBtn").on("click", function() {
    if (!deleteKey) return;

    dataBase.ref("trains/" + deleteKey).remove(function (error) {
        if (error) {
                showAlert("Delete failed.", "danger");
            } else {
                showAlert("Train deleted successfully.", "success");

                // remove focus from delete button when action is successfull
                $("#delete").blur();

              
            }
});
    $("#confirmModal").modal("hide"); // close modal
  deleteKey = ""; // reset    
   

                // clear values from form
        $("#dropdown").val('');
        $("#existingdestination").val('');
        $("#existingfirsttime").val('');
        $("#existingfrequency").val('');



             }); 
      
        });

    });