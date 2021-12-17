jQuery(document).ready(function () {
    countDown();
    showResult();
    getRtdbData();
});

let start = new Date().getTime();

function calTime(start){
    let end = new Date().getTime();
    let dur = end - start;
  
    return  dur

}
function submitAnswer(choice){
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
    // reveive result and score

}


function countDown(){
    // start  timer 10 sec.
    // 10 sec. finish then show result
}

function showResult(res, score){
    // show results


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
    var game_key=document.getElementById("game_key").value;
    var question_key=document.getElementById("question_key").value;

    var questionStatusRef = firebase.database().ref("games/"+game_key+"/questions/"+question_key+"/")
    console.log("games/"+game_key+"/questions/"+question_key+"/") 
    console.log(questionStatusRef)
    questionStatusRef.on('child_changed', function(snapshot){
        const changedPost = snapshot.val();
        console.log(changedPost)
        if (changedPost=='timeout'){
            console.log('time is out show result');
            //- submit form
            // document.getElementById("autoSubmitForm").submit();            
        }
        if (changedPost=='end'){
            console.log('game is about to end');
            //- submit form
            document.getElementById("autoSubmitForm").submit();            
        }
    });
}