var socket = io();
    socket.on('status', (status)=>{
      var statusIndicator = [...document.getElementsByClassName("status-indicator")];

      if(!status) {
        var statusIndicator = [...document.getElementsByClassName("status-indicator")];
        statusIndicator[0].innerHTML = "Closed";
        statusIndicator[0].classList.remove("--active");
      } else {
        statusIndicator[0].innerHTML = "Open";
        statusIndicator[0].classList.add("--active");
      }
      
    });

    socket.on('sendMeasurement', (measure)=>{
      var max = 49;
      var currentValue = Math.round(((max-measure)/max)*180);
      var currentPercent = Math.round(((max-measure)/max)*100);
      
      
      var maskFill = document.querySelectorAll(".mask .fill");
      var full = document.querySelector('.mask.full');
      var fill = document.querySelectorAll('.circle .fill');
      var percentText = document.querySelector(".inside-circle");
      if(!(currentValue < 0) && currentValue != -0) {
        console.log(currentValue)
        if(currentValue < 180/2) {
        
          maskFill.forEach(el=>{
            el.style.backgroundColor = "#90EE90";
          })
          
        }
        else if (currentValue >= 180/2 && currentValue < 180-10) {
          maskFill.forEach(el=>{
            el.style.backgroundColor = "#FFD580";
          })
        }
        else if (currentValue >= 180-10) {
          maskFill.forEach(el=>{
            el.style.backgroundColor = "#FF7F7F";
          })
        }
  
          full.style.transform = "rotate("+currentValue+"deg)";
  
          fill.forEach(el=>{
            el.style.transform = "rotate("+currentValue+"deg)";
          })

          percentText.innerHTML = `${currentPercent}%`;
  
      
      }
      
    });