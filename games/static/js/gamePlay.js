jQuery(document).ready(function () {
  starter();
  countDown();
  // showResult();
  getRtdbData();
  // summaryQuestino();
});

let start = new Date().getTime();
let timeout = true;
let response_msg = "";
let summary_msg = "";

END_POINT_URL = "http://127.0.0.1:8000";
//END_POINT_URL="https://ihubgamming.herokuapp.com"

let game_key = document.getElementById("game_key").value;
let question_key = document.getElementById("question_key").value;
let uid = document.getElementById("uid").value;

var result = "";
var point = 0;

function calTime(start) {
  let end = new Date().getTime();
  let dur = end - start;
  return dur;
}

function submitAnswer(choice) {
  timeout = false;
  // timer stop
  // disable other choices
  $(':button[type="button"]').prop("disabled", true);
  // highlight choosen choice
  // $("#choice"+choice).effect( "highlight", {color: 'red'}, 3000 );
  $("#choice" + choice).addClass("highlightButton", 500, "linear");
  // send api choice and timer to backend
  countTime = calTime(start);

  var settings = {
    url: END_POINT_URL + "/API/submitanswer",
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      game_key: game_key,
      question_key: question_key,
      uid: uid,
      choice: choice,
      countTime: countTime,
      timeout: timeout,
    }),
  };
  $.ajax(settings)
    .done((response) => {
      response_msg = response;
      let results = response_msg.split(" ");
      result = results[0];
      point = `+ ${Number(results[2]).toFixed(0)}`;
    })
    .fail((response) => {
      alert("Error: something wrong");
    });

  // reveive result and score
}
async function summaryQuestion() {
  var settings = {
    url: END_POINT_URL + "/API/summaryquestion",
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      game_key: game_key,
      question_key: question_key,
      uid: uid,
    }),
  };
  $.ajax(settings)
    .done((response) => {
      console.log("update summary message");
      summary_msg = response;
      document.getElementById("response_msg").innerHTML = response_msg;
      document.getElementById("summary_msg").innerHTML = summary_msg;
      $("#game").attr("hidden", true);
      $("#result").attr("hidden", false);
      if (result == "ถูกต้อง!") {
        $("#score-text").text(point);
        $("score-title").attr("hidden", false);
        $("#result-title").text("Correct");
        $("#correct").attr("hidden", false);
      } else {
        $("#score-text").text("Time to get your head in the game!");
        $("#score-text").addClass("incorrect-small");
        $("#result-title").text("Incorrect");
        $("#incorrect").attr("hidden", false);
      }
    })
    .fail((response) => {
      alert("Error: something wrong");
    });
}

function countDown() {
  // start  timer 10 sec.
  // 10 sec. finish then show result
}

function showResult() {
  // show results
  document.getElementById("response_msg").innerHTML = response_msg;
  console.log(summary_msg);
  document.getElementById("summary_msg").innerHTML = summary_msg;
}

function getRtdbData() {
  // show number of players choose the choices
  //- question status changed to result
  //- query score
  //- show result data and leader board
  // showResult(res, score)

  // redirect to another question by admin
  //-question status cheged to finished.
  const firebaseConfig = {
    // apiKey: localStorage.APIkey,
    apiKey: "AIzaSyBUBV2dWYzeTdn9QnCEJdQ3ieFOE17p95s",
    authDomain: "ihub-reunion.firebaseapp.com",
    databaseURL:
      "https://ihub-reunion-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ihub-reunion",
    storageBucket: "ihub-reunion.appspot.com",
    messagingSenderId: "516373221314",
    appId: "1:516373221314:web:1f5c232abb1488162e905b",
  };
  firebase.initializeApp(firebaseConfig);

  var questionStatusRef = firebase
    .database()
    .ref("games/" + game_key + "/questions/" + question_key + "/");
  questionStatusRef.on("child_changed", async function (snapshot) {
    const changedPost = snapshot.val();
    if (changedPost == "timeout") {
      console.log(timeout);
      if (timeout) {
        var settings = {
          url: END_POINT_URL + "/API/submitanswer",
          method: "POST",
          timeout: 0,
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify({
            game_key: game_key,
            question_key: question_key,
            uid: uid,
            timeout: timeout,
          }),
        };
        $.ajax(settings)
          .done((response) => {
            console.log("update personal result");
            response_msg = response;
            let results = response_msg.split(" ");
            result = results[0];
            point = `+ ${Number(results[2]).toFixed(0)}`;
            // await Promise.all([summaryQuestion()]);
            // showResult();
            summaryQuestion();
          })
          .fail((response) => {
            alert("Error: something wrong");
          });
      } else {
        summaryQuestion();
        // await Promise.all([summaryQuestion()]);
        // showResult();
      }
    }
    if (changedPost == "end") {
      //- submit form
      document.getElementById("autoSubmitForm").submit();
    }
  });
}

// var timeleft = 10;
// var downloadTimer = setInterval(function () {
//   if (timeleft <= 0) {
//     clearInterval(downloadTimer);
//     document.getElementById("countdown").innerHTML = "Finished";
//     $(':button[type="button"]').prop("disabled", true);
//   } else {
//     document.getElementById("countdown").innerHTML =
//       timeleft + " seconds remaining";
//   }
//   timeleft -= 1;
// }, 1000);

function starter() {
  setTimeout(() => {
    $("#start").removeClass("hidden");
  }, 800);
  setTimeout(() => {
    $("#start").addClass("hidden");
    $("#start-outer").attr("hidden", true);
    $("#game").attr("hidden", false);
  }, 6000);
}
