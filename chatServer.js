/*
chatServer.js
Author: David Goedicke (da.goedicke@gmail.com)
Closley based on work from Nikolas Martelaro (nmartelaro@gmail.com) as well as Captain Anonymous (https://codepen.io/anon/pen/PEVYXz) who forked of an original work by Ian Tairea (https://codepen.io/mrtairea/pen/yJapwv)
*/

var express = require('express'); // web server application
var app = express(); // webapp
var http = require('http').Server(app); // connects http library to server
var io = require('socket.io')(http); // connect websocket library to server
var serverPort = 8000;
var userResponses = [];


//---------------------- WEBAPP SERVER SETUP ---------------------------------//
// use express to create the simple webapp
app.use(express.static('public')); // find pages in public directory

// start the server and say what port it is on
http.listen(serverPort, function() {
  console.log('listening on *:%s', serverPort);
});
//----------------------------------------------------------------------------//


//---------------------- WEBSOCKET COMMUNICATION -----------------------------//
// this is the websocket event handler and say if someone connects
// as long as someone is connected, listen for messages
io.on('connect', function(socket) {
  console.log('a new user connected');
  var questionNum = 0; // keep count of question, used for IF condition.
  socket.on('loaded', function() { // we wait until the client has loaded and contacted us that it is ready to go.

    socket.emit('answer', "Hey, hello I am SimpleBoot a simple chat bot example."); //We start with the introduction;
    setTimeout(timedQuestion, 1000, socket, "What is your name?"); // Wait a moment and respond with a question.

  });
  socket.on('message', (data) => { // If we get a new message from the client we process it;
    console.log(data);
    questionNum = bot(data, socket, questionNum); // run the bot function with the new message
  });
  socket.on('disconnect', function() { // This function  gets called when the browser window gets closed
    console.log('user disconnected');
  });
});
//--------------------------CHAT BOT FUNCTION-------------------------------//
function bot(data, socket, questionNum) {
  var input = data; // This is generally really terrible from a security point of view ToDo avoid code injection
  var answer;
  var question;
  var waitTime;

  /// These are the main statments that make up the conversation.
  if (questionNum == 0) {
    answer = 'Hello ' + input + ' :-)'; // output response
    waitTime = 1000;
    question = 'When do you want to travel the Winter or the Summer?'; // load next question
  } else if (questionNum == 1) {
    userResponses.push(input);
    answer = 'Nothing like a ' + input + ' vacation!';
    waitTime = 2000;
    question = 'Do you want to go to a warm destination or a cold destination?'; // load next question
  } else if (questionNum == 2) {
    userResponses.push(input);
    answer = 'Me as well!'
    waitTime = 2000;
    question = 'Are you looking to see city landmarks or do recreation activities?'; // load next question
  } else if (questionNum == 3) {
    userResponses.push(input);
    answer = 'Ok, ' + input + ' it is.';
    waitTime = 2000;
    question = 'How many people are you travelling with?'; // load next question
  }
  else {

    answer = 'You should travel to ' + matchDestination() + "!" // output response
    waitTime = 0;
    question = '';
  }


  /// We take the changed data and distribute it across the required objects.
  socket.emit('answer', answer);
  setTimeout(timedQuestion, waitTime, socket, question);
  return (questionNum + 1);
}
function matchDestination() {

  var Destinations =  [
    ["Cabo", "Summer", "warm", "Recreation", "Recreation Activities"],
    ["Aspen", "Winter", "cold", "Recreation", "Recreation Activities"],
    ["Boston", "Winter", "cold", "Landmark", "city"],
    ["Rome", "Summer", "warm", "Landmark", "city"]
  ];

  var arrayLength = Destinations.length;
  var destLength = Destinations[0].length;


  var destinationCounts = [];
  var max_count = 0;
  var category = "";
  for (var i = 0; i < arrayLength; i++) {
    var count = 0;
    for (var j = 1; j < destLength; j++){
      console.log(i);
      console.log(j);
      console.log(Destinations[i][j]);
      if (userResponses.includes(Destinations[i][j]) == true){
        count = count + 1;
      }
    }
    if (count > max_count){
        category = Destinations[i][0];
        max_count = count;
    }
    destinationCounts.push(count);
  }
  console.log(destinationCounts);
  console.log(category);
  return category

}

function timedQuestion(socket, question) {
  if (question != '') {
    socket.emit('question', question);
  } else {
    //console.log('No Question send!');
  }

}
//----------------------------------------------------------------------------//
