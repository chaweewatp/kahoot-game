jQuery(document).ready(function () {
    countDown();
    // showResult();
    getRtdbData();
    // summaryQuestino();
});


let start = new Date().getTime();
let timeout = true;
let response_msg = "";
let summary_msg = "";
function calTime(start){
    let end = new Date().getTime();
    let dur = end - start;
  
    return  dur

}
// END_POINT_URL="http://127.0.0.1:8000"
END_POINT_URL="https://ihubgamming.herokuapp.com"

let game_key=document.getElementById("game_key").value;
let question_key=document.getElementById("question_key").value;
let uid=document.getElementById("uid").value;

function submitAnswer(choice){
    timeout=false;
    console.log(choice);

    // timer stop
    
    // disable other choices
    $(':button[type="button"]').prop('disabled', true);
    // highlight choosen choice
    // $("#choice"+choice).effect( "highlight", {color: 'red'}, 3000 );
    $("#choice"+choice).addClass( "highlightButton", 500, "linear");

    // send api choice and timer to backend
    countTime = calTime(start)
    console.log("countTime is: ")
    console.log(countTime)

    var settings = {
        url: END_POINT_URL+"/API/submitanswer",
        method: "POST",
        timeout: 0,
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify({game_key:game_key, question_key:question_key, uid:uid, choice:choice, countTime:countTime, timeout:timeout}),
      };
      console.log(settings)
      $.ajax(settings)
        .done((response) => {
            // console.log(response)
            response_msg=response
            // console.log(response_msg)
        })
        .fail((response) => {
          alert("Error: something wrong");
        });

    // reveive result and score

}
async function summaryQuestion(){
    var settings = {
        url: END_POINT_URL+"/API/summaryquestion",
        method: "POST",
        timeout: 0,
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify({game_key:game_key, question_key:question_key, uid:uid }),
      };
      console.log(settings)
      $.ajax(settings)
        .done((response) => {
            // console.log(response)
            summary_msg=response;
        })
        .fail((response) => {
          alert("Error: something wrong");
        });
}

function countDown(){
    // start  timer 10 sec.
    // 10 sec. finish then show result
}

function showResult(response_msg){
    // show results
    document.getElementById("response_msg").innerHTML = response_msg;
    document.getElementById("summary_msg").innerHTML = summary_msg;

}


function getRtdbData(){
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
        databaseURL: "https://ihub-reunion-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "ihub-reunion",
        storageBucket: "ihub-reunion.appspot.com",
        messagingSenderId: "516373221314",
        appId: "1:516373221314:web:1f5c232abb1488162e905b"
        };
        firebase.initializeApp(firebaseConfig);
    // console.log("firebase connected");


    var questionStatusRef = firebase.database().ref("games/"+game_key+"/questions/"+question_key+"/")
    console.log("games/"+game_key+"/questions/"+question_key+"/") 
    console.log(questionStatusRef)
    questionStatusRef.on('child_changed', async function(snapshot){
        const changedPost = snapshot.val();
        console.log(changedPost)

        if (changedPost=='timeout'){
            console.log('time is out show result');
            await Promise.all([summaryQuestion()])
            if (timeout){
                var settings = {
                    url: END_POINT_URL+"/API/submitanswer",
                    method: "POST",
                    timeout: 0,
                    headers: {
                    "Content-Type": "application/json",
                    },
                    data: JSON.stringify({game_key:game_key, question_key:question_key, uid:uid, timeout:timeout}),
                };
                console.log(settings)
                $.ajax(settings)
                    .done((response) => {
                        console.log(response);
                        response_msg=response;
                        showResult(response_msg);
                    })
                    .fail((response) => {
                    alert("Error: something wrong");
                    });
            } else {
                showResult(response_msg);
            } 
            
        }
        if (changedPost=='end'){
            console.log('game is about to end');
            //- submit form
            document.getElementById("autoSubmitForm").submit();            
        }
    });
}