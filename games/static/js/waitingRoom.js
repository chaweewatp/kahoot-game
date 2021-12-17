jQuery(document).ready(function () {
    getRtdbData();
});

function displayName(index, item){
    // console.log(index)
    // console.log(item)
}
// END_POINT_URL="http://127.0.0.1:8000"
// function redirectToGamePlay(){
//     console.log(END_POINT_URL+"/gamePlay/")
//     var settings = {
//         "url": END_POINT_URL+"/gamePlay/",
//         "method": "POST",
//         "timeout": 0,
//         "headers": {
//             "Content-Type": "application/json"
//         },
//         "data": JSON.stringify({"test": "test", "test2": "test2"}),
//     };
//     $.ajax(settings).done((response) => {
//     }).fail((response) => {
//         });
// }

function getRtdbData() {
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
    var playerRef = firebase.database().ref("players/") 
    
    // // retieve all players
    // playerRef.on('value', function(snapshot){
    //     var arr = snapshot.val();
    //     console.log(arr)
    // })
    // console.log(game_key);
    // // retieve players with game id
    playerRef.orderByChild("game_key").equalTo(game_key).on('value', function(snapshot) {
        snapshot.forEach(childSnapshot=>{
            let item = childSnapshot.val();
            // console.log(item);
            $('body').append('<div id="' + item.name + '">' + item.name + '</div>');
        })
    });

    // var game_key=document.getElementById("game_key").value;
    var gameStatusRef = firebase.database().ref("games/"+game_key+"/") 
    gameStatusRef.on('child_changed', function(snapshot){
        const changedPost = snapshot.val();
        // console.log(changedPost)
        if (changedPost=='start'){
            console.log('game is about to start');
            document.getElementById("autoSubmitForm").submit();
        }
      
    });


    
}   

