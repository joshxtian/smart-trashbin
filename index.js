const {Board, Boards, Led, Servo, Proximity, Leds} = require('johnny-five');
var request = require("request");
const five = require('johnny-five');
var board, servo, proximity, insideProximity1, insideProximity2, insideProximity3, insideProximity4, insideProximity5, leds, sensorAvg, isFull = false, smsSent = false;



var shortcode = '21661576';
var access_token = 'sLM7Q7KX2d5qegFSvBnQBvqsjZob8JBbKLTt2_4nV7g';
var address = '09266550507';
var clientCorrelator = '123';
var message = 'Hey! The thinker bin is full, kindly empty the bin in order for it to function again. Thank you';

var options = { method: 'POST',
  url: 'https://devapi.globelabs.com.ph/smsmessaging/v1/outbound/' + shortcode + '/requests',
  qs: { 'access_token': access_token },
  headers: 
   { 'Content-Type': 'application/json' },
  body: 
   { 'outboundSMSMessageRequest': 
      { 'senderAddress': shortcode,
        'outboundSMSTextMessage': { 'message': message },
        'address': address } },
  json: true };


let greenZone = 20;
let orangeZone = 30;
let redZone = 0;
var ports = [
  { id: "A", port: "/dev/cu.usbmodem14201" },
  { id: "B", port: "/dev/cu.usbmodem14101" }
];
 
const express = require('express');
const { set } = require('express/lib/response');

const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http);







app.use(express.static(__dirname + '/public'));




app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

http.listen(3000, () => {
  console.log('listening on 3000....');
});

new Boards(ports).on("ready", function() {

  let innerSensor1Status, innerSensor2Status, innerSensor3Status, innerSensor4Status, innerSensor5Status;
  let innerSensor1Value = 0; 
  let innerSensor2Value = 0; 
  let innerSensor3Value = 0; 
  let innerSensor4Value = 0; 
  let innerSensor5Value = 0;  


  openerSensor = new Proximity({
    board: this.byId("B"),
    controller: "HCSR04",
    pin: "A2",
    freq: 100
  });
  

  var innerSensor1 = new Proximity({
    board: this.byId("A"),
    controller: "HCSR04",
    pin: "A1",
    freq: 100
  });
  var innerSensor2 = new Proximity({
    board: this.byId("A"),
    controller: "HCSR04",
    pin: "A2",
    freq: 100
  });
  var innerSensor3 = new Proximity({
    board: this.byId("A"),
    controller: "HCSR04",
    pin: "A3",
    freq: 100
  });
  var innerSensor4 = new Proximity({
    board: this.byId("B"),
    controller: "HCSR04",
    
    pin: "A0",
    freq: 100
  });
  var innerSensor5 = new Proximity({
    board: this.byId("B"),
    controller: "HCSR04",
    pin: "A1",
    freq: 100
  });

  servo = new Servo({
    board: this.byId("A"),
    pin: 12,
    type: "continuous",
    startAt: 0,
    center: true,
    debug: true,
  });

  var greenLed = new Led({
    board: this.byId("A"),
    pin:2,

  });
  var yellowLed = new Led({
    board: this.byId("A"),
    pin:3
  });
  var redLed = new Led(
    {
      board: this.byId("A"),
      pin: 4
    });
 
  


  openerSensor.within([ 0, 10 ], "cm", function() {
    if(isFull && !servo.isMoving) {
      console.log("Cannot Open Bin is Full");
    } 
    else {
      console.log(this.cm)
      if(!servo.isMoving) {
        servo.isMoving = true;
        triggerTrashbin(servo);
        var status = true;
        io.emit('status', status);
      }
      else {
      console.log("Still moving");
      
      }
    }
    
  });


  

  innerSensor1.on("data", function(){
    innerSensor1Value = this.cm;
 
  
  });

  innerSensor2.on("data", function(){
    innerSensor2Value = this.cm;  
    console.log(this.cm)

  });

  innerSensor3.on("data", function(){
   
    innerSensor3Value = this.cm;  
  
  
  });

  innerSensor4.on("data", function(){
    innerSensor4Value = this.cm;  
    
 
   
  });

  innerSensor5.on("data", function(){
    innerSensor5Value = this.cm;  

    
   
  });

  var functionInterval = setInterval(function()
  { 
    sensorAvg = (innerSensor1Value+innerSensor2Value+innerSensor3Value+innerSensor4Value+innerSensor5Value)/5;

    if (sensorAvg >= 25) {
      greenLed.on();
      redLed.off();
      yellowLed.off();
    }
    else if (sensorAvg <= 24 && sensorAvg >= 4) {
      greenLed.off();
      redLed.off();
      yellowLed.on();
    }
    else if (sensorAvg <= 3) {
      greenLed.off();
      redLed.on();
      yellowLed.off();
    }
   
    
    sendMeasurement((innerSensor1Value+innerSensor2Value+innerSensor3Value+innerSensor4Value+innerSensor5Value)/5);
  }, 
    1000);
  });

