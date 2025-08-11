$(document).ready(function () {
  // Initialize Firebase
  const config = {
    apiKey: "AIzaSyCuoaga2RX28gNNgUdqELpgCkyHr0qphKU",
    authDomain: "traintime-19073.firebaseapp.com",
    databaseURL: "https://traintime-19073.firebaseio.com",
    projectId: "traintime-19073",
    storageBucket: "",
    messagingSenderId: "85912264302",
  };
  firebase.initializeApp(config);

  // for firebase database, values in the form and for current time
  const dataBase = firebase.database();
  let minutesAway = 0;
  let trainName = "";
  let destination = "";
  let firstTime = "";
  let frequency = 0;
  let nextArrival = 0;
  let trainKey = "";

  // format trainName to meet firebase rules and use as the key
  function formatKey(trainName) {
    return trainName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  }

  // Frequency field must be a positive integer
  function frequencyValidation() {
    frequency = Number(frequency);
    if (frequency <= 0 || !Number.isInteger(frequency)) {
      showAlert("Please enter an integer greater than zero.", "danger");
      return false;
    }
    return true;
  }

  // First Train Time field must be in HH:MM format
  function timeValidation() {
    const timeFormat = /^(0?[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeFormat.test(firstTime)) {
      showAlert("Please use HH:MM format for First Train Time.", "danger");
      return false;
    }
    return true;
  }
  //  all form fields must be filled in, used for Add and Edit
  function allfieldsValidation() {
    if (!trainName || !destination || !firstTime || !frequency) {
      showAlert(
        "Please fill in all fields when adding or editing a train.",
        "danger"
      );
      return false;
    }
    return true;
  }

  // a function to handle the many alerts
  function showAlert(message, type = "success") {
    $("#message")
      .removeClass("alert-success alert-danger alert-warning alert-info show")
      .addClass("alert alert-" + type)
      .html(message)
      .show();
    // allow DOM to apply display before animation
    setTimeout(() => {
      $("#message").addClass("show");
    }, 10);
    // hide after 4 seconds
    setTimeout(() => {
      $("#message").removeClass("show");
    }, 4000);
    // then fade it out completely
    setTimeout(() => {
      $("#message").fadeOut();
    }, 4500);
  }

  // Clears form data for Add Train
  function clearAddform() {
    $("#trainname").val("");
    $("#destination").val("");
    $("#firsttime").val("");
    $("#frequency").val("");
  }

  // Clears form data for Edit and Delete Train
  function clearEditDeleteform() {
    $("#dropdown").val("");
    $("#existingdestination").val("");
    $("#existingfirsttime").val("");
    $("#existingfrequency").val("");
  }

  // ******************************************************************************************

  // submit button to Add Train
  $("#submit").on("click", function (event) {
    event.preventDefault();
    // get values from Add Train
    trainName = $("#trainname").val().trim();
    destination = $("#destination").val().trim();
    firstTime = $("#firsttime").val().trim();
    frequency = $("#frequency").val().trim();

    // Validate required fields are completed in Add Train
    if (!allfieldsValidation() || !timeValidation() || !frequencyValidation()) {
      return;
    }
     trainKey = formatKey(trainName);
    // store values in trains database in firebase
    // make sure it isn't a duplicate train name
    dataBase.ref("trains/" + trainKey).once("value", function (snapshot) {
      if (snapshot.exists()) {
        showAlert("A train with that name already exists.", "warning");
      } else {
        dataBase.ref("trains/" + trainKey).set(
          {
            trainname: trainName,
            destination: destination,
            firsttime: firstTime,
            frequency: frequency,
          },
          function (error) {
            if (error) {
              showAlert(
                "Train could not be added. Please try again.",
                "danger"
              );
            } else {
              showAlert("Train added successfully!", "success");
              // remove focus from submit button when successfull
              $("#submit").blur();
              // clear values from form
              clearAddform();
            }
          }
        );
      }
    });
  });

  // listener for added trains
  dataBase.ref("trains").on("child_added", function (childSnapshot) {

    // get current time
    const currentTimeHour = moment().format("HH");
    const currentTimeMin = moment().format("mm");

    // set nextarrival to firstTime since they will be the same time for the first train
    nextArrival = childSnapshot.val().firsttime;
    let nextArrivalTime = moment(nextArrival, "HH:mm");

    // create a loop that will compare the current time to the next Arrival time.
    while (moment().isAfter(nextArrivalTime)) {

      // if the current time is after the next Arrival time then we have missed the train and we need to add the frequency to the next Arrival time to see if we have time to catch the next one
      // we repeat this until we find the next Arrival time that is in the future
      nextArrivalTime = moment(nextArrivalTime).add(
        childSnapshot.val().frequency,
        "minutes"
      );
    }
    // when the current time is before the next Arrival time then we calculate the difference in minutes and append that value to our table
    const nextArrivalHour = moment(nextArrivalTime, "HH:mm").format("HH");
    const nextArrivalMin = moment(nextArrivalTime, "HH:mm").format("mm");

    minutesAway =
      nextArrivalHour * 60 +
      parseInt(nextArrivalMin) -
      (currentTimeHour * 60 + parseInt(currentTimeMin));

    // if result is a negative number than next train is at midnight or after so need to add 1440 (24 * 60) to minutesAway for next day and bring to positive
    if (minutesAway < 0) {
      minutesAway = minutesAway + 1440;
    }
    // create a new row in the table for the new train info
    const newTableRow = $("<tr>").attr("data-key", childSnapshot.key);
    // retrieve trainname from database and append to position in table row
    const td1 = $("<td>").text(childSnapshot.val().trainname);
    $(newTableRow).append(td1);
    // retrieve destination from database and append to position in table row
    const td2 = $("<td>").text(childSnapshot.val().destination);
    $(newTableRow).append(td2);
    // retrieve frequency from database and append to position in table row
    const td3 = $("<td>").text(childSnapshot.val().frequency);
    $(newTableRow).append(td3);
    // get calculated value for next Arrival and append to position in table row
    const td4 = $("<td>").text(
      moment(nextArrivalTime, "HH:mm").format("h:mm a")
    );
    $(newTableRow).append(td4);
    // get calculated value for minutes Away and append to position in table row
    const td5 = $("<td>").text(minutesAway);
    $(newTableRow).append(td5);
    
    // add trainname to the dropdown list in the Edit/Delete section
    const option = $("<option>").text(childSnapshot.val().trainname);
    $(option).attr("value", childSnapshot.val().trainname);
    $("#dropdown").append(option);
    // Append new table row to traintable in DOM
    $("#traintable").append(newTableRow);
  });

  // listener for deleted train
  dataBase.ref("trains").on("child_removed", function (oldChildSnapshot) {
    const key = oldChildSnapshot.key;
    // Remove row from table
    $('tr[data-key="' + key + '"]').remove();
    // when a train is deleted update the dropdown menu in the Edit/Delete section
    $("#dropdown option").each(function () {
      if ($(this).val() === oldChildSnapshot.val().trainname) {
        $(this).remove();
      }
    });
  });

  dataBase.ref("trains").on("child_added", function (childSnapshot) {
    //check this
    newTableRow = $("<tr>").attr("data-key", childSnapshot.key); //check this
    $("#dropdown").on("input", function (event) {
      event.preventDefault();
      const selectedtrainName = $(this).val();
      dataBase
        .ref("trains/")
        .orderByChild("trainname")
        .equalTo(selectedtrainName)
        .once("value", function (snapshot) {
          if (snapshot.exists()) {
            snapshot.forEach(function (childSnapshot) {
              const trainData = childSnapshot.val();
              // Fill in the form fields
              $("#existingdestination").val(trainData.destination);
              $("#existingfirsttime").val(trainData.firsttime);
              $("#existingfrequency").val(trainData.frequency);
              // Store key for edit/delete buttons
              $("#edit").data("key", childSnapshot.key);
              $("#delete").data("key", childSnapshot.key);
            });
          } else {
            showAlert("You must select a valid Train Name.", "warning");
            return;
          }
        });
    });
    $("#edit").on("click", function (event) {
      event.preventDefault();
      const key = $(this).data("key");
      if (!$("#dropdown").val()) {
        showAlert("You must select a valid Train Name.", "warning");
        return;
      }
      trainName = $("#dropdown").val().trim();
      destination = $("#existingdestination").val().trim();
      firstTime = $("#existingfirsttime").val().trim();
      frequency = $("#existingfrequency").val().trim();
      if (
        !allfieldsValidation() ||
        !timeValidation() ||
        !frequencyValidation()
      ) {
        return;
      }
      const updatedData = {
        trainname: trainName,
        destination: destination,
        firsttime: firstTime,
        frequency: frequency,
      };

      dataBase.ref("trains/" + key).update(updatedData, function (error) {
        if (error) {
          showAlert("Update failed.", "danger");
        } else {
          const row = $('tr[data-key="' + key + '"]');
          row.find("td:eq(0)").text(trainName);
          row.find("td:eq(1)").text(destination);
          row.find("td:eq(2)").text(frequency);

          // Recalculate arrival time and minutes away
          let nextArrivalTime = moment(firstTime, "HH:mm");

          while (moment().isAfter(nextArrivalTime)) {
            nextArrivalTime = moment(nextArrivalTime).add(
              parseInt(frequency),
              "minutes"
            );
          }

          let editMinutesAway = moment(nextArrivalTime).diff(
            moment(),
            "minutes"
          );
          if (editMinutesAway < 0) {
            editMinutesAway += 1440;
          }

          row.find("td:eq(3)").text(nextArrivalTime.format("h:mm a"));
          row.find("td:eq(4)").text(editMinutesAway);

          // clear values from form
          clearEditDeleteform();
          showAlert("Train updated successfully.", "success");

          // remove focus from edit button when action is successfull
          $("#edit").blur();
        }
      });
    });

    // let to store key temporarily
    let deleteKey = "";

    $("#delete").on("click", function (event) {
      event.preventDefault();
      deleteKey = $(this).data("key");
      if (!$("#dropdown").val()) {
        showAlert("You must select a valid Train Name.", "warning");
        return;
      } else {
        $("#confirmModal").modal("show");
      }
    });

    $("#confirmDeleteBtn").on("click", function () {
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

      // close modal
      $("#confirmModal").modal("hide");
      // reset
      deleteKey = "";

      // clear values from form
      clearEditDeleteform();
    });

    // clear values from form with reset button (Add Train)
    $("#resetAdd").on("click", clearAddform);

    // clear values from form with reset button (Edit/Delete Train)
    $("#resetExisting").on("click", clearEditDeleteform);
  });
});
