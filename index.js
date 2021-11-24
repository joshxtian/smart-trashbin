const {Board, Led, Servo, Proximity} = require('johnny-five');
const five = require('johnny-five');
var led, board, servo, proximity;
const express = require('express');
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
  led = new Led({
    pin: "A1"
  });
  servo = new Servo({
    pin: "12"
  });

  proximity = new Proximity({
    controller: "HCSR04",
    pin: "A4",
    freq: 50
  });

  proximity.on("data", function() {
    console.log(this.cm);
    if(this.cm <= 15) {
      led.on(); 
      servo.sweep({
        range: [45, 135], 
        interval: 1000,
        step: 10
      });
      var detected = true;
      io.emit('detected', detected);
    }
    else if(this.cm > 15) {
      led.off();
      servo.stop();
      var detected = false;

      io.emit('detected', detected);
    }
  });

});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});