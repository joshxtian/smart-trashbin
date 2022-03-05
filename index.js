const {Board, Led, Servo, Proximity, Leds} = require('johnny-five');
const five = require('johnny-five');
var board, servo, proximity, insideProximity1, insideProximity2, insideProximity3, insideProximity4, insideProximity5, leds;
let greenZone = 20;
let orangeZone = 30;
let redZone = 0;
const express = require('express');
const { set } = require('express/lib/response');

const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http);
board = new Board({debug:true});






app.use(express.static(__dirname + '/public'));


// Initialize a new instance of socket.io by passing the http (the HTTP server) object.



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

http.listen(3000, () => {
  console.log('listening on 3000....');
});



board.on('ready', function() {
  // TEST CODES

  let innerSensor1Status, innerSensor2Status, innerSensor3Status, innerSensor4Status, innerSensor5Status;

  openerSensor = new Proximity({
    controller: "HCSR04",
    pin: "A6",
    freq: 100
  });
  

  var innerSensor1 = new Proximity({
    controller: "HCSR04",
    pin: "A1",
    freq: 100
  });
  var innerSensor2 = new Proximity({
    controller: "HCSR04",
    pin: "A2",
    freq: 3000
  });
  var innerSensor3 = new Proximity({
    controller: "HCSR04",
    pin: "A3",
    freq: 100
  });
  var innerSensor4 = new Proximity({
    controller: "HCSR04",
    pin: "A4",
    freq: 100
  });
  var innerSensor5 = new Proximity({
    controller: "HCSR04",
    pin: "A5",
    freq: 100
  });

  servo = new Servo({
    pin: 12,
    type: "continuous",
    startAt: 0,
    center: true,
    debug: true,
  });

  var greenLed = new Led(2);
  var yellowLed = new Led(3);
  var redLed = new Led(4);
  


  openerSensor.within([ 0, 10 ], "cm", function() {
    if(!servo.isMoving) {
      servo.isMoving = true;
      
      triggerTrashbin(servo);
      var status = true;
      io.emit('status', status);
    } else {
      console.log("Still moving");
      
    }
  });


  // innerSensor2.within([34,57],"cm",function() {
  //   console.log("green")
  // });
  // innerSensor2.within([18,33],"cm",function() {
  //   console.log("orange")
  // });
  // innerSensor2.within([0,17],"cm",function() {
  //   console.log("red")
  // });

  innerSensor2.on("data", function(){
    sendMeasurement(this.cm)
  });



});

function sendMeasurement(measure) {
  io.emit('sendMeasurement', measure);
}

function triggerTrashbin(servo) {
  servo.ccw(1);
  console.log("trashbin is opening")

  const myTimeout = setTimeout(function() {
    servo.cw(1);
    console.log("trashbin is closing");
    const myTimeout2 = setTimeout(function(){
      var status = false;
      io.emit('status', status);
      servo.isMoving = false;
      servo.stop();
    },15000);
  }, 15000);
  
}

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});