// html element references for user input sections
let primaryGoal = document.getElementById("primary-goal");
let equipment = document.getElementById("equipment");
let days = document.getElementById("days");
let experience = document.getElementById("experience");
let time = document.getElementById("duration");
let informationForm = document.getElementById("extra-information");

// html element references for UI elements
let generateButton = document.getElementById("generate");
let inputArea = document.getElementById("input-area");
let centerBox = document.getElementById("center-box");
let mainWrapper = document.getElementById("main-wrapper")

const reloadUrl = "index.html"

// Event listener for the "Generate" button click
generateButton.addEventListener("click", generateWorkout);


// Function to handle "generate" button click
function generateWorkout() {

  // While waiting for server to generate program, display loading gif
  inputArea.style.alignItems = "center"
  inputArea.style.marginTop = "150px"
  inputArea.innerHTML = '<img src="loading.gif" width="75px" height="75px">'

  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      // If request to server was successful, display to client the servers response data (workout plan)
      if (this.readyState == 4 && this.status == 200) {

          // Parse the servers response to display to clients html
          let serverResponse = JSON.parse(this.responseText).trim()
          
          // Make the center box scale to fit the workout program
          centerBox.style.height = "auto";
          mainWrapper.style.height = "100%";
          mainWrapper.style.paddingTop = "50px";
          mainWrapper.style.paddingBottom = "50px";

          inputArea.style.marginTop = "0px"
          inputArea.style.alignItems = "normal"

          // Add the server response html 
          inputArea.innerHTML = serverResponse

          // Add Disclaimer text
          inputArea.innerHTML += `
          <p><i>Disclaimer: Use this AI-generated workout 
          program at your own risk; it's not medical advice, 
          and always consult a healthcare professional before 
          starting new exercises.</i></p>`;
          
          // Add button to reload page and try again
          inputArea.innerHTML += `
          <div class="button-container" style="margin-bottom: 20px;">
            <a href="${reloadUrl}">
              <button>Retry</button>
            </a>
          </div>`;
  
      }
      // If rate limit is hit, display on html
      else if (this.readyState == 4 && this.status == 429)
      {
        inputArea.innerHTML = "<h3>Rate Limit Exceeded</h3>"
        inputArea.innerHTML += `
        <div class="button-container" style="margin-bottom: 20px;">
          <a href="${reloadUrl}">
            <button>Retry</button>
          </a>
        </div>
      `;
      }
  };

  // Put all workout-info from the client 'form' into an object to easily send to server
  let workoutInfo = {
    primaryGoalText: primaryGoal.options[primaryGoal.selectedIndex].value,
    equipmentText: equipment.options[equipment.selectedIndex].value,
    daysText: days.options[days.selectedIndex].value,
    experienceText: experience.options[experience.selectedIndex].value,
    timeText: time.options[time.selectedIndex].value,
    informationFormText: informationForm.value,
  };

  // Send workout info to server
  xhttp.open("POST", "generateWorkout");
  xhttp.send(JSON.stringify(workoutInfo));
}