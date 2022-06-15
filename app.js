const { Board, Proximity, Led, Servo } = require("johnny-five");
var proximity, led, servo;
const board = new Board(
  {
    debug:true,
    port: "/dev/tty.usbmodem14201"
  });

board.on("ready", function() {
  proximity = new Proximity({
    controller: "HCSR04",
    pin: "A0",
    freq: 100
  });
  // servo = new Servo({
  //   pin: 13,
  //   type: "continuous",
  //   startAt: 0,
  //   center: true,
  //   debug: true,
  // });
  // servo.isMoving = false;
  // proximity1 = new Proximity({
  //   controller: "HCSR04",
  //   pin: "A1",
  //   freq: 100
  // });

  
  // led = new Led({
  //   pin: "A0"
  // });
  // led.pulse(500);
  

  // proximity.on("data", function() {
  //   const {centimeters, inches} = proximity;
  //   console.log("Proximity: ");
  //   console.log("  cm  : ", centimeters);
  //   console.log("  in  : ", inches);
  //   console.log("-----------------");
  // });

  // proximity.within([ 0, 10 ], "cm", function() {   
  //   if(!servo.isMoving) {
  //     servo.isMoving = true;
      
  //     triggerTrashbin(servo);
  //   } else {
  //     console.log("Still moving");
      
  //   }
  // });

  // proximity1.within([ 0, 10 ], "cm", function() {
  //   console.log(this.cm);
  // });
  proximity.on("data", function () {
    console.log("cm: " + this.cm);
  });

});

function triggerTrashbin(servo) {
  servo.ccw(1);
  console.log("trashbin is opening")
  console.log("current servo position: " + servo.position);

  const myTimeout = setTimeout(function() {
    servo.cw(1);
    console.log("trashbin is closing");
    const myTimeout2 = setTimeout(function(){

   
      servo.isMoving = false;
      console.log("current servo position: " + servo.position);
      servo.stop();
      
    },15000);
  }, 15000);
  // const returnStop = setTimeout(function(){

  //   servo.stop();
  // },5000);
}