function sendMeasurement(measure) {
  io.emit('sendMeasurement', measure);
  if(sensorAvg <= 3) {
    isFull = true;
    if(!smsSent) {
      request(options, function (error, response, body) {
        if (error) throw new Error(error);
        
        console.log(body);
      });
      smsSent = true;
    }
  }
}

function checkDistance(distance) {
  if(distance > 0) console.log(distance);

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


// board.on('ready', function() {
//   // TEST CODES

//   let innerSensor1Status, innerSensor2Status, innerSensor3Status, innerSensor4Status, innerSensor5Status;
//   let innerSensor1Value = 0; 
//   let innerSensor2Value = 0; 
//   let innerSensor3Value = 0; 
//   let innerSensor4Value = 0; 
//   let innerSensor5Value = 0;  


//   openerSensor = new Proximity({
//     controller: "HCSR04",
//     pin: "A15",
//     freq: 100
//   });
  

//   var innerSensor1 = new Proximity({
//     controller: "HCSR04",
//     pin: "A1",
//     freq: 100
//   });
//   var innerSensor2 = new Proximity({
//     controller: "HCSR04",
//     pin: "A2",
//     freq: 100
//   });
//   var innerSensor3 = new Proximity({
//     controller: "HCSR04",
//     pin: "A3",
//     freq: 100
//   });
//   var innerSensor4 = new Proximity({
//     controller: "HCSR04",
//     pin: "2",
//     freq: 100
//   });
//   var innerSensor5 = new Proximity({
//     controller: "HCSR04",
//     pin: "A5",
//     freq: 100
//   });

//   // servo = new Servo({
//   //   pin: 12,
//   //   type: "continuous",
//   //   startAt: 0,
//   //   center: true,
//   //   debug: true,
//   // });

//   var greenLed = new Led(2);
//   var yellowLed = new Led(3);
//   var redLed = new Led(4);
  


//   // openerSensor.within([ 0, 10 ], "cm", function() {
//   //   console.log(this.cm)
//   //   if(!servo.isMoving) {
//   //     servo.isMoving = true;
      
//   //     triggerTrashbin(servo);
//   //     var status = true;
//   //     io.emit('status', status);
//   //   } else {
//   //     // console.log("Still moving");
      
//   //   }
//   // });


//   // innerSensor2.within([34,57],"cm",function() {
//   //   console.log("green")
//   // });
//   // innerSensor2.within([18,33],"cm",function() {
//   //   console.log("orange")
//   // });
//   // innerSensor2.within([0,17],"cm",function() {
//   //   console.log("red")
//   // });
//   innerSensor1.on("data", function(){
//     innerSensor1Value = this.cm;
    
    
//   });

//   innerSensor2.on("data", function(){
//     innerSensor2Value = this.cm;  
    
   

//   });

//   innerSensor3.on("data", function(){
    
//     innerSensor3Value = this.cm;  
    
    
//   });

//   innerSensor4.on("data", function(){
//     innerSensor4Value = this.cm;  
//     checkDistance(this.cm);
    
//   });

//   innerSensor5.on("data", function(){
//     innerSensor5Value = this.cm;  

    
   
//   });

//   var functionInterval = setInterval(function()
//   { 
    


//     sendMeasurement((innerSensor1Value+innerSensor2Value+innerSensor3Value+innerSensor4Value+innerSensor5Value)/5);
//   }, 
//     1000);
//   });

// function sendMeasurement(measure) {
//   io.emit('sendMeasurement', measure);
// }

// function checkDistance(distance) {
//   if(distance > 0) console.log(distance);

// }

// function triggerTrashbin(servo) {
//   servo.ccw(1);
//   console.log("trashbin is opening")

//   const myTimeout = setTimeout(function() {
//     servo.cw(1);
//     console.log("trashbin is closing");
//     const myTimeout2 = setTimeout(function(){
//       var status = false;
//       io.emit('status', status);
//       servo.isMoving = false;
//       servo.stop();
//     },15000);
//   }, 15000);
// }

// io.on('connection', (socket) => {
//   console.log('a user connected');

//   socket.on('disconnect', () => {
//     console.log('user disconnected');
//   });
// });