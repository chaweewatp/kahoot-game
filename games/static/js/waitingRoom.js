jQuery(document).ready(function () {
  getRtdbData();
});

// var data = [];
// var layout;
// var fill = d3.scale.ordinal(d3.schemeCategory20);

function getRtdbData() {
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
  // console.log("firebase connected");
  var game_key = document.getElementById("game_key").value;
  var playerRef = firebase.database().ref("players/");

  // // retieve all players
  // playerRef.on('value', function(snapshot){
  //     var arr = snapshot.val();
  //     console.log(arr)
  // })
  // console.log(game_key);
  // // retieve players with game id
  playerRef
    .orderByChild("game_key")
    .equalTo(game_key)
    .on("value", async function (snapshot) {

      $("#waitingListMobile").empty();
      $("#waitingListDesktop").empty();
      await snapshot.forEach((childSnapshot) => {
        let item = childSnapshot.val();
        console.log(item);
        //data.push({ text: item.name, value: 1000 + Math.random() * 1000 });
        $("#waitingListMobile").append(
          '<div class="name-border" id="' +
            item.name +
            '"><span class="name-text">' +
            item.name +
            "</span></div>"
        );
        $("#waitingListDesktop").append(
          '<div class="name-border" id="' +
            item.name +
            '"><span class="name-text">' +
            item.name +
            "</span></div>"
        );
      });
      //layout = d3.layout.cloud().size([400, 300]).words(data).on("end", draw);
      //layout.start();
    });

  // var game_key=document.getElementById("game_key").value;
  var gameStatusRef = firebase.database().ref("games/" + game_key + "/");
  gameStatusRef.on("child_changed", function (snapshot) {
    const changedPost = snapshot.val();
    console.log(changedPost)
    if (changedPost == "start") {
      console.log("game is about to start");
      $("#waiting").attr("hidden", true);
      $("#ready").attr("hidden", false);
      setTimeout(() => {
        document.getElementById("autoSubmitForm").submit();
      }, 3000);
      //   document.getElementById("autoSubmitForm").submit();
    }
  });
}

// function draw(words) {
//   d3.select("#demo1")
//     .append("g")
//     .attr(
//       "transform",
//       "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")"
//     )
//     .selectAll("text")
//     .data(words)
//     .enter()
//     .append("text")
//     .text((d) => d.text)
//     .style("font-size", (d) => d.size + "px")
//     .style("font-family", (d) => d.font)
//     .style("fill", (d, i) => fill(i))
//     .attr("text-anchor", "middle")
//     .attr(
//       "transform",
//       (d) => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"
//     );
// }